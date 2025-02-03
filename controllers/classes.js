const moment = require("moment-timezone");
const Gender = require("../models/gender");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  IsObjectIdReferenced,
  generateClassCode,
  hiddenFieldsDefault,
  hiddenFieldsUser,
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
const User = require("../models/user");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const { logAudit } = require("../middleware");
const Class = require("../models/class");

module.exports.GetClasses = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `classes` collection (excluding
  the fields `__v` and `_id`). */
  const classes = await Class.find({}, hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `classCode`
  property from the request body. It then uses this `classCode`
  to query the database for a single document in the `classes`
  collection (excluding the fields `__v` and `_id`). */
  const { classCode } = req.body;
  const classes = await Class.findOne({ classCode }, hiddenFieldsDefault);

  /* The below code snippet is checking if the `classes` variable
  is falsy, which means that no document was found in the database
  that matches the specified `classCode` provided in the request
  body. If no document is found (`classes` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!classes) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
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
        MESSAGE_GET_CLASS_SUCCESS,
        classes
      )
    );
};

module.exports.CreateClass = async (req, res, next) => {
  /* The below code snippet is extracting the `name` property 
  from the request body. */
  const { name } = req.body;

  /* The below code snippet remove extra spaces and capitalize
  the `name` and the use it to query the database for
  a single document in the `classes` collection. */
  const existingClass = await Class.findOne({
    name: name?.trim()?.toUpperCase(),
  });

  /* The below code snippet is checking if there is an existing
  class with the same `name` in the database. If `existingClass` 
  is truthy (meaning a class with the same name already exists), 
  it returns an error response using the `next` function with 
  an `ExpressResponse` object. */
  if (existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_EXIST
      )
    );
  }

  /* The below code snippet is generating a unique `classCode`
  for a new class being created. */
  const classCode = generateClassCode();

  /* The below code snippet is creating a new instance of the
  `Class` model with the provided data. */
  const newClass = new Class({
    classCode,
    name: name?.trim()?.toUpperCase(),
  });

  /* The below code snippet is saving the newly created
  `newClass` object to the database. */
  await newClass.save();

  /* The below code snippet is querying the database to find
  the newly created class document using the above generated 
  `classCode` (excluding the fields `__v` and `_id`). */
  const createdClass = await Class.findOne({ classCode }, hiddenFieldsDefault);

  /* The below code snippet is using the current logged in 
  user's `userCode` to query the database to find the `_id`
  of that user.
   */
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

  /* The below code snippet is creating a audit log. */
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

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `classCode`,
  `name` properties from the request body. */
  const { classCode, name } = req.body;

  /* The below code snippet is using the `classCode`
  to query the database for a single document in the
  `classes` collection. */
  const existingClass = await Class.findOne({
    classCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `classCode`. If so, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  /* The below code snippet is querying the database to
  find document without the `classCode` from the request
  body and with `name` from the request body. */
  const otherClasses = await Class.find({
    classCode: { $ne: classCode },
    name: name?.trim()?.toUpperCase(),
  });

  /* The below code snippet is checking if there is a
  document in the `classes` collection with the given 
  `name` other than the document with the given 
  `classCode`. If so, then it returns an error response 
  using the `next` function with an `ExpressResponse` 
  object. */
  if (otherClasses?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_TAKEN
      )
    );
  }

  /* The below code snippet is querying the database to find
  and retrieve the gender document (excluding the fields 
  `__v` and `_id`). */
  const classBeforeUpdate = await Class.findOne(
    { classCode },
    hiddenFieldsDefault
  );

  /* The below code snippet is updating the instance of the
  `Class` model with the provided data. */
  const classUpdate = await Class.findOneAndUpdate(
    { classCode },
    {
      name: name?.trim()?.toUpperCase(),
      updatedAt: moment().valueOf(),
    }
  );

  /* The below code snippet is saving the updated `class`
  object to the database. */
  await classUpdate.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated class document (excluding the
  fields `__v` and `_id`). */
  const updatedClass = await Class.findOne({ classCode }, hiddenFieldsDefault);

  /* The below code snippet is using the current logged in 
  user's `userCode` to query the database to find the `_id`
  of that user.
   */
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

  /* The below code snippet is creating a audit log. */
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

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `classCode`
  property from the request body. */
  const { classCode } = req.body;

  /* The below code snippet is using the `classCode`
  to query the database for a single document in the
  `classes` collection. */
  const existingClass = await Class.findOne({
    classCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `classCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the class is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingClass._id);

  /* The below code snippet returns an error response using 
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The below code snippet is querying the database to find
  and retrieve the class document (excluding the fields 
  `__v` and `_id`). */
  const classBeforeDelete = await Class.findOne(
    { classCode },
    hiddenFieldsDefault
  );

  /* The the below code snippet is querying the database to
  delete the document with the given `classCode` in the
  classes collection (excluding the fields `__v` and 
  `_id`). */
  const classDelete = await Class.deleteOne({ classCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (classDelete?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CLASSS_ERROR
      )
    );
  }

  /* The below code snippet is using the current logged in 
  user's `userCode` to query the database to find the `_id`
  of that user.
   */
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

  /* The below code snippet is creating a audit log. */
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

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
