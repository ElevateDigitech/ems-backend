const Profile = require("../models/profile");
const Gender = require("../models/gender");
const Country = require("../models/country");
const State = require("../models/state");
const City = require("../models/city");
const User = require("../models/user");
const ExpressResponse = require("../utils/ExpressResponse");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  generateProfileCode,
  generateAuditCode,
} = require("../utils/helpers");
const { STATUS_SUCCESS, STATUS_ERROR } = require("../utils/status");
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
} = require("../utils/messages");

module.exports.getProfiles = async (req, res, next) => {
  // Query the `Profile` collection and populate related fields
  const profiles = await Profile.find({}, hiddenFieldsDefault)
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // Convert queried profiles to JSON format
  const profilesJSON = profiles.map((profile) => profile.toJSON());

  // Send success response with retrieved profiles
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILES_SUCCESS,
        profilesJSON
      )
    );
};

module.exports.GetOwnProfile = async (req, res, next) => {
  /// Extract userCode from the request object
  const { userCode } = req.user;

  // Query the Profile document based on userCode and populate related fields
  const profile = await Profile.findOne(
    {
      userCode,
    },
    hiddenFieldsDefault
  )
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // If no profile is found, return an error response
  if (!profile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_OWN_PROFILE_NOT_FOUND
      )
    );
  }

  // Convert the profile object to JSON format
  const profileJSON = profile.toJSON();

  // Send a success response with the retrieved profile data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profileJSON
      )
    );
};

module.exports.GetProfileByCode = async (req, res, next) => {
  // Extract profileCode from the request body
  const { profileCode } = req.body;

  // Query the Profile document using profileCode and populate related fields
  const profile = await Profile.findOne(
    {
      profileCode,
    },
    hiddenFieldsDefault
  )
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // If no profile is found, return an error response
  if (!profile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  // Convert the profile object to JSON format
  const profileJSON = profile.toJSON();

  // Send a success response with the retrieved profile data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profileJSON
      )
    );
};

module.exports.GetProfileByUserCode = async (req, res, next) => {
  // Extract userCode from the request body and validate it
  const { userCode } = req.body;
  if (!userCode || userCode.trim().length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      )
    );
  }

  // Search for the user in the database using the provided userCode
  const user = await User.findOne({ userCode });
  if (!user) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_USER_NOT_FOUND
      )
    );
  }

  // Query the Profile document associated with the found user and populate related fields
  const profile = await Profile.findOne(
    {
      user: user._id,
    },
    hiddenFieldsDefault
  )
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // If no profile is found, return an error response
  if (!profile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PROFILE_NOT_FOUND_UNDER_USER
      )
    );
  }

  // Convert the profile object to JSON format
  const profileJSON = profile.toJSON();

  // Send a success response with the retrieved profile data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profileJSON
      )
    );
};

module.exports.CreateProfile = async (req, res, next) => {
  // Destructure properties from the request body with default values where applicable
  const {
    firstName,
    lastName = "",
    profilePicture,
    gender,
    phoneNumber,
    address,
    social = null,
    notification,
    user,
  } = req.body;
  const { city, state, country } = address;

  // Look for an existing user with the provided userCode
  const existingUser = await User.findOne({
    userCode: user,
  });
  if (!existingUser) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_USER_NOT_FOUND
      )
    );
  }

  // Check if a profile already exists for the user
  const existingProfile = await Profile.findOne({
    user: existingUser._id,
  });
  if (existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_EXIST
      )
    );
  }

  // Check if a profile with the given phone number already exists
  const existingProfileWithPhone = await Profile.findOne({
    phoneNumber: phoneNumber?.trim(),
  });
  if (existingProfileWithPhone) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_TAKEN
      )
    );
  }

  // Retrieve the gender document using the genderCode
  const existingGender = await Gender.findOne({
    genderCode: gender,
  });
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  // Retrieve the country document using the countryCode
  const existingCountry = await Country.findOne({
    countryCode: country,
  });
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Retrieve the state document using the stateCode and ensure it belongs to the country
  const existingState = await State.findOne({
    stateCode: state,
    country: existingCountry._id,
  });
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      )
    );
  }

  // Retrieve the city document using the cityCode and ensure it belongs to the state
  const existingCity = await City.findOne({
    cityCode: city,
    state: existingState._id,
  });
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      )
    );
  }

  // Generate a unique profileCode for the new profile
  const profileCode = generateProfileCode();

  // Construct the profile object with the retrieved data
  const profileData = {
    profileCode,
    firstName,
    lastName,
    profilePicture,
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

  // Include social data if provided
  if (social) {
    profileData.social = social;
  }

  // Create a new profile instance and save it to the database
  const profile = new Profile(profileData);
  await profile.save();

  // Retrieve the newly created profile with related documents populated
  const createdProfile = await Profile.findOne(
    { profileCode },
    hiddenFieldsDefault
  )
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // Convert the profile document to JSON format
  const createdProfileData = createdProfile.toJSON();

  // Retrieve the current logged-in user and their role
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Log the profile creation in the audit log
  await logAudit(
    generateAuditCode(),
    auditActions.CREATE,
    auditCollections.PROFILES,
    createdProfileData.profileCode,
    auditChanges.CREATE_PROFILE,
    null,
    createdProfileData.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the created profile data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_PROFILE_SUCCESS,
        createdProfileData
      )
    );
};

