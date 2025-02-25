/**
 * Builds a MongoDB aggregation pipeline to retrieve a single audit log.
 *
 * @param {Object} options - Pipeline options.
 * @param {Object} options.query - Query filters to match documents.
 * @param {boolean} [options.projection=false] - Whether to apply field projection.
 * @returns {Array} MongoDB aggregation pipeline.
 */
const buildAuditLogPipeline = ({ query = {}, projection = false }) => {
  const pipeline = [];

  // Step 1: Match the query (filters like { permissionCode: 'SOME_CODE' })
  pipeline.push({ $match: query });

  // Step 2: Limit to 1 document
  pipeline.push({ $limit: 1 });

  // Step 3: Projection (Optional - limits returned fields)
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        auditCode: 1,
        action: 1,
        collection: 1,
        document: 1,
        changes: 1,
        before: 1,
        after: 1,
        user: 1,
        createdAtEpochTimestamp: { $toLong: "$createdAt" },
      },
    });
  }

  return pipeline;
};

/**
 * Builds a MongoDB aggregation pipeline to retrieve multiple audit logs.
 *
 * @param {Object} options - Pipeline options.
 * @param {string} [options.keyword] - Keyword for search (applies to multiple fields).
 * @param {Object} [options.query={}] - Query filters to match documents.
 * @param {string} [options.sortField="_id"] - Field to sort by.
 * @param {string} [options.sortValue="desc"] - Sort direction ('asc' or 'desc').
 * @param {number} [options.page=1] - Page number for pagination.
 * @param {number} [options.limit=10] - Number of records per page.
 * @param {boolean} [options.projection=false] - Whether to apply field projection.
 * @param {boolean} [options.all=false] - Whether to retrieve all records (ignores pagination).
 * @returns {Array} MongoDB aggregation pipeline.
 */
const buildAuditLogsPipeline = ({
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

  // Step 1: Match exact filters (if any query filters are provided)
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Keyword Search (LIKE match on specific fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const searchConditions = [
      { action: { $regex: keywordRegex } },
      { collection: { $regex: keywordRegex } },
      { changes: { $regex: keywordRegex } },
      { "user.name": { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  // Step 3: Sorting (sort by the specified field and direction)
  pipeline.push({
    $sort: { [sortField]: sortValue === "asc" ? 1 : -1 },
  });

  // Step 4: Pagination (skip and limit, unless 'all' flag is true)
  if (!all) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
  }

  // Step 5: Projection (Optional - limits returned fields)
  if (projection) {
    pipeline.push({
      $project: {
        _id: 0,
        auditCode: 1,
        action: 1,
        collection: 1,
        document: 1,
        changes: 1,
        before: 1,
        after: 1,
        user: 1,
        createdAtEpochTimestamp: { $toLong: "$createdAt" },
      },
    });
  }

  return pipeline;
};

/**
 * Builds a MongoDB aggregation pipeline to count audit logs.
 *
 * @param {Object} options - Pipeline options.
 * @param {string} [options.keyword] - Keyword for search (applies to multiple fields).
 * @param {Object} [options.query={}] - Query filters to match documents.
 * @returns {Array} MongoDB aggregation pipeline.
 */
const buildAuditLogCountPipeline = ({ keyword, query = {} }) => {
  const pipeline = [];

  // Step 1: Match exact filters (if any query filters are provided)
  if (Object.keys(query).length > 0) {
    pipeline.push({ $match: query });
  }

  // Step 2: Keyword Search (LIKE match on specific fields)
  if (keyword && keyword.trim().length > 0) {
    const keywordRegex = new RegExp(keyword, "i");

    const searchConditions = [
      { action: { $regex: keywordRegex } },
      { collection: { $regex: keywordRegex } },
      { changes: { $regex: keywordRegex } },
      { "user.name": { $regex: keywordRegex } },
    ];

    pipeline.push({
      $match: {
        $or: searchConditions,
      },
    });
  }

  // Step 3: Count total documents matching the criteria
  pipeline.push({ $count: "totalCount" });

  return pipeline;
};

module.exports = {
  buildAuditLogPipeline,
  buildAuditLogsPipeline,
  buildAuditLogCountPipeline,
};
