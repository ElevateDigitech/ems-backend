const Role = require("../models/role");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  generateRoleCode,
  getPermissionIds,
  getInvalidPermissions,
  IsObjectIdReferenced,
  hiddenFieldsDefault,
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
} = require("../utils/messages");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditChanges,
  auditCollections,
} = require("../utils/audit");
const User = require("../models/user");

module.exports.GetRoles = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `roles` collection (excluding `__v`
  and `_id`) with populating the linked documents from the
  `permissions` collection (excluding the fields `__v` and
  `_id`). */
  const roles = await Role.find({}, hiddenFieldsDefault).populate(
    "rolePermissions",
    hiddenFieldsDefault
  );

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `roleCode`
  property from the user object in the request. It then uses 
  this `roleCode` to query the database for a single document 
  in the `roles` collection (excluding the fields `__v` and 
  `_id`) with populating the linked documents from the 
  `permissions` collection (excluding the fields `__v` and 
  `_id`). */
  const { roleCode } = req.user?.role;
  const role = await Role.findOne({ roleCode }, hiddenFieldsDefault).populate(
    "rolePermissions",
    hiddenFieldsDefault
  );

  /* The below code snippet is checking if there is no document
  was found in the database that matches the specified `roleCode`
  provided in the request parameters. If no document is found, 
  then it returns an error response using the `next` function
  with an `ExpressResponse` object. */
  if (!role) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
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
        MESSAGE_GET_ROLE_SUCCESS,
        role
      )
    );
};

module.exports.GetRoleByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `roleCode`
  property from the request body. It then uses this `roleCode`
  to query the database for a single document in the `roles`
  collection (excluding the fields `__v` and `_id`) with
  populating the linked documents from the `permissions`
  collection (excluding the fields `__v` and `_id`). */
  const { roleCode } = req.body;
  const role = await Role.findOne({ roleCode }, hiddenFieldsDefault).populate(
    "rolePermissions",
    hiddenFieldsDefault
  );

  /* The below code snippet is checking if there is no document
  was found in the database that matches the specified `roleCode`
  provided in the request parameters. If no document is found, 
  then it returns an error response using the `next` function
  with an `ExpressResponse` object. */
  if (!role) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
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
        MESSAGE_GET_ROLE_SUCCESS,
        role
      )
    );
};

module.exports.CreateRole = async (req, res, next) => {
  /* The below code snippet is extracting the `roleName`,
  `roleDescription`, `roleAllowDeletion`, and `rolePermissions`
  properties from the request body. */
  const { roleName, roleDescription, roleAllowDeletion, rolePermissions } =
    req.body;

  /* The below code snippet remove extra spaces and capitalize
  the `roleName` and the use it to query the database for a
  single document in the `roles` collection. */
  const existingRole = await Role.findOne({
    roleName: roleName?.trim()?.toUpperCase(),
  });

  /* The below code snippet is checking if there is an existing
  role with the same `roleName` in the database. If there is a
  role with the same name already exists, it returns an
  error response using the `next` function with an
  `ExpressResponse` object. */
  if (existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_EXIST
      )
    );
  }

  /* The below code snippet is checking if there is any invalid
  `permissionCode` exist in the given `rolePermission` array. */
  const invalidPermissions = await getInvalidPermissions(rolePermissions);

  /* The below code snippet is checking if atleast one of the
  given `permissionCode` is invalid. If so, then returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (invalidPermissions.some((isInvalid) => isInvalid)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      )
    );
  }

  /* The below code snippet is generating a unique role
  code for a new role being created. */
  const roleCode = generateRoleCode();

  /* The below code snippet is creating an array of permission
  ids from the given `permissionCodes` */
  const permissions = await getPermissionIds(rolePermissions);

  /* The below code snippet is creating a new instance of the
  `Role` model with the provided data. */
  const role = new Role({
    roleCode,
    roleName: roleName?.trim()?.toUpperCase(),
    roleDescription,
    roleAllowDeletion: roleAllowDeletion ?? true,
    rolePermissions: [...permissions],
  });

  /* The below code snippet is saving the newly created
  `role` object to the database. */
  await role.save();

  /* The below code snippet is querying the database to find
  the newly created role document using the above generated
  `roleCode` (excluding the fields `__v` and `_id`) with
  populating the linked documents from the `permissions`
  collection (excluding the fields `__v` and `_id`). */
  const createdRole = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  /* The below code snippet is using the current logged in 
  user's `userCode` to query the database to find the `_id`
  of that user.
   */
  const createdUser = await User.findOne({ userCode: req.user.userCode });

  /* The below code snippet is creating a audit log. */
  await logAudit(
    auditActions?.CREATE,
    auditCollections?.ROLES,
    role?._id,
    auditChanges?.CREATE_ROLE,
    null,
    createdRole,
    createdUser?._id
  );

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `roleCode`,
  `roleName`, `roleDescription`, `roleAllowDeletion`, and
  `rolePermissions` properties from the request body. */
  const { roleCode, roleName, roleDescription, rolePermissions } = req.body;

  /* The below code snippet using the given `roleCode` to
  query the database for a single document in the `roles`
  collection. */
  const existingRole = await Role.findOne({ roleCode });

  /* The below code snippet is checking if no document is
  found with the given `roleCode`. If so, then it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if there is any invalid
  `permissionCode` exist in the given `rolePermission` array. */
  const invalidPermissions = await getInvalidPermissions(rolePermissions);

  /* The below code snippet is checking if atleast one of the
  given `permissionCode` is invalid. If so, then returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (invalidPermissions.some((isInvalid) => isInvalid)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_PERMISSION_NOT_FOUND
      )
    );
  }

  /* The below code snippet is creating an array of permission
  ids from the given `permissionCodes` */
  const permissions = await getPermissionIds(rolePermissions);

  /* The below code snippet is finding and updating the instance
  of the `Role` model with the provided data. */
  const role = await Role.findOneAndUpdate(
    { roleCode },
    {
      roleName: roleName?.trim()?.toUpperCase(),
      roleDescription,
      rolePermissions: [...permissions],
    }
  );

  /* The below code snippet is querying the database to find
  and retrieve an updated role document (excluding the
  fields `__v` and `_id`) with populating the linked documents
  from the `permissions` collection (excluding the fields
  `__v` and `_id`).. */
  const updateRole = await Role.findOne(
    { roleCode },
    hiddenFieldsDefault
  ).populate("rolePermissions", hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_ROLE_SUCCESS,
        updateRole
      )
    );
};

module.exports.DeleteRole = async (req, res, next) => {
  /* The below code snippet is extracting the `roleCode`
  property from the request body. */
  const { roleCode } = req.body;

  /* The below code snippet is using the `rolecode`
  to query the database for a single document in the
  `roles` collection. */
  const existingRole = await Role.findOne({ roleCode });

  /* The below code snippet is checking if no document is
  found with the given `roleCode`. If so, then it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingRole) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the found
  document is allowed to be deleted. If not, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingRole?.roleAllowDeletion) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE
      )
    );
  }

  /* The below code snippet is checking if the role is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingRole._id);

  /* The below code snippet returns an error response
  using the `next` function with an `ExpressResponse`
  object, when the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The the below code snippet is querying the database
  to delete the document with the given `rolecode` in the
  `roles` collection. */
  const role = await Role.deleteOne({ roleCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (role?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_ROLE_ERROR
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
        MESSAGE_DELETE_ROLE_SUCCESS
      )
    );
};
