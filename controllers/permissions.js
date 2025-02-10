const Permission = require("../models/permission");
const {
  hiddenFieldsDefault,
  handleError,
  handleSuccess,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_PERMISSIONS_SUCCESS,
  MESSAGE_PERMISSION_NOT_FOUND,
  MESSAGE_GET_PERMISSION_SUCCESS,
} = require("../utils/messages");

// Permission Controller
module.exports = {
  /**
   * Retrieves all permissions from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetPermissions: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Query the database to retrieve all permission documents
    const permissions = await Permission.find({}, hiddenFieldsDefault).limit(
      entries
    );

    // Return a success response with the retrieved permissions
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_PERMISSIONS_SUCCESS,
          permissions
        )
      );
  },

  /**
   * Retrieves a permission by its unique permission code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetPermissionByCode: async (req, res, next) => {
    // Extract the permissionCode from the request body
    const { permissionCode } = req.body;

    // Query the database to find the permission by its code
    const permission = await Permission.findOne(
      { permissionCode },
      hiddenFieldsDefault
    );

    // Check if the permission exists
    if (!permission) {
      //  If not found, return an error response
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PERMISSION_NOT_FOUND
      );
    }

    // If found, return a success response with the permission data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_PERMISSION_SUCCESS,
          permission
        )
      );
  },
};
