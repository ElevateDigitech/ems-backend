const moment = require("moment-timezone");
const { generateStrandCode } = require("../utils/helpers");
const {
  buildStrandPipeline,
  buildStrandsPipeline,
  buildStrandCountPipeline,
} = require("../pipelines/strands");
const Strand = require("../models/strand");

/**
 * Retrieves a single strand from the database.
 *
 * @param {Object} params - The parameters for querying a strand.
 * @param {Object} params.query - The MongoDB query object to filter the strand.
 * @param {Boolean} params.projection - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the strand object or null if not found.
 */
const findStrand = async ({
  query = {}, // MongoDB query object to filter the strand
  projection = false, // Fields to include/exclude in the result
}) => {
  const pipeline = buildStrandPipeline({ query, projection });

  // Execute aggregation pipeline
  const result = await Strand.aggregate(pipeline);

  // Return the first document or null if not found
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple strands from the database with pagination, filtering, and sorting support.
 *
 * @param {Object} params - The parameters for querying strands.
 * @param {Object} [params.query={}] - The MongoDB query object to filter strands.
 * @param {string} [params.keyword=""] - A keyword to search within strands.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of strands to retrieve per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the strands and the total count.
 */
const findStrands = async ({
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
    Strand.aggregate(
      buildStrandsPipeline({
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
    Strand.aggregate(
      buildStrandCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total strand count from aggregation result, fallback to 0 if undefined.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return retrieved strands and their total count.
  return { results, totalCount };
};

/**
 * Formats a strand title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The strand title to format.
 * @returns {string} - The formatted strand title.
 */
const formatStrandTitle = (title) => {
  // Step 1: Trim whitespace and convert the title to uppercase
  return title.trim().toUpperCase();
};

/**
 * Creates a new strand object.
 *
 * @param {Object} params - The parameters to create the strand object.
 * @param {string} params.title - The title of the strand.
 * @returns {Object} - The newly created strand object.
 */
const createStrandObj = ({ title }) => {
  // Step 1: Generate a unique strand code
  const strandCode = generateStrandCode();

  // Step 2: Create a new strand object with the generated code and provided title
  return new Strand({
    strandCode,
    title,
  });
};

/**
 * Updates an existing strand in the database.
 *
 * @param {Object} params - The parameters for updating the strand.
 * @param {string} params.strandCode - The unique code of the strand to update.
 * @param {string} params.title - The new title for the strand.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated strand object.
 */
const updateStrandObj = async ({ strandCode, title }) => {
  // Step 1: Update the strand document with the provided strandCode
  return await Strand.findOneAndUpdate(
    { strandCode }, // Query to find the strand by strandCode
    {
      title, // Update the strand title
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a strand from the database.
 *
 * @param {string} strandCode - The unique code of the strand to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteStrandObj = async (strandCode) => {
  // Step 1: Delete the strand document with the provided strandCode
  return await Strand.deleteOne({ strandCode });
};

module.exports = {
  findStrands, // Export function to retrieve multiple strands
  findStrand, // Export function to retrieve a single strand
  formatStrandTitle, // Export function to format strand title
  createStrandObj, // Export function to create a new strand object
  updateStrandObj, // Export function to update an existing strand
  deleteStrandObj, // Export function to delete a strand
};
