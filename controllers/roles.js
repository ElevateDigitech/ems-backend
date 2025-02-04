const moment = require("moment-timezone");
const Role = require("../models/role");
const User = require("../models/user");
const ExpressResponse = require("../utils/ExpressResponse");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditChanges,
  auditCollections,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  generateRoleCode,
  getPermissionIds,
  getInvalidPermissions,
  IsObjectIdReferenced,
  generateAuditCode,
} = require("../utils/helpers");
const { STATUS_SUCCESS, STATUS_ERROR } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
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

module.exports.GetRoles = async (req, res, next) => {
  // Query the `roles` collection to retrieve all documents (excluding `__v` and `_id`) and populate the linked `rolePermissions` from the `permissions` collection (excluding `__v` and `_id`).
  const roles = await Role.find({}, hiddenFieldsDefault).populate(
    "rolePermissions",
    hiddenFieldsDefault
  );

  // Return a success response with the retrieved roles data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_ROLES_SUCCESS,
        roles
      )
    );
};

module.exports.GetOwnRole = async (req, res, next) => {
  // Extract the `roleCode` from the user object in the request, and query the `roles` collection for a document matching the `roleCode`. Populate the linked `rolePermissions` from the `permissions` collection.
  const { roleCode } = req.user?.role;
  const role = await Role.findOne(
    {
      roleCode,
    },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Check if no role document was found in the database for the specified `roleCode`. If not, return an error response using the `next` function with an `ExpressResponse` object.
  if (!role) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  // Return a success response with the found role data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_ROLE_SUCCESS,
        role
      )
    );
};

module.exports.GetRoleByCode = async (req, res, next) => {
  // Extract the `roleCode` from the request body and use it to query the database for a matching document in the `roles` collection. Also populate the related `rolePermissions` from the `permissions` collection.
  const { roleCode } = req.body;
  const role = await Role.findOne(
    {
      roleCode,
    },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Check if no document is found for the provided `roleCode`. If not found, return an error response using the `next` function and an `ExpressResponse` object.
  if (!role) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  // Return a success response with the role data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_ROLE_SUCCESS,
        role
      )
    );
};

module.exports.CreateRole = async (req, res, next) => {
  // Extract the `roleName`, `roleDescription`, `roleAllowDeletion`, and `rolePermissions` properties from the request body.
  const { roleName, roleDescription, roleAllowDeletion, rolePermissions } =
    req.body;

  // Trim spaces and capitalize `roleName`, then query the database for an existing role with the same name.
  const existingRole = await Role.findOne({
    roleName: roleName?.trim()?.toUpperCase(),
  });

  // If a role with the same name already exists, return an error response.
  if (existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_EXIST
      )
    );
  }

  // Check if there are any invalid permission codes in the provided `rolePermissions` array.
  const invalidPermissions = await getInvalidPermissions(rolePermissions);

  // If any of the permission codes are invalid, return an error response.
  if (invalidPermissions.some((isInvalid) => isInvalid)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      )
    );
  }

  // Generate a unique role code for the new role being created.
  const roleCode = generateRoleCode();

  // Get the permission IDs corresponding to the provided permission codes.
  const permissions = await getPermissionIds(rolePermissions);

  // Create a new `Role` instance with the provided data.
  const role = new Role({
    roleCode,
    roleName: roleName?.trim()?.toUpperCase(),
    roleDescription,
    roleAllowDeletion: roleAllowDeletion ?? true,
    rolePermissions: [...permissions],
  });

  // Save the newly created `Role` to the database.
  await role.save();

  // Query the database to retrieve the newly created role document using the generated `roleCode`, excluding `_id` and `__v` fields, and populate the linked `rolePermissions`.
  const createdRole = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Use the current logged-in user's `userCode` to query the database for the user's details.
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Create an audit log for the role creation action.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.ROLES,
    createdRole?.roleCode,
    auditChanges?.CREATE_ROLE,
    null,
    createdRole?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the newly created role data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_ROLE_SUCCESS,
        createdRole
      )
    );
};

module.exports.UpdateRole = async (req, res, next) => {
  // Extract the properties `roleCode`, `roleName`, `roleDescription`, and `rolePermissions` from the request body.
  const { roleCode, roleName, roleDescription, rolePermissions } = req.body;

  // Query the database to check if a role with the given `roleCode` exists.
  const existingRole = await Role.findOne({
    roleCode,
  });

  // If no role with the specified `roleCode` is found, return an error response.
  if (!existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  // Query the database to check if there are other roles with the same `roleName`, excluding the current role.
  const otherRoles = await Role.find({
    roleCode: { $ne: roleCode },
    roleName: roleName?.trim()?.toUpperCase(),
  });

  // If a role with the same `roleName` already exists, return an error response.
  if (otherRoles?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_TAKEN
      )
    );
  }

  // Check if any of the provided `rolePermissions` have invalid permission codes.
  const invalidPermissions = await getInvalidPermissions(rolePermissions);

  // If there are invalid permission codes, return an error response.
  if (invalidPermissions.some((isInvalid) => isInvalid)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      )
    );
  }

  // Create an array of permission IDs from the provided permission codes.
  const permissions = await getPermissionIds(rolePermissions);

  // Retrieve the current role details before updating it.
  const roleBeforeUpdate = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Update the `Role` document with the new data.
  const role = await Role.findOneAndUpdate(
    { roleCode },
    {
      roleName: roleName?.trim()?.toUpperCase(),
      roleDescription,
      rolePermissions: [...permissions],
      updatedAt: moment().valueOf(),
    }
  );

  // Retrieve the updated role document, including the populated `rolePermissions`.
  const updatedRole = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Query the database to get the details of the currently logged-in user.
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Log the role update action in the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.ROLES,
    updatedRole?.roleCode,
    auditChanges?.UPDATE_ROLE,
    roleBeforeUpdate?.toObject(),
    updatedRole?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated role data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_ROLE_SUCCESS,
        updatedRole
      )
    );
};

module.exports.DeleteRole = async (req, res, next) => {
  // Extract the `roleCode` property from the request body.
  const { roleCode } = req.body;

  // Use the `roleCode` to query the database for a document in the `roles` collection.
  const existingRole = await Role.findOne({
    roleCode,
  });

  // Check if no document is found with the given `roleCode`. If not, return an error response.
  if (!existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  // Check if the found role is allowed to be deleted. If not, return an error response.
  if (!existingRole?.roleAllowDeletion) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE
      )
    );
  }

  // Check if the role is being referenced anywhere in the database.
  const { isReferenced } = await IsObjectIdReferenced(existingRole._id);

  // If the role is being referenced, return an error response.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the role details before deletion.
  const roleBeforeDelete = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  // Delete the role from the database using the `roleCode`.
  const role = await Role.deleteOne({
    roleCode,
  });

  // Check if the deletion was successful by inspecting `deletedCount`. If not, return an error response.
  if (role?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_ROLE_ERROR
      )
    );
  }

  // Use the current logged-in user's `userCode` to find their `_id` in the database.
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Log the deletion action in the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.ROLES,
    existingRole?.roleCode,
    auditChanges?.DELETE_ROLE,
    roleBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response confirming the role deletion.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_ROLE_SUCCESS
      )
    );
};
