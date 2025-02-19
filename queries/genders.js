const moment = require("moment-timezone");
const Gender = require("../models/gender");
const { hiddenFieldsDefault, generateGenderCode } = require("../utils/helpers");
const {
  buildGenderPipeline,
  buildGenderCountPipeline,
} = require("../pipelines/genders");

/**
 * Retrieves multiple genders from the database with pagination, filtering, sorting, and optional projection support.
 *
 * @param {Object} params - The parameters for querying genders.
 * @param {Object} [params.query={}] - The MongoDB query object to filter genders.
 * @param {string} [params.keyword=""] - Search keyword for filtering results based on text fields.
 * @param {string} [params.sortField="_id"] - Field by which to sort the results.
 * @param {string} [params.sortValue="desc"] - Sort order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - Current page number for pagination.
 * @param {number} [params.limit=10] - Number of results to return per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the results and totalCount.
 */
const findGenders = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute two parallel aggregation queries:
  // 1. Fetch the gender records with filtering, sorting, pagination, and optional projection.
  // 2. Count the total number of gender records matching the query and keyword filter.
  const [results, countResult] = await Promise.all([
    Gender.aggregate(
      buildGenderPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        populate, // Assuming this variable is defined elsewhere for populating references.
        projection, // Apply field projection if requested.
        all,
      })
    ),
    Gender.aggregate(
      buildGenderCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the count aggregation result.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results and the total count.
  return { results, totalCount };
};

/**
 * Retrieves a single gender from the database.
 *
 * @param {Object} params - The parameters for querying a gender.
 * @param {Object} params.query - The MongoDB query object to filter the gender.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the gender object or null if not found.
 */
const findGender = async ({
  query = {}, // MongoDB query object to filter the gender
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single gender based on the query criteria
  return await Gender.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats a gender name by trimming whitespace and converting it to uppercase.
 *
 * @param {string} name - The gender name to format.
 * @returns {string} - The formatted gender name.
 */
const formatGenderName = (name) => {
  // Step 1: Trim whitespace and convert the name to uppercase
  return name.trim().toUpperCase();
};

/**
 * Creates a new gender object.
 *
 * @param {Object} params - The parameters to create the gender object.
 * @param {string} params.genderName - The name of the gender.
 * @returns {Object} - The newly created gender object.
 */
const createGenderObj = async ({ genderName }) => {
  // Step 1: Generate a unique gender code
  const genderCode = generateGenderCode();

  // Step 2: Create a new Gender object with the generated code and provided name
  return new Gender({
    genderCode,
    genderName,
  });
};

/**
 * Updates an existing gender in the database.
 *
 * @param {Object} params - The parameters for updating the gender.
 * @param {string} params.genderCode - The unique code of the gender to update.
 * @param {string} params.genderName - The new name for the gender.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated gender object.
 */
const updateGenderObj = async ({ genderCode, genderName }) => {
  // Step 1: Update the gender document with the provided genderCode
  return await Gender.findOneAndUpdate(
    { genderCode }, // Query to find the gender
    {
      genderName, // Update the gender name
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a gender from the database.
 *
 * @param {string} genderCode - The unique code of the gender to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteGenderObj = async (genderCode) => {
  // Step 1: Delete the gender document with the provided genderCode
  return await Gender.deleteOne({ genderCode });
};

module.exports = {
  findGenders, // Export function to retrieve multiple genders
  findGender, // Export function to retrieve a single gender
  formatGenderName, // Export function to format gender names
  createGenderObj, // Export function to create a new gender object
  updateGenderObj, // Export function to update an existing gender
  deleteGenderObj, // Export function to delete a gender
};
