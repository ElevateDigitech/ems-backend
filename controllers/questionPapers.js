const moment = require("moment-timezone");
const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  isObjectIdReferenced,
  getInvalidQuestions,
  getQuestionsWithIds,
  hasDuplicates,
  getInvalidStrands,
  getInvalidSubStrands,
  getInvalidSections,
  getSectionDetails,
  getPendingSubmissionQuestionPaperIds,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_QUESTION_PAPER_EXIST,
  MESSAGE_CREATE_QUESTION_PAPER_SUCCESS,
  MESSAGE_GET_QUESTION_PAPERS_SUCCESS,
  MESSAGE_GET_QUESTION_PAPER_SUCCESS,
  MESSAGE_UPDATE_QUESTION_PAPER_SUCCESS,
  MESSAGE_QUESTION_PAPER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_QUESTION_PAPER_SUCCESS,
  MESSAGE_DELETE_QUESTION_PAPER_ERROR,
  MESSAGE_QUESTION_PAPER_NOT_FOUND,
  MESSAGE_SUBJECT_NOT_FOUND,
  MESSAGE_EXAM_NOT_FOUND,
  MESSAGE_QUESTION_PAPER_TAKEN,
  MESSAGE_QUESTION_PAPER_QUESTIONS_NOT_FOUND,
  MESSAGE_SECTION_NOT_FOUND,
  MESSAGE_QUESTION_PAPER_QUESTION_NUMBER_DUPLICATION,
  MESSAGE_QUESTION_PAPER_SUB_STRANDS_NOT_FOUND,
  MESSAGE_QUESTION_PAPER_STRANDS_NOT_FOUND,
  MESSAGE_QUESTION_PAPER_SECTIONS_NOT_FOUND,
  MESSAGE_DUPLICATE_QUESTION_PAPER_SUCCESS,
  MESSAGE_QUESTION_PAPER_NOT_ALLOWED_UPDATE_REFERENCE_EXIST,
} = require("../utils/messages");
const {
  findQuestionPapers,
  findQuestionPaper,
  formatQuestionPaperTitle,
  createQuestionPaperObj,
  updateQuestionPaperObj,
  deleteQuestionPaperObj,
  findPendingSubmissionQuestionPapers,
} = require("../queries/questionPapers");
const { findUser } = require("../queries/users");
const { findSubject } = require("../queries/subjects");
const { findExam } = require("../queries/exams");
const { findSection } = require("../queries/sections");

