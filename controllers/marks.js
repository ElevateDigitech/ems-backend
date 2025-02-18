const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  getCurrentUser,
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
const {
  findMarks,
  findMark,
  createMarkObj,
  updateMarkObj,
  deleteMarkObj,
  getMarkPaginationObject,
  getTotalMarks,
} = require("../queries/marks");
const { findExam } = require("../queries/exams");
const { findStudent } = require("../queries/students");
const { findSubject } = require("../queries/subjects");

module.exports = {
  /**
   * Retrieves all marks from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarks: async (req, res, next) => {
    // Step 1: Extract pagination parameters from the query
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query;

    // Step 2: Retrieve all marks from the database with the specified pagination
    const marks = await findMarks({
      page,
      perPage,
      sortField,
      sortValue,
      keyword,
      options: true,
      populated: true,
    });
    const total = await getTotalMarks(keyword);
    // Step 3: Send the retrieved marks in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_MARKS_SUCCESS,
          marks,
          total
        )
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
    // Step 1: Extract the mark code from the request body
    const { markCode } = req.body;

    // Step 2: Find the mark by its code in the database
    const mark = await findMark({
      query: { markCode },
      options: true,
      populated: true,
    });

    // Step 3: Return the found mark or handle the error if not found
    return mark
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_MARK_SUCCESS, mark)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by exam code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksByExamCode: async (req, res, next) => {
    // Step 1: Extract pagination parameters from the query
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query;

    // Step 2: Find the exam using the provided exam code
    const exam = await findExam({ query: { examCode: req.body.examCode } });
    if (!exam)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_EXAM_NOT_FOUND);

    // Step 3: Retrieve marks associated with the found exam
    const marks = await findMarks({
      query: { exam: exam._id },
      page,
      perPage,
      options: true,
      populated: true,
    });

    const pagination = await getMarkPaginationObject(page, perPage);
    // Step 4: Return the marks if found, or handle the error if none are found
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_MARK_SUCCESS,
              marks,
              pagination
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by student code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksByStudentCode: async (req, res, next) => {
    // Step 1: Extract pagination parameters from the query
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query;

    // Step 2: Find the student using the provided student code
    const student = await findStudent({
      query: { studentCode: req.body.studentCode },
    });
    if (!student)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENT_NOT_FOUND
      );

    // Step 3: Retrieve marks associated with the found student
    const marks = await findMarks({
      query: { student: student._id },
      page,
      perPage,
      options: true,
      populated: true,
    });

    const pagination = await getMarkPaginationObject(page, perPage);
    // Step 4: Return the marks if found, or handle the error if none are found
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_MARK_SUCCESS,
              marks,
              pagination
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_MARKS_NOT_FOUND);
  },

  /**
   * Retrieves marks by subject code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetMarksBySubjectCode: async (req, res, next) => {
    // Step 1: Extract pagination parameters from the query
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query;

    // Step 2: Find the subject using the provided subject code
    const subject = await findSubject({
      query: { subjectCode: req.body.subjectCode },
    });
    if (!subject)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SUBJECT_NOT_FOUND
      );

    // Step 3: Retrieve marks associated with the found subject
    const marks = await findMarks({
      query: { subject: subject._id },
      page,
      perPage,
      options: true,
      populated: true,
    });

    const pagination = await getMarkPaginationObject(page, perPage);
    // Step 4: Return the marks if found, or handle the error if none are found
    return marks.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_MARK_SUCCESS,
              marks,
              pagination
            )
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

    // Step 1: Validate exam
    const exam = await findExam({ query: { examCode } });
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Step 2: Validate student
    const student = await findStudent({ query: { studentCode } });
    if (!student)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Step 3: Validate subject
    const subject = await findSubject({ query: { subjectCode } });
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    // Step 4: Check for duplicate mark
    const duplicateMark = await findMarks({
      query: { exam: exam._id, student: student._id, subject: subject._id },
    });
    if (duplicateMark?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_EXIST);

    // Step 5: Create and save the mark
    const mark = await createMarkObj({
      markEarned,
      markTotal,
      exam: exam._id,
      student: student._id,
      subject: subject._id,
    });
    await mark.save();

    // Step 6: Log the audit
    const createdMark = await findMark({
      query: { markCode: mark.markCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.MARKS,
      mark.markCode,
      auditChanges.CREATE_MARK,
      null,
      createdMark.toObject(),
      currentUser.toObject()
    );

    // Step 7: Return the created mark
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

    // Step 1: Validate the mark
    const mark = await findMark({ query: { markCode } });
    if (!mark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_NOT_FOUND);

    // Step 2: Validate exam
    const exam = await findExam({ query: { examCode } });
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Step 3: Validate student
    const student = await findStudent({ query: { studentCode } });
    if (!student)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Step 4: Validate subject
    const subject = await findSubject({ query: { subjectCode } });
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    // Step 5: Check for duplicate mark
    const duplicateMark = await findMarks({
      query: {
        markCode: { $ne: markCode },
        exam: exam._id,
        student: student._id,
        subject: subject._id,
      },
    });
    if (duplicateMark?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_EXIST);

    // Step 6: Capture previous data for audit
    const previousData = await findMark({
      query: { markCode },
      options: true,
      populated: true,
    });

    // Step 7: Update the mark details
    await updateMarkObj({
      markCode,
      markEarned,
      markTotal,
      exam: exam._id,
      student: student._id,
      subject: subject._id,
    });

    // Step 8: Log the audit
    const updatedMark = await findMark({
      query: { markCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.MARKS,
      markCode,
      auditChanges.UPDATE_MARK,
      previousData.toObject(),
      updatedMark.toObject(),
      currentUser.toObject()
    );

    // Step 9: Return the updated mark
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
    const { markCode } = req.body;

    // Step 1: Validate the mark
    const mark = await findMark({ query: { markCode } });
    if (!mark)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_MARK_NOT_FOUND);

    // Step 2: Check if the mark is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(mark._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_MARK_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 3: Capture data for audit before deletion
    const previousData = await findMark({
      query: { markCode },
      options: true,
      populated: true,
    });

    // Step 4: Delete the mark
    const deletionResult = await deleteMarkObj(markCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_MARK_ERROR
      );

    // Step 5: Log the audit
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.MARKS,
      mark.markCode,
      auditChanges.DELETE_MARK,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 6: Return the success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_MARK_SUCCESS));
  },
};
