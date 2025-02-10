const moment = require("moment-timezone");
const Mark = require("../models/mark");
const Exam = require("../models/exam");
const Student = require("../models/student");
const Subject = require("../models/subject");
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
  generateMarkCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_MARKS_SUCCESS,
  MESSAGE_GET_MARK_SUCCESS,
  MESSAGE_MARKS_NOT_FOUND,
  MESSAGE_EXAM_NOT_FOUND,
  MESSAGE_STUDENT_NOT_FOUND,
  MESSAGE_SUBJECT_NOT_FOUND,
  MESSAGE_MARK_EXIST,
  MESSAGE_CREATE_MARK_SUCCESS,
  MESSAGE_MARK_NOT_FOUND,
  MESSAGE_MARK_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_UPDATE_MARK_SUCCESS,
  MESSAGE_DELETE_MARK_ERROR,
  MESSAGE_DELETE_MARK_SUCCESS,
} = require("../utils/messages");

// Utility functions for database queries
const findMarksByQuery = async (query, limit) =>
  await Mark.find(query, hiddenFieldsDefault)
    .populate("exam", hiddenFieldsDefault)
    .populate({
      path: "student",
      select: hiddenFieldsDefault,
      populate: {
        path: "section",
        select: hiddenFieldsDefault,
        populate: {
          path: "class",
          select: hiddenFieldsDefault,
        },
      },
    })
    .populate("subject", hiddenFieldsDefault)
    .limit(limit);
const findMarkByQuery = async (query) =>
  await Mark.findOne(query, hiddenFieldsDefault)
    .populate("exam", hiddenFieldsDefault)
    .populate({
      path: "student",
      select: hiddenFieldsDefault,
      populate: {
        path: "section",
        select: hiddenFieldsDefault,
        populate: {
          path: "class",
          select: hiddenFieldsDefault,
        },
      },
    })
    .populate("subject", hiddenFieldsDefault);
const findExamByCode = async (examCode) => await Exam.findOne({ examCode });
const findStudentByCode = async (studentCode) =>
  await Student.findOne({ studentCode });
const findSubjectByCode = async (subjectCode) =>
  await Subject.findOne({ subjectCode });
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

// Mark Controller
module.exports = {
  /**
   * Retrieves all marks from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetMarks: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Retrieve all marks from the database
    const marks = await findMarksByQuery({}, entries);

    // Send the retrieved marks in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARKS_SUCCESS, marks)
      );
  },

  /**
   * Retrieves a mark by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarkByCode: async (req, res, next) => {
    // Extract the mark code from the request
    const { markCode } = req.body;

    // Find the mark by its code
    const mark = await findMarkByQuery({ markCode });

    // Return the mark if found, else return an error
    return mark
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARK_SUCCESS, mark)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by the given mark code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksByExamCode: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Find the exam by its code
    const exam = await findExamByCode(req.body.examCode);
    if (!exam)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_EXAM_NOT_FOUND);

    // Find marks that belong to the exam
    const marks = await findMarksByQuery({ exam: exam._id }, entries);

    // Return the marks if found, else return an error
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARK_SUCCESS, marks)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by the given student code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksByStudentCode: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Find the student by its code
    const student = await findStudentByCode(req.body.studentCode);
    if (!student)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENT_NOT_FOUND
      );

    // Find marks that belong to the student
    const marks = await findMarksByQuery({ student: student._id }, entries);

    // Return the marks if found, else return an error
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARK_SUCCESS, marks)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by the given subject code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksBySubjectCode: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Find the subject by its code
    const subject = await findSubjectByCode(req.body.subjectCode);
    if (!subject)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SUBJECT_NOT_FOUND
      );

    // Find marks that belong to the subject
    const marks = await findMarksByQuery({ subject: subject._id }, entries);

    // Return the marks if found, else return an error
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARK_SUCCESS, marks)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Creates a new mark entry in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateMark: async (req, res, next) => {
    const { markEarned, markTotal, examCode, studentCode, subjectCode } =
      req.body;

    // Validate exam, student, and subject
    const exam = await findExamByCode(examCode);
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    const student = await findStudentByCode(studentCode);
    if (!student)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    const subject = await findSubjectByCode(subjectCode);
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    // Check if the mark already entered
    const duplicateMark = await findMarkByQuery({
      exam: exam._id,
      student: student._id,
      subject: subject._id,
    });
    if (duplicateMark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_EXIST);

    // Create and save the mark
    const mark = new Mark({
      markCode: generateMarkCode(),
      markEarned,
      markTotal,
      exam: exam._id,
      student: student._id,
      subject: subject._id,
    });
    await mark.save();

    // Log the audit
    const createdMark = await findMarkByQuery({ markCode: mark.markCode });
    const user = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.MARKS,
      mark.markCode,
      auditChanges.CREATE_MARK,
      null,
      createdMark,
      user
    );

    // Return the created city
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_MARK_SUCCESS,
          createdMark
        )
      );
  },

  /**
   * Updates an existing mark in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateMark: async (req, res, next) => {
    const {
      markCode,
      markEarned,
      markTotal,
      examCode,
      studentCode,
      subjectCode,
    } = req.body;

    // Validate the mark
    const mark = await findMarkByQuery({ markCode });
    if (!mark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_NOT_FOUND);

    // Validate exam, student, and subject
    const exam = await findExamByCode(examCode);
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    const student = await findStudentByCode(studentCode);
    if (!student)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    const subject = await findSubjectByCode(subjectCode);
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    // Check if the mark already entered
    const duplicateMark = await findMarkByQuery({
      markCode: { $ne: markCode },
      exam: exam._id,
      student: student._id,
      subject: subject._id,
    });
    if (duplicateMark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_EXIST);

    // Mark details before update
    const markBeforeUpdate = mark.toObject();

    // Update the mark details
    await Mark.updateOne(
      { markCode },
      {
        markEarned,
        markTotal,
        exam: exam._id,
        student: student._id,
        subject: subject._id,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the audit
    const updatedMark = await findMarkByQuery({ markCode });
    const user = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.MARKS,
      markCode,
      auditChanges.UPDATE_MARK,
      markBeforeUpdate,
      updatedMark,
      user
    );

    // Return the updated city
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_MARK_SUCCESS,
          updatedMark
        )
      );
  },

  /**
   * Deletes a mark from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteMark: async (req, res, next) => {
    // Extract the mark code from the request
    const { markCode } = req.body;

    // Validate the mark
    const mark = await Mark.findOne({ markCode });
    if (!mark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_NOT_FOUND);

    // Check if the mark is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(mark._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_MARK_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete the mark
    const previousData = await findMarkByQuery({ markCode });
    const deletionResult = await Mark.deleteOne({ markCode: mark.markCode });
    if (deletionResult.deletedCount === 0)
      return next(
        handleSuccess(
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          MESSAGE_DELETE_MARK_ERROR
        )
      );

    // Log the audit
    const user = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.MARKS,
      mark.markCode,
      auditChanges.DELETE_MARK,
      previousData.toObject(),
      null,
      user.toObject()
    );

    // Return the success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_MARK_SUCCESS));
  },
};
