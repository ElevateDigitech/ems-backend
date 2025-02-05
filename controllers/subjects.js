const moment = require("moment-timezone");
const Subject = require("../models/subject");
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
  toCapitalize,
  generateCountryCode,
  IsObjectIdReferenced,
  generateAuditCode,
  generateSubjectCode,
} = require("../utils/helpers");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");
const {
  MESSAGE_COUNTRY_EXIST,
  MESSAGE_CREATE_COUNTRY_SUCCESS,
  MESSAGE_GET_COUNTRIES_SUCCESS,
  MESSAGE_GET_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_UPDATE_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_COUNTRY_SUCCESS,
  MESSAGE_DELETE_COUNTRY_ERROR,
  MESSAGE_COUNTRY_TAKEN,
  MESSAGE_GET_SUBJECTS_SUCCESS,
  MESSAGE_SUBJECT_NOT_FOUND,
  MESSAGE_GET_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_EXIST,
  MESSAGE_CREATE_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_TAKEN,
  MESSAGE_UPDATE_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_SUBJECT_ERROR,
  MESSAGE_DELETE_SUBJECT_SUCCESS,
} = require("../utils/messages");

module.exports.GetSubjects = async (req, res, next) => {
  // Query the database to retrieve all documents from the `subjects` collection (excluding `__v` and `_id` fields).
  const subjects = await Subject.find({}, hiddenFieldsDefault);

  // Return a success response with the list of subjects.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_SUBJECTS_SUCCESS,
        subjects
      )
    );
};

module.exports.GetSubjectByCode = async (req, res, next) => {
  // Extract the `subjectCode` from the request body and query the `subjects` collection for the matching document (excluding `__v` and `_id` fields).
  const { subjectCode } = req.body;
  const subject = await Subject.findOne(
    {
      subjectCode,
    },
    hiddenFieldsDefault
  );

  // Check if no document is found with the provided `subjectCode` in the request. If not, return an error response.
  if (!subject) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SUBJECT_NOT_FOUND
      )
    );
  }

  // Return a success response with the found subject details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_SUBJECT_SUCCESS,
        subject
      )
    );
};

module.exports.CreateSubject = async (req, res, next) => {
  // Extract the `name` property from the request body.
  const { name } = req.body;

  // Capitalize the `name` and querying the database for a matching subject document.
  const existingSubject = await Subject.findOne({
    $or: [{ name: toCapitalize(name) }],
  });

  // Check if a subject with the same `name` already exists. If found, return a conflict error.
  if (existingSubject) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_EXIST
      )
    );
  }

  // Generate a unique `subjectCode` for the new country.
  const subjectCode = generateSubjectCode();

  // Create a new `Country` model instance with the provided data.
  const country = new Subject({
    subjectCode,
    name: toCapitalize(name),
  });

  // Save the newly created country to the database.
  await country.save();

  // Retrieve the newly created country document using the generated `subjectCode` (excluding `__v` and `_id` fields).
  const createdCountry = await Subject.findOne(
    { subjectCode },
    hiddenFieldsDefault
  );

  // Query the database for the current user's details using their `userCode`.
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

  // Create an audit log for the country creation.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.SUBJECTS,
    createdCountry?.subjectCode,
    auditChanges?.CREATE_SUBJECT,
    null,
    createdCountry?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the created country details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_SUBJECT_SUCCESS,
        createdCountry
      )
    );
};

module.exports.UpdateSubject = async (req, res, next) => {
  // Extract the `subjectCode` and `name` properties from the request body.
  const { subjectCode, name } = req.body;

  // Use the `subjectCode` to search for an existing subject document in the `subjects` collection.
  const existingSubject = await Subject.findOne({
    subjectCode,
  });

  // If no document is found, return an error response indicating the subject was not found.
  if (!existingSubject) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_NOT_FOUND
      )
    );
  }

  // Search for any other subjects with the same `name` (excluding the current `subjectCode`).
  const otherSubjects = await Subject.find({
    subjectCode: { $ne: subjectCode },
    $or: [{ name: toCapitalize(name) }],
  });

  // If any other subjects with the same `name` are found, return an error response.
  if (otherSubjects?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_TAKEN
      )
    );
  }

  // Retrieve the current subject document before the update (excluding `__v` and `_id`).
  const subjectBeforeUpdate = await Subject.findOne(
    { subjectCode },
    hiddenFieldsDefault
  );

  // Update the subject document with the new data (`name`) and the current timestamp.
  const subject = await Subject.findOneAndUpdate(
    { subjectCode },
    {
      name: toCapitalize(name),
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated subject document to the database.
  await subject.save();

  // Retrieve the updated subject document (excluding `__v` and `_id`).
  const updatedSubject = await Subject.findOne(
    { subjectCode },
    hiddenFieldsDefault
  );

  // Use the logged-in user's `userCode` to query and retrieve their details.
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

  // Create an audit log for the update action.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.SUBJECTS,
    updatedSubject?.subjectCode,
    auditChanges?.UPDATE_SUBJECT,
    subjectBeforeUpdate?.toObject(),
    updatedSubject?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated country details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_SUBJECT_SUCCESS,
        updatedSubject
      )
    );
};

module.exports.DeleteSubject = async (req, res, next) => {
  // Extract the `subjectCode` property from the request body.
  const { subjectCode } = req.body;

  // Query the database to find a subject document matching the `subjectCode`.
  const existingSubject = await Subject.findOne({
    subjectCode,
  });

  // If no subject document is found, return an error response.
  if (!existingSubject) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_NOT_FOUND
      )
    );
  }

  // Check if the subject is being referenced in any other part of the database.
  const { isReferenced } = await IsObjectIdReferenced(existingSubject._id);

  // If the subject is referenced, return an error response indicating it cannot be deleted.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the subject document before deletion (excluding `__v` and `_id`).
  const subjectBeforeDelete = await Subject.findOne(
    { subjectCode },
    hiddenFieldsDefault
  );

  // Attempt to delete the subject document with the given `subjectCode`.
  const subject = await Subject.deleteOne({
    subjectCode,
  });

  // If the document is not deleted (i.e., `deletedCount` is 0), return an error response.
  if (subject?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SUBJECT_ERROR
      )
    );
  }

  // Query the database for the current user's details using `userCode`.
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

  // Create an audit log for the deletion action.
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.SUBJECTS,
    subjectBeforeDelete?.subjectCode,
    auditChanges?.DELETE_SUBJECT,
    subjectBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response indicating the subject was successfully deleted.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_SUBJECT_SUCCESS
      )
    );
};
