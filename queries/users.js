const User = require("../models/user");
const { hiddenFieldsUser, hiddenFieldsDefault } = require("../utils/helpers");
const searchFields = ["action", "module", "changes", "before", "after"];

/**
 * Retrieves multiple users from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying users.
 * @param {Object} params.query - The MongoDB query object to filter users.
 * @param {boolean} params.options - Determines whether to exclude hidden fields.
 * @param {number} params.page - Current page number for pagination (default is 1).
 * @param {number} params.perPage - Number of users per page (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of users.
 */
const findUsers = async ({
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
  const usersQuery = User.find(query, options ? hiddenFieldsUser : {})
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
  return populated
    ? usersQuery.populate({
        path: "role",
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions",
          select: hiddenFieldsDefault,
        },
      })
    : usersQuery;
};

/**
 * Retrieves a single user from the database.
 *
 * @param {Object} params - The parameters for querying a user.
 * @param {Object} params.query - The MongoDB query object to filter the user.
 * @param {boolean} params.options - Determines whether to exclude hidden fields.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the user object or null if not found.
 */
const findUser = async ({ query = {}, options = false, populated = false }) => {
  const userQuery = User.findOne(query, options ? hiddenFieldsUser : {});

  return populated
    ? userQuery.populate({
        path: "role",
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions",
          select: hiddenFieldsDefault,
        },
      })
    : userQuery;
};

const getTotalUsers = async (keyword) => {
  const filter = {};
  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
  }
  const total = await User.countDocuments(filter);
  return total;
};

module.exports = {
  findUsers,
  findUser,
  getTotalUsers,
};
