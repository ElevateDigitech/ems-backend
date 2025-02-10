const moment = require("moment-timezone");
const ExamType = require("../models/examtype");
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
  generateExamTypeCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_EXAMTYPES_SUCCESS,
  MESSAGE_GET_EXAMTYPE_SUCCESS,
  MESSAGE_EXAMTYPE_NOT_FOUND,
  MESSAGE_EXAMTYPE_EXIST,
  MESSAGE_CREATE_EXAMTYPES_SUCCESS,
  MESSAGE_EXAMTYPE_TAKEN,
  MESSAGE_UPDATE_EXAMTYPES_SUCCESS,
  MESSAGE_EXAMTYPE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_EXAMTYPES_ERROR,
  MESSAGE_DELETE_EXAMTYPES_SUCCESS,
} = require("../utils/messages");

// Utility functions
const findExamTypeByCode = async (examTypeCode) =>
  await ExamType.findOne({ examTypeCode }, hiddenFieldsDefault);
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: { path: "rolePermissions", select: hiddenFieldsDefault },
  });

// Exam type Controller
module.exports = {
  /**
   * Retrieves all exam types from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetExamTypes: async (req, res) => {
    // Fetch all exam type documents
    const examTypes = await ExamType.find({}, hiddenFieldsDefault);

    // Return success response with fetched data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_EXAMTYPES_SUCCESS,
          examTypes
        )
      );
  },

  /**
   * Retrieves a exam type by its unique exam type code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetExamTypeByCode: async (req, res, next) => {
    const { examTypeCode } = req.body;

    // Fetch exam type by provided examTypeCode
    const examType = await findExamTypeByCode(examTypeCode);

    // Return response based on exam type existence
    return examType
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_EXAMTYPE_SUCCESS,
              examType
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_EXAMTYPE_NOT_FOUND);
  },

  /**
   * Creates a new exam type in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateExamType: async (req, res, next) => {
    const { title } = req.body;
    const formattedName = title.trim().toUpperCase();

    // Check if exam type already exists
    if (await ExamType.findOne({ title: formattedName }))
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAMTYPE_EXIST);

    // Create new exam type
    const newExamType = new ExamType({
      examTypeCode: generateExamTypeCode(),
      title: formattedName,
    });
    await newExamType.save();

    // Log creation
    const createdExamType = await findExamTypeByCode(newExamType.examTypeCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.EXAMTYPES,
      createdExamType.examTypeCode,
      auditChanges.CREATE_EXAM_TYPE,
      null,
      createdExamType.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_EXAMTYPES_SUCCESS,
          createdExamType
        )
      );
  },

  /**
   * Updates an existing exam type in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateExamType: async (req, res, next) => {
    const { examTypeCode, title } = req.body;
    const formattedName = title.trim().toUpperCase();

    // Check for existing exam type
    const existingExamType = await findExamTypeByCode(examTypeCode);
    if (!existingExamType)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EXAMTYPE_NOT_FOUND
      );

    // Check if new exam type is taken
    if (
      await ExamType.findOne({
        examTypeCode: { $ne: examTypeCode },
        title: formattedName,
      })
    )
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAMTYPE_TAKEN);

    // Update exam type data
    const previousData = existingExamType.toObject();
    await ExamType.findOneAndUpdate(
      { examTypeCode },
      {
        title: formattedName,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the update audit
    const updatedExamType = await findExamTypeByCode(examTypeCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.EXAMTYPES,
      examTypeCode,
      auditChanges.UPDATE_EXAM_TYPE,
      previousData,
      updatedExamType.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_EXAMTYPES_SUCCESS,
          updatedExamType
        )
      );
  },

  /**
   * Deletes a exam type from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteExamType: async (req, res, next) => {
    const { examTypeCode } = req.body;
    const existingExamType = await findExamTypeByCode(examTypeCode);

    // Validate exam type existence
    if (!existingExamType)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EXAMTYPE_NOT_FOUND
      );

    // Check if exam type is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingExamType._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EXAMTYPE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete exam type
    const previousData = existingExamType.toObject();
    const deletionResult = await ExamType.deleteOne({ examTypeCode });

    // Validate deletion
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_EXAMTYPES_ERROR
      );

    // Log deletion
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.EXAMTYPES,
      examTypeCode,
      auditChanges.DELETE_EXAM_TYPE,
      previousData,
      null,
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_EXAMTYPES_SUCCESS)
      );
  },
};
