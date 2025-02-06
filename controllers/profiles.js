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
} = require("../utils/messages");

const findProfilesByQuery = async (query) => {
  return Profile.find(query, hiddenFieldsDefault)
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
};

const findProfileByQuery = async (query) => {
  return Profile.findOne(query, hiddenFieldsDefault)
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
};

const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
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
    const profiles = await findProfilesByQuery({});
    const profilesJSON = profiles.map((profile) => profile.toJSON());

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_PROFILES_SUCCESS,
          profilesJSON
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
    const profile = await findProfileByQuery({ userCode: req.user.userCode });
    if (!profile) {
      return next(
        handleError(STATUS_CODE_BAD_REQUEST, MESSAGE_OWN_PROFILE_NOT_FOUND)
      );
    }
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
   * Retrieves a profile based on the provided profile code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetProfileByCode: async (req, res, next) => {
    const { profileCode } = req.body;
    const profile = await findProfileByQuery({ profileCode });
    if (!profile) {
      return next(
        handleError(STATUS_CODE_BAD_REQUEST, MESSAGE_PROFILE_NOT_FOUND)
      );
    }
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
   * Retrieves a profile based on the provided user code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetProfileByUserCode: async (req, res, next) => {
    const { userCode } = req.body;
    if (!userCode || userCode.trim().length === 0) {
      return next(
        handleError(STATUS_CODE_BAD_REQUEST, MESSAGE_MISSING_REQUIRED_FIELDS)
      );
    }
    const user = await User.findOne({ userCode });
    if (!user) {
      return next(handleError(STATUS_CODE_BAD_REQUEST, MESSAGE_USER_NOT_FOUND));
    }
    const profile = await findProfileByQuery({ user: user._id });
    if (!profile) {
      return next(
        handleError(
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_PROFILE_NOT_FOUND_UNDER_USER
        )
      );
    }
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
    const {
      firstName,
      lastName = "",
      profilePicture,
      genderCode,
      phoneNumber,
      address,
      social = null,
      notification,
      userCode,
    } = req.body;
    const { cityCode, stateCode, countryCode } = address;

    const existingUser = await User.findOne({ userCode });
    if (!existingUser)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND));

    const existingProfile = await findProfileByQuery({
      user: existingUser._id,
    });
    if (existingProfile)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_PROFILE_EXIST));

    const existingProfileWithPhone = await findProfileByQuery({
      phoneNumber: phoneNumber?.trim(),
    });
    if (existingProfileWithPhone)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN));

    const existingGender = await Gender.findOne({ genderCode });
    if (!existingGender)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND));

    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND));

    const existingState = await State.findOne({
      stateCode,
      country: existingCountry._id,
    });
    if (!existingState)
      return next(
        handleError(STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY)
      );

    const existingCity = await City.findOne({
      cityCode,
      state: existingState._id,
    });
    if (!existingCity)
      return next(
        handleError(STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND_UNDER_STATE)
      );

    const profileCode = generateProfileCode();
    const profile = new Profile({
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
      social,
    });

    await profile.save();

    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.PROFILES,
      profile.profileCode,
      auditChanges.CREATE_PROFILE,
      null,
      profile.toObject(),
      currentUser.toObject()
    );

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_PROFILE_SUCCESS,
          profile.toJSON()
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
    const {
      profileCode,
      firstName,
      lastName = "",
      profilePicture,
      genderCode,
      phoneNumber,
      address,
      social = null,
      notification,
    } = req.body;
    const { cityCode, stateCode, countryCode } = address;

    const existingProfile = await findProfileByQuery({ profileCode });
    if (!existingProfile)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_PROFILE_NOT_FOUND));

    const existingProfileWithPhone = await findProfileByQuery({
      profileCode: { $ne: profileCode },
      phoneNumber: phoneNumber?.trim(),
    });
    if (existingProfileWithPhone)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_PROFILE_TAKEN));

    const existingGender = await Gender.findOne({ genderCode });
    if (!existingGender)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND));

    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND));

    const existingState = await State.findOne({
      stateCode,
      country: existingCountry._id,
    });
    if (!existingState)
      return next(
        handleError(STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY)
      );

    const existingCity = await City.findOne({
      cityCode,
      state: existingState._id,
    });
    if (!existingCity)
      return next(
        handleError(STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND_UNDER_STATE)
      );

    const previousData = existingProfile.toObject();
    await Profile.findOneAndUpdate(
      { genderCode },
      {
        firstName,
        lastName,
        profilePicture,
        phoneNumber,
        gender: existingGender._id,
        address: {
          ...address,
          country: existingCountry._id,
          state: existingState._id,
          city: existingCity._id,
        },
        notification,
        social,
      }
    );

    const updatedProfile = await findProfileByQuery({ profileCode });
    const currentUser = await findUserByCode(req.user.userCode);
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
    const { profileCode } = req.body;

    const existingProfile = await findProfileByQuery({ profileCode });
    if (!existingProfile)
      return next(handleError(STATUS_CODE_CONFLICT, MESSAGE_PROFILE_NOT_FOUND));

    const previousData = existingProfile.toObject();
    const deletionResult = await existingProfile.deleteOne();

    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_PROFILE_ERROR
      );

    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.PROFILES,
      existingProfile.profileCode,
      auditChanges.DELETE_PROFILE,
      previousData,
      null,
      currentUser.toObject()
    );

    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_PROFILE_SUCCESS));
  },
};
