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
const {
  findCountries,
  findCountry,
  formatCountryFields,
  createCountryObj,
  updateCountryObj,
  deleteCountryObj,
} = require("../queries/countries");

module.exports = {
  /**
   * Retrieves all countries from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetCountries: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findCountries({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      projection: true,
    });
    // Step 3: Send the retrieved countries in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_COUNTRIES_SUCCESS,
          results,
          totalCount
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
    const { countryCode } = req.body; // Step 1: Extract the country code from the request body
    const country = await findCountry({ query: { countryCode } }); // Step 2: Find the country by its unique code

    // Step 3: Return the country details if found, else return an error
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
    const { name, iso2, iso3 } = req.body; // Step 1: Extract country details from the request body
    const { formattedName, formattedISO2, formattedISO3 } = formatCountryFields(
      { name, iso2, iso3 }
    ); // Step 2: Format country fields

    const existingCountry = await findCountry({
      query: {
        $or: [
          { name: formattedName },
          { iso2: formattedISO2 },
          { iso3: formattedISO3 },
        ],
      },
    }); // Step 3: Check for existing country

    if (existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_EXIST); // Step 4: Handle duplicate country error

    const newCountry = await createCountryObj({
      name: formattedName,
      iso2: formattedISO2,
      iso3: formattedISO3,
    }); // Step 5: Create new country document
    await newCountry.save(); // Step 6: Save the new country

    const createdCountry = await findCountry({
      query: { countryCode: newCountry.countryCode },
      options: true,
    }); // Step 7: Retrieve the newly created country
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.COUNTRIES,
      createdCountry.countryCode,
      auditChanges.CREATE_COUNTRY,
      null,
      createdCountry ,
      currentUser 
    ); // Step 8: Log the creation audit

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_COUNTRY_SUCCESS,
          createdCountry
        )
      ); // Step 9: Send the created country as response
  },

  /**
   * Updates an existing country in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateCountry: async (req, res, next) => {
    const { countryCode, name, iso2, iso3 } = req.body; // Step 1: Extract country details
    const { formattedName, formattedISO2, formattedISO3 } = formatCountryFields(
      { name, iso2, iso3 }
    ); // Step 2: Format country fields

    const existingCountry = await findCountry({ query: { countryCode } }); // Step 3: Find the existing country
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND); // Step 4: Handle not found error

    const duplicateCountry = await findCountry({
      query: {
        countryCode: { $ne: countryCode },
        $or: [
          { name: formattedName },
          { iso2: formattedISO2 },
          { iso3: formattedISO3 },
        ],
      },
    }); // Step 5: Check for duplicate country details

    if (duplicateCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_TAKEN); // Step 6: Handle duplicate country error

    const previousData = await findCountry({
      query: { countryCode },
      options: true,
    }); // Step 7: Capture previous data for audit

    await updateCountryObj({
      countryCode,
      name: formattedName,
      iso2: formattedISO2,
      iso3: formattedISO3,
    }); // Step 8: Update the country details

    const updatedCountry = await findCountry({
      query: { countryCode },
      options: true,
    }); // Step 9: Retrieve the updated country
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.COUNTRIES,
      countryCode,
      auditChanges.UPDATE_COUNTRY,
      previousData ,
      updatedCountry ,
      currentUser 
    ); // Step 10: Log the update audit

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_COUNTRY_SUCCESS,
          updatedCountry
        )
      ); // Step 11: Send the updated country as response
  },

  /**
   * Deletes a country from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteCountry: async (req, res, next) => {
    const { countryCode } = req.body; // Step 1: Extract country code
    const existingCountry = await findCountry({ query: { countryCode } }); // Step 2: Find the country

    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND); // Step 3: Handle not found error

    const { isReferenced } = await IsObjectIdReferenced(existingCountry._id); // Step 4: Check references
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      ); // Step 5: Handle reference error

    const previousData = await findCountry({
      query: { countryCode },
      options: true,
    }); // Step 6: Capture previous data for audit

    const deletionResult = await deleteCountryObj(countryCode); // Step 7: Delete the country
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_COUNTRY_ERROR
      ); // Step 8: Handle deletion error

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.COUNTRIES,
      countryCode,
      auditChanges.DELETE_COUNTRY,
      previousData ,
      null,
      currentUser 
    ); // Step 9: Log the deletion audit

    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_COUNTRY_SUCCESS)); // Step 10: Send the deletion success response
  },
};
