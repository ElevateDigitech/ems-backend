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
  // Query the database to retrieve all documents from the `permissions` collection, excluding `__v` and `_id` fields.
  const permissions = await Permission.find({}, hiddenFieldsDefault);

  // Return a success response with the retrieved permissions.
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
  // Extract `permissionCode` from the request body and query the database for a document in the `permissions` collection based on this code, excluding the `__v` and `_id` fields.
  const { permissionCode } = req.body;
  const permission = await Permission.findOne(
    { permissionCode },
    hiddenFieldsDefault
  );

  // Check if no document was found with the provided `permissionCode`. If not, return an error response.
  if (!permission) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PERMISSION_NOT_FOUND
      )
    );
  }

  // Return a success response with the retrieved permission document.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_PERMISSION_SUCCESS,
        permission
      )
    );
};
