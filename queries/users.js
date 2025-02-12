const User = require("../models/user");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  getLimitAndSkip,
} = require("../utils/helpers");

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
const findUsers = async ({
  query = {}, // MongoDB query object to filter permissions
  options = false, // Fields to include/exclude in the result
  roleOptions = false,
  rolePermissionOptions = false,
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
  populated = false,
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(start, end);

  // Query the database with the provided filters
  // Apply skip for pagination
  // Apply limit to control the number of results returned
  return populated
    ? await User.find(query, options ? hiddenFieldsUser : {})
        .skip(skip)
        .limit(limit)
        .populate({
          path: "role",
          select: roleOptions ? hiddenFieldsDefault : {},
          populate: {
            path: "rolePermissions",
            select: rolePermissionOptions ? hiddenFieldsDefault : {},
          },
        })
    : await User.find(query, options ? hiddenFieldsUser : {})
        .skip(skip)
        .limit(limit);
};

/**
 * Retrieves a single permission from the database.
 *
 * @param {Object} params - The parameters for querying a User.
 * @param {Object} params.query - The MongoDB query object to filter the User.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the permission object or null if not found.
 */
const findUser = async ({
  query = {}, // MongoDB query object to filter the permission
  options = false, // Fields to include/exclude in the result
  populated = false,
}) => {
  // Query the database to find a single permission
  // Return the first document that matches the query criteria
  return populated
    ? await User.findOne(query, options ? hiddenFieldsUser : {}).populate({
        path: "role",
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions",
          select: hiddenFieldsDefault,
        },
      })
    : await User.findOne(query, options ? hiddenFieldsUser : {});
};

module.exports = {
  findUsers, // Export function to retrieve multiple permissions
  findUser, // Export function to retrieve a single permission
};
