const Profile = require("../models/profile");
const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  getCurrentUser,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_MISSING_REQUIRED_FIELDS,
  MESSAGE_GENDER_NOT_FOUND,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_USER_NOT_FOUND,
  MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY,
  MESSAGE_CITY_NOT_FOUND_UNDER_STATE,
  MESSAGE_PROFILE_NOT_FOUND_UNDER_USER,
  MESSAGE_PROFILE_NOT_FOUND,
  MESSAGE_PROFILE_EXIST,
  MESSAGE_GET_PROFILES_SUCCESS,
  MESSAGE_GET_PROFILE_SUCCESS,
  MESSAGE_CREATE_PROFILE_SUCCESS,
  MESSAGE_UPDATE_PROFILE_SUCCESS,
  MESSAGE_DELETE_PROFILE_ERROR,
  MESSAGE_DELETE_PROFILE_SUCCESS,
  MESSAGE_OWN_PROFILE_NOT_FOUND,
  MESSAGE_PROFILE_TAKEN,
  MESSAGE_PROFILE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
} = require("../utils/messages");
const {
  findProfiles,
  findProfile,
  createProfileObj,
  updateProfileObj,
  removeUploadedProfilePicture,
} = require("../queries/profiles");
const { findUser } = require("../queries/users");
const { findGender } = require("../queries/genders");
const { findCountry } = require("../queries/countries");
const { findState } = require("../queries/states");
const { findCity } = require("../queries/cities");

