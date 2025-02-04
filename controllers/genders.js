const moment = require("moment-timezone");
const Gender = require("../models/gender");
const User = require("../models/user");
const ExpressResponse = require("../utils/ExpressResponse");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  IsObjectIdReferenced,
  generateGenderCode,
  generateAuditCode,
} = require("../utils/helpers");
const { STATUS_SUCCESS, STATUS_ERROR } = require("../utils/status");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GENDER_EXIST,
  MESSAGE_CREATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_FOUND,
  MESSAGE_UPDATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_GENDERS_ERROR,
  MESSAGE_DELETE_GENDERS_SUCCESS,
  MESSAGE_GET_GENDER_SUCCESS,
  MESSAGE_GET_GENDERS_SUCCESS,
  MESSAGE_GENDER_TAKEN,
} = require("../utils/messages");

module.exports.GetGenders = async (req, res, next) => {
  /// Query the database to retrieve all documents from the `genders` collection (excluding `__v` and `_id`).
  const genders = await Gender.find({}, hiddenFieldsDefault);

  // Return a success response with the retrieved genders data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_GENDERS_SUCCESS,
        genders
      )
    );
};

module.exports.GetGenderByCode = async (req, res, next) => {
  // Extract the `genderCode` from the request body and query the database for a matching document in the `genders` collection (excluding `__v` and `_id`).
  const { genderCode } = req.body;
  const gender = await Gender.findOne(
    {
      genderCode,
    },
    hiddenFieldsDefault
  );

  // Check if no gender document was found. If so, return an error response.
  if (!gender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  // Return a success response with the found gender data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_GENDER_SUCCESS,
        gender
      )
    );
};

module.exports.CreateGender = async (req, res, next) => {
  // Extract the `genderName` from the request body.
  const { genderName } = req.body;

  // Clean up and capitalize the `genderName`, then query the database for an existing gender with the same name.
  const existingGender = await Gender.findOne({
    genderName: genderName?.trim()?.toUpperCase(),
  });

  // If a gender with the same name already exists, return an error response.
  if (existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_EXIST
      )
    );
  }

  // Generate a unique `genderCode` for the new gender.
  const genderCode = generateGenderCode();

  // Create a new instance of the `Gender` model with the provided data.
  const gender = new Gender({
    genderCode,
    genderName: genderName?.trim()?.toUpperCase(),
  });

  // Save the newly created gender document to the database.
  await gender.save();

  // Retrieve the newly created gender document using the generated `genderCode`, excluding `__v` and `_id` fields.
  const createdGender = await Gender.findOne(
    { genderCode },
    hiddenFieldsDefault
  );

  // Use the currently logged-in user's `userCode` to find their `_id` and associated role.
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

  // Create an audit log entry for the gender creation action.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.GENDERS,
    createdGender?.genderCode,
    auditChanges?.CREATE_GENDER,
    null,
    createdGender?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the created gender document.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_GENDERS_SUCCESS,
        createdGender
      )
    );
};

module.exports.UpdateGender = async (req, res, next) => {
  // Extract the `genderCode` and `genderName` properties from the request body.
  const { genderCode, genderName } = req.body;

  // Use the `genderCode` to query the database for the corresponding gender document.
  const existingGender = await Gender.findOne({
    genderCode,
  });

  // If no document is found with the given `genderCode`, return an error response.
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  // Query the database to find other gender documents (excluding the current `genderCode`)
  // with the provided `genderName`.
  const otherGenders = await Gender.find({
    genderCode: { $ne: genderCode },
    genderName: genderName?.trim()?.toUpperCase(),
  });

  // If a document with the same `genderName` (other than the current one) exists,
  // return an error response.
  if (otherGenders?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_TAKEN
      )
    );
  }

  // Retrieve the gender document before updating it, excluding `__v` and `_id` fields.
  const genderBeforeUpdate = await Gender.findOne(
    { genderCode },
    hiddenFieldsDefault
  );

  // Update the gender document with the new `genderName` and set the updated timestamp.
  const gender = await Gender.findOneAndUpdate(
    { genderCode },
    {
      genderName: genderName?.trim()?.toUpperCase(),
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated gender document to the database.
  await gender.save();

  // Retrieve the updated gender document, excluding `__v` and `_id` fields.
  const updatedGender = await Gender.findOne(
    { genderCode },
    hiddenFieldsDefault
  );

  // Use the logged-in user's `userCode` to find the user details and their role.
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

  // Create an audit log entry for the gender update action.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.GENDERS,
    genderBeforeUpdate?.genderCode,
    auditChanges?.UPDATE_GENDER,
    genderBeforeUpdate?.toObject(),
    updatedGender?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated gender data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_GENDERS_SUCCESS,
        updatedGender
      )
    );
};

module.exports.DeleteGender = async (req, res, next) => {
  // Extract the `genderCode` property from the request body.
  const { genderCode } = req.body;

  // Use the `genderCode` to find the corresponding gender document in the database.
  const existingGender = await Gender.findOne({
    genderCode,
  });

  // If no document is found with the given `genderCode`, return an error response.
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  // Check if the gender is currently referenced anywhere in the database.
  const { isReferenced } = await IsObjectIdReferenced(existingGender._id);

  // If the gender is in use, return an error response.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the gender document before deletion, excluding the `__v` and `_id` fields.
  const genderBeforeDelete = await Gender.findOne(
    { genderCode },
    hiddenFieldsDefault
  );

  // Delete the gender document from the database using the provided `genderCode`.
  const gender = await Gender.deleteOne({
    genderCode,
  });

  // If no document was deleted (i.e., `deletedCount` is 0), return an error response.
  if (gender?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_GENDERS_ERROR
      )
    );
  }

  // Use the current logged-in user's `userCode` to find their details and role.
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

  // Create an audit log for the gender deletion action.
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.GENDERS,
    genderBeforeDelete?.genderCode,
    auditChanges?.DELETE_GENDER,
    genderBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response after the gender has been deleted.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_GENDERS_SUCCESS
      )
    );
};
