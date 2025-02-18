const moment = require("moment-timezone");
const State = require("../models/state");
const {
  toCapitalize,
  generateStateCode,
  hiddenFieldsDefault,
} = require("../utils/helpers");
const searchFields = ["action", "module", "changes", "before", "after"];

/**
 * Retrieves all states from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying states.
 * @param {Object} params.query - The MongoDB query object to filter states.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of states.
 */
const findStates = async ({
  query = {},
  options = false,
  page = 1,
  perPage = 10,
  populated = false,
  sortField,
  sortValue,
  keyword,
}) => {
  const limit = parseInt(perPage); // Number of items to return
  const skip = (parseInt(page) - 1) * parseInt(perPage); // Number of items to skip // Step 1: Calculate pagination parameters

  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    const filterQueries = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
    query.$or = query.$or ? [...query.$or, ...filterQueries] : filterQueries;
  }

  const sortOptions =
    sortField && sortField?.length > 0 && sortValue && sortValue?.length > 0
      ? { [sortField]: sortValue }
      : { _id: -1 };

  // Step 2: Build the base query to find states
  const statesQuery = State.find(query, options ? hiddenFieldsDefault : {})
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related country data if populated flag is true
  return populated
    ? statesQuery.populate("country", hiddenFieldsDefault)
    : statesQuery;
};

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
  options = false,
  populated = false,
}) => {
  const stateQuery = State.findOne(query, options ? hiddenFieldsDefault : {}); // Step 1: Build the base query to find a state

  // Step 2: Conditionally populate related country data if populated flag is true
  return populated
    ? stateQuery.populate("country", hiddenFieldsDefault)
    : stateQuery;
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

const getTotalStates = async (keyword) => {
  const filter = {};
  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
  }
  const total = await State.countDocuments(filter);
  return total;
};

module.exports = {
  findStates, // Export function to retrieve multiple states
  findState, // Export function to retrieve a single state
  formatStateFields, // Export function to format state fields
  createStateObj, // Export function to create a new state
  updateStateObj, // Export function to update an existing state
  deleteStateObj, // Export function to delete a state
  getTotalStates,
};
