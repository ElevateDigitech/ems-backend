const moment = require("moment-timezone");
const Mark = require("../models/mark");
const { hiddenFieldsDefault, generateMarkCode } = require("../utils/helpers");
const {
  buildMarkPipeline,
  buildMarkCountPipeline,
} = require("../pipelines/marks");

/**
 * Retrieves all marks from the database with support for pagination, sorting, keyword search, and population.
 *
 * @param {Object} params - The parameters for querying marks.
 * @param {Object} [params.query={}] - The MongoDB query object to filter marks.
 * @param {string} [params.keyword=""] - A keyword to search within specific fields (optional).
 * @param {string} [params.sortField="_id"] - The field to sort the results by (default is "_id").
 * @param {string} [params.sortValue="desc"] - The sorting order ("asc" or "desc", default is "desc").
 * @param {number} [params.page=1] - The current page number for pagination (default is 1).
 * @param {number} [params.limit=10] - The number of items per page for pagination (default is 10).
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise resolving to an object containing:
 */
const findMarks = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  populate = false,
  projection = false,
  all = false,
}) => {
  // Executes two parallel aggregation pipelines using Promise.all for efficiency:
  const [results, countResult] = await Promise.all([
    // Pipeline to fetch the paginated and sorted marks based on filters.
    Mark.aggregate(
      buildMarkPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        populate,
        projection,
        all,
      })
    ),

    // Pipeline to get the total count of matching marks based on filters (ignores pagination).
    Mark.aggregate(
      buildMarkCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the result. Defaults to 0 if not found.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return both results and the total count for pagination support.
  return { results, totalCount };
};

/**
 * Retrieves a single mark from the database.
 *
 * @param {Object} params - The parameters for querying a mark.
 * @param {Object} params.query - The MongoDB query object to filter the mark.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the mark object or null if not found.
 */
const findMark = async ({ query = {}, options = false, populated = false }) => {
  // Step 1: Build the base query to find a mark
  const markQuery = Mark.findOne(query, options ? hiddenFieldsDefault : {});

  // Step 2: Conditionally populate related exam, student, and subject data if populated flag is true
  return populated
    ? markQuery
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
    : markQuery;
};

/**
 * Creates a new mark object.
 *
 * @param {Object} params - The parameters to create the mark object.
 * @param {number} params.markEarned - The marks earned by the student.
 * @param {number} params.markTotal - The total marks possible.
 * @param {string} params.exam - The associated exam ID.
 * @param {string} params.student - The associated student ID.
 * @param {string} params.subject - The associated subject ID.
 * @returns {Object} - The newly created mark object.
 */
const createMarkObj = async ({
  markEarned,
  markTotal,
  exam,
  student,
  subject,
}) => {
  // Step 1: Generate a unique mark code
  const markCode = generateMarkCode();

  // Step 2: Create and return the new mark object
  return new Mark({
    markCode,
    markEarned,
    markTotal,
    exam,
    student,
    subject,
  });
};

/**
 * Updates an existing mark in the database.
 *
 * @param {Object} params - The parameters for updating the mark.
 * @param {string} params.markCode - The unique code of the mark to update.
 * @param {number} params.markEarned - The new marks earned.
 * @param {number} params.markTotal - The new total marks possible.
 * @param {string} params.exam - The new associated exam ID.
 * @param {string} params.student - The new associated student ID.
 * @param {string} params.subject - The new associated subject ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated mark object.
 */
const updateMarkObj = async ({
  markCode,
  markEarned,
  markTotal,
  exam,
  student,
  subject,
}) => {
  // Step 1: Identify the mark by its code and update the fields
  return await Mark.findOneAndUpdate(
    { markCode },
    {
      markEarned,
      markTotal,
      exam,
      student,
      subject,
      updatedAt: moment().valueOf(), // Step 2: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a mark from the database.
 *
 * @param {string} markCode - The unique code of the mark to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteMarkObj = async (markCode) => {
  // Step 1: Delete the mark document by markCode
  return await Mark.deleteOne({ markCode });
};

module.exports = {
  findMarks, // Export function to retrieve multiple marks
  findMark, // Export function to retrieve a single mark
  createMarkObj, // Export function to create a new mark
  updateMarkObj, // Export function to update an existing mark
  deleteMarkObj, // Export function to delete a mark
};
