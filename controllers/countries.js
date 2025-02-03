const moment = require("moment-timezone");
const { logAudit } = require("../middleware");
const Country = require("../models/country");
const User = require("../models/user");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  toCapitalize,
  generateCountryCode,
  IsObjectIdReferenced,
  hiddenFieldsDefault,
  generateAuditCode,
  hiddenFieldsUser,
} = require("../utils/helpers");
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
} = require("../utils/messages");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
} = require("../utils/statusCodes");

module.exports.GetCountries = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `countries` collection (excluding
  the fields `__v` and `_id`). */
  const countries = await Country.find({}, hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_COUNTRIES_SUCCESS,
        countries
      )
    );
};

module.exports.GetCountryByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `countryCode` 
  property from the request body. It then uses this `countryCode`
  to query the database for a single document in the `countries`
  collection (excluding the fields `__v` and `_id`). */
  const { countryCode } = req.body;
  const countries = await Country.findOne({ countryCode }, hiddenFieldsDefault);

  /* The below code snippet is checking if the `countries` variable
  is falsy, which means that no document was found in the database
  that matches the specified `countryCode` provided in the request
  parameters. If no document is found (`countries` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!countries) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
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
        MESSAGE_GET_COUNTRY_SUCCESS,
        countries
      )
    );
};

module.exports.CreateCountry = async (req, res, next) => {
  /* The below code snippet is extracting the `name`, `iso2`,
  and `iso3` properties from the request body. */
  const { name, iso2, iso3 } = req.body;

  /* The below code snippet capitalize the `name`, make all
  letters capital for `iso2` and `iso3` and then the uses 
  it to query the database for a single document in the
  `countries` collection. */
  const existingCountry = await Country.findOne({
    $or: [
      { name: toCapitalize(name) },
      { iso2: iso2.toUpperCase() },
      { iso3: iso3.toUpperCase() },
    ],
  });

  /* The below code snippet is checking if there is an existing
  country with the same `name` or `iso2` or `iso3` in the 
  database. If `existingCountry` is truthy (meaning a country 
  with the same `name` or `iso2` or `iso3` already exists), it 
  returns an error response using the `next` function with an 
  `ExpressResponse` object. */
  if (existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_EXIST
      )
    );
  }

  /* The below code snippet is generating a unique `countryCode`
  for a new country being created. */
  const countryCode = generateCountryCode();

  /* The below code snippet is creating a new instance of the
  `Country` model with the provided data. */
  const country = new Country({
    name: toCapitalize(name),
    countryCode,
    iso2: iso2.toUpperCase(),
    iso3: iso3.toUpperCase(),
  });

  /* The below code snippet is saving the newly created
  `country` object to the database. */
  await country.save();

  /* The below code snippet is querying the database to find
  the newly created country document using the above
  generated `countryCode` (excluding the fields `__v` and
  `_id`). */
  const createdCountry = await Country.findOne(
    { countryCode },
    hiddenFieldsDefault
  );

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
    auditCollections?.COUNTRIES,
    createdCountry?.countryCode,
    auditChanges?.CREATE_COUNTRY,
    null,
    createdCountry?.toObject(),
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
        MESSAGE_CREATE_COUNTRY_SUCCESS,
        createdCountry
      )
    );
};

module.exports.UpdateCountry = async (req, res, next) => {
  /* The below code snippet is extracting the `countryCode`,
  `name`, `iso2`, and `iso3` properties from the request 
  body. */
  const { countryCode, name, iso2, iso3 } = req.body;

  /* The below code snippet is using the `countryCode`
  to query the database for a single document in the
  `countries` collection. */
  const existingCountry = await Country.findOne({
    countryCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `countryCode`. If so, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is querying the database to
  find document without the `countryCode` from the request
  body and with either `name` (or) `iso2` (or) `iso3` from 
  the request body.  */
  const otherCountries = await Country.find({
    countryCode: { $ne: countryCode },
    $or: [
      { name: toCapitalize(name) },
      { iso2: iso2.toUpperCase() },
      { iso3: iso3.toUpperCase() },
    ],
  });

  /* The below code snippet is checking if there is a
  document in the `countries` collection with the given 
  `name` (or) `iso2` (or) `iso3` other than the document 
  with the given `countryCode`. If so, then it returns 
  an error response using the `next` function with an 
  `ExpressResponse` object. */
  if (otherCountries?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_TAKEN
      )
    );
  }

  /* The below code snippet is querying the database to find
  and retrieve the gender document (excluding the fields 
  `__v` and `_id`). */
  const countryBeforeUpdate = await Country.findOne(
    { countryCode },
    hiddenFieldsDefault
  );

  /* The below code snippet is updating the instance of the
  `Country` model with the provided data. */
  const country = await Country.findOneAndUpdate(
    { countryCode },
    {
      name: toCapitalize(name),
      iso2: iso2.toUpperCase(),
      iso3: iso3.toUpperCase(),
      updatedAt: moment().valueOf(),
    }
  );

  /* The below code snippet is saving the updated `country`
  object to the database. */
  await country.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated country document (excluding the
  fields `__v` and `_id`). */
  const updatedCountry = await Country.findOne(
    { countryCode },
    hiddenFieldsDefault
  );

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
    auditCollections?.COUNTRIES,
    updatedCountry?.countryCode,
    auditChanges?.UPDATE_COUNTRY,
    countryBeforeUpdate?.toObject(),
    updatedCountry?.toObject(),
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
        MESSAGE_UPDATE_COUNTRY_SUCCESS,
        updatedCountry
      )
    );
};

module.exports.DeleteCountry = async (req, res, next) => {
  /* The below code snippet is extracting the `countryCode`
  property from the request body. */
  const { countryCode } = req.body;

  /* The below code snippet is using the `countryCode`
  to query the database for a single document in the
  `countries` collection. */
  const existingCountry = await Country.findOne({
    countryCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `countryCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the country is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingCountry._id);

  /* The below code snippet returns an error response using
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The the below code snippet is querying the database to
  delete the document with the given `countryCode` in the
  `countries` collection (excluding the fields `__v` and
  `_id`). */
  const country = await Country.deleteOne({ countryCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (country?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_COUNTRY_ERROR
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
        MESSAGE_DELETE_COUNTRY_SUCCESS
      )
    );
};
