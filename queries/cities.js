const moment = require("moment-timezone");
const City = require("../models/city");
const { toCapitalize, generateCityCode } = require("../utils/helpers");
const {
  buildCitiesPipeline,
  buildCityCountPipeline,
  buildCityPipeline,
} = require("../pipelines/cities");

/**
 * Retrieves a single city from the database using an aggregation pipeline.
 *
 * @param {Object} params - Parameters for querying a city.
 * @param {Object} params.query - MongoDB query to filter the city.
 * @param {Object} params.projection - Fields to include/exclude.
 * @param {boolean} params.populate - Whether to populate related fields.
 * @returns {Promise<Object|null>} - The city object or null if not found.
 */
const findCity = async ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = buildCityPipeline({ query, projection, populate });

  // Execute aggregation pipeline
  const result = await City.aggregate(pipeline);

  // Return the first document or null if not found
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple cities with filtering, searching, sorting, and pagination.
 *
 * @param {Object} params - Query parameters.
 * @param {Object} [params.query={}] - MongoDB query to filter cities.
 * @param {string} [params.keyword=""] - Search term for city fields.
 * @param {string} [params.sortField="_id"] - Field to sort by.
 * @param {string} [params.sortValue="desc"] - Sort direction: 'asc' or 'desc'.
 * @param {number} [params.page=1] - Page number for pagination.
 * @param {number} [params.limit=10] - Number of results per page.
 * @param {boolean} [params.populate=false] - Populate related fields.
 * @param {boolean} [params.projection=false] - Apply field projection.
 * @param {boolean} [params.all=false] - Fetch all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - Cities and total count.
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
  const [results, countResult] = await Promise.all([
    City.aggregate(
      buildCitiesPipeline({
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

  // Extract total count or fallback to 0
  const totalCount = countResult[0]?.totalCount || 0;

  return { results, totalCount };
};

/**
 * Capitalizes the city name.
 *
 * @param {string} name - City name.
 * @returns {string} - Capitalized city name.
 */
const formatCityName = (name) => {
  return toCapitalize(name);
};

/**
 * Creates a new city object.
 *
 * @param {Object} params - City details.
 * @param {string} params.name - City name.
 * @param {string} params.state - State ID.
 * @param {string} params.country - Country ID.
 * @returns {Object} - New city object instance.
 */
const createCityObj = async ({ name, state, country }) => {
  const cityCode = generateCityCode();

  return new City({
    cityCode,
    name,
    state,
    country,
  });
};

/**
 * Updates an existing city.
 *
 * @param {Object} params - Update details.
 * @param {string} params.cityCode - City code to identify the city.
 * @param {string} params.name - Updated city name.
 * @param {string} params.state - Updated state ID.
 * @param {string} params.country - Updated country ID.
 * @returns {Promise<Object|null>} - Updated city object.
 */
const updateCityObj = async ({ cityCode, name, state, country }) => {
  return await City.findOneAndUpdate(
    { cityCode },
    {
      name,
      state,
      country,
      updatedAt: moment().valueOf(),
    },
    { new: true } // Return updated document
  );
};

/**
 * Deletes a city by cityCode.
 *
 * @param {string} cityCode - City code.
 * @returns {Promise<Object>} - Deletion result.
 */
const deleteCityObj = async (cityCode) => {
  return await City.deleteOne({ cityCode });
};

module.exports = {
  findCity,
  findCities,
  formatCityName,
  createCityObj,
  updateCityObj,
  deleteCityObj,
};
