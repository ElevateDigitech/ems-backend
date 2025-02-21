const moment = require("moment-timezone");
const State = require("../models/state");
const {
  toCapitalize,
  generateStateCode,
  hiddenFieldsDefault,
} = require("../utils/helpers");
const {
  buildStatesPipeline,
  buildStateCountPipeline,
  buildStatePipeline,
} = require("../pipelines/states");

/**
 * Retrieves a single state from the database.
 *
 * @param {Object} params - The parameters for querying a state.
 * @param {Object} params.query - The MongoDB query object to filter the state.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the state object or null if not found.
 */
const findState = async ({
  query = {},
  projection = false,
  populate = false,
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildStatePipeline({ query, projection, populate });

  // Execute the aggregation pipeline using the audit log model.
  const result = await State.aggregate(pipeline);

  // Since we expect a single audit log, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all states from the database with pagination, sorting, filtering, and population support.
 *
 * @param {Object} params - The parameters for querying states.
 * @param {Object} [params.query={}] - The MongoDB query object to filter states.
 * @param {string} [params.keyword=""] - A keyword for search functionality.
 * @param {string} [params.sortField="_id"] - The field to sort the results by (default is _id).
 * @param {string} [params.sortValue="desc"] - The sort direction, either 'asc' or 'desc' (default is 'desc').
 * @param {number} [params.page=1] - The page number for pagination (default is 1).
 * @param {number} [params.limit=10] - The number of records per page (default is 10).
 * @param {boolean} [params.populate=false] - Whether to populate related data (default is false).
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise resolving to an object containing results and totalCount.
 */
const findStates = async ({
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
  // Execute two parallel aggregate queries for efficiency
  const [results, countResult] = await Promise.all([
    // Fetch paginated, sorted, and optionally populated results
    State.aggregate(
      buildStatesPipeline({
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

    // Fetch the total count of matching documents without pagination
    State.aggregate(
      buildStateCountPipeline({
        query,
        keyword,
        populate,
      })
    ),
  ]);

  // Extract the total count from the aggregation result
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results and the total number of matching documents
  return { results, totalCount };
};

/**
 * Formats state fields by trimming whitespace and converting to proper case.
 *
 * @param {Object} params - The state details to format.
 * @param {string} params.name - The state name to format.
 * @param {string} params.iso - The ISO code to format.
 * @returns {Object} - The formatted state details.
 */
const formatStateFields = ({ name, iso }) => {
  return {
    formattedName: toCapitalize(name), // Step 1: Capitalize the state name
    formattedISO: iso.toUpperCase(), // Step 2: Convert ISO code to uppercase
  };
};

/**
 * Creates a new state object.
 *
 * @param {Object} params - The parameters to create the state object.
 * @param {string} params.name - The name of the state.
 * @param {string} params.iso - The ISO code of the state.
 * @param {string} params.country - The associated country ID.
 * @returns {Object} - The newly created state object.
 */
const createStateObj = async ({ name, iso, country }) => {
  const stateCode = generateStateCode(); // Step 1: Generate a unique state code

  // Step 2: Create and return the new state object
  return new State({
    stateCode,
    name,
    iso,
    country,
  });
};

/**
 * Updates an existing state in the database.
 *
 * @param {Object} params - The parameters for updating the state.
 * @param {string} params.stateCode - The unique code of the state to update.
 * @param {string} params.name - The new name for the state.
 * @param {string} params.iso - The new ISO code for the state.
 * @param {string} params.country - The new associated country ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated state object.
 */
const updateStateObj = async ({ stateCode, name, iso, country }) => {
  return await State.findOneAndUpdate(
    { stateCode }, // Step 1: Identify the state by its code
    {
      name, // Step 2: Update the name
      iso, // Step 3: Update the ISO code
      country, // Step 4: Update the associated country
      updatedAt: moment().valueOf(), // Step 5: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a state from the database.
 *
 * @param {string} stateCode - The unique code of the state to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteStateObj = async (stateCode) => {
  return await State.deleteOne({ stateCode }); // Step 1: Delete the state document by stateCode
};

module.exports = {
  findStates, // Export function to retrieve multiple states
  findState, // Export function to retrieve a single state
  formatStateFields, // Export function to format state fields
  createStateObj, // Export function to create a new state
  updateStateObj, // Export function to update an existing state
  deleteStateObj, // Export function to delete a state
};