module.exports.UpdateProfile = async (req, res, next) => {
  // Extract the required properties from the request body.
  const {
    profileCode,
    firstName,
    lastName = "",
    profilePicture,
    phoneNumber,
    gender,
    address,
    social = null,
    notification,
    user,
  } = req.body;

  const { city, state, country } = address;

  // Query the database to find a profile with the provided `profileCode`.
  const existingProfile = await Profile.findOne({
    profileCode,
  });

  // If no profile is found, return an error response.
  if (!existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  // Query the database to find a user with the provided `user` code.
  const existingUser = await User.findOne({
    userCode: user,
  });

  // If no user is found, return an error response.
  if (!existingUser) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_USER_NOT_FOUND
      )
    );
  }

  // Check if the provided phone number already exists in the database for a different profile.
  const existingProfileWithPhone = await Profile.findOne({
    profileCode: { $ne: profileCode },
    phoneNumber: phoneNumber?.trim(),
  });
  if (existingProfileWithPhone) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_TAKEN
      )
    );
  }

  // Query the `genders` collection to find the gender by `genderCode`.
  const existingGender = await Gender.findOne({
    genderCode: gender,
  });

  // If no gender is found, return an error response.
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  // Query the `countries` collection to find the country by `countryCode`.
  const existingCountry = await Country.findOne({
    countryCode: country,
  });

  // If no country is found, return an error response.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Query the `states` collection to find the state by `stateCode` and the associated country.
  const existingState = await State.findOne({
    stateCode: state,
    country: existingCountry?._id,
  });

  // If no state is found, return an error response.
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      )
    );
  }

  // Query the `cities` collection to find the city by `cityCode` and the associated state.
  const existingCity = await City.findOne({
    cityCode: city,
    state: existingState?._id,
  });

  // If no city is found, return an error response.
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      )
    );
  }

  // Create an object to update the profile.
  const obj = {
    profileCode,
    firstName,
    lastName,
    profilePicture,
    gender: existingGender?._id,
    phoneNumber,
    address: {
      ...address,
      country: existingCountry?._id,
      state: existingState?._id,
      city: existingCity?._id,
    },
    notification,
    user: existingUser?._id,
  };

  // Add the `social` property to the object if provided in the request body.
  if (social) {
    obj.social = social;
  }

  // Retrieve the profile document before updating it, excluding certain fields.
  const profileBeforeUpdate = await City.findOne(
    { cityCode },
    hiddenFieldsDefault
  );

  // Update the profile in the database with the new information.
  const profile = await Profile.findOneAndUpdate(
    {
      profileCode,
    },
    obj
  );

  // Save the updated profile object.
  await profile.save();

  // Query the database to retrieve the updated profile, including related documents such as gender, user, role, city, state, and country.
  const updatedProfile = await Profile.findOne(
    { profileCode },
    hiddenFieldsDefault
  )
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
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        },
        {
          path: "country",
          select: hiddenFieldsDefault,
        },
      ],
    })
    .populate({
      path: "address.state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate({
      path: "address.country",
      select: hiddenFieldsDefault,
    });

  // Convert the updated profile to JSON format.
  const updatedProfileData = updatedProfile.toJSON();

  // Retrieve the current logged-in user's details using their `userCode`.
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Log the profile update in the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.CITIES,
    updatedProfileData?.cityCode,
    auditChanges?.UPDATE_CITY,
    profileBeforeUpdate?.toObject(),
    updatedProfileData?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response indicating that the profile was updated successfully.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_PROFILE_SUCCESS,
        updatedProfileData
      )
    );
};

module.exports.DeleteProfile = async (req, res, next) => {
  // Extract the `profileCode` from the request body.
  const { profileCode } = req.body;

  // Use the `profileCode` to query the database for a profile document.
  const existingProfile = await Profile.findOne({
    profileCode,
  });

  // If no profile is found, return an error response.
  if (!existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  // Delete the profile document with the provided `profileCode`.
  const profile = await Profile.deleteOne({
    profileCode,
  });

  // Check if the deletion was successful by verifying `deletedCount`.
  // If no document was deleted, return an error response.
  if (profile?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_PROFILE_ERROR
      )
    );
  }

  // Return a success response indicating that the profile was deleted successfully.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_PROFILE_SUCCESS
      )
    );
};
