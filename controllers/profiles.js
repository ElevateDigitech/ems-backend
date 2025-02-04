const Profile = require("../models/profile");
const ExpressResponse = require("../utils/ExpressResponse");
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
  /* The below code snippet is extracting `profileCode`, 
  `firstName`, `lastName`, `profilePicture`, `gender`, 
  `address`, `notification`, and `user` properties from 
  the request body. */
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

  /* The below code snippet is using the `profileCode` 
  property from the request body to query the database
  for a document in the `profiles` collection. */
  const existingProfile = await Profile.findOne({ profileCode });

  /* The below code snippet is checking if no document is
  found. If so, then it returns an error response using 
  the `next` function with an `ExpressResponse ` object. */
  if (!existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  /* The below code snippet using the given `user` to
  query the database for a single document in the `users`
  collection. */
  const existingUser = await User.findOne({ userCode: user });

  /* The below code snippet is checking if no document is
  found with the given `user`. If so, then it returns an 
  error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingUser) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_USER_NOT_FOUND
      )
    );
  }

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

  /* The below code snippet is using the `genderCode` to 
  query the database for a single document in the `genders` 
  collection. */
  const existingGender = await Gender.findOne({
    genderCode: gender,
  });

  /* The below code snippet is checking if no document is
  found with the given `genderCode`. If so, it returns an 
  error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  /* The below code snippet is using the `countryCode` to 
  query the database for a single document in the `countries`
  collection. */
  const existingCountry = await Country.findOne({
    countryCode: country,
  });

  /* The below code snippet is checking if no document is
  found with the given `countryCode`. If so, it returns an 
  error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is using the `stateCode` to 
  query the database for a single document in the `states` 
  collection. */
  const existingState = await State.findOne({
    stateCode: state,
    country: existingCountry?._id,
  });

  /* The below code snippet is checking if no document is
  found with the given `stateCode`. If so, it returns an 
  error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY
      )
    );
  }

  /* The below code snippet is using the `cityCode` to query 
  the database for a single document in the `cities` 
  collection. */
  const existingCity = await City.findOne({
    cityCode: city,
    state: existingState?._id,
  });

  /* The below code snippet is checking if no document is found 
  with the given `cityCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND_UNDER_STATE
      )
    );
  }

  /* The below code snippet is generating a object `obj`. */
  const obj = {
    profileCode,
    firstName,
    lastName,
    profilePicture,
    gender: existingGender?._id,
    address: {
      ...address,
      country: existingCountry?._id,
      state: existingState?._id,
      city: existingCity?._id,
    },
    notification,
    user: existingUser?._id,
  };

  /* The below code snippet is adding social properties to the
  object `obj` based on the `social` property from the request
  body. */
  if (social) {
    obj.social = social;
  }

  /* The below code snippet is updating the instance of the
  `Profile` model with the provided data. */
  const profile = await Profile.findOneAndUpdate({ profileCode }, obj);

  /* The below code snippet is saving the updated `Profile`
  object to the database. */
  await profile.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated state document (excluding the fields 
  `__v` and `_id`) with populating the linked documents from 
  the `genders`, `users`, `roles`, `rolePermissions`, `cities`, 
  `states`, and  `countries` collections (excluding the fields 
  `__v` and `_id). */
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

  /* The below code snippet is running toJSON function on 
  found document in `profiles` */
  const updatedProfileData = updatedProfile.toJSON();

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `profileCode`
  property from the request body. */
  const { profileCode } = req.body;

  /* The below code snippet is using the `profileCode` to 
  query the database for a single document in the `genders` 
  collection. */
  const existingProfile = await Profile.findOne({
    profileCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `profileCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  /* The the below code snippet is querying the database to
  delete the document with the given `profileCode` in the
  profiles collection. */
  const profile = await Profile.deleteOne({ profileCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (profile?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_PROFILE_ERROR
      )
    );
  }

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
