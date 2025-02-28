const moment = require("moment-timezone");
const Question = require("../models/question");
const { generateQuestionCode } = require("../utils/helpers");
const {
  buildQuestionPipeline,
  buildQuestionsPipeline,
  buildQuestionCountPipeline,
} = require("../pipelines/questions");

/**
 * Retrieves a single class from the database.
 *
 * @param {Object} params - The parameters for querying a Question.
 * @param {Object} params.query - The MongoDB query object to filter the Question.
 * @param {Boolean} params.projection - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the class object or null if not found.
 */
const findQuestion = async ({
  query = {}, // MongoDB query object to filter the class
  projection = false, // Fields to include/exclude in the result
}) => {
  const pipeline = buildQuestionPipeline({ query, projection });

  // Execute aggregation pipeline
  const result = await Question.aggregate(pipeline);

  // Return the first document or null if not found
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple classes from the database with pagination, filtering, and sorting support.
 *
 * @param {Object} params - The parameters for querying classes.
 * @param {Object} [params.query={}] - The MongoDB query object to filter classes.
 * @param {string} [params.keyword=""] - A keyword to search within classes.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of classes to retrieve per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the classes and the total count.
 */
const findQuestions = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute aggregation pipelines concurrently for efficiency.
  const [results, countResult] = await Promise.all([
    Question.aggregate(
      buildQuestionsPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        projection,
        all,
      })
    ),
    Question.aggregate(
      buildQuestionCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total class count from aggregation result, fallback to 0 if undefined.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return retrieved classes and their total count.
  return { results, totalCount };
};

/**
 * Creates a new class object.
 *
 * @param {Object} params - The parameters to create the class object.
 * @param {string} params.level - The level of the Question.
 * @param {string} params.total - The total for the Question.
 * @returns {Object} - The newly created class object.
 */
const createQuestionObj = ({ level, total }) => {
  // Step 1: Generate a unique class code
  const questionCode = generateQuestionCode();

  // Step 2: Create a new Class object with the generated code and provided level
  return new Question({
    questionCode,
    level,
    total,
  });
};

/**
 * Updates an existing class in the database.
 *
 * @param {Object} params - The parameters for updating the Question.
 * @param {string} params.questionCode - The unique code of the class to update.
 * @param {string} params.level - The new level for the Question.
 * @param {string} params.total - The new level for the Question.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated class object.
 */
const updateQuestionObj = async ({ questionCode, level, total }) => {
  // Step 1: Update the class document with the provided questionCode
  return await Question.findOneAndUpdate(
    { questionCode }, // Query to find the class by questionCode
    {
      level, // Update the class level
      total,
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a class from the database.
 *
 * @param {string} questionCode - The unique code of the class to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteQuestionObj = async (questionCode) => {
  // Step 1: Delete the class document with the provided questionCode
  return await Question.deleteOne({ questionCode });
};

module.exports = {
  findQuestion, // Export function to retrieve a single class
  findQuestions, // Export function to retrieve multiple classes
  createQuestionObj, // Export function to create a new class object
  updateQuestionObj, // Export function to update an existing class
  deleteQuestionObj, // Export function to delete a class
};
