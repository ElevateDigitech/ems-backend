const User = require("../models/user");
const {
  buildUserPipeline,
  buildUserCountPipeline,
} = require("../pipelines/users");
const {
  hiddenFieldsUser,
  hiddenFieldsDefault,
  generateUserCode,
} = require("../utils/helpers");

/**
 * Retrieves multiple users from the database with pagination, sorting, search, and population support.
 *
 * @param {Object} params - The parameters for querying users.
 * @param {Object} params.query - The MongoDB query object to filter users.
 * @param {string} [params.keyword=""] - Search keyword to match against user fields.
 * @param {string} [params.sortField="_id"] - Field by which the results should be sorted.
 * @param {string} [params.sortValue="desc"] - Sorting order: 'asc' or 'desc'.
 * @param {number} [params.page=1] - Current page number for pagination (default is 1).
 * @param {number} [params.limit=10] - Number of users per page (default is 10).
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing an array of users and the total count.
 */
const findUsers = async ({
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
  // Execute two parallel aggregation queries for efficiency
  const [results, countResult] = await Promise.all([
    // Fetch paginated, sorted, and optionally populated results
    User.aggregate(
      buildUserPipeline({
        query, // MongoDB filter query
        keyword, // Search keyword
        sortField, // Sorting field
        sortValue, // Sorting order
        page, // Current page number
        limit, // Results per page
        populate, // Populate related fields if true
        projection,
        all,
      })
    ),

    // Fetch the total count of matching documents without pagination
    User.aggregate(
      buildUserCountPipeline({
        query, // MongoDB filter query
        keyword, // Search keyword
      })
    ),
  ]);

  // Extract the total document count from the aggregation result
  const totalCount = countResult[0]?.totalCount || 0;

  // Return paginated results along with the total number of matching documents
  return { results, totalCount };
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

/**
 * Creates a new profile object.
 *
 * @param {Object} params - The parameters to create the profile object.
 * @returns {Object} - The newly created profile object.
 */
const createUserObj = async ({
  email,
  username,
  userAllowDeletion,
  roleId,
}) => {
  // Create new user object
  const user = new User({
    userCode: generateUserCode(), // Generate unique user code
    email: email.trim().toLowerCase(), // Normalize email
    username, // Set username
    userAllowDeletion, // Set deletion permission
    role: roleId, // Assign role ID
  });

  // Register the user with the provided password
  await User.register(user, password);

  return user;
};

/**
 * Updates an existing profile in the database.
 *
 * @param {Object} params - The parameters for updating the profile.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated profile object.
 */
const updateUserObj = async ({
  userCode,
  firstName,
  lastName,
  profilePicture,
  dob,
  gender,
  phoneNumber,
  address,
  notification,
  social,
}) => {
  // Step 1: Find the profile by its code and update the fields
  return await Profile.findOneAndUpdate(
    { userCode },
    {
      firstName,
      lastName,
      profilePicture,
      dob,
      gender,
      phoneNumber,
      address,
      notification,
      social,
      updatedAt: moment().valueOf(), // Step 2: Set the current timestamp for the update
    }
  );
};

const deleteUserObj = async (userCode) => {
  return await User.deleteOne({ userCode });
};

module.exports = {
  findUsers,
  findUser,
  createUserObj,
  updateUserObj,
  deleteUserObj,
};
