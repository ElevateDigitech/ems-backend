const Profile = require("../models/profile");
const Gender = require("../models/gender");
const Country = require("../models/country");
const State = require("../models/state");
const City = require("../models/city");
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleError,
  handleSuccess,
  generateProfileCode,
  generateAuditCode,
  IsObjectIdReferenced,
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

// Function to find multiple profiles based on a query
const findProfilesByQuery = async (query, limit) => {
  return Profile.find(query, hiddenFieldsDefault)
    .populate("gender", hiddenFieldsDefault) // Populating gender field
    .populate({
      path: "user", // Populating user field
      select: hiddenFieldsDefault,
      populate: {
        path: "role", // Populating user's role
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions", // Populating role permissions
          select: hiddenFieldsDefault,
        },
      },
    })
    .populate({
      path: "address.city", // Populating address.city field
      select: hiddenFieldsDefault,
      populate: [
        {
          path: "state", // Populating state under city
          select: hiddenFieldsDefault,
          populate: {
            path: "country", // Populating country under state
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country", // Populating country under city
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state", // Populating address.state field
      select: hiddenFieldsDefault,
      populate: {
        path: "country", // Populating country under state
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country", // Populating address.country field
      select: hiddenFieldsDefault,
    })
    .limit(limit);
};

// Function to find a single profile based on a query
const findProfileByQuery = async (query) => {
  return Profile.findOne(query, hiddenFieldsDefault)
    .populate("gender", hiddenFieldsDefault) // Populating gender field
    .populate({
      path: "user", // Populating user field
      select: hiddenFieldsDefault,
      populate: {
        path: "role", // Populating user's role
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions", // Populating role permissions
          select: hiddenFieldsDefault,
        },
      },
    })
    .populate({
      path: "address.city", // Populating address.city field
      select: hiddenFieldsDefault,
      populate: [
        {
          path: "state", // Populating state under city
          select: hiddenFieldsDefault,
          populate: {
            path: "country", // Populating country under state
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country", // Populating country under city
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state", // Populating address.state field
      select: hiddenFieldsDefault,
      populate: {
        path: "country", // Populating country under state
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country", // Populating address.country field
      select: hiddenFieldsDefault,
    });
};

// Function to find a user based on user code
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role", // Populating user's role
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions", // Populating role permissions
      select: hiddenFieldsDefault,
    },
  });

module.exports = {
  /**
   * Retrieves all profiles from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getProfiles: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Retrieve all profiles from the database using an empty query object
    const profiles = await findProfilesByQuery({}, entries);

    // Convert each profile object to a plain JSON object for easier handling
    const profilesJSON = profiles.map((profile) => profile.toJSON());

    // Send a success response to the client
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // Status code indicating success
        MESSAGE_GET_PROFILES_SUCCESS, // Message indicating profiles fetched successfully
        profilesJSON // The actual data (array of profile JSON objects)
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
    const loggedInUser = await User.findOne({ userCode: req.user.userCode });

    // Retrieve the profile associated with the logged-in user
    const profile = await findProfileByQuery({ user: loggedInUser });

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
    const profile = await findProfileByQuery({ profileCode });

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
    const user = await User.findOne({ userCode });

    // If the user is not found, handle the error indicating the user was not found
    if (!user) {
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_USER_NOT_FOUND);
    }

    // Find the profile associated with the found user's ID
    const profile = await findProfileByQuery({ user: user._id });

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

    // Check if the user with the provided userCode exists
    const existingUser = await User.findOne({ userCode });
    if (!existingUser)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);

    // Check if a profile already exists for the user
    const existingProfile = await findProfileByQuery({
      user: existingUser._id,
    });
    if (existingProfile)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_EXIST);

    // Check if the phone number is already associated with another profile
    const existingProfileWithPhone = await findProfileByQuery({
      phoneNumber: phoneNumber?.trim(),
    });
    if (existingProfileWithPhone)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN);

    // Validate the gender code
    const existingGender = await Gender.findOne({ genderCode });
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);

    // Validate the country code
    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Validate the state code within the specified country
    const existingState = await State.findOne({
      stateCode,
      country: existingCountry._id,
    });
    if (!existingState)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      );

    // Validate the city code within the specified state
    const existingCity = await City.findOne({
      cityCode,
      state: existingState._id,
    });
    if (!existingCity)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      );

    // Generate a unique profile code
    const profileCode = generateProfileCode();

    // Create the profile object with the validated data
    let obj = {
      profileCode,
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
    const profile = new Profile(obj);
    await profile.save();

    // Retrieve the newly created profile to confirm creation
    const createdProfile = await findProfileByQuery({ profileCode });

    // Get the current user information from the request
    const currentUser = await findUserByCode(req.user.userCode);

    // Log the creation action in the audit logs
    await logAudit(
      generateAuditCode(),
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
    } = req.body;

    // Destructure address-related codes
    const { cityCode, stateCode, countryCode } = address;

    // Check if the profile with the provided profileCode exists
    const existingProfile = await findProfileByQuery({ profileCode });
    if (!existingProfile)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_NOT_FOUND);

    // Check if the provided phone number is already associated with another profile
    const existingProfileWithPhone = await findProfileByQuery({
      profileCode: { $ne: profileCode }, // Exclude current profile
      phoneNumber: phoneNumber?.trim(), // Trim whitespace
    });
    if (existingProfileWithPhone)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN);

    // Validate if the provided genderCode exists
    const existingGender = await Gender.findOne({ genderCode });
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);

    // Validate if the provided countryCode exists
    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Validate if the provided stateCode exists under the provided country
    const existingState = await State.findOne({
      stateCode,
      country: existingCountry._id,
    });
    if (!existingState)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      );

    // Validate if the provided cityCode exists under the provided state
    const existingCity = await City.findOne({
      cityCode,
      state: existingState._id,
    });
    if (!existingCity)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      );

    // Save previous profile data for audit logging
    const previousData = existingProfile.toObject();

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

    // Update the profile with the new data
    await Profile.findOneAndUpdate({ genderCode }, obj);

    // Fetch the updated profile data
    const updatedProfile = await findProfileByQuery({ profileCode });

    // Fetch the current user making the request
    const currentUser = await findUserByCode(req.user.userCode);

    // Log the profile update action for auditing purposes
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.PROFILES,
      existingProfile.profileCode,
      auditChanges.UPDATE_PROFILE,
      previousData,
      updatedProfile,
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
    const previousData = await findProfileByQuery({ profileCode });

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
      generateAuditCode(),
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
