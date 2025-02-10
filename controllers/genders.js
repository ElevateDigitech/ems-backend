const moment = require("moment-timezone");
const Gender = require("../models/gender");
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
  IsObjectIdReferenced,
  generateGenderCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GENDER_EXIST,
  MESSAGE_CREATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_FOUND,
  MESSAGE_UPDATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_GENDERS_ERROR,
  MESSAGE_DELETE_GENDERS_SUCCESS,
  MESSAGE_GET_GENDER_SUCCESS,
  MESSAGE_GET_GENDERS_SUCCESS,
  MESSAGE_GENDER_TAKEN,
} = require("../utils/messages");

// Utility functions
const findGenderByCode = async (genderCode) =>
  await Gender.findOne({ genderCode }, hiddenFieldsDefault);
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: { path: "rolePermissions", select: hiddenFieldsDefault },
  });

// Gender Controller
module.exports = {
  /**
   * Retrieves all genders from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetGenders: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Fetch all gender documents
    const genders = await Gender.find({}, hiddenFieldsDefault).limit(entries);

    // Return success response with fetched data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_GENDERS_SUCCESS, genders)
      );
  },

  /**
   * Retrieves a gender by its unique gender code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetGenderByCode: async (req, res, next) => {
    const { genderCode } = req.body;

    // Fetch gender by provided genderCode
    const gender = await findGenderByCode(genderCode);

    // Return response based on gender existence
    return gender
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_GENDER_SUCCESS,
              gender
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_GENDER_NOT_FOUND);
  },

  /**
   * Creates a new gender in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateGender: async (req, res, next) => {
    const { genderName } = req.body;
    const formattedName = genderName.trim().toUpperCase();

    // Check if gender already exists
    if (await Gender.findOne({ genderName: formattedName }))
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_EXIST);

    // Create new gender
    const newGender = new Gender({
      genderCode: generateGenderCode(),
      genderName: formattedName,
    });
    await newGender.save();

    // Log creation
    const createdGender = await findGenderByCode(newGender.genderCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.GENDERS,
      createdGender.genderCode,
      auditChanges.CREATE_GENDER,
      null,
      createdGender.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_GENDERS_SUCCESS,
          createdGender
        )
      );
  },

  /**
   * Updates an existing gender in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateGender: async (req, res, next) => {
    const { genderCode, genderName } = req.body;
    const formattedName = genderName.trim().toUpperCase();

    // Check for existing gender
    const existingGender = await findGenderByCode(genderCode);
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);

    // Check if new gender name is taken
    if (
      await Gender.findOne({
        genderCode: { $ne: genderCode },
        genderName: formattedName,
      })
    )
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_TAKEN);

    // Update gender data
    const previousData = existingGender.toObject();
    await Gender.findOneAndUpdate(
      { genderCode },
      {
        genderName: formattedName,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the update audit
    const updatedGender = await findCountryByCode(countryCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.GENDERS,
      genderCode,
      auditChanges.UPDATE_GENDER,
      previousData,
      updatedGender.toObject(),
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_GENDERS_SUCCESS,
          updatedGender
        )
      );
  },

  /**
   * Deletes a gender from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteGender: async (req, res, next) => {
    const { genderCode } = req.body;
    const existingGender = await findGenderByCode(genderCode);

    // Validate gender existence
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);

    // Check if gender is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingCountry._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete gender
    const previousData = existingGender.toObject();
    const deletionResult = await Gender.deleteOne({ genderCode });

    // Validate deletion
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_GENDERS_ERROR
      );

    // Log deletion
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.GENDERS,
      genderCode,
      auditChanges.DELETE_GENDER,
      previousData,
      null,
      currentUser.toObject()
    );

    // Return success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_GENDERS_SUCCESS));
  },
};
