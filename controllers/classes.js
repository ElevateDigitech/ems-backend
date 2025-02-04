const moment = require("moment-timezone");
const Class = require("../models/class");
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
  generateClassCode,
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
  MESSAGE_GET_CLASSES_SUCCESS,
  MESSAGE_CLASS_NOT_FOUND,
  MESSAGE_GET_CLASS_SUCCESS,
  MESSAGE_CLASS_EXIST,
  MESSAGE_CREATE_CLASSS_SUCCESS,
  MESSAGE_CLASS_TAKEN,
  MESSAGE_UPDATE_CLASSS_SUCCESS,
  MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_CLASSS_ERROR,
  MESSAGE_DELETE_CLASSS_SUCCESS,
} = require("../utils/messages");

module.exports.GetClasses = async (req, res, next) => {
  // Query the database to retrieve all documents from the `classes` collection (excluding `__v` and `_id` fields).
  const classes = await Class.find({}, hiddenFieldsDefault);

  // Return a success response with the retrieved classes.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CLASSES_SUCCESS,
        classes
      )
    );
};

module.exports.GetClassByCode = async (req, res, next) => {
  // Extract `classCode` from the request body and query the `classes` collection to find a document.
  const { classCode } = req.body;
  const classDetails = await Class.findOne(
    {
      classCode,
    },
    hiddenFieldsDefault
  );

  // Check if a document with the specified `classCode` is found; return an error if not.
  if (!classDetails) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  // Return a success response with the found class details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CLASS_SUCCESS,
        classDetails
      )
    );
};

module.exports.CreateClass = async (req, res, next) => {
  // Extract `name` from the request body.
  const { name } = req.body;

  // Trim extra spaces and capitalize the `name` before querying the database to find a matching class.
  const existingClass = await Class.findOne({
    name: name?.trim()?.toUpperCase(),
  });

  // Check if a class with the same `name` already exists in the database. If it does, return an error.
  if (existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_EXIST
      )
    );
  }

  // Generate a unique `classCode` for the new class.
  const classCode = generateClassCode();

  // Create a new `Class` instance with the provided data.
  const newClass = new Class({
    classCode,
    name: name?.trim()?.toUpperCase(),
  });

  // Save the new class to the database.
  await newClass.save();

  // Retrieve the newly created class document using the generated `classCode` (excluding `__v` and `_id`).
  const createdClass = await Class.findOne(
    {
      classCode,
    },
    hiddenFieldsDefault
  );

  // Query the current logged-in user's details using their `userCode`.
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

  // Create an audit log for the class creation action.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.CLASS,
    createdClass?.classCode,
    auditChanges?.CREATE_CLASS,
    null,
    createdClass?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the created class details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_CLASSS_SUCCESS,
        createdClass
      )
    );
};

module.exports.UpdateClass = async (req, res, next) => {
  // Extract the `classCode` and `name` properties from the request body.
  const { classCode, name } = req.body;

  // Query the database to check if the class with the given `classCode` exists.
  const existingClass = await Class.findOne({
    classCode,
  });

  // If no class with the provided `classCode` is found, return an error response.
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  // Check if another class exists with the same `name` but a different `classCode`.
  const otherClasses = await Class.find({
    classCode: { $ne: classCode },
    name: name?.trim()?.toUpperCase(),
  });

  // If a class with the same name is found, return a conflict error.
  if (otherClasses?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_TAKEN
      )
    );
  }

  // Retrieve the current class data before updating (excluding `__v` and `_id`).
  const classBeforeUpdate = await Class.findOne(
    { classCode },
    hiddenFieldsDefault
  );

  // Update the class with the new name and the current timestamp for `updatedAt`.
  const classUpdate = await Class.findOneAndUpdate(
    { classCode },
    {
      name: name?.trim()?.toUpperCase(),
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated class object in the database.
  await classUpdate.save();

  // Fetch the updated class data (excluding `__v` and `_id`).
  const updatedClass = await Class.findOne(
    {
      classCode,
    },
    hiddenFieldsDefault
  );

  // Get the current logged-in user's details using their `userCode`.
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

  // Create an audit log for the class update.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.CLASS,
    classBeforeUpdate?.classCode,
    auditChanges?.UPDATE_CLASS,
    classBeforeUpdate?.toObject(),
    updatedClass?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated class data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_CLASSS_SUCCESS,
        updatedClass
      )
    );
};

module.exports.DeleteClass = async (req, res, next) => {
  // Extract the `classCode` property from the request body.
  const { classCode } = req.body;

  // Query the database to find a class document with the provided `classCode`.
  const existingClass = await Class.findOne({
    classCode,
  });

  // If no class with the given `classCode` is found, return an error response.
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  // Check if the class is referenced anywhere in the database.
  const { isReferenced } = await IsObjectIdReferenced(existingClass._id);

  // If the class is referenced, return an error response indicating it cannot be deleted.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the class document before deletion (excluding `__v` and `_id`).
  const classBeforeDelete = await Class.findOne(
    { classCode },
    hiddenFieldsDefault
  );

  // Delete the class document from the database.
  const classDelete = await Class.deleteOne({
    classCode,
  });

  // If the document deletion fails (i.e., `deletedCount` is 0), return an error response.
  if (classDelete?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CLASSS_ERROR
      )
    );
  }

  // Query the database for the current logged-in user's details using their `userCode`.
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

  // Create an audit log for the class deletion action.
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.CLASS,
    classBeforeDelete?.classCode,
    auditChanges?.DELETE_CLASS,
    classBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response after the class is successfully deleted.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_CLASSS_SUCCESS
      )
    );
};
