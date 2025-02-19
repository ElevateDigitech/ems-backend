const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditChanges,
  auditCollections,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  getPermissionIds,
  getInvalidPermissions,
  IsObjectIdReferenced,
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
  formatRoleFields,
} = require("../queries/roles");

module.exports = {
  /**
   * Retrieves all roles from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetRoles: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findRoles({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 3: Send the retrieved roles in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_ROLES_SUCCESS,
          results,
          totalCount
        )
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
    const role = await findRole({
      query: { roleCode: req.user?.role?.roleCode },
      projection: true,
      populate: true,
    }); // Step 1: Find the role of the current user

    if (!role)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND); // Step 2: Handle error if role not found

    // Step 3: Send the retrieved role in the response
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
    const role = await findRole({
      query: { roleCode: req.body.roleCode },
      projection: true,
      populate: true,
    }); // Step 1: Find the role using the provided role code

    if (!role)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND); // Step 2: Handle error if role not found

    // Step 3: Send the retrieved role in the response
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
    }); // Step 1: Format role fields

    const existingRole = await findRole({
      query: { roleName: formattedRoleName },
    });
    if (existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_EXIST); // Step 2: Check if role already exists

    const invalidPermission = await getInvalidPermissions(rolePermissions);
    if (invalidPermission.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      ); // Step 3: Validate permissions

    const newRole = await createRoleObj({
      roleName: formattedRoleName,
      roleDescription: formattedRoleDescription,
      roleAllowDeletion,
      rolePermissions: await getPermissionIds(rolePermissions),
    }); // Step 4: Create new role

    await newRole.save(); // Step 5: Save the new role

    const createdRole = await findRole({
      query: { roleCode: newRole.roleCode },
      projection: true,
      populate: true,
    }); // Step 6: Retrieve the newly created role

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.ROLES,
      createdRole.roleCode,
      auditChanges.CREATE_ROLE,
      null,
      createdRole.toObject(),
      currentUser.toObject()
    ); // Step 7: Log the creation action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_ROLE_SUCCESS,
          createdRole
        )
      ); // Step 8: Send the created role in the response
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
    }); // Step 1: Format role fields

    const existingRole = await findRole({ query: { roleCode } });
    if (!existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND); // Step 2: Find the existing role

    const duplicateRole = await findRole({
      query: { roleCode: { $ne: roleCode }, roleName: formattedRoleName },
    });
    if (duplicateRole)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_ROLE_TAKEN); // Step 3: Check for role name conflicts

    const invalidPermissions = await getInvalidPermissions(rolePermissions);
    if (invalidPermissions.some(Boolean))
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      ); // Step 4: Validate permissions

    const previousData = await findRole({
      query: { roleCode },
      projection: true,
      populate: true,
    });

    await updateRoleObj({
      roleCode,
      roleName: formattedRoleName,
      roleDescription: formattedRoleDescription,
      rolePermissions: await getPermissionIds(rolePermissions),
    }); // Step 5: Update the role in the database

    const updatedRole = await findRole({
      query: { roleCode },
      projection: true,
      populate: true,
    });

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.ROLES,
      updatedRole.roleCode,
      auditChanges.UPDATE_ROLE,
      previousData.toObject(),
      updatedRole.toObject(),
      currentUser.toObject()
    ); // Step 6: Log the update action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_ROLE_SUCCESS,
          updatedRole
        )
      ); // Step 7: Send the updated role in the response
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

    const existingRole = await findRole({ query: { roleCode } });
    if (!existingRole)
      return handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_ROLE_NOT_FOUND); // Step 1: Find the role to be deleted

    if (!existingRole.roleAllowDeletion)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE
      ); // Step 2: Check if deletion is allowed

    const { isReferenced } = await IsObjectIdReferenced(existingRole._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      ); // Step 3: Check for references

    const previousData = await findRole({
      query: { roleCode },
      projection: true,
      populate: true,
    });

    const deletionResult = await deleteRoleObj(roleCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_ROLE_ERROR
      ); // Step 4: Handle deletion error

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.ROLES,
      roleCode,
      auditChanges.DELETE_ROLE,
      previousData.toObject(),
      null,
      currentUser.toObject()
    ); // Step 5: Log the deletion action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_ROLE_SUCCESS)); // Step 6: Send a success response
  },
};
