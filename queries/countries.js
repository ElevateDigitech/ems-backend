const moment = require("moment-timezone");
const Country = require("../models/country");
const {
  hiddenFieldsDefault,
  generateCountryCode,
  toCapitalize,
} = require("../utils/helpers");
const {
  buildCountriesPipeline,
  buildCountryCountPipeline,
  buildCountryPipeline,
} = require("../pipelines/countries");

/**
 * Retrieves a single country from the database.
 *
 * @param {Object} params - The parameters for querying a country.
 * @param {Object} params.query - The MongoDB query object to filter the country.
 * @param {Object} params.projection - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the country object or null if not found.
 */
const findCountry = async ({
  query = {}, // MongoDB query object to filter the country
  projection = false, // Fields to include/exclude in the result
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildCountryPipeline({ query, projection });

  // Execute the aggregation pipeline using the audit log model.
  const result = await Country.aggregate(pipeline);

  // Since we expect a single audit log, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple countries from the database with pagination, search, sorting, and projection support.
 *
 * @param {Object} params - The parameters for querying countries.
 * @param {Object} [params.query={}] - The MongoDB query object to filter countries.
 * @param {string} [params.keyword=""] - Search keyword for filtering countries based on specific fields.
 * @param {string} [params.sortField="_id"] - Field to sort the results by.
 * @param {string} [params.sortValue="desc"] - Sort direction, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The page number for pagination.
 * @param {number} [params.limit=10] - The number of countries to return per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise resolving to an object containing the country results and the total count.
 */
const findCountries = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Perform parallel aggregation queries to improve performance
  const [results, countResult] = await Promise.all([
    Country.aggregate(
      buildCountriesPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        projection,
        all,
      })
    ),
    Country.aggregate(
      buildCountryCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the aggregation result
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results along with the total count
  return { results, totalCount };
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

module.exports = {
  findCountries, // Export function to retrieve multiple countries
  findCountry, // Export function to retrieve a single country
  formatCountryFields, // Export function to format country fields
  createCountryObj, // Export function to create a new country object
  updateCountryObj, // Export function to update an existing country
  deleteCountryObj, // Export function to delete a country
};
