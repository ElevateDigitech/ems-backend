/**
 * Builds an aggregation pipeline to retrieve a single gender document from the database.
 *
 * @param {Object} params - Parameters for querying a gender document.
 * @param {Object} params.query - MongoDB query object to filter documents.
 * @param {boolean} params.projection - Whether to project specific fields in the result.
 * @returns {Array} - Aggregation pipeline array.
 */
const buildGenderPipeline = ({ query = {}, projection = false }) => {
  const pipeline = [];

  // 1. Apply exact match filters if any fields are provided in the query object
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Limit the result to only 1 document
  pipeline.push({ $limit: 1 });

  // 3. Apply projection if requested
  if (projection) {
    const baseProjection = {
      _id: 0,
      genderCode: 1, // Include genderCode field
      genderName: 1, // Include genderName field
      createdAt: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAt: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

/**
 * Builds an aggregation pipeline to retrieve multiple gender documents with optional search, sorting, pagination, and projection.
 *
 * @param {Object} params - Parameters for querying gender documents.
 * @param {string} [params.keyword] - Keyword for searching across fields.
 * @param {Object} [params.query={}] - MongoDB query object to filter documents.
 * @param {string} [params.sortField="_id"] - Field to sort by.
 * @param {string} [params.sortValue="desc"] - Sort order ("asc" or "desc").
 * @param {number} [params.page=1] - Page number for pagination.
 * @param {number} [params.limit=10] - Number of documents per page.
 * @param {boolean} [params.projection=false] - Whether to project specific fields in the result.
 * @param {boolean} [params.all=false] - Whether to retrieve all documents (disables pagination).
 * @returns {Array} - Aggregation pipeline array.
 */
const buildGendersPipeline = ({
  keyword,
  query = {},
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  const pipeline = [];

  // 1. Apply exact match filters if any fields are provided in the query object
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Perform a keyword search across multiple fields (LIKE match)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex search

    const genderSearchConditions = [
      { genderCode: { $regex: keywordRegex } },
      { genderName: { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: genderSearchConditions, // Match either genderCode or genderName with the keyword
      },
    });
  }

  // 3. Sort the results based on the provided field and direction
  pipeline.push({
    $sort: { [sortField]: sortValue === "asc" ? 1 : -1 },
  });

  // 4. Implement pagination if 'all' is not true
  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip }); // Skip records based on pagination
    pipeline.push({ $limit: parseInt(limit) }); // Limit the number of results per page
  }

  // 5. Apply projection if requested
  if (projection) {
    const baseProjection = {
      _id: 0,
      genderCode: 1, // Include genderCode field
      genderName: 1, // Include genderName field
      createdAt: { $toLong: "$createdAt" }, // Convert createdAt field to long integer
      updatedAt: { $toLong: "$updatedAt" }, // Convert updatedAt field to long integer
    };
    pipeline.push({ $project: baseProjection });
  }

  return pipeline;
};

/**
 * Builds an aggregation pipeline to count the number of gender documents matching given filters and search criteria.
 *
 * @param {Object} params - Parameters for counting gender documents.
 * @param {string} [params.keyword] - Keyword for searching across fields.
 * @param {Object} [params.query={}] - MongoDB query object to filter documents.
 * @returns {Array} - Aggregation pipeline array.
 */
const buildGenderCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  // 1. Apply exact match filters if any fields are provided in the query object
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // 2. Perform a keyword search across multiple fields (LIKE match)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i"); // Case-insensitive regex search

    const genderSearchConditions = [
      { genderCode: { $regex: keywordRegex } },
      { genderName: { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: genderSearchConditions, // Match either genderCode or genderName with the keyword
      },
    });
  }

  // 3. Count the number of matching documents
  pipeline.push({
    $count: "totalCount",
  });

  return pipeline;
};

module.exports = {
  buildGenderPipeline,
  buildGendersPipeline,
  buildGenderCountPipeline,
};
