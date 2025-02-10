const moment = require("moment-timezone");
const Exam = require("../models/exam");
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  generateexamCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_EXAMS_SUCCESS,
  MESSAGE_GET_EXAM_SUCCESS,
  MESSAGE_EXAM_NOT_FOUND,
  MESSAGE_EXAM_EXIST,
  MESSAGE_CREATE_EXAMS_SUCCESS,
  MESSAGE_EXAM_TAKEN,
  MESSAGE_UPDATE_EXAMS_SUCCESS,
  MESSAGE_EXAM_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_EXAMS_ERROR,
  MESSAGE_DELETE_EXAMS_SUCCESS,
} = require("../utils/messages");

// Utility functions
const findExamByCode = async (examCode) =>
  await Exam.findOne({ examCode }, hiddenFieldsDefault);
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: { path: "rolePermissions", select: hiddenFieldsDefault },
  });

// Exam Controller
module.exports = {
  /**
   * Retrieves all exams from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetExams: async (req, res) => {
    // Fetch all exam documents
    const exams = await Exam.find({}, hiddenFieldsDefault);

    // Return success response with fetched data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_EXAMS_SUCCESS, exams)
      );
  },

  /**
   * Retrieves a exam by its unique exam code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetExamByCode: async (req, res, next) => {
    const { examCode } = req.body;

    // Fetch exam by provided examCode
    const exam = await findExamByCode(examCode);

    // Return response based on exam existence
    return exam
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_EXAM_SUCCESS, exam)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_EXAM_NOT_FOUND);
  },

  /**
   * Creates a new exam in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateExam: async (req, res, next) => {
    const { title } = req.body;
    const formattedName = title.trim().toUpperCase();

    // Check if exam already exists
    if (await Exam.findOne({ title: formattedName }))
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_EXIST);

    // Create new exam
    const newExam = new Exam({
      examCode: generateexamCode(),
      title: formattedName,
    });
    await newExam.save();

    // Log creation
    const createdExam = await findExamByCode(newExam.examCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.examS,
      createdExam.examCode,
      auditChanges.CREATE_EXAM_TYPE,
      null,
      createdExam.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_EXAMS_SUCCESS,
          createdExam
        )
      );
  },

  /**
   * Updates an existing exam in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateExam: async (req, res, next) => {
    const { examCode, title } = req.body;
    const formattedName = title.trim().toUpperCase();

    // Check for existing exam
    const existingExam = await findExamByCode(examCode);
    if (!existingExam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Check if new exam is taken
    if (
      await Exam.findOne({
        examCode: { $ne: examCode },
        title: formattedName,
      })
    )
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_TAKEN);

    // Update exam data
    const previousData = existingExam.toObject();
    await Exam.findOneAndUpdate(
      { examCode },
      {
        title: formattedName,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the update audit
    const updatedExam = await findExamByCode(examCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.examS,
      examCode,
      auditChanges.UPDATE_EXAM_TYPE,
      previousData,
      updatedExam.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_EXAMS_SUCCESS,
          updatedExam
        )
      );
  },

  /**
   * Deletes a exam from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteExam: async (req, res, next) => {
    const { examCode } = req.body;
    const existingExam = await findExamByCode(examCode);

    // Validate exam existence
    if (!existingExam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Check if exam is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingExam._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EXAM_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete exam
    const previousData = existingExam.toObject();
    const deletionResult = await Exam.deleteOne({ examCode });

    // Validate deletion
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_EXAMS_ERROR
      );

    // Log deletion
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.examS,
      examCode,
      auditChanges.DELETE_EXAM_TYPE,
      previousData,
      null,
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_EXAMS_SUCCESS));
  },
};
