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
const {
  findExams,
  findExam,
  createExamObj,
  formatExamTitle,
  updateExamObj,
  deleteExamObj,
} = require("../queries/exams");

module.exports = {
  /**
   * Retrieves all exams from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetExams: async (req, res, next) => {
    const { start = 1, end = 10 } = req.query; // Step 1: Extract pagination parameters
    const exams = await findExams({ start, end, options: true }); // Step 2: Fetch exams from database

    // Step 3: Return success response with fetched data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_EXAMS_SUCCESS, exams)
      );
  },

  /**
   * Retrieves an exam by its unique exam code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetExamByCode: async (req, res, next) => {
    const { examCode } = req.body; // Step 1: Extract exam code from request
    const exam = await findExam({ query: { examCode }, options: true }); // Step 2: Fetch exam by provided examCode

    // Step 3: Return response based on exam existence
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
    const { title } = req.body; // Step 1: Extract exam title from request
    const formattedTitle = formatExamTitle(title); // Step 2: Format exam title

    // Step 3: Check if exam already exists
    const existingExam = await findExam({ query: { title: formattedTitle } });
    if (existingExam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_EXIST);

    // Step 4: Create new exam
    const newExam = await createExamObj({ title: formattedTitle });
    await newExam.save();

    // Step 5: Log creation
    const createdExam = await findExam({
      query: { examCode: newExam.examCode },
      options: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.EXAMS,
      createdExam.examCode,
      auditChanges.CREATE_EXAM,
      null,
      createdExam.toObject(),
      currentUser.toObject()
    );

    // Step 6: Return success response
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
    const { examCode, title } = req.body; // Step 1: Extract exam code and title from request
    const formattedTitle = formatExamTitle(title); // Step 2: Format exam title

    // Step 3: Check for existing exam
    const existingExam = await findExam({ query: { examCode } });
    if (!existingExam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Step 4: Check if new exam title is taken
    const otherExams = await findExam({
      query: { examCode: { $ne: examCode }, title: formattedTitle },
    });
    if (otherExams)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_TAKEN);

    // Step 5: Update exam data
    const previousData = await findExam({ query: { examCode }, options: true });
    await updateExamObj({ examCode, title: formattedTitle });

    // Step 6: Log the update audit
    const updatedExam = await findExam({ query: { examCode }, options: true });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.EXAMS,
      examCode,
      auditChanges.UPDATE_EXAM,
      previousData.toObject(),
      updatedExam.toObject(),
      currentUser.toObject()
    );

    // Step 7: Return success response
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
   * Deletes an exam from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteExam: async (req, res, next) => {
    const { examCode } = req.body; // Step 1: Extract exam code from request
    const existingExam = await findExam({ query: { examCode } }); // Step 2: Validate exam existence

    if (!existingExam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    // Step 3: Check if exam is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingExam._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EXAM_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete exam
    const previousData = await findExam({ query: { examCode }, options: true });
    const deletionResult = await deleteExamObj(examCode);

    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_EXAMS_ERROR
      );

    // Step 5: Log deletion
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.EXAMS,
      examCode,
      auditChanges.DELETE_EXAM,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 6: Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_EXAMS_SUCCESS));
  },
};
