const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
const QuestionPaper = require("../models/questionPaper");
const {
  buildQuestionPaperPipeline,
  buildQuestionPapersPipeline,
  buildQuestionPaperCountPipeline,
} = require("../pipelines/questionPapers");
const generateQuestionPaperCode = () => `QUESTION-PAPER-${uuidv4()}`;

/**
 * Retrieves a single question paper from the database.
 *
 * @param {Object} params - The parameters for querying a question paper.
 * @param {Object} params.query - The MongoDB query object to filter the question paper.
 * @param {Object} params.projection - Fields to include or exclude from the result.
 * @param {Object} params.populate - Fields to populate in the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the question paper object or null if not found.
 */
const findQuestionPaper = async ({
  query = {},
  projection = false,
  populate = false,
}) => {
  // Build the aggregation pipeline with the provided query, projection, and populate options.
  const pipeline = buildQuestionPaperPipeline({ query, projection, populate });

  // Execute the aggregation pipeline using the QuestionPaper model.
  const result = await QuestionPaper.aggregate(pipeline);

  // Since we expect a single question paper, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple question papers from the database with pagination, search, and sorting capabilities.
 *
 * @param {Object} params - The parameters for querying question papers.
 * @param {Object} [params.query={}] - The MongoDB query object to filter question papers.
 * @param {string} [params.keyword=""] - A search keyword to filter question papers based on text search.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of results per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.populate=false] - Whether to populate related fields.
 * @param {boolean} [params.all=false] - Whether to query all records without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the results and total count.
 */
const findQuestionPapers = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  populate = false,
  all = false,
}) => {
  // Execute two parallel database aggregation queries using Promise.all
  const [results, countResult] = await Promise.all([
    // Fetch question papers with filters, pagination, sorting, and projections
    QuestionPaper.aggregate(
      buildQuestionPapersPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        projection,
        populate,
        all,
      })
    ),

    // Get the total count of question papers matching the filter
    QuestionPaper.aggregate(
      buildQuestionPaperCountPipeline({
        query,
        keyword,
        populate,
      })
    ),
  ]);

  // Extract the total count from the aggregation result (default to 0 if not found)
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results along with the total count
  return { results, totalCount };
};

/**
 * Formats a question paper title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The question paper title to format.
 * @returns {string} - The formatted question paper title.
 */
const formatQuestionPaperTitle = (title) => {
  return title.trim().toUpperCase();
};

/**
 * Creates a new question paper object.
 *
 * @param {Object} params - The parameters to create the question paper.
 * @param {string} params.title - The title of the question paper.
 * @param {Object} params.exam - The associated exam information.
 * @param {Object} params.subject - The associated subject information.
 * @param {Array} params.questions - The list of questions.
 * @returns {Object} - The newly created question paper object.
 */
const createQuestionPaperObj = ({
  title,
  section,
  subject,
  exam,
  examDate,
  submissionDate,
  questions,
}) => {
  // Generate a unique question paper code
  const questionPaperCode = generateQuestionPaperCode();

  // Create a new QuestionPaper object with the provided details
  return new QuestionPaper({
    questionPaperCode,
    title,
    section,
    subject,
    exam,
    examDate,
    submissionDate,
    questions,
  });
};

/**
 * Updates an existing question paper in the database.
 *
 * @param {Object} params - The parameters for updating the question paper.
 * @param {string} params.QuestionPaperCode - The unique code of the question paper to update.
 * @param {string} [params.title] - The new title for the question paper.
 * @param {Object} [params.exam] - The updated exam information.
 * @param {Object} [params.subject] - The updated subject information.
 * @param {Array} [params.questions] - The updated list of questions.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated question paper object or null if not found.
 */
const updateQuestionPaperObj = async ({
  questionPaperCode,
  title,
  section,
  subject,
  exam,
  examDate,
  questions,
}) => {
  // Update the question paper document with the provided details
  return await QuestionPaper.findOneAndUpdate(
    { questionPaperCode },
    {
      title,
      section,
      subject,
      exam,
      examDate,
      questions,
      updatedAt: moment().valueOf(),
    }
  );
};

/**
 * Deletes a question paper from the database.
 *
 * @param {string} questionPaperCode - The unique code of the question paper to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteQuestionPaperObj = async (questionPaperCode) => {
  return await QuestionPaper.deleteOne({ questionPaperCode });
};

module.exports = {
  generateQuestionPaperCode,
  findQuestionPapers,
  findQuestionPaper,
  formatQuestionPaperTitle,
  createQuestionPaperObj,
  updateQuestionPaperObj,
  deleteQuestionPaperObj,
};
