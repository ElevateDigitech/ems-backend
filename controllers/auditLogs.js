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

module.exports.GetAudits = async (req, res, next) => {
  // Retrieve all documents from the `auditLogs` collection while excluding specific fields
  const auditLogs = await AuditLog.find({}, hiddenFieldsDefault);

  // Send a success response containing the retrieved audit logs
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

module.exports.GetAuditByCode = async (req, res, next) => {
  // Extract the `auditCode` from the request body and query the `auditLogs` collection for a matching document, excluding specific fields
  const { auditCode } = req.body;
  const auditLogs = await AuditLog.findOne(
    {
      auditCode,
    },
    hiddenFieldsDefault
  );

  // If no matching document is found, return an error response
  if (!auditLogs) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_AUDIT_NOT_FOUND
      )
    );
  }

  // Send a success response with the retrieved audit log data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_AUDIT_SUCCESS,
        auditLogs
      )
    );
};
