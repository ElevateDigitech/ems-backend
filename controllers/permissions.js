const {
  findPermissions,
  findPermission,
  getPermissionPaginationObject,
} = require("../queries/permissions");
const { handleError, handleSuccess } = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_PERMISSIONS_SUCCESS,
  MESSAGE_PERMISSION_NOT_FOUND,
  MESSAGE_GET_PERMISSION_SUCCESS,
  MESSAGE_ROLE_NOT_FOUND,
} = require("../utils/messages");
const { findRole } = require("../queries/roles");

module.exports = {
  /**
   * Retrieves all permissions from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetPermissions: async (req, res, next) => {
    // Step 1: Destructure 'start' and 'end' from the query parameters, defaulting to 1 and 10 if not provided
    const { page = 1, perPage = 10 } = req.query;

    // Step 2: Query the database to retrieve all permission documents within the provided range
    const permissions = await findPermissions({ page, perPage, options: true });
    const pagination = await getPermissionPaginationObject(page, perPage); // Get total count
    // Step 3: Return a success response with the retrieved permissions
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // HTTP status code for success
        MESSAGE_GET_PERMISSIONS_SUCCESS, // Success message
        permissions, // Data containing the permissions
        pagination
      )
    );
  },

  /**
   * Retrieves a specific permission by its unique permission code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetPermissionByCode: async (req, res, next) => {
    // Step 1: Extract the permissionCode from the request body
    const { permissionCode } = req.body;

    // Step 2: Query the database to find the permission document by its unique code
    const permission = await findPermission({
      query: { permissionCode },
      options: true,
    });

    // Step 3: Check if the permission exists in the database
    if (!permission) {
      // Step 4: If the permission is not found, return an error response
      return handleError(
        next, // Pass the next middleware function to handle the error
        STATUS_CODE_BAD_REQUEST, // HTTP status code for a bad request
        MESSAGE_PERMISSION_NOT_FOUND // Error message indicating permission not found
      );
    }

    // Step 5: If the permission is found, return a success response with the permission data
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // HTTP status code for success
        MESSAGE_GET_PERMISSION_SUCCESS, // Success message
        permission // Data containing the specific permission
      )
    );
  },

  /**
   * Retrieves a specific permission by its unique permission code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetPermissionsByRoleCode: async (req, res, next) => {
    // Step 1: Destructure 'start' and 'end' from the query parameters, defaulting to 1 and 10 if not provided
    const { page = 1, perPage = 10 } = req.query;
    // Step 1: Extract the permissionCode from the request body
    const { roleCode } = req.body;

    // Step 2: Query the database to find the permission document by its unique code
    const role = await findRole({
      query: { roleCode },
      options: true,
      populated: true,
    });

    // Step 3: Check if the permission exists in the database
    if (!role) {
      // Step 4: If the permission is not found, return an error response
      return handleError(
        next, // Pass the next middleware function to handle the error
        STATUS_CODE_BAD_REQUEST, // HTTP status code for a bad request
        MESSAGE_ROLE_NOT_FOUND // Error message indicating permission not found
      );
    }

    const rolePermissions = role?.rolePermissions?.map(
      (p) => p?.permissionCode
    );

    // Step 2: Query the database to find the permission document by its unique code
    const permissions = await findPermissions({
      page,
      perPage,
      query: { permissionCode: { $in: rolePermissions } },
      options: true,
    });

    // Step 3: Check if the permission exists in the database
    if (!permissions) {
      // Step 4: If the permission is not found, return an error response
      return handleError(
        next, // Pass the next middleware function to handle the error
        STATUS_CODE_BAD_REQUEST, // HTTP status code for a bad request
        MESSAGE_PERMISSION_NOT_FOUND // Error message indicating permission not found
      );
    }
    const pagination = await getPermissionPaginationObject(page, perPage); // Get total count

    // Step 5: If the permission is found, return a success response with the permission data
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS, // HTTP status code for success
        MESSAGE_GET_PERMISSION_SUCCESS, // Success message
        permissions, // Data containing the specific permission
        pagination
      )
    );
  },
};