module.exports = {
  /**
   * Retrieves all question papers from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetQuestionPapers: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findQuestionPapers({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
      populate: true,
    });
    // Step 3: Send the retrieved question papers in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_QUESTION_PAPERS_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Retrieves a question paper by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionPaperByCode: async (req, res, next) => {
    const { questionPaperCode } = req.body; // Step 1: Extract the city code from the request

    // Step 2: Find the question paper by its code
    const questionPaper = await findQuestionPaper({
      query: { questionPaperCode },
      projection: true,
      populate: true,
    });

    // Step 3: Return the question paper if found, else return an error
    return questionPaper
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_QUESTION_PAPER_SUCCESS,
              questionPaper
            )
          )
      : handleError(
          next,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_QUESTION_PAPER_NOT_FOUND
        );
  },

  /**
   * Retrieves question papers by the given subject code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionPapersBySubjectCode: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Step 2: Find the subject by its code
    const subject = await findSubject({
      query: { subjectCode: req.body.subjectCode },
    });
    if (!subject)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_SUBJECT_NOT_FOUND, [], 0)
        );

    const { results, totalCount } = await findQuestionPapers({
      query: { subject: subject._id },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });
    // Step 4: Return the question papers if found, else return an error
    return res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results.length === 0
            ? MESSAGE_QUESTION_PAPER_NOT_FOUND
            : MESSAGE_GET_QUESTION_PAPER_SUCCESS,
          results.length === 0 ? [] : results,
          results.length === 0 ? 0 : totalCount
        )
      );
  },

  /**
   * Retrieves question papers by the given exam code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionPapersByExamCode: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Step 2: Find the exam by its code
    const exam = await findExam({
      query: { examCode: req.body.examCode },
    });
    if (!exam)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_EXAM_NOT_FOUND, [], 0)
        );

    const { results, totalCount } = await findQuestionPapers({
      query: { exam: exam._id },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 4: Return the question papers if found, else return an error
    return res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results.length === 0
            ? MESSAGE_QUESTION_PAPER_NOT_FOUND
            : MESSAGE_GET_QUESTION_PAPER_SUCCESS,
          results.length === 0 ? [] : results,
          results.length === 0 ? 0 : totalCount
        )
      );
  },

  /**
   * Retrieves question papers by the given section code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionPapersBySectionCode: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Step 2: Find the section by its code
    const section = await findSection({
      query: { sectionCode: req.body.sectionCode },
    });
    if (!section)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_SECTION_NOT_FOUND, [], 0)
        );

    const { results, totalCount } = await findQuestionPapers({
      query: { section: section._id },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 4: Return the question papers if found, else return an error
    return res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results.length === 0
            ? MESSAGE_QUESTION_PAPER_NOT_FOUND
            : MESSAGE_GET_QUESTION_PAPER_SUCCESS,
          results.length === 0 ? [] : results,
          results.length === 0 ? 0 : totalCount
        )
      );
  },

  /**
   * Retrieves question papers by the given query.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetQuestionPapersByQuery: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const { sectionCode, subjectCode, examCode } = req.body;
    // Step 2: Find the section by its code
    const section = await findSection({
      query: { sectionCode },
    });
    if (!section)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_SECTION_NOT_FOUND, [], 0)
        );

    // Step 3: Find the subject by its code
    const subject = await findSubject({
      query: { subjectCode },
    });
    if (!subject)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_SUBJECT_NOT_FOUND, [], 0)
        );

    // Step 3: Find the exam by its code
    const exam = await findExam({
      query: { examCode },
    });
    if (!exam)
      return res
        .status(STATUS_CODE_SUCCESS)
        .send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_EXAM_NOT_FOUND, [], 0)
        );

    const { results, totalCount } = await findQuestionPapers({
      query: {
        section: section._id,
        subject: subject._id,
        exam: exam._id,
      },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 4: Return the question papers if found, else return an empty array
    return res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results?.length
            ? MESSAGE_GET_QUESTION_PAPER_SUCCESS
            : MESSAGE_QUESTION_PAPER_NOT_FOUND,
          results?.length ? results : [],
          results?.length ? totalCount : 0
        )
      );
  },

  /**
   * Retrieves question papers by the given query.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetPendingQuestionPapers: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const today = moment().toDate();

    const pendingSubmissionQuestionPapers = await findQuestionPapers({
      query: { submissionDate: { $lte: today } },
      all: true,
    });

    const pendingSubmissionQuestionPaperIds =
      await getPendingSubmissionQuestionPaperIds(
        pendingSubmissionQuestionPapers?.results
      );

    const { results, totalCount } = await findQuestionPapers({
      query: {
        _id: { $in: pendingSubmissionQuestionPaperIds?.filter(Boolean) },
      },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 4: Return the question papers if found, else return an empty array
    return res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results?.length
            ? MESSAGE_GET_QUESTION_PAPER_SUCCESS
            : MESSAGE_QUESTION_PAPER_NOT_FOUND,
          results?.length ? results : [],
          results?.length ? totalCount : 0
        )
      );
  },

  /**
   * Creates a new question paper in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateQuestionPaper: async (req, res, next) => {
    const {
      title,
      subjectCode,
      examCode,
      examDate,
      submissionDate,
      sectionCode,
      questions,
    } = req.body;
    const formattedTitle = formatQuestionPaperTitle(title); // Step 1: Format question paper title

    // Step 2: Check if the question paper already exists
    const existingQuestionPaper = await findQuestionPaper({
      query: { title: formattedTitle },
    });
    if (existingQuestionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_EXIST
      );

    // Step 3: Validate subject and exam
    const subject = await findSubject({ query: { subjectCode } });
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    const exam = await findExam({ query: { examCode } });
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    const section = await findSection({ query: { sectionCode } });
    if (!section)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    const duplicateQuestionPaper = await findQuestionPaper({
      query: { subjectCode, examCode, sectionCode },
    });

    if (duplicateQuestionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_TAKEN
      );

    const duplicateQuestionsExist = hasDuplicates(
      questions?.map((q) => q?.questionNumber)
    );

    if (duplicateQuestionsExist)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_QUESTION_NUMBER_DUPLICATION
      );

    // Step 4: Validate Questions
    const invalidQuestion = await getInvalidQuestions(questions);
    if (invalidQuestion.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_QUESTIONS_NOT_FOUND
      );

    // Step 5: Validate Strands
    const invalidStrands = await getInvalidStrands(questions);
    if (invalidStrands.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_STRANDS_NOT_FOUND
      );

    // Step 6: Validate Sub Strands
    const invalidSubStrands = await getInvalidSubStrands(questions);
    if (invalidSubStrands.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_SUB_STRANDS_NOT_FOUND
      );

    const questionsWithIds = await getQuestionsWithIds(questions);

    // Step 7: Create and save the questionPaper
    const questionPaper = createQuestionPaperObj({
      title: formattedTitle,
      section: section._id,
      subject: subject._id,
      exam: exam._id,
      examDate,
      submissionDate,
      questions: questionsWithIds,
    });

    await questionPaper.save();

    // Step 8: Log the audit
    const createdQuestionPaper = await findQuestionPaper({
      query: { questionPaperCode: questionPaper.questionPaperCode },
      projection: true,
      populate: true,
    });

    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.CREATE,
      auditCollections.QUESTION_PAPERS,
      createdQuestionPaper.questionPaperCode,
      auditChanges.CREATE_QUESTION_PAPER,
      null,
      createdQuestionPaper,
      currentUser
    );

    // Step 9: Return the created question paper
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_QUESTION_PAPER_SUCCESS,
          createdQuestionPaper
        )
      );
  },

  /**
   * Updates an existing question paper in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateQuestionPaper: async (req, res, next) => {
    const {
      questionPaperCode,
      title,
      sectionCode,
      subjectCode,
      examCode,
      examDate,
      questions,
    } = req.body;
    const formattedTitle = formatQuestionPaperTitle(title); // Step 1: Format question paper title

    // Step 2: Validate the question paper
    const questionPaper = await findQuestionPaper({
      query: { questionPaperCode },
    });
    if (!questionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_NOT_FOUND
      );

    // Step 3: Question paper in use, not allowed to update
    const { isReferenced } = await isObjectIdReferenced(questionPaper._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_NOT_ALLOWED_UPDATE_REFERENCE_EXIST
      );

    // Step 4: Validate subject and exam
    const subject = await findSubject({ query: { subjectCode } });
    if (!subject)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);

    const exam = await findExam({ query: { examCode } });
    if (!exam)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_EXAM_NOT_FOUND);

    const section = await findSection({ query: { sectionCode } });
    if (!section)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    const duplicateQuestionsExist = hasDuplicates(
      questions?.map((q) => q?.questionNumber)
    );

    if (duplicateQuestionsExist)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_QUESTION_NUMBER_DUPLICATION
      );

    // Step 5: Validate Questions
    const invalidQuestion = await getInvalidQuestions(questions);
    if (invalidQuestion.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_QUESTIONS_NOT_FOUND
      );

    const questionsWithIds = await getQuestionsWithIds(questions);

    // Step 6: Check for duplicate question paper title
    const duplicateQuestionPaper = await findQuestionPaper({
      query: {
        questionPaperCode: { $ne: questionPaperCode },
        $or: [
          { title: formattedTitle },
          { sectionCode, subjectCode, examCode },
        ],
      },
    });
    if (duplicateQuestionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_TAKEN
      );

    // Step 7: Question paper details before update
    const previousData = await findQuestionPaper({
      query: { questionPaperCode },
      projection: true,
      populate: true,
    });

    // Step 8: Update the question paper details
    await updateQuestionPaperObj({
      questionPaperCode,
      title: formattedTitle,
      section: section._id,
      subject: subject._id,
      exam: exam._id,
      examDate,
      questions: questionsWithIds,
    });

    // Step 9: Log the audit
    const updatedCity = await findQuestionPaper({
      query: { questionPaperCode },
      projection: true,
      populate: true,
    });
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.UPDATE,
      auditCollections.QUESTION_PAPERS,
      questionPaperCode,
      auditChanges.UPDATE_CITY,
      previousData,
      updatedCity,
      currentUser
    );

    // Step 10: Return the updated question paper
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_QUESTION_PAPER_SUCCESS,
          updatedCity
        )
      );
  },

  /**
   * Create Duplicates for an existing question paper in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateDuplicateQuestionPapers: async (req, res, next) => {
    // Sttep 1: Extract the values
    const { questionPaperCode, sectionCodes } = req.body;

    // Step 2: Validate the question paper
    const existinQuestionPaper = await findQuestionPaper({
      query: { questionPaperCode },
    });
    if (!existinQuestionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_NOT_FOUND
      );

    // Step 3: Validate sections
    const invalidSections = await getInvalidSections(sectionCodes);
    if (invalidSections.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_QUESTION_PAPER_SECTIONS_NOT_FOUND
      );

    // Step 4: Extract the section id's
    const sectionDetails = await getSectionDetails(sectionCodes);

    // Step 5: Extract the common fields
    const commonQuestionPaperDetails = {
      subject: existinQuestionPaper?.subject,
      exam: existinQuestionPaper?.exam,
      examDate: moment(existinQuestionPaper?.examDate).format("YYYY-MM-DD"),
      submissionDate: moment(existinQuestionPaper?.submissionDate).format(
        "YYYY-MM-DD"
      ),
      questions: existinQuestionPaper?.questions?.map((q) => {
        let newQ = { ...q };
        if (newQ._id) {
          delete newQ._id;
        }
        return newQ;
      }),
    };

    // Step 6: Array to hold created question paper codes
    const questionPaperCodes = [];

    // Step 7: loop section id's and create new question paper
    for (const sectionDetail of sectionDetails || []) {
      // Step 8: create new question paper object
      const questionPaper = createQuestionPaperObj({
        title: formatQuestionPaperTitle(
          `Copy of ${existinQuestionPaper?.title} for ${sectionDetail.name}`
        ),
        section: sectionDetail._id,
        ...commonQuestionPaperDetails,
      });

      // Step 9: save the created object
      await questionPaper.save();

      // Step 10: created question paper
      const createdQuestionPaper = await findQuestionPaper({
        query: { questionPaperCode: questionPaper.questionPaperCode },
        projection: true,
        populate: true,
      });

      // Step 11: created user
      const currentUser = await findUser({
        query: { userCode: req.user.userCode },
        projection: true,
        populate: true,
      });

      // Step 12: Log the audit
      await logAudit(
        auditActions.CREATE,
        auditCollections.QUESTION_PAPERS,
        createdQuestionPaper.questionPaperCode,
        auditChanges.CREATE_QUESTION_PAPER,
        null,
        createdQuestionPaper,
        currentUser
      );

      // Step 13: Capture question paper code
      questionPaperCodes.push(questionPaper.questionPaperCode);
    }

    // Step 14: Capture created question paper details
    const { results, totalCount } = await findQuestionPapers({
      query: {
        questionPaperCode: { $in: questionPaperCodes },
      },
      populate: true,
      projection: true,
      all: true,
    });

    // Step 15: Return the question papers
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_DUPLICATE_QUESTION_PAPER_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Deletes a question paper from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteQuestionPaper: async (req, res, next) => {
    const { questionPaperCode } = req.body; // Step 1: Extract the question paper code from the request

    // Step 2: Validate the question paper
    const questionPaper = await findQuestionPaper({
      query: { questionPaperCode },
    });
    if (!questionPaper)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_NOT_FOUND
      );

    // Step 3: Check if the question paper is referenced elsewhere
    const { isReferenced } = await isObjectIdReferenced(questionPaper._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_QUESTION_PAPER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the question paper
    const previousData = await findQuestionPaper({
      query: { questionPaperCode },
      projection: true,
      populate: true,
    });
    const deletionResult = await deleteQuestionPaperObj(questionPaperCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_QUESTION_PAPER_ERROR
      );

    // Step 5: Log the audit
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.DELETE,
      auditCollections.QUESTION_PAPERS,
      questionPaperCode,
      auditChanges.DELETE_CITY,
      previousData,
      null,
      currentUser
    );

    // Step 6: Return the success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_DELETE_QUESTION_PAPER_SUCCESS
        )
      );
  },
};
