const AuditLog = require("../models/auditLog");
const { hiddenFieldsDefault, generateAuditCode } = require("../utils/helpers");
const searchFields = ["action", "module", "changes", "before", "after"];

/**
 * Retrieves multiple audit logs from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying audit logs.
 * @param {Object} params.query - The MongoDB query object to filter audit logs.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of audit logs.
 */
const findAuditLogs = async ({
  query = {}, // MongoDB query object to filter audit logs
  options = false, // Fields to include/exclude in the result
  page = 1, // Current page for pagination (default is 1)
  perPage = 10, // Items per page for pagination (default is 10)
  sortField,
  sortValue,
  keyword,
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const limit = parseInt(perPage); // Number of items to return
  const skip = (parseInt(page) - 1) * parseInt(perPage); // Number of items to skip

  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    const filterQueries = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
    query.$or = query.$or ? [...query.$or, ...filterQueries] : filterQueries;
  }

  const sortOptions =
    sortField && sortField?.length > 0 && sortValue && sortValue?.length > 0
      ? { [sortField]: sortValue }
      : { _id: -1 };

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await AuditLog.find(query, options ? hiddenFieldsDefault : {})
    .sort(sortOptions)
    .skip(skip) // Apply skip
    .limit(limit); // Apply limit
};

/**
 * Retrieves a single audit log from the database.
 *
 * @param {Object} params - The parameters for querying an audit log.
 * @param {Object} params.query - The MongoDB query object to filter the audit log.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the audit log object or null if not found.
 */
const findAuditLog = async ({
  query = {}, // MongoDB query object to filter the audit log
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single audit log that matches the query
  return await AuditLog.findOne(query, options ? hiddenFieldsDefault : {});
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

const getTotalAuditlogs = async (keyword) => {
  const filter = {};
  if (keyword && keyword?.length > 0 && searchFields.length > 0) {
    const keywordRegex = new RegExp(keyword, "i");
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: keywordRegex },
    }));
  }
  const total = await AuditLog.countDocuments(filter);
  return total;
};

module.exports = {
  findAuditLogs, // Export function to retrieve multiple audit logs
  findAuditLog, // Export function to retrieve a single audit log
  logAudit, // Export function to log audit trails
  getTotalAuditlogs,
};
