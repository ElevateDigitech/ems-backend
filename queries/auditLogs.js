const AuditLog = require("../models/auditLog");
const { hiddenFieldsDefault } = require("../utils/helpers");

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
  options = hiddenFieldsDefault, // Fields to include/exclude in the result
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
}) => {
  const limit = (end > 0 ? end : 10) - (start > 0 ? start : 1) + 1; // Calculate the number of entries to fetch
  const skip = (start > 0 ? start : 1) - 1; // Calculate how many entries to skip

  // Query the database with the provided filters, skipping and limiting as per pagination
  return await AuditLog.find(query, options).skip(skip).limit(limit);
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
  options = hiddenFieldsDefault, // Fields to include/exclude in the result
}) => {
  // Query the database to find a single audit log that matches the query
  return await AuditLog.findOne(query, options);
};

module.exports = {
  findAuditLogs, // Export function to retrieve multiple audit logs
  findAuditLog, // Export function to retrieve a single audit log
};
