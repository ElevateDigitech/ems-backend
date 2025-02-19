const Permission = require("../models/permission");
const {
  buildPermissionsPipeline,
  buildPermissionCountPipeline,
  buildPermissionPipeline,
} = require("../pipelines/permissions");

/**
 * Retrieves a single permission from the database using an aggregation pipeline.
 *
 * @param {Object} params - The parameters for querying a permission.
 * @param {Object} [params.query={}] - The MongoDB query object to filter the permission.
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @returns {Promise<Object|null>} - A promise that resolves to the permission object or null if not found.
 */
const findPermission = async ({
  query = {}, // The MongoDB query object to filter the permission document..
  projection = false, // Boolean indicating whether to apply field projection in the aggregation pipeline.
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildPermissionPipeline({ query, projection });

  // Execute the aggregation pipeline using the Permission model.
  const result = await Permission.aggregate(pipeline);

  // Since we expect a single permission, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple permissions from the database with pagination, filtering, sorting, and projection support.
 *
 * @param {Object} params - Parameters for querying permissions.
 * @param {Object} [params.query={}] - The MongoDB query object to filter permissions.
 * @param {string} [params.keyword=""] - A keyword for text-based search in permissions.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order: 'asc' for ascending or 'desc' for descending.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of records per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the results and the total count.
 */
const findPermissions = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute two parallel aggregation queries using Promise.all:
  // 1. Fetch paginated permission records with filters, sorting, and field projection.
  // 2. Fetch the total count of permissions that match the query.
  const [results, countResult] = await Promise.all([
    Permission.aggregate(
      buildPermissionsPipeline({
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
    Permission.aggregate(
      buildPermissionCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the aggregation result.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the fetched permissions and the total count.
  return { results, totalCount };
};

module.exports = {
  findPermission, // Export function to retrieve a single permission
  findPermissions, // Export function to retrieve multiple permissions
};
