const moment = require("moment-timezone");
const City = require("../models/city");
const {
  hiddenFieldsDefault,
  toCapitalize,
  generateCityCode,
} = require("../utils/helpers");
const {
  buildCityPipeline,
  buildCityCountPipeline,
} = require("../pipelines/cities");

/**
 * Retrieves all cities from the database with support for filtering, searching, sorting, pagination, and optional population of related data.
 *
 * @param {Object} params - The parameters for querying cities.
 * @param {Object} [params.query={}] - The MongoDB query object to filter cities (e.g., { country: 'USA' }).
 * @param {string} [params.keyword=""] - Search keyword for text-based search across city fields.
 * @param {string} [params.sortField="_id"] - Field to sort results by (default is '_id').
 * @param {string} [params.sortValue="desc"] - Sorting order: 'asc' for ascending, 'desc' for descending (default is 'desc').
 * @param {number} [params.page=1] - Current page number for pagination (default is 1).
 * @param {number} [params.limit=10] - Number of results per page (default is 10).
 * @param {boolean} [params.populate=false] - Whether to populate related data in the results (default is false).
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing an array of cities and the total count of matching documents.
 */
const findCities = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  populate = false,
  projection = false,
  all = false,
}) => {
  // Perform two concurrent aggregation operations:
  // 1. Fetch paginated and sorted city data.
  // 2. Count the total number of matching documents.
  const [results, countResult] = await Promise.all([
    City.aggregate(
      buildCityPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        populate,
        projection,
        all,
      })
    ),
    City.aggregate(
      buildCityCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total count from the aggregation result; fallback to 0 if not available
  const totalCount = countResult[0]?.totalCount || 0;

  // Return results along with the total document count
  return { results, totalCount };
};

/**
 * Retrieves a single city from the database.
 *
 * @param {Object} params - The parameters for querying a city.
 * @param {Object} params.query - The MongoDB query object to filter the city.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the city object or null if not found.
 */
const findCity = async ({ query = {}, options = false, populated = false }) => {
  const cityQuery = City.findOne(query, options ? hiddenFieldsDefault : {}); // Step 1: Build the base query to find a city

  // Step 2: Conditionally populate related state and country data if populated flag is true
  return populated
    ? cityQuery
        .populate({
          path: "state",
          select: hiddenFieldsDefault,
          populate: {
            path: "country",
            select: hiddenFieldsDefault,
          },
        })
        .populate("country", hiddenFieldsDefault)
    : cityQuery;
};

/**
 * Formats city name by capitalizing the input.
 *
 * @param {string} name - The city name to format.
 * @returns {string} - The formatted city name.
 */
const formatCityName = (name) => {
  return toCapitalize(name); // Step 1: Capitalize the city name
};

/**
 * Creates a new city object.
 *
 * @param {Object} params - The parameters to create the city object.
 * @param {string} params.name - The name of the city.
 * @param {string} params.state - The associated state ID.
 * @param {string} params.country - The associated country ID.
 * @returns {Object} - The newly created city object.
 */
const createCityObj = async ({ name, state, country }) => {
  const cityCode = generateCityCode(); // Step 1: Generate a unique city code

  // Step 2: Create and return the new city object
  return new City({
    cityCode,
    name,
    state,
    country,
  });
};

/**
 * Updates an existing city in the database.
 *
 * @param {Object} params - The parameters for updating the city.
 * @param {string} params.cityCode - The unique code of the city to update.
 * @param {string} params.name - The new name for the city.
 * @param {string} params.state - The new associated state ID.
 * @param {string} params.country - The new associated country ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated city object.
 */
const updateCityObj = async ({ cityCode, name, state, country }) => {
  return await City.findOneAndUpdate(
    { cityCode }, // Step 1: Identify the city by its code
    {
      name, // Step 2: Update city name
      state, // Step 3: Update state
      country, // Step 4: Update country
      updatedAt: moment().valueOf(), // Step 5: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a city from the database.
 *
 * @param {string} cityCode - The unique code of the city to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteCityObj = async (cityCode) => {
  return await City.deleteOne({ cityCode }); // Step 1: Delete the city document by cityCode
};

module.exports = {
  findCities, // Export function to retrieve multiple cities
  findCity, // Export function to retrieve a single city
  formatCityName, // Export function to format city name
  createCityObj, // Export function to create a new city
  updateCityObj, // Export function to update an existing city
  deleteCityObj, // Export function to delete a city
};
