const Permission = require("../models/permission");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  // generatePermissionCode,
  // IsObjectIdReferenced,
  hiddenFieldsDefault,
} = require("../utils/helpers");
const { STATUS_SUCCESS, STATUS_ERROR } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  // STATUS_CODE_CONFLICT,
  // STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_PERMISSIONS_SUCCESS,
  MESSAGE_PERMISSION_NOT_FOUND,
  MESSAGE_GET_PERMISSION_SUCCESS,
  // MESSAGE_PERMISSION_EXIST,
  // MESSAGE_CREATE_PERMISSIONS_SUCCESS,
  // MESSAGE_UPDATE_PERMISSIONS_SUCCESS,
  // MESSAGE_DELETE_PERMISSIONS_SUCCESS,
  // MESSAGE_DELETE_PERMISSIONS_ERROR,
  // MESSAGE_PERMISSION_NOT_ALLOWED_DELETE,
  // MESSAGE_PERMISSION_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
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

// module.exports.CreatePermission = async (req, res, next) => {
//   /* The below code snippet is extracting the `permissionName`,
//   `permissionDescription`, and `permissionAllowDeletion` properties
//   from the request body. */
//   const { permissionName, permissionDescription, permissionAllowDeletion } =
//     req.body;

//   /* The below code snippet remove extra spaces and capitalize
//   the `permissionName` and the use it to query the database for
//   a single document in the `permissions` collection. */
//   const existingPermission = await Permission.findOne({
//     permissionName: permissionName?.trim()?.toUpperCase(),
//   });

//   /* The below code snippet is checking if there is an existing
//   permission with the same `permissionName` in the database. If
//   `existingPermission` is truthy (meaning a permission with the
//   same name already exists), it returns an error response using
//   the `next` function with an `ExpressResponse` object. */
//   if (existingPermission) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_CONFLICT,
//         MESSAGE_PERMISSION_EXIST
//       )
//     );
//   }

//   /* The below code snippet is generating a unique permission
//   code for a new permission being created. */
//   const permissionCode = generatePermissionCode();

//   /* The below code snippet is creating a new instance of the
//   `Permission` model with the provided data. */
//   const permission = new Permission({
//     permissionCode,
//     permissionName: permissionName?.trim()?.toUpperCase(),
//     permissionDescription,
//     permissionAllowDeletion: permissionAllowDeletion ?? true,
//   });

//   /* The below code snippet is saving the newly created
//   `permission` object to the database. */
//   await permission.save();

//   /* The below code snippet is querying the database to find
//   the newly created permission document using the above
//   generated `permissionCode` (excluding the fields `__v` and
//   `_id`). */
//   const createdPermission = await Permission.findOne(
//     { permissionCode },
//     hiddenFieldsDefault
//   );

//   /* The below code snippet returns an success response with
//   an `ExpressResponse` object. */
//   res
//     .status(STATUS_CODE_SUCCESS)
//     .send(
//       new ExpressResponse(
//         STATUS_SUCCESS,
//         STATUS_CODE_SUCCESS,
//         MESSAGE_CREATE_PERMISSIONS_SUCCESS,
//         createdPermission
//       )
//     );
// };

// module.exports.UpdatePermission = async (req, res, next) => {
//   /* The below code snippet is extracting the `permissionCode`,
//   `permissionName`, `permissionDescription` properties from
//   the request body. */
//   const { permissionCode, permissionName, permissionDescription } = req.body;

//   /* The below code snippet is using the `permissionCode`
//   to query the database for a single document in the
//   `permissions` collection. */
//   const existingPermission = await Permission.findOne({
//     permissionCode,
//   });

//   /* The below code snippet is checking if no document is
//   found with the given `permissionCode`. If so, it returns
//   an error response using the `next` function with an
//   `ExpressResponse` object. */
//   if (!existingPermission) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_CONFLICT,
//         MESSAGE_PERMISSION_NOT_FOUND
//       )
//     );
//   }

//   /* The below code snippet is updating the instance of the
//   `Permission` model with the provided data. */
//   const permission = await Permission.findOneAndUpdate(
//     { permissionCode },
//     {
//       permissionName: permissionName?.trim()?.toUpperCase(),
//       permissionDescription,
//     }
//   );

//   /* The below code snippet is saving the updated `permission`
//   object to the database. */
//   await permission.save();

//   /* The below code snippet is querying the database to find
//   and retrieve an updated permission document (excluding the
//   fields `__v` and `_id`). */
//   const updatedPermission = await Permission.findOne(
//     { permissionCode },
//     hiddenFieldsDefault
//   );

//   /* The below code snippet returns an success response with
//   an `ExpressResponse` object. */
//   res
//     .status(STATUS_CODE_SUCCESS)
//     .send(
//       new ExpressResponse(
//         STATUS_SUCCESS,
//         STATUS_CODE_SUCCESS,
//         MESSAGE_UPDATE_PERMISSIONS_SUCCESS,
//         updatedPermission
//       )
//     );
// };

// module.exports.DeletePermission = async (req, res, next) => {
//   /* The below code snippet is extracting the `permissionCode`
//   property from the request body. */
//   const { permissionCode } = req.body;

//   /* The below code snippet is using the `permissionCode`
//   to query the database for a single document in the
//   `permissions` collection. */
//   const existingPermission = await Permission.findOne({
//     permissionCode,
//   });

//   /* The below code snippet is checking if no document is
//   found with the given `permissionCode`. It returns an error
//   response using the `next` function with an `ExpressResponse`
//   object. */
//   if (!existingPermission) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_CONFLICT,
//         MESSAGE_PERMISSION_NOT_FOUND
//       )
//     );
//   }

//   /* The below code snippet is checking if the found document
//   is allowed to be deleted. If not, it returns an error response
//   using the `next` function with an `ExpressResponse` object. */
//   if (!existingPermission?.permissionAllowDeletion) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_CONFLICT,
//         MESSAGE_PERMISSION_NOT_ALLOWED_DELETE
//       )
//     );
//   }

//   /* The below code snippet is checking if the permission is
//   being used anywhere in the database. */
//   const { isReferenced } = await IsObjectIdReferenced(existingPermission._id);

//   /* The below code snippet returns an error response using
//   the `next` function with an `ExpressResponse` object, when
//   the found document is in use. */
//   if (isReferenced) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_CONFLICT,
//         MESSAGE_PERMISSION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
//       )
//     );
//   }

//   /* The the below code snippet is querying the database to
//   delete the document with the given `permissionCode` in the
//   permissions collection (excluding the fields `__v` and
//   `_id`). */
//   const permission = await Permission.deleteOne(
//     { permissionCode },
//     hiddenFieldsDefault
//   );

//   /* The the below code snippet is using `deletedCount` in the
//   `deleteOne mongoose function response to confirm the document
//   deletion. If it is `0` then the document is not deleted, then
//   it return an error response using the `next` function with
//   an `ExpressResponse` object. */
//   if (permission?.deletedCount === 0) {
//     return next(
//       new ExpressResponse(
//         STATUS_ERROR,
//         STATUS_CODE_INTERNAL_SERVER_ERROR,
//         MESSAGE_DELETE_PERMISSIONS_ERROR
//       )
//     );
//   }

//   /* The below code snippet returns an success response with
//   an `ExpressResponse` object. */
//   res
//     .status(STATUS_CODE_SUCCESS)
//     .send(
//       new ExpressResponse(
//         STATUS_SUCCESS,
//         STATUS_CODE_SUCCESS,
//         MESSAGE_DELETE_PERMISSIONS_SUCCESS
//       )
//     );
// };
