const { findAuditLogs, findAuditLog, getAuditLogPaginationObject } = require("../queries/auditLogs");
const { handleSuccess, handleError } = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_AUDITS_SUCCESS,
  MESSAGE_AUDIT_NOT_FOUND,
  MESSAGE_GET_AUDIT_SUCCESS,
} = require("../utils/messages");

module.exports = {
  /**
   * Retrieves all audit logs from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetAudits: async (req, res, next) => {
    // Step 1: Destructure 'start' and 'end' from the query parameters, defaulting to 1 and 10 if not provided
    const { page = 1, perPage = 10 } = req.query;

    // Step 2: Fetch audit logs from the database using the provided start and end range
    const auditLogs = await findAuditLogs({ page, perPage, options: true });
    const pagination = await getAuditLogPaginationObject(page, perPage);
    // Step 3: Send a successful HTTP response with the retrieved audit logs
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // HTTP status code for success
        MESSAGE_GET_AUDITS_SUCCESS, // Success message
        auditLogs, // Data containing the audit logs
        pagination,
      )
    );
  },

  /**
   * Retrieves a specific audit log based on the provided audit code.
   *
   * @param {Object} req - Express request object containing auditCode in body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetAuditByCode: async (req, res, next) => {
    // Step 1: Extract 'auditCode' from the request body
    const { auditCode } = req.body;

    // Step 2: Find a single audit log that matches the provided audit code
    const auditLog = await findAuditLog({
      query: { auditCode },
      options: true,
    });

    // Step 3: Check if the audit log exists in the database
    if (!auditLog) {
      // Step 4: If the audit log is not found, send an error response
      return handleError(
        next, // Pass the next middleware function to handle the error
        STATUS_CODE_BAD_REQUEST, // HTTP status code for a bad request
        MESSAGE_AUDIT_NOT_FOUND // Error message indicating audit log not found
      );
    }

    // Step 5: Send a successful HTTP response with the retrieved audit log
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // HTTP status code for success
        MESSAGE_GET_AUDIT_SUCCESS, // Success message
        auditLog // Data containing the specific audit log
      )
    );
  },
};
