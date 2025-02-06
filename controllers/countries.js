const moment = require("moment-timezone");
const Country = require("../models/country");
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
  toCapitalize,
  generateCountryCode,
  IsObjectIdReferenced,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_COUNTRY_EXIST,
  MESSAGE_CREATE_COUNTRY_SUCCESS,
  MESSAGE_GET_COUNTRIES_SUCCESS,
  MESSAGE_GET_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_UPDATE_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_COUNTRY_SUCCESS,
  MESSAGE_DELETE_COUNTRY_ERROR,
  MESSAGE_COUNTRY_TAKEN,
} = require("../utils/messages");

// Utility Functions
const findCountryByCode = async (countryCode) =>
  await Country.findOne({ countryCode }, hiddenFieldsDefault);
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: { path: "rolePermissions", select: hiddenFieldsDefault },
  });

// Country Controller
module.exports = {
  /**
   * Retrieves all countries from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetCountries: async (req, res) => {
    // Fetch all countries from the database
    const countries = await Country.find({}, hiddenFieldsDefault);

    // Send the retrieved countries in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_COUNTRIES_SUCCESS,
          countries
        )
      );
  },

  /**
   * Retrieves a country by its unique country code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetCountryByCode: async (req, res, next) => {
    // Extract the country code from the request body
    const { countryCode } = req.body;

    // Find the country by its unique code
    const country = await findCountryByCode(countryCode);

    // Return the country details if found, else return an error
    return country
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_COUNTRY_SUCCESS,
              country
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_COUNTRY_NOT_FOUND);
  },

  /**
   * Creates a new country in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateCountry: async (req, res, next) => {
    // Extract country details from the request body
    const { name, iso2, iso3 } = req.body;
    const formattedName = toCapitalize(name);

    // Check if a country with the same name or ISO codes already exists
    const existingCountry = await Country.findOne({
      $or: [
        { name: formattedName },
        { iso2: iso2.toUpperCase() },
        { iso3: iso3.toUpperCase() },
      ],
    });

    // Return error if duplicate country exists
    if (existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_EXIST);

    // Create a new country document
    const newCountry = new Country({
      countryCode: generateCountryCode(),
      name: formattedName,
      iso2: iso2.toUpperCase(),
      iso3: iso3.toUpperCase(),
    });
    await newCountry.save();

    // Log the audit for the creation
    const createdCountry = await findCountryByCode(newCountry.countryCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.COUNTRIES,
      createdCountry.countryCode,
      auditChanges.CREATE_COUNTRY,
      null,
      createdCountry.toObject(),
      currentUser.toObject()
    );

    // Send the created country as response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_COUNTRY_SUCCESS,
          createdCountry
        )
      );
  },

  /**
   * Updates an existing country in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateCountry: async (req, res, next) => {
    // Extract country details from the request body
    const { countryCode, name, iso2, iso3 } = req.body;
    const formattedName = toCapitalize(name);

    // Find the existing country by code
    const existingCountry = await findCountryByCode(countryCode);

    // Return error if country does not exist
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Check for duplicate country details
    const duplicateCountry = await Country.findOne({
      countryCode: { $ne: countryCode },
      $or: [
        { name: formattedName },
        { iso2: iso2.toUpperCase() },
        { iso3: iso3.toUpperCase() },
      ],
    });

    if (duplicateCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_TAKEN);

    // Update the country details
    const previousData = existingCountry.toObject();
    await Country.findOneAndUpdate(
      { countryCode },
      {
        name: formattedName,
        iso2: iso2.toUpperCase(),
        iso3: iso3.toUpperCase(),
        updatedAt: moment().valueOf(),
      }
    );

    // Log the update audit
    const updatedCountry = await findCountryByCode(countryCode);
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.COUNTRIES,
      countryCode,
      auditChanges.UPDATE_COUNTRY,
      previousData,
      updatedCountry.toObject(),
      currentUser.toObject()
    );

    // Send the updated country as response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_COUNTRY_SUCCESS,
          updatedCountry
        )
      );
  },

  /**
   * Deletes a country from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteCountry: async (req, res, next) => {
    // Extract country code from the request body
    const { countryCode } = req.body;

    // Find the country by code
    const existingCountry = await findCountryByCode(countryCode);

    // Return error if country not found
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Check if the country is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingCountry._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete the country from the database
    const previousData = existingCountry.toObject();
    const deletionResult = await Country.deleteOne({ countryCode });

    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_COUNTRY_ERROR
      );

    // Log the deletion audit
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.COUNTRIES,
      countryCode,
      auditChanges.DELETE_COUNTRY,
      previousData,
      null,
      currentUser.toObject()
    );

    // Send the deletion success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_COUNTRY_SUCCESS));
  },
};