module.exports = {
  /**
   * Retrieves all profiles from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getProfiles: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findProfiles({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });
    // Send a success response to the client
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // Status code indicating success
        MESSAGE_GET_PROFILES_SUCCESS, // Message indicating profiles fetched successfully
        results, // The actual data (array of profile JSON objects)
        totalCount
      )
    );
  },

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetOwnProfile: async (req, res, next) => {
    // Find the logged-in user's information from the database using their userCode
    const loggedInUser = await findUser({
      query: { userCode: req.user.userCode },
    });

    // Retrieve the profile associated with the logged-in user
    const profile = await findProfile({
      query: { user: loggedInUser._id },
      options: true,
      populated: true,
    });

    // Check if the profile exists
    if (!profile) {
      // If the profile is not found, handle the error by passing an error message to the next middleware
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST, // Status code indicating a bad request
        MESSAGE_OWN_PROFILE_NOT_FOUND // Error message indicating the user's profile was not found
      );
    }

    // Send a success response with the user's profile data
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // Status code indicating success
        MESSAGE_GET_PROFILE_SUCCESS, // Message indicating the profile was fetched successfully
        profile.toJSON() // The actual profile data in JSON format
      )
    );
  },

  /**
   * Retrieves a profile based on the provided profile code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetProfileByCode: async (req, res, next) => {
    // Extract 'profileCode' from the request body
    const { profileCode } = req.body;

    // Use the 'profileCode' to find the corresponding profile in the database
    const profile = await findProfile({
      query: { profileCode },
      options: true,
      populated: true,
    });

    // Check if the profile exists
    if (!profile) {
      // If the profile is not found, handle the error
      // This sends a 400 Bad Request status code along with an error message
      return handleError(
        next, // Pass the error to the next middleware
        STATUS_CODE_BAD_REQUEST, // HTTP status code for bad request
        MESSAGE_PROFILE_NOT_FOUND // Error message indicating profile not found
      );
    }

    // If the profile exists, send a success response
    res
      .status(STATUS_CODE_SUCCESS) // Set the HTTP status code for a successful request
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS, // HTTP status code for success
          MESSAGE_GET_PROFILE_SUCCESS, // Success message
          profile.toJSON() // Convert the profile object to JSON format and send it in the response
        )
      );
  },
  /**
   * Retrieves a profile based on the provided user code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetProfileByUserCode: async (req, res, next) => {
    // Extract the userCode from the request body
    const { userCode } = req.body;

    // Validate if the userCode exists and is not an empty string
    if (!userCode || userCode.trim().length === 0) {
      // If userCode is missing or empty, handle the error with a bad request status
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Search for the user in the database using the provided userCode
    const user = await findUser({ query: { userCode } });

    // If the user is not found, handle the error indicating the user was not found
    if (!user) {
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_USER_NOT_FOUND);
    }

    // Find the profile associated with the found user's ID
    const profile = await findProfile({
      query: { user: user._id },
      options: true,
      populated: true,
    });

    // If the profile is not found, handle the error indicating the profile was not found under the user
    if (!profile) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PROFILE_NOT_FOUND_UNDER_USER
      );
    }

    // If the profile is found, send a success response with the profile data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_PROFILE_SUCCESS,
          profile.toJSON()
        )
      );
  },
  /**
   * Creates a new profile in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateProfile: async (req, res, next) => {
    // Destructure the request body to get profile details
    const {
      firstName,
      lastName = "", // Default value if lastName is not provided
      profilePicture,
      dob,
      genderCode,
      phoneNumber,
      address,
      social = null, // Default value if social is not provided
      notification,
      userCode,
    } = req.body;

    // Destructure the address object to get location codes
    const { cityCode, stateCode, countryCode } = address;
    const fileName = profilePicture?.filename;

    // Check if the user with the provided userCode exists
    const existingUser = await findUser({ query: { userCode } });
    if (!existingUser) {
      await removeUploadedProfilePicture(fileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);
    }

    // Check if a profile already exists for the user
    const existingProfile = await findProfile({
      query: { user: existingUser._id },
    });
    if (existingProfile) {
      await removeUploadedProfilePicture(fileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_EXIST);
    }

    // Check if the phone number is already associated with another profile
    const existingProfileWithPhone = await findProfile({
      query: { phoneNumber: phoneNumber?.trim() },
    });
    if (existingProfileWithPhone) {
      await removeUploadedProfilePicture(fileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN);
    }

    // Validate the gender code
    const existingGender = await findGender({ query: { genderCode } });
    if (!existingGender) {
      await removeUploadedProfilePicture(fileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);
    }

    // Validate the country code
    const existingCountry = await findCountry({ query: { countryCode } });
    if (!existingCountry) {
      await removeUploadedProfilePicture(fileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);
    }

    // Validate the state code within the specified country
    const existingState = await findState({
      query: {
        stateCode,
        country: existingCountry._id,
      },
    });
    if (!existingState) {
      await removeUploadedProfilePicture(fileName);
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      );
    }

    // Validate the city code within the specified state
    const existingCity = await findCity({
      query: {
        cityCode,
        state: existingState._id,
      },
    });
    if (!existingCity) {
      await removeUploadedProfilePicture(fileName);
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      );
    }

    // Create the profile object with the validated data
    let obj = {
      firstName,
      lastName,
      profilePicture,
      dob,
      gender: existingGender._id,
      phoneNumber,
      address: {
        ...address,
        country: existingCountry._id,
        state: existingState._id,
        city: existingCity._id,
      },
      notification,
      user: existingUser._id,
    };

    // Add social information if provided
    if (social) {
      obj.social = social;
    }

    // Create a new profile document in the database
    const profile = await createProfileObj(obj);
    await profile.save();

    // Retrieve the newly created profile to confirm creation
    const createdProfile = await findProfile({
      query: { profileCode: profile.profileCode },
      options: true,
      populated: true,
    });

    // Get the current user information from the request
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the creation action in the audit logs
    await logAudit(
      auditActions.CREATE,
      auditCollections.PROFILES,
      profile.profileCode,
      auditChanges.CREATE_PROFILE,
      null,
      createdProfile.toObject(),
      currentUser.toObject()
    );

    // Send a success response with the created profile details
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_PROFILE_SUCCESS,
          createdProfile
        )
      );
  },
  /**
   * Updates an existing profile in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateProfile: async (req, res, next) => {
    // Destructure profile-related data from the request body
    const {
      profileCode,
      firstName,
      lastName = "", // Default to an empty string if not provided
      profilePicture,
      dob,
      genderCode,
      phoneNumber,
      address,
      social = null, // Default to null if not provided
      notification,
      isProfilePictureChanged = false,
    } = req.body;

    // Destructure address-related codes
    const { cityCode, stateCode, countryCode } = address;
    const newFileName = profilePicture?.filename;

    // Check if the profile with the provided profileCode exists
    const existingProfile = await findProfile({ query: { profileCode } });
    if (!existingProfile) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_NOT_FOUND);
    }

    const fileName = existingProfile?.profilePicture?.filename;

    // Check if the provided phone number is already associated with another profile
    const existingProfileWithPhone = await findProfile({
      query: {
        profileCode: { $ne: profileCode }, // Exclude current profile
        phoneNumber: phoneNumber?.trim(), // Trim whitespace
      },
    });
    if (existingProfileWithPhone) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN);
    }

    // Validate if the provided genderCode exists
    const existingGender = await findGender({ query: { genderCode } });
    if (!existingGender) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);
    }

    // Validate if the provided countryCode exists
    const existingCountry = await findCountry({ query: { countryCode } });
    if (!existingCountry) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);
    }

    // Validate if the provided stateCode exists under the provided country
    const existingState = await findState({
      query: {
        stateCode,
        country: existingCountry._id,
      },
    });
    if (!existingState) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      );
    }

    // Validate if the provided cityCode exists under the provided state
    const existingCity = await findCity({
      query: {
        cityCode,
        state: existingState._id,
      },
    });
    if (!existingCity) {
      await removeUploadedProfilePicture(newFileName);
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      );
    }

    // Save previous profile data for audit logging
    const previousData = await findProfile({
      query: { profileCode },
      options: true,
      populated: true,
    });

    // Prepare the updated profile object
    let obj = {
      firstName,
      lastName,
      profilePicture,
      dob,
      gender: existingGender._id,
      phoneNumber,
      address: {
        ...address,
        country: existingCountry._id,
        state: existingState._id,
        city: existingCity._id,
      },
      notification,
      social,
    };

    // Add social details if provided
    if (social) {
      obj.social = social;
    }

    if (isProfilePictureChanged) {
      await removeUploadedProfilePicture(fileName);
    } else {
      await removeUploadedProfilePicture(newFileName);
    }

    // Update the profile with the new data
    await updateProfileObj({ genderCode, ...obj });

    // Fetch the updated profile data
    const updatedProfile = await findProfile({
      query: { profileCode },
      options: true,
      populated: true,
    });

    // Fetch the current user making the request
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the profile update action for auditing purposes
    await logAudit(
      auditActions.UPDATE,
      auditCollections.PROFILES,
      existingProfile.profileCode,
      auditChanges.UPDATE_PROFILE,
      previousData.toObject(),
      updatedProfile.toObject(),
      currentUser.toObject()
    );

    // Send a success response with the updated profile data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_PROFILE_SUCCESS,
          updatedProfile
        )
      );
  },
  /**
   * Deletes a profile from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteProfile: async (req, res, next) => {
    // Extract the profileCode from the request body
    const { profileCode } = req.body;

    // Check if the profile with the given profileCode exists in the database
    const existingProfile = await Profile.findOne({ profileCode });
    if (!existingProfile)
      // If the profile does not exist, return an error response
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_NOT_FOUND);

    const fileName = existingProfile?.profilePicture?.filename;

    // Check if the profile is referenced by any other objects in the system
    const { isReferenced } = await IsObjectIdReferenced(existingProfile._id);
    if (isReferenced)
      // If the profile is referenced elsewhere, deletion is not allowed
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Convert the existing profile document to a plain JavaScript object for audit logging
    const previousData = await findProfile({
      query: { profileCode },
      options: true,
      populated: true,
    });

    await removeUploadedProfilePicture(fileName);

    // Attempt to delete the profile from the database
    const deletionResult = await existingProfile.deleteOne();

    // Check if the deletion was successful
    if (deletionResult.deletedCount === 0)
      // If no documents were deleted, return an internal server error
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_PROFILE_ERROR
      );

    // Find the current user who initiated the delete request
    const currentUser = await findUserByCode(req.user.userCode);

    // Log the deletion action for audit purposes
    await logAudit(
      auditActions.DELETE,
      auditCollections.PROFILES,
      existingProfile.profileCode,
      auditChanges.DELETE_PROFILE,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Send a success response indicating the profile was deleted successfully
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_PROFILE_SUCCESS));
  },
};
