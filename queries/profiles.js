const moment = require("moment-timezone");
const Profile = require("../models/profile");
const {
  hiddenFieldsDefault,
  generateProfileCode,
} = require("../utils/helpers");
const { cloudinary } = require("../cloudinary");
const {
  buildProfilePipeline,
  buildProfileCountPipeline,
} = require("../pipelines/profiles");

/**
 * Retrieves all profiles from the database with pagination, filtering, sorting, population, and projection support.
 *
 * @param {Object} params - Parameters for querying profiles.
 * @param {Object} [params.query={}] - The MongoDB query object to filter profiles.
 * @param {string} [params.keyword=""] - A keyword for text-based search in profiles.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order: 'asc' for ascending or 'desc' for descending.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of records per page.
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the results and the total count.
 */
const findProfiles = async ({
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
  // Execute two parallel aggregation queries using Promise.all:
  // 1. Fetch paginated profile records with filters, sorting, field projection, and optional population of related data.
  // 2. Fetch the total count of profiles that match the query.
  const [results, countResult] = await Promise.all([
    Profile.aggregate(
      buildProfilePipeline({
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
    Profile.aggregate(
      buildProfileCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the aggregation result.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the fetched profiles and the total count.
  return { results, totalCount };
};

/**
 * Retrieves a single profile from the database.
 *
 * @param {Object} params - The parameters for querying a profile.
 * @param {Object} params.query - The MongoDB query object to filter the profile.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the profile object or null if not found.
 */
const findProfile = async ({
  query = {},
  options = false,
  populated = false,
}) => {
  // Step 1: Build the base query to find a profile
  const profileQuery = Profile.findOne(
    query,
    options ? hiddenFieldsDefault : {}
  );

  // Step 2: Conditionally populate related data if populated flag is true
  return populated
    ? profileQuery
        .populate("gender", hiddenFieldsDefault)
        .populate({
          path: "user",
          select: hiddenFieldsDefault,
          populate: {
            path: "role",
            select: hiddenFieldsDefault,
            populate: {
              path: "rolePermissions",
              select: hiddenFieldsDefault,
            },
          },
        })
        .populate({
          path: "address.city",
          select: hiddenFieldsDefault,
          populate: [
            {
              path: "state",
              select: hiddenFieldsDefault,
              populate: { path: "country", select: hiddenFieldsDefault },
            },
            { path: "country", select: hiddenFieldsDefault },
          ],
        })
        .populate({
          path: "address.state",
          select: hiddenFieldsDefault,
          populate: { path: "country", select: hiddenFieldsDefault },
        })
        .populate({ path: "address.country", select: hiddenFieldsDefault })
    : profileQuery;
};

/**
 * Removes an uploaded profile picture from Cloudinary.
 *
 * @param {string} filename - The filename of the profile picture to remove.
 * @returns {Promise<Object>} - A promise that resolves to the result of the deletion.
 */
const removeUploadedProfilePicture = async (filename) => {
  // Step 1: Check if the filename is provided and valid
  if (filename && filename.trim().length > 0) {
    // Step 2: Delete the image from Cloudinary
    return await cloudinary.uploader.destroy(filename);
  }
  return;
};

/**
 * Creates a new profile object.
 *
 * @param {Object} params - The parameters to create the profile object.
 * @returns {Object} - The newly created profile object.
 */
const createProfileObj = async ({
  firstName,
  lastName,
  profilePicture,
  dob,
  gender,
  phoneNumber,
  address,
  notification,
  social,
  user,
}) => {
  // Step 1: Generate a unique profile code
  const profileCode = generateProfileCode();

  // Step 2: Create and return the new profile object
  return new Profile({
    profileCode,
    firstName,
    lastName,
    profilePicture,
    dob,
    gender,
    phoneNumber,
    address,
    notification,
    social,
    user,
  });
};

/**
 * Updates an existing profile in the database.
 *
 * @param {Object} params - The parameters for updating the profile.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated profile object.
 */
const updateProfileObj = async ({
  profileCode,
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
    { profileCode },
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

/**
 * Deletes a profile from the database.
 *
 * @param {string} profileCode - The unique code of the profile to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteProfileObj = async (profileCode) => {
  // Step 1: Delete the profile document by profileCode
  return await Profile.deleteOne({ profileCode });
};

module.exports = {
  findProfiles, // Export function to retrieve multiple profiles
  findProfile, // Export function to retrieve a single profile
  removeUploadedProfilePicture, // Export function to remove uploaded profile picture
  createProfileObj, // Export function to create a new profile
  updateProfileObj, // Export function to update an existing profile
  deleteProfileObj, // Export function to delete a profile
};
