const Permission = require("../models/permission");
const ExpressResponse = require("../utils/ExpressResponse");
const { hiddenFieldsDefault } = require("../utils/helpers");
const { STATUS_SUCCESS, STATUS_ERROR } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_PERMISSIONS_SUCCESS,
  MESSAGE_PERMISSION_NOT_FOUND,
  MESSAGE_GET_PERMISSION_SUCCESS,
} = require("../utils/messages");

module.exports.GetPermissions = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `permissions` collection (excluding
  the fields `__v` and `_id`). */
  const permissions = await Permission.find({}, hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PERMISSIONS_SUCCESS,
        permissions
      )
    );
};

module.exports.GetPermissionByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `permissionCode`
  property from the request body. It then uses this `permissionCode`
  to query the database for a single document in the `permissions`
  collection (excluding the fields `__v` and `_id`). */
  const { permissionCode } = req.body;
  const permissions = await Permission.findOne(
    { permissionCode },
    hiddenFieldsDefault
  );

  /* The below code snippet is checking if the `permissions` variable
  is falsy, which means that no document was found in the database
  that matches the specified `PermissionCode` provided in the request
  parameters. If no document is found (`permissions` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!permissions) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PERMISSION_NOT_FOUND
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
        MESSAGE_GET_PERMISSION_SUCCESS,
        permissions
      )
    );
};
