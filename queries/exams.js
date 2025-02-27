const moment = require("moment-timezone");
const Exam = require("../models/exam");
const { generateExamCode } = require("../utils/helpers");
const {
  buildExamsPipeline,
  buildExamCountPipeline,
  buildExamPipeline,
} = require("../pipelines/exams");

/**
 * Retrieves a single exam from the database.
 *
 * @param {Object} params - The parameters for querying an exam.
 * @param {Object} params.query - The MongoDB query object to filter the exam.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the exam object or null if not found.
 */
const findExam = async ({
  query = {}, // MongoDB query object to filter the exam
  projection = false, // Fields to include/exclude in the result
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildExamPipeline({ query, projection });

  // Execute the aggregation pipeline using the audit log model.
  const result = await Exam.aggregate(pipeline);

  // Since we expect a single audit log, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all exams from the database with pagination, search, and sorting capabilities.
 *
 * @param {Object} params - The parameters for querying exams.
 * @param {Object} [params.query={}] - The MongoDB query object to filter exams.
 * @param {string} [params.keyword=""] - A search keyword to filter exams based on text search.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of results per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the results and total count.
 */
const findExams = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute two parallel database aggregation queries using Promise.all
  const [results, countResult] = await Promise.all([
    // Fetch exams based on provided filters, pagination, sorting, and projection
    Exam.aggregate(
      buildExamsPipeline({
        query, // Query filter object
        keyword, // Search keyword for filtering
        sortField, // Field to sort by
        sortValue, // Sorting order ('asc' or 'desc')
        page, // Current page number for pagination
        limit, // Number of results per page
        projection,
        all,
      })
    ),

    // Get the total count of exams matching the filter
    Exam.aggregate(
      buildExamCountPipeline({
        query, // Query filter object
        keyword, // Search keyword for filtering
      })
    ),
  ]);

  // Extract the total count from the aggregation result (default to 0 if not found)
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results along with the total count
  return { results, totalCount };
};

/**
 * Formats an exam title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The exam title to format.
 * @returns {string} - The formatted exam title.
 */
const formatExamTitle = (title) => {
  // Step 1: Trim whitespace and convert the title to uppercase
  return title.trim().toUpperCase();
};

/**
 * Creates a new exam object.
 *
 * @param {Object} params - The parameters to create the exam object.
 * @param {string} params.title - The title of the exam.
 * @returns {Object} - The newly created exam object.
 */
const createExamObj = async ({ title, date }) => {
  // Step 1: Generate a unique exam code
  const examCode = generateExamCode();

  // Step 2: Create a new Exam object with the generated code and provided title
  return new Exam({
    examCode,
    title,
    date,
  });
};

/**
 * Updates an existing exam in the database.
 *
 * @param {Object} params - The parameters for updating the exam.
 * @param {string} params.examCode - The unique code of the exam to update.
 * @param {string} params.title - The new title for the exam.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated exam object.
 */
const updateExamObj = async ({ examCode, title, date }) => {
  // Step 1: Update the exam document with the provided examCode
  return await Exam.findOneAndUpdate(
    { examCode }, // Query to find the exam by examCode
    {
      title, // Update the exam title
      date,
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes an exam from the database.
 *
 * @param {string} examCode - The unique code of the exam to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteExamObj = async (examCode) => {
  // Step 1: Delete the exam document with the provided examCode
  return await Exam.deleteOne({ examCode });
};

module.exports = {
  findExams, // Export function to retrieve multiple exams
  findExam, // Export function to retrieve a single exam
  formatExamTitle, // Export function to format exam titles
  createExamObj, // Export function to create a new exam object
  updateExamObj, // Export function to update an existing exam
  deleteExamObj, // Export function to delete an exam
};
