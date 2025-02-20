const AuditLog = require("../models/auditLog");
const {
  buildAuditLogsPipeline,
  buildAuditLogCountPipeline,
  buildAuditLogPipeline,
} = require("../pipelines/auditLogs");
const { generateAuditCode } = require("../utils/helpers");
const helpers = require("../utils/helpers");
console.log(helpers);
/**
 * Retrieves a single audit log from the database using an aggregation pipeline.
 *
 * @param {Object} params - The parameters for querying a audit log.
 * @param {Object} [params.query={}] - The MongoDB query object to filter the audit log.
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @returns {Promise<Object|null>} - A promise that resolves to the audit log object or null if not found.
 */
const findAuditLog = async ({
  query = {}, // The MongoDB query object to filter the audit log document..
  projection = false, // Boolean indicating whether to apply field projection in the aggregation pipeline.
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildAuditLogPipeline({ query, projection });

  // Execute the aggregation pipeline using the audit log model.
  const result = await AuditLog.aggregate(pipeline);

  // Since we expect a single audit log, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves multiple audit logs from the database with pagination, sorting, keyword search, and projection support.
 *
 * @param {Object} params - The parameters for querying audit logs.
 * @param {Object} [params.query={}] - The MongoDB query object to filter audit logs based on specific conditions.
 * @param {string} [params.keyword=""] - A keyword for searching within audit logs (e.g., text search).
 * @param {string} [params.sortField="_id"] - The field by which the results should be sorted (default is "_id").
 * @param {string} [params.sortValue="desc"] - The sorting order ("asc" for ascending, "desc" for descending).
 * @param {number} [params.page=1] - The page number for pagination (1-based).
 * @param {number} [params.limit=10] - The number of records per page (default is 10).
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the audit logs and total count.
 */
const findAuditLogs = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute two aggregate queries concurrently using Promise.all for efficiency:
  // 1. Fetch paginated audit log results.
  // 2. Get the total count of audit logs matching the query and keyword filters.
  const [results, countResult] = await Promise.all([
    // Fetch the filtered, sorted, and paginated audit logs.
    AuditLog.aggregate(
      buildAuditLogsPipeline({
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
    // Count the total number of audit logs that match the query and keyword (without pagination).
    AuditLog.aggregate(
      buildAuditLogCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total count from the aggregation result (handle cases where no results are found).
  const totalCount = countResult[0]?.totalCount || 0;

  // Return both results and totalCount in an object.
  return { results, totalCount };
};

/**
 * Logs an audit trail for actions performed.
 *
 * @param {string} action - The action performed (e.g., CREATE, UPDATE, DELETE).
 * @param {string} collection - The database collection involved.
 * @param {string} document - The specific document ID related to the action.
 * @param {Object} changes - A description of the changes made.
 * @param {Object} [before=null] - The previous state of the document (if applicable).
 * @param {Object} [after=null] - The new state of the document (if applicable).
 * @param {Object} user - The user performing the action.
 * @returns {Promise<void>} - A promise that resolves once the audit log is saved.
 */
const logAudit = async (
  action, // The action performed
  collection, // The database collection involved
  document, // The specific document ID
  changes, // Description of changes
  before = null, // Previous state (optional)
  after = null, // New state (optional)
  user // User performing the action
) => {
  // Step 1: Generate a unique audit code for this audit log
  const auditCode = generateAuditCode();
  // Step 2: Create a new audit log object with the provided details
  const audit = new AuditLog({
    auditCode, // Unique audit identifier
    action, // Action performed
    collection, // Collection affected
    document, // Document ID involved
    changes, // Description of changes
    before, // Previous state
    after, // New state
    user, // User who performed the action
  });

  // Step 3: Save the audit log to the database
  await audit.save();
};

module.exports = {
  findAuditLog, // Export function to retrieve a single audit log
  findAuditLogs, // Export function to retrieve multiple audit logs
  logAudit, // Export function to log audit trails
};
