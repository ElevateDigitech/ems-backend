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
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_QUESTIONS_SUCCESS,
  MESSAGE_QUESTION_NOT_FOUND,
  MESSAGE_GET_QUESTION_SUCCESS,
  MESSAGE_QUESTION_EXIST,
  MESSAGE_CREATE_QUESTION_SUCCESS,
  MESSAGE_QUESTION_TAKEN,
  MESSAGE_UPDATE_QUESTION_SUCCESS,
  MESSAGE_QUESTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_QUESTION_ERROR,
  MESSAGE_DELETE_QUESTION_SUCCESS,
  MESSAGE_QUESTION_NOT_ALLOWED_UPDATE_REFERENCE_EXIST,
} = require("../utils/messages");
const {
  findQuestions,
  findQuestion,
  createQuestionObj,
  updateQuestionObj,
  deleteQuestionObj,
} = require("../queries/questions");
const { findUser } = require("../queries/users");

module.exports = {
  /**
   * Retrieves all classes from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetQuestions: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findQuestions({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      projection: true,
    });

    // Step 3: Send the retrieved classes in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_QUESTIONS_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Retrieves a class by its unique class code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionByCode: async (req, res, next) => {
    const { questionCode } = req.body; // Step 1: Extract class code from request
    const classDetails = await findQuestion({
      query: { questionCode },
      projection: true,
    }); // Step 2: Find class in database

    // Step 3: Return the class details if found, otherwise handle error
    return classDetails
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_QUESTION_SUCCESS,
              classDetails
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_QUESTION_NOT_FOUND);
  },

  /**
   * Creates a new class in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateQuestion: async (req, res, next) => {
    const { level, total } = req.body; // Step 1: Extract class level from request

    // Step 3: Check if the class already exists
    const existingQuestion = await findQuestion({ query: { level, total } });
    if (existingQuestion)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_QUESTION_EXIST);

    // Step 4: Create and save the new class
    const newQuestion = createQuestionObj({ level, total });
    await newQuestion.save();

    // Step 5: Log the creation in audit logs
    const createdQuestion = await findQuestion({
      query: { questionCode: newQuestion.questionCode },
      projection: true,
    });

    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.CREATE,
      auditCollections.QUESTIONS,
      createdQuestion.questionCode,
      auditChanges.CREATE_QUESTION,
      null,
      createdQuestion,
      currentUser
    );

    // Step 6: Send the created class as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_QUESTION_SUCCESS,
          createdQuestion
        )
      );
  },

  /**
   * Updates an existing class in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateQuestion: async (req, res, next) => {
    const { questionCode, level, total } = req.body; // Step 1: Extract class code and new level
    // Step 3: Validate if the class exists
    const existingQuestion = await findQuestion({ query: { questionCode } });
    if (!existingQuestion)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_NOT_FOUND
      );

    // Step 4: Check for level conflicts with other classes
    const duplicateQuestion = await findQuestion({
      query: { questionCode: { $ne: questionCode }, level, total },
    });
    if (duplicateQuestion)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_QUESTION_TAKEN);

    // Step 3: Check if the class is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingQuestion._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_NOT_ALLOWED_UPDATE_REFERENCE_EXIST
      );

    // Step 5: Capture current class data before update
    const previousData = await findQuestion({
      query: { questionCode },
      projection: true,
    });

    // Step 6: Update the class details
    await updateQuestionObj({ questionCode, level, total });

    // Step 7: Log the update in the audit logs
    const updatedQuestion = await findQuestion({
      query: { questionCode },
      projection: true,
    });
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.UPDATE,
      auditCollections.QUESTIONS,
      questionCode,
      auditChanges.UPDATE_QUESTION,
      previousData,
      updatedQuestion,
      currentUser
    );

    // Step 8: Send the updated class as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_QUESTION_SUCCESS,
          updatedQuestion
        )
      );
  },

  /**
   * Deletes a class from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteQuestion: async (req, res, next) => {
    const { questionCode } = req.body; // Step 1: Extract class code from request

    // Step 2: Validate if the class exists
    const existingQuestion = await findQuestion({ query: { questionCode } });
    if (!existingQuestion)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_NOT_FOUND
      );

    // Step 3: Check if the class is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingQuestion._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the class
    const previousData = await findQuestion({
      query: { questionCode },
      projection: true,
    });
    const deletionResult = await deleteQuestionObj(questionCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_QUESTION_ERROR
      );

    // Step 5: Log the deletion in the audit logs
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.DELETE,
      auditCollections.CLASSES,
      questionCode,
      auditChanges.DELETE_QUESTION,
      previousData,
      null,
      currentUser
    );

    // Step 6: Send deletion success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_QUESTION_SUCCESS)
      );
  },
};
