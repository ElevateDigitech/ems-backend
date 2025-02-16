const moment = require("moment-timezone");
const Country = require("../models/country");
const {
  hiddenFieldsDefault,
  generateCountryCode,
  getLimitAndSkip,
  toCapitalize,
} = require("../utils/helpers");

/**
 * Retrieves multiple countries from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying countries.
 * @param {Object} params.query - The MongoDB query object to filter countries.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of countries.
 */
const findCountries = async ({
  query = {}, // MongoDB query object to filter countries
  options = false, // Fields to include/exclude in the result
  page = 1, // Current page for pagination (default is 1)
  perPage = 10, // Items per page for pagination (default is 10)
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(page, perPage);

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await Country.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip) // Apply skip for pagination
    .limit(limit); // Apply limit to control number of results
};

/**
 * Retrieves a single country from the database.
 *
 * @param {Object} params - The parameters for querying a country.
 * @param {Object} params.query - The MongoDB query object to filter the country.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the country object or null if not found.
 */
const findCountry = async ({
  query = {}, // MongoDB query object to filter the country
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single country based on the query criteria
  return await Country.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats country fields by trimming whitespace and converting to proper case.
 *
 * @param {Object} params - The country details to format.
 * @param {string} params.name - The country name to format.
 * @param {string} params.iso2 - The ISO2 code to format.
 * @param {string} params.iso3 - The ISO3 code to format.
 * @returns {Object} - The formatted country details.
 */
const formatCountryFields = ({ name, iso2, iso3 }) => {
  return {
    formattedName: toCapitalize(name), // Step 1: Capitalize country name
    formattedISO2: iso2.toUpperCase(), // Step 2: Convert ISO2 code to uppercase
    formattedISO3: iso3.toUpperCase(), // Step 3: Convert ISO3 code to uppercase
  };
};

/**
 * Creates a new country object.
 *
 * @param {Object} params - The parameters to create the country object.
 * @param {string} params.name - The name of the country.
 * @param {string} params.iso2 - The ISO2 code of the country.
 * @param {string} params.iso3 - The ISO3 code of the country.
 * @returns {Object} - The newly created country object.
 */
const createCountryObj = async ({ name, iso2, iso3 }) => {
  // Step 1: Generate a unique country code
  const countryCode = generateCountryCode();

  // Step 2: Create a new Country object with the generated code and provided details
  return new Country({
    countryCode,
    name,
    iso2,
    iso3,
  });
};

/**
 * Updates an existing country in the database.
 *
 * @param {Object} params - The parameters for updating the country.
 * @param {string} params.countryCode - The unique code of the country to update.
 * @param {string} params.name - The new name for the country.
 * @param {string} params.iso2 - The new ISO2 code for the country.
 * @param {string} params.iso3 - The new ISO3 code for the country.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated country object.
 */
const updateCountryObj = async ({ countryCode, name, iso2, iso3 }) => {
  // Step 1: Update the country document with the provided countryCode
  return await Country.findOneAndUpdate(
    { countryCode }, // Query to find the country by countryCode
    {
      name, // Update the name
      iso2, // Update the ISO2 code
      iso3, // Update the ISO3 code
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a country from the database.
 *
 * @param {string} countryCode - The unique code of the country to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteCountryObj = async (countryCode) => {
  // Step 1: Delete the country document with the provided countryCode
  return await Country.deleteOne({ countryCode });
};

const getCountryPaginationObject = async (page, perPage) => ({
  page,
  perPage,
  total: await Country.countDocuments(),
});

module.exports = {
  findCountries, // Export function to retrieve multiple countries
  findCountry, // Export function to retrieve a single country
  formatCountryFields, // Export function to format country fields
  createCountryObj, // Export function to create a new country object
  updateCountryObj, // Export function to update an existing country
  deleteCountryObj, // Export function to delete a country
  getCountryPaginationObject,
};
