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
const {
  findCities,
  findCity,
  formatCityName,
  createCityObj,
  updateCityObj,
  deleteCityObj,
  getCityPaginationObject,
  getTotalCities,
} = require("../queries/cities");
const { findState } = require("../queries/states");
const { findCountry } = require("../queries/countries");

module.exports = {
  /**
   * Retrieves all cities from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetCities: async (req, res, next) => {
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query; // Step 1: Extract pagination parameters

    // Step 2: Retrieve all cities from the database
    const cities = await findCities({
      page,
      perPage,
      sortField,
      sortValue,
      keyword,
      options: true,
      populated: true,
    });
    const total = await getTotalCities(keyword);
    // Step 3: Send the retrieved cities in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_CITIES_SUCCESS,
          cities,
          total
        )
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
    const { cityCode } = req.body; // Step 1: Extract the city code from the request

    // Step 2: Find the city by its code
    const city = await findCity({
      query: { cityCode },
      options: true,
      populated: true,
    });

    // Step 3: Return the city if found, else return an error
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
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query; // Step 1: Extract pagination parameters

    // Step 2: Find the state by its code
    const state = await findState({ query: { stateCode: req.body.stateCode } });
    if (!state)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      );

    // Step 3: Find cities related to the state
    const cities = await findCities({
      query: { state: state._id },
      page,
      perPage,
      options: true,
      populated: true,
    });

    const pagination = await getCityPaginationObject(page, perPage);
    // Step 4: Return the cities if found, else return an error
    return cities.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_CITY_SUCCESS,
              cities,
              pagination
            )
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
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query; // Step 1: Extract pagination parameters

    // Step 2: Find the country by its code
    const country = await findCountry({
      query: { countryCode: req.body.countryCode },
    });
    if (!country)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      );

    // Step 3: Find cities related to the country
    const cities = await findCities({
      query: { country: country._id },
      page,
      perPage,
      options: true,
      populated: true,
    });

    const pagination = await getCityPaginationObject(page, perPage);
    // Step 4: Return the cities if found, else return an error
    return cities.length
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_CITY_SUCCESS,
              cities,
              pagination
            )
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
    const formattedName = formatCityName(name); // Step 1: Format city name

    // Step 2: Check if the city already exists
    const existingCity = await findCity({ query: { name: formattedName } });
    if (existingCity)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_EXIST);

    // Step 3: Validate state and country
    const state = await findState({ query: { stateCode } });
    if (!state)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    const country = await findCountry({ query: { countryCode } });
    if (!country)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Step 4: Create and save the city
    const city = await createCityObj({
      name: formattedName,
      state: state._id,
      country: country._id,
    });
    await city.save();

    // Step 5: Log the audit
    const createdCity = await findCity({
      query: { cityCode: city.cityCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.CITIES,
      city.cityCode,
      auditChanges.CREATE_CITY,
      null,
      createdCity.toObject(),
      currentUser.toObject()
    );

    // Step 6: Return the created city
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
    const formattedName = formatCityName(name); // Step 1: Format city name

    // Step 2: Validate the city
    const city = await findCity({ query: { cityCode } });
    if (!city)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND);

    // Step 3: Validate state and country
    const state = await findState({ query: { stateCode } });
    if (!state)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    const country = await findCountry({ query: { countryCode } });
    if (!country)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Step 4: Check for duplicate city name
    const otherCities = await findCities({
      query: { cityCode: { $ne: cityCode }, name: formattedName },
    });
    if (otherCities?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_TAKEN);

    // Step 5: City details before update
    const previousData = await findCity({
      query: { cityCode },
      options: true,
      populated: true,
    });

    // Step 6: Update the city details
    await updateCityObj({
      cityCode,
      name: formattedName,
      state: state._id,
      country: country._id,
    });

    // Step 7: Log the audit
    const updatedCity = await findCity({
      query: { cityCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.CITIES,
      cityCode,
      auditChanges.UPDATE_CITY,
      previousData,
      updatedCity,
      currentUser.toObject()
    );

    // Step 8: Return the updated city
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
    const { cityCode } = req.body; // Step 1: Extract the city code from the request

    // Step 2: Validate the city
    const city = await findCity({ query: { cityCode } });
    if (!city)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CITY_NOT_FOUND);

    // Step 3: Check if the city is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(city._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the city
    const previousData = await findCity({
      query: { cityCode },
      options: true,
      populated: true,
    });
    const deletionResult = await deleteCityObj(cityCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CITY_ERROR
      );

    // Step 5: Log the audit
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.CITIES,
      city.cityCode,
      auditChanges.DELETE_CITY,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 6: Return the success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_CITY_SUCCESS));
  },
};
