const moment = require("moment-timezone");
const Profile = require("../models/profile");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  generateProfileCode,
} = require("../utils/helpers");
const { cloudinary } = require("../cloudinary");

/**
 * Retrieves all profiles from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying profiles.
 * @param {Object} params.query - The MongoDB query object to filter profiles.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of profiles.
 */
const findProfiles = async ({
  query = {},
  options = false,
  start = 1,
  end = 10,
  populated = false,
}) => {
  // Step 1: Calculate pagination parameters
  const { limit, skip } = getLimitAndSkip(start, end);

  // Step 2: Build the base query to find profiles
  const profilesQuery = Profile.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related data if populated flag is true
  return populated
    ? profilesQuery
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
    : profilesQuery;
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
