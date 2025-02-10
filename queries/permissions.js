const Permission = require("../models/permission");
const { hiddenFieldsDefault } = require("../utils/helpers");

/**
 * Retrieves multiple permissions from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying permissions.
 * @param {Object} params.query - The MongoDB query object to filter permissions.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of permissions.
 */
const findPermissions = async ({
  query = {}, // MongoDB query object to filter permissions
  options = hiddenFieldsDefault, // Fields to include/exclude in the result
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
}) => {
  // Calculate the number of entries to fetch
  const limit = (end > 0 ? end : 10) - (start > 0 ? start : 1) + 1;

  // Calculate how many entries to skip
  const skip = (start > 0 ? start : 1) - 1;

  // Query the database with the provided filters
  // Apply skip for pagination
  // Apply limit to control the number of results returned
  return await Permission.find(query, options).skip(skip).limit(limit);
};

/**
 * Retrieves a single permission from the database.
 *
 * @param {Object} params - The parameters for querying a permission.
 * @param {Object} params.query - The MongoDB query object to filter the permission.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the permission object or null if not found.
 */
const findPermission = async ({
  query = {}, // MongoDB query object to filter the permission
  options = hiddenFieldsDefault, // Fields to include/exclude in the result
}) => {
  // Query the database to find a single permission
  // Return the first document that matches the query criteria
  return await Permission.findOne(query, options);
};

module.exports = {
  findPermissions, // Export function to retrieve multiple permissions
  findPermission, // Export function to retrieve a single permission
};
