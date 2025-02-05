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
  // Extract the `countryCode` from the request body and query the `countries` collection for the matching document (excluding `__v` and `_id` fields).
  const { countryCode } = req.body;
  const country = await Subject.findOne(
    {
      countryCode,
    },
    hiddenFieldsDefault
  );

  // Check if no document is found with the provided `countryCode` in the request. If not, return an error response.
  if (!country) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Return a success response with the found country details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_COUNTRY_SUCCESS,
        country
      )
    );
};

module.exports.CreateSubject = async (req, res, next) => {
  // Extract the `name`, `iso2`, and `iso3` properties from the request body.
  const { name, iso2, iso3 } = req.body;

  // Capitalize the `name` and convert `iso2` and `iso3` to uppercase before querying the database for a matching country document.
  const existingCountry = await Subject.findOne({
    $or: [
      { name: toCapitalize(name) },
      { iso2: iso2.toUpperCase() },
      { iso3: iso3.toUpperCase() },
    ],
  });

  // Check if a country with the same `name`, `iso2`, or `iso3` already exists. If found, return a conflict error.
  if (existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_EXIST
      )
    );
  }

  // Generate a unique `countryCode` for the new country.
  const countryCode = generateCountryCode();

  // Create a new `Country` model instance with the provided data.
  const country = new Subject({
    countryCode,
    name: toCapitalize(name),
    iso2: iso2.toUpperCase(),
    iso3: iso3.toUpperCase(),
  });

  // Save the newly created country to the database.
  await country.save();

  // Retrieve the newly created country document using the generated `countryCode` (excluding `__v` and `_id` fields).
  const createdCountry = await Subject.findOne(
    { countryCode },
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
    auditCollections?.COUNTRIES,
    createdCountry?.countryCode,
    auditChanges?.CREATE_COUNTRY,
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
        MESSAGE_CREATE_COUNTRY_SUCCESS,
        createdCountry
      )
    );
};

module.exports.UpdateSubject = async (req, res, next) => {
  // Extract the `countryCode`, `name`, `iso2`, and `iso3` properties from the request body.
  const { countryCode, name, iso2, iso3 } = req.body;

  // Use the `countryCode` to search for an existing country document in the `countries` collection.
  const existingCountry = await Subject.findOne({
    countryCode,
  });

  // If no document is found, return an error response indicating the country was not found.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Search for any other countries with the same `name`, `iso2`, or `iso3` (excluding the current `countryCode`).
  const otherCountries = await Subject.find({
    countryCode: { $ne: countryCode },
    $or: [
      { name: toCapitalize(name) },
      { iso2: iso2.toUpperCase() },
      { iso3: iso3.toUpperCase() },
    ],
  });

  // If any other countries with the same `name`, `iso2`, or `iso3` are found, return an error response.
  if (otherCountries?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_TAKEN
      )
    );
  }

  // Retrieve the current country document before the update (excluding `__v` and `_id`).
  const countryBeforeUpdate = await Subject.findOne(
    { countryCode },
    hiddenFieldsDefault
  );

  // Update the country document with the new data (`name`, `iso2`, `iso3`) and the current timestamp.
  const country = await Subject.findOneAndUpdate(
    { countryCode },
    {
      name: toCapitalize(name),
      iso2: iso2.toUpperCase(),
      iso3: iso3.toUpperCase(),
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated country document to the database.
  await country.save();

  // Retrieve the updated country document (excluding `__v` and `_id`).
  const updatedCountry = await Subject.findOne(
    { countryCode },
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
    auditCollections?.COUNTRIES,
    updatedCountry?.countryCode,
    auditChanges?.UPDATE_COUNTRY,
    countryBeforeUpdate?.toObject(),
    updatedCountry?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated country details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_COUNTRY_SUCCESS,
        updatedCountry
      )
    );
};

module.exports.DeleteSubject = async (req, res, next) => {
  // Extract the `countryCode` property from the request body.
  const { countryCode } = req.body;

  // Query the database to find a country document matching the `countryCode`.
  const existingCountry = await Subject.findOne({
    countryCode,
  });

  // If no country document is found, return an error response.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Check if the country is being referenced in any other part of the database.
  const { isReferenced } = await IsObjectIdReferenced(existingCountry._id);

  // If the country is referenced, return an error response indicating it cannot be deleted.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the country document before deletion (excluding `__v` and `_id`).
  const countryBeforeDelete = await Subject.findOne(
    { countryCode },
    hiddenFieldsDefault
  );

  // Attempt to delete the country document with the given `countryCode`.
  const country = await Subject.deleteOne({
    countryCode,
  });

  // If the document is not deleted (i.e., `deletedCount` is 0), return an error response.
  if (country?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_COUNTRY_ERROR
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
    auditCollections?.COUNTRIES,
    countryBeforeDelete?.countryCode,
    auditChanges?.DELETE_COUNTRY,
    countryBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response indicating the country was successfully deleted.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_COUNTRY_SUCCESS
      )
    );
};
