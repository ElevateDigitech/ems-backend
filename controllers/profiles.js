const Profile = require("../models/profile");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  hiddenFieldsDefault,
  generateProfileCode,
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
} = require("../utils/messages");
const Gender = require("../models/gender");
const Country = require("../models/country");
const State = require("../models/state");
const City = require("../models/city");
const User = require("../models/user");

module.exports.getProfiles = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `profiles` collection (excluding
  the fields `__v` and `_id`) with populating the linked 
  documents from the `genders`, `users`, `roles`, 
  `rolePermissions`, `cities`, `states`, and `countries`
  collections (excluding the fields `__v` and `_id). */
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

  /* The below code snippet is running toJSON function on 
  every document in the profiles array */
  const profilesJSON = profiles.map((doc) => doc.toJSON());

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `userCode`
  property from the user object in the request. It then 
  uses this `userCode` to query the database for a single 
  document in the `profiles` collection (excluding the fields 
  `__v` and `_id`) with populating the linked documents from 
  the `genders`, `users`, `roles`, `rolePermissions`, `cities`, 
  `states`, and `countries` collections (excluding the fields 
  `__v` and `_id). */
  const { userCode } = req.user;
  const profiles = await Profile.findOne({ userCode }, hiddenFieldsDefault)
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

  /* The below code snippet is checking if the `profiles` variable
  is falsy, which means that no document was found in the database
  that matches the specified `profileCode` provided in the request
  parameters. If no document is found (`profiles` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!profiles) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_OWN_PROFILE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is running toJSON function on 
  found document in `profiles` */
  const profilesJSON = profiles.toJSON();

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profilesJSON
      )
    );
};

module.exports.GetProfileByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `profileCode`
  property from the request body. It then uses this `profileCode`
  to query the database for a single document in the `profiles`
  collection (excluding the fields `__v` and `_id`) with 
  populating the linked documents from the `genders`, `users`,
  `roles`, `rolePermissions`, `cities`, `states`, and `countries`
  collections (excluding the fields `__v` and `_id). */
  const { profileCode } = req.body;
  const profiles = await Profile.findOne({ profileCode }, hiddenFieldsDefault)
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

  /* The below code snippet is checking if the `profiles` variable
  is falsy, which means that no document was found in the database
  that matches the specified `profileCode` provided in the request
  parameters. If no document is found (`profiles` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!profiles) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PROFILE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is running toJSON function on 
  found document in `profiles` */
  const profilesJSON = profiles.toJSON();

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profilesJSON
      )
    );
};

module.exports.GetProfileByUserCode = async (req, res, next) => {
  /* The below code snippet is extracting the `userCode`
  property from the request body. */
  const { userCode } = req.body;

  if (!userCode || userCode?.trim()?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      )
    );
  }

  /* The below code snippet uses the `userCode` to query the 
  database to find a document in the `users` collection. */
  const user = await User.findOne({ userCode });

  /* The below code snippet is checking if the `user` variable
  is falsy, which means that no document was found in the database
  that matches the specified `userCode` provided in the request
  parameters. If no document is found (`user` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!user) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_USER_NOT_FOUND
      )
    );
  }

  /* The below code snippet uses the `_id` from the above found user
  document to query the database to find a document the `profiles` 
  collection (excluding the fields `__v` and `_id`) with populating 
  the linked documents from the `genders`, `users`, `roles`, 
  `rolePermissions`, `cities`, `states`, and  `countries` collections 
  (excluding the fields `__v` and `_id).*/
  const profiles = await Profile.findOne(
    { user: user?._id },
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

  /* The below code snippet is checking if the `profiles` variable
  is falsy, which means that no document was found in the database
  that matches the specified `_id` found in the above found `user` 
  document. If no document is found (`profiles` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!profiles) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PROFILE_NOT_FOUND_UNDER_USER
      )
    );
  }

  /* The below code snippet is running toJSON function on 
  found document in `profiles` */
  const profilesJSON = profiles.toJSON();

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PROFILE_SUCCESS,
        profilesJSON
      )
    );
};

module.exports.CreateProfile = async (req, res, next) => {
  /* The below code snippet is extracting `firstName`, 
  `lastName`, `profilePicture`, `gender`, `address`, 
  `notification`, and `user` properties from the 
  request body. */
  const {
    firstName,
    lastName = "",
    profilePicture,
    gender,
    address,
    social = null,
    notification,
    user,
  } = req.body;

  /* The below code snippet is extracting `city`, `state`, 
  and `country` from the address object. */
  const { city, state, country } = address;

  /* The below code snippet using the given `user` to
  query the database for a single document in the `users`
  collection. */
  const existingUser = await User.findOne({ userCode: user });

  /* The below code snippet is checking if no document is
  found with the given `user`. If so, then it returns
  an error response using the `next` function with an
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

  /* The below code snippet is using the `_id` of the 
  `existingUser` to check for if a profile for this user
  is already there. */
  const existingProfile = await Profile.findOne({ user: existingUser?._id });

  /* The below code snippet is checking if a document is
  found. If so, then it returns an error response using 
  the `next` function with an `ExpressResponse ` object. */
  if (existingProfile) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_PROFILE_EXIST
      )
    );
  }

  /* The below code snippet is using the `genderCode`
  to query the database for a single document in the
  `genders` collection. */
  const existingGender = await Gender.findOne({
    genderCode: gender,
  });

  /* The below code snippet is checking if no document is
  found with the given `genderCode`. If so, it returns
  an error response using the `next` function with an
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

  /* The below code snippet is using the `countryCode`
  to query the database for a single document in the
  `countries` collection. */
  const existingCountry = await Country.findOne({
    countryCode: country,
  });

  /* The below code snippet is checking if no document is
  found with the given `countryCode`. If so, it returns
  an error response using the `next` function with an
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

  /* The below code snippet is generating a unique `profileCode`
  for a new profile being created. */
  const profileCode = generateProfileCode();

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

  /* The below code snippet is creating a new instance of the
  `Profile` model with the provided object `obj`. */
  const profile = new Profile(obj);

  /* The below code snippet is saving the newly created
  `Profile` object to the database. */
  await profile.save();

  /* The below code snippet is querying the database to find
  the newly created profile document using the above generated 
  `profileCode` (excluding the fields `__v` and `_id`) with 
  populating the linked documents from the `genders`, `users`, 
  `roles`, `rolePermissions`, `cities`, `states`, and  `countries`
  collections (excluding the fields `__v` and `_id). */
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

  /* The below code snippet is running toJSON function on 
  found document in `profiles` */
  const createdProfileData = createdProfile.toJSON();

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
