const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");
const SubStrand = require("../models/subStrand");
const {
  buildSubStrandPipeline,
  buildSubStrandsPipeline,
  buildSubStrandCountPipeline,
} = require("../pipelines/subStrands");
const generateSubStrandCode = () => `SUB-STRAND-${uuidv4()}`;

/**
 * Retrieves a single sub strand from the database.
 *
 * @param {Object} params - The parameters for querying a sub strand.
 * @param {Object} params.query - The MongoDB query object to filter the sub strand.
 * @param {Boolean} params.projection - Fields to include or exclude from the result.
 * @param {boolean} params.populate - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the strand object or null if not found.
 */
const findSubStrand = async ({
  query = {}, // MongoDB query object to filter the strand
  projection = false, // Fields to include/exclude in the result
  populate = false,
}) => {
  const pipeline = buildSubStrandPipeline({ query, projection, populate });

  // Execute aggregation pipeline
  const result = await SubStrand.aggregate(pipeline);

  // Return the first document or null if not found
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple sub strands from the database with pagination, filtering, and sorting support.
 *
 * @param {Object} params - The parameters for querying sub strands.
 * @param {Object} [params.query={}] - The MongoDB query object to filter sub strands.
 * @param {string} [params.keyword=""] - A keyword to search within sub strands.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of sub strands to retrieve per page.
 * @param {boolean} [params.populate=false] - Determines whether related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the sub strands and the total count.
 */
const findSubStrands = async ({
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
  // Execute aggregation pipelines concurrently for efficiency.
  const [results, countResult] = await Promise.all([
    SubStrand.aggregate(
      buildSubStrandsPipeline({
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
    SubStrand.aggregate(
      buildSubStrandCountPipeline({
        query,
        keyword,
        populate,
      })
    ),
  ]);

  // Extract total sub strand count from aggregation result, fallback to 0 if undefined.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return retrieved sub strands and their total count.
  return { results, totalCount };
};

/**
 * Formats a strand title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The strand title to format.
 * @returns {string} - The formatted strand title.
 */
const formatSubStrandTitle = (title) => {
  // Step 1: Trim whitespace and convert the title to uppercase
  return title.trim().toUpperCase();
};

/**
 * Creates a new sub strand object.
 *
 * @param {Object} params - The parameters to create the sub strand object.
 * @param {string} params.title - The title of the sub strand.
 * @param {string} params.strandId - The title of the sub strand.
 * @returns {Object} - The newly created sub strand object.
 */
const createSubStrandObj = ({ title, strandId }) => {
  // Step 1: Generate a unique sub strand code
  const subStrandCode = generateSubStrandCode();

  // Step 2: Create a new strand object with the generated code and provided title
  return new SubStrand({
    subStrandCode,
    title,
    strand: strandId,
  });
};

/**
 * Updates an existing sub strand in the database.
 *
 * @param {Object} params - The parameters for updating the sub strand.
 * @param {string} params.subStrandCode - The unique code of the sub strand to update.
 * @param {string} params.title - The new title for the sub strand.
 * @param {string} params.strandId - The new title for the sub strand.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated sub strand object.
 */
const updateSubStrandObj = async ({ subStrandCode, title, strandId }) => {
  // Step 1: Update the strand document with the provided subStrandCode
  return await SubStrand.findOneAndUpdate(
    { subStrandCode }, // Query to find the strand by subStrandCode
    {
      title, // Update the strand title
      strand: strandId,
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a sub strand from the database.
 *
 * @param {string} subStrandCode - The unique code of the sub strand to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteSubStrandObj = async (subStrandCode) => {
  // Step 1: Delete the strand document with the provided subStrandCode
  return await SubStrand.deleteOne({ subStrandCode });
};

module.exports = {
  generateSubStrandCode,
  findSubStrands, // Export function to retrieve multiple strands
  findSubStrand, // Export function to retrieve a single strand
  formatSubStrandTitle, // Export function to format strand title
  createSubStrandObj, // Export function to create a new strand object
  updateSubStrandObj, // Export function to update an existing strand
  deleteSubStrandObj, // Export function to delete a strand
};
