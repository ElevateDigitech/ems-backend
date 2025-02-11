const moment = require("moment-timezone");
const City = require("../models/city");
const State = require("../models/state");
const Country = require("../models/country");
const User = require("../models/user");
const { logAudit } = require("../queries/auditLogs");
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
  IsObjectIdReferenced,
  generateCityCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_CITY_EXIST,
  MESSAGE_CREATE_CITY_SUCCESS,
  MESSAGE_GET_CITIES_SUCCESS,
  MESSAGE_GET_CITY_SUCCESS,
  MESSAGE_CITY_NOT_FOUND,
  MESSAGE_UPDATE_CITY_SUCCESS,
  MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_CITY_SUCCESS,
  MESSAGE_DELETE_CITY_ERROR,
  MESSAGE_CITIES_NOT_FOUND,
  MESSAGE_STATE_NOT_FOUND,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_CITY_TAKEN,
} = require("../utils/messages");

// Utility functions for database queries
const findCitiesByQuery = async (query, limit) =>
  await City.find(query, hiddenFieldsDefault)
    .populate({
      path: "state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate("country", hiddenFieldsDefault)
    .limit(limit);
const findCityByQuery = async (query) =>
  await City.findOne(query, hiddenFieldsDefault)
    .populate({
      path: "state",
      select: hiddenFieldsDefault,
      populate: {
        path: "country",
        select: hiddenFieldsDefault,
      },
    })
    .populate("country", hiddenFieldsDefault);
const findStateByCode = async (stateCode) => await State.findOne({ stateCode });
const findCountryByCode = async (countryCode) =>
  await Country.findOne({ countryCode });
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

// City Controller
module.exports = {
  /**
   * Retrieves all cities from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetCities: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Retrieve all cities from the database
    const cities = await findCitiesByQuery({}, entries);

    // Send the retrieved cities in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_CITIES_SUCCESS, cities)
      );
  },

  /**
   * Retrieves a city by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetCityByCode: async (req, res, next) => {
    // Extract the city code from the request
    const { cityCode } = req.body;

    // Find the city by its code
    const city = await findCityByQuery({ cityCode });

    // Return the city if found, else return an error
    return city
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_CITY_SUCCESS, city)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_CITY_NOT_FOUND);
  },

  /**
   * Retrieves cities by the given state code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetCitiesByStateCode: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Find the state by its code
    const state = await findStateByCode(req.body.stateCode);
    if (!state)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      );

    // Find cities that belong to the state
    const cities = await findCitiesByQuery({ state: state._id }, entries);

    // Return the cities if found, else return an error
    return cities.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_CITY_SUCCESS, cities)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_CITIES_NOT_FOUND);
  },

  /**
   * Retrieves cities by the given country code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetCitiesByCountryCode: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Find the country by its code
    const country = await findCountryByCode(req.body.countryCode);
    if (!country)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      );

    // Find cities that belong to the country
    const cities = await findCitiesByQuery({ country: country._id }, entries);

    // Return the cities if found, else return an error
    return cities.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_CITY_SUCCESS, cities)
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_CITIES_NOT_FOUND);
  },

  /**
   * Creates a new city in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateCity: async (req, res, next) => {
    const { name, stateCode, countryCode } = req.body;

    // Check if the city already exists
    if (await City.findOne({ name: toCapitalize(name) }))
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_EXIST);

    // Validate state and country
    const state = await findStateByCode(stateCode);
    if (!state)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    const country = await findCountryByCode(countryCode);
    if (!country)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Create and save the city
    const city = new City({
      name: toCapitalize(name),
      cityCode: generateCityCode(),
      state: state._id,
      country: country._id,
    });
    await city.save();

    // Log the audit
    const createdCity = await findCityByQuery({ cityCode: city.cityCode });
    const user = await findUserByCode(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.CITIES,
      city.cityCode,
      auditChanges.CREATE_CITY,
      null,
      createdCity,
      user
    );

    // Return the created city
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_CITY_SUCCESS,
          createdCity
        )
      );
  },

  /**
   * Updates an existing city in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateCity: async (req, res, next) => {
    const { cityCode, name, stateCode, countryCode } = req.body;

    // Validate the city
    const city = await findCityByQuery({ cityCode });
    if (!city)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND);

    // Validate state and country
    const state = await findStateByCode(stateCode);
    if (!state)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    const country = await findCountryByCode(countryCode);
    if (!country)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Check for duplicate city name
    if (
      await City.findOne({
        name: toCapitalize(name),
        cityCode: { $ne: cityCode },
      })
    )
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_TAKEN);

    // City details before update
    const cityBeforeUpdate = city.toObject();

    // Update the city details
    await City.updateOne(
      { cityCode },
      {
        name: toCapitalize(name),
        state: state._id,
        country: country._id,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the audit
    const updatedCity = await findCityByQuery({ cityCode });
    const user = await findUserByCode(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.CITIES,
      cityCode,
      auditChanges.UPDATE_CITY,
      cityBeforeUpdate,
      updatedCity,
      user
    );

    // Return the updated city
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_CITY_SUCCESS,
          updatedCity
        )
      );
  },

  /**
   * Deletes a city from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteCity: async (req, res, next) => {
    // Extract the city code from the request
    const { cityCode } = req.body;

    // Validate the city
    const city = await City.findOne({ cityCode });
    if (!city)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND);

    // Check if the city is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(city._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete the city
    const previousData = await findCityByQuery({ cityCode });
    const deletionResult = await City.deleteOne({ cityCode: city.cityCode });
    if (deletionResult.deletedCount === 0)
      return next(
        handleSuccess(
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          MESSAGE_DELETE_CITY_ERROR
        )
      );

    // Log the audit
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.CITIES,
      city.cityCode,
      auditChanges.DELETE_CITY,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Return the success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_CITY_SUCCESS));
  },
};
