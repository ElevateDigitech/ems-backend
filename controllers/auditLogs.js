const AuditLog = require("../models/auditLog");
const ExpressResponse = require("../utils/ExpressResponse");
const { hiddenFieldsDefault } = require("../utils/helpers");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_AUDITS_SUCCESS,
  MESSAGE_AUDIT_NOT_FOUND,
  MESSAGE_GET_AUDIT_SUCCESS,
} = require("../utils/messages");

/**
 * Retrieves all audit logs from the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports.GetAudits = async (req, res, next) => {
  // Fetch all audit logs, excluding hidden fields
  const auditLogs = await AuditLog.find({}, hiddenFieldsDefault);

  // Send a successful response with the retrieved audit logs
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_AUDITS_SUCCESS,
        auditLogs
      )
    );
};

/**
 * Retrieves a specific audit log based on the provided audit code.
 *
 * @param {Object} req - Express request object containing auditCode in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports.GetAuditByCode = async (req, res, next) => {
  // Extract auditCode from the request body
  const { auditCode } = req.body;

  // Find a single audit log that matches the provided audit code
  const auditLog = await AuditLog.findOne({ auditCode }, hiddenFieldsDefault);

  // If no audit log is found, pass an error response to the next middleware
  if (!auditLog) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_AUDIT_NOT_FOUND
      )
    );
  }

  // Send a successful response with the retrieved audit log
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_AUDIT_SUCCESS,
        auditLog
      )
    );
};
