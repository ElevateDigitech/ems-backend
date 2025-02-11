const moment = require("moment-timezone");
const Role = require("../models/role");
const User = require("../models/user");
const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditChanges,
  auditCollections,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleError,
  handleSuccess,
  generateRoleCode,
  getPermissionIds,
  getInvalidPermissions,
  IsObjectIdReferenced,
  generateAuditCode,
  getCurrentUser,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_ROLES_SUCCESS,
  MESSAGE_ROLE_NOT_FOUND,
  MESSAGE_GET_ROLE_SUCCESS,
  MESSAGE_ROLE_EXIST,
  MESSAGE_ROLE_PERMISSION_NOT_FOUND,
  MESSAGE_CREATE_ROLE_SUCCESS,
  MESSAGE_UPDATE_ROLE_SUCCESS,
  MESSAGE_ROLE_NOT_ALLOWED_DELETE,
  MESSAGE_DELETE_ROLE_SUCCESS,
  MESSAGE_DELETE_ROLE_ERROR,
  MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_ROLE_TAKEN,
} = require("../utils/messages");
const {
  findRoles,
  findRole,
  createRoleObj,
  updateRoleObj,
  deleteRoleObj,
} = require("../queries/roles");

module.exports = {
  /**
   * Retrieves all roles from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetRoles: async (req, res) => {
    const { start = 1, end = 10 } = req.query; // Step 1: Extract pagination parameters
    const roles = await findRoles({
      start,
      end,
      options: true,
      populated: true,
    }); // Step 2: Fetch exams from database

    // Send the retrieved roles in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_ROLES_SUCCESS, roles)
      );
  },

  /**
   * Retrieves the role of the currently authenticated user.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetOwnRole: async (req, res, next) => {
    // Find the role of the current user
    const role = await findRole({
      query: { roleCode: req.user?.role?.roleCode },
      options: true,
      populated: true,
    });

    // Handle error if role not found
    if (!role)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND);

    // Send the retrieved role in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_ROLE_SUCCESS, role));
  },

  /**
   * Retrieves a role based on the provided role code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetRoleByCode: async (req, res, next) => {
    // Find the role using the provided role code
    const role = await findRole({
      query: { roleCode: req.body.roleCode },
      options: true,
      populated: true,
    });

    // Handle error if role not found
    if (!role)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND);

    // Send the retrieved role in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_ROLE_SUCCESS, role));
  },

  /**
   * Creates a new role with the provided details.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateRole: async (req, res, next) => {
    const {
      roleName,
      roleDescription,
      roleAllowDeletion = true,
      rolePermissions,
    } = req.body;

    const { formattedRoleName, formattedRoleDescription } = formatRoleFields({
      roleName,
      roleDescription,
    });
    // Check if the role already exists
    const existingRole = await findRole({
      query: {
        roleName: formattedRoleName,
      },
    });
    if (existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_EXIST);

    // Validate the provided permissions
    const invalidPermission = await getInvalidPermissions(rolePermissions);
    if (invalidPermission.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      );

    // Create a new role
    const newRole = await createRoleObj({
      roleName: formattedRoleName,
      roleDescription: formattedRoleDescription,
      roleAllowDeletion,
      rolePermissions: await getPermissionIds(rolePermissions),
    });

    // Save the new role to the database
    await newRole.save();

    // Retrieve the newly created role
    const createdRole = await findRole({
      query: { roleCode: newRole.roleCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the creation action
    await logAudit(
      auditActions.CREATE,
      auditCollections.ROLES,
      createdRole.roleCode,
      auditChanges.CREATE_ROLE,
      null,
      createdRole.toObject(),
      currentUser.toObject()
    );

    // Send the created role in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_ROLE_SUCCESS,
          createdRole
        )
      );
  },

  /**
   * Updates an existing role with new information.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateRole: async (req, res, next) => {
    const { roleCode, roleName, roleDescription, rolePermissions } = req.body;
    const { formattedRoleName, formattedRoleDescription } = formatRoleFields({
      roleName,
      roleDescription,
    });
    // Find the existing role
    const existingRole = await findRole({ query: { roleCode } });
    if (!existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND);

    // Check for role name conflicts
    const otherRoles = await findRole({
      query: {
        roleCode: { $ne: roleCode },
        roleName: formattedRoleName,
      },
    });
    if (otherRoles?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_ROLE_TAKEN);

    // Validate the provided permissions
    const invalidPermisions = await getInvalidPermissions(rolePermissions);
    if (invalidPermisions.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      );

    // Save the current role state for audit logging
    const previousData = await findRole({
      query: { roleCode },
      options: true,
    });

    // Update the role in the database
    await updateRoleObj({
      roleCode,
      roleName: formattedRoleName,
      roleDescription: formattedRoleDescription,
      rolePermissions: await getPermissionIds(rolePermissions),
    });

    // Retrieve the updated role
    const updatedRole = await findRole({
      query: { roleCode },
      options: true,
      populated: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the update action
    await logAudit(
      auditActions.UPDATE,
      auditCollections.ROLES,
      updatedRole.roleCode,
      auditChanges.UPDATE_ROLE,
      previousData.toObject(),
      updatedRole.toObject(),
      currentUser.toObject()
    );

    // Send the updated role in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_ROLE_SUCCESS,
          updatedRole
        )
      );
  },

  /**
   * Deletes a role from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteRole: async (req, res, next) => {
    const { roleCode } = req.body;

    // Find the role to be deleted
    const existingRole = await findRole({ query: { roleCode } });
    if (!existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND);

    // Check if the role is allowed to be deleted
    if (!existingRole.roleAllowDeletion)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE
      );

    // Check if the role is referenced by other objects
    const { isReferenced } = await IsObjectIdReferenced(existingRole._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Save the current role state for audit logging
    const previousData = await findRole({
      query: { roleCode },
      options: true,
      populated: true,
    });

    // Delete the role from the database
    const deletionResult = await deleteRoleObj(roleCode);

    // Handle error if deletion failed
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_ROLE_ERROR
      );

    // Retrieve the current user for audit logging
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the deletion action
    await logAudit(
      auditActions.DELETE,
      auditCollections.ROLES,
      roleCode,
      auditChanges.DELETE_ROLE,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Send a success response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_ROLE_SUCCESS));
  },
};
