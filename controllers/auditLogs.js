const AuditLog = require("../models/auditLog");
const ExpressResponse = require("../utils/ExpressResponse");
const { hiddenFieldsDefault } = require("../utils/helpers");
const {
  MESSAGE_GET_AUDITS_SUCCESS,
  MESSAGE_AUDIT_NOT_FOUND,
  MESSAGE_GET_AUDIT_SUCCESS,
} = require("../utils/messages");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");

module.exports.GetAudits = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `auditLogs` collection (excluding
  the fields `__v` and `_id`). */
  const auditLogs = await AuditLog.find({}, hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `auditCode` 
  property from the request body. It then uses this `auditCode`
  to query the database for a single document in the `auditLogs`
  collection (excluding the fields `__v` and `_id`). */
  const { auditCode } = req.body;
  const auditLogs = await AuditLog.findOne({ auditCode }, hiddenFieldsDefault);

  /* The below code snippet is checking if the `auditLogs` variable
  is falsy, which means that no document was found in the database
  that matches the specified `auditCode` provided in the request
  parameters. If no document is found (`auditLogs` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!auditLogs) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_AUDIT_NOT_FOUND
      )
    );
  }

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
