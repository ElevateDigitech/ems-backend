const moment = require("moment-timezone");
const Gender = require("../models/gender");
const { hiddenFieldsDefault, generateGenderCode } = require("../utils/helpers");
const searchFields = ["action", "module", "changes", "before", "after"];

/**
 * Retrieves multiple genders from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying genders.
 * @param {Object} params.query - The MongoDB query object to filter genders.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of genders.
 */
const findGenders = async ({
  query = {}, // MongoDB query object to filter genders
  options = false, // Fields to include/exclude in the result
  page = 1, // Current page for pagination (default is 1)
  perPage = 10, // Items per page for pagination (default is 10)
  sortField,
  sortValue,
  keyword,
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const limit = parseInt(perPage); // Number of items to return
  const skip = (parseInt(page) - 1) * parseInt(perPage); // Number of items to skip

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

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await Gender.find(query, options ? hiddenFieldsDefault : {})
    .sort(sortOptions)
    .skip(skip) // Apply skip
    .limit(limit); // Apply limit
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

const getTotalGenders = async (keyword) => {
  const filter = {};
  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
  }
  const total = await Gender.countDocuments(filter);
  return total;
};

module.exports = {
  findGenders, // Export function to retrieve multiple genders
  findGender, // Export function to retrieve a single gender
  formatGenderName, // Export function to format gender names
  createGenderObj, // Export function to create a new gender object
  updateGenderObj, // Export function to update an existing gender
  deleteGenderObj, // Export function to delete a gender
  getTotalGenders,
};
