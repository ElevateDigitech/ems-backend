const AuditLog = require("../models/auditLog");
const {
  hiddenFieldsDefault,
  handleSuccess,
  handleError,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_AUDITS_SUCCESS,
  MESSAGE_AUDIT_NOT_FOUND,
  MESSAGE_GET_AUDIT_SUCCESS,
} = require("../utils/messages");

// Auditlog Controller
module.exports = {
  /**
   * Retrieves all audit logs from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetAudits: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Fetch audit logs from the database
    // - {}: No filter applied, meaning all documents will be retrieved
    // - hiddenFieldsDefault: Specifies which fields to exclude (projection)
    // - .limit(entries): Limits the number of returned documents to 'entries' (default 100)
    const auditLogs = await AuditLog.find({}, hiddenFieldsDefault).limit(
      entries
    );

    // Send a successful response with the retrieved audit logs
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_AUDITS_SUCCESS,
          auditLogs
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
    // Extract auditCode from the request body
    const { auditCode } = req.body;

    // Find a single audit log that matches the provided audit code
    const auditLog = await AuditLog.findOne({ auditCode }, hiddenFieldsDefault);

    // If no audit log is found, pass an error response to the next middleware
    if (!auditLog) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_AUDIT_NOT_FOUND
      );
    }

    // Send a successful response with the retrieved audit log
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_AUDIT_SUCCESS, auditLog)
      );
  },
};
