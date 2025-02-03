const moment = require("moment-timezone");
const City = require("../models/city");
const State = require("../models/state");
const Country = require("../models/country");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  toCapitalize,
  IsObjectIdReferenced,
  generateCityCode,
  hiddenFieldsDefault,
  hiddenFieldsUser,
  generateAuditCode,
} = require("../utils/helpers");
const {
  MESSAGE_CITY_EXIST,
  MESSAGE_CREATE_CITY_SUCCESS,
  MESSAGE_GET_CITIES_SUCCESS,
  MESSAGE_GET_CITY_SUCCESS,
  MESSAGE_CITY_NOT_FOUND,
  MESSAGE_UPDATE_CITY_SUCCESS,
  MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_CITY_SUCCESS,
  MESSAGE_DELETE_CITY_ERROR,
  MESSAGE_CITIES_NOT_FOUND,
  MESSAGE_STATE_NOT_FOUND,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_CITY_TAKEN,
} = require("../utils/messages");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");

module.exports.GetCities = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `cities` collection (excluding the 
  fields `__v` and `_id`) with populating the linked documents 
  from the `states` and `countries` collections (excluding the 
  fields `__v` and `_id`). */
  const states = await City.find({}, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CITIES_SUCCESS,
        states
      )
    );
};

module.exports.GetCityByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `cityCode` property 
  from the request body. It then uses this `cityCode` to query 
  the database for a single document in the `cities` collection 
  (excluding the fields `__v` and `_id`) with populating the 
  linked documents from the `states` and `countries` collections 
  (excluding the fields `__v` and `_id`). */
  const { cityCode } = req.body;
  const city = await City.findOne({ cityCode }, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  /* The below code snippet is checking if the `city` variable
  is falsy, which means that no document was found in the database
  that matches the specified `cityCode` provided in the request
  parameters. If no document is found (`city` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!city) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CITY_SUCCESS,
        city
      )
    );
};

module.exports.GetCitiesByStateCode = async (req, res, next) => {
  /* The below code snippet is extracting the `stateCode` 
  property from the request body. */
  const { stateCode } = req.body;

  /* The below code snippet uses the `stateCode` to query the 
  database to find a document in the `states` collection
  (excluding the fields `__v` and `_id`). */
  const state = await State.findOne({ stateCode });

  /* The below code snippet is checking if the `state` variable
  is falsy, which means that no document was found in the database
  that matches the specified `stateCode` provided in the request
  parameters. If no document is found (`state` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!state) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  /* The below code snippet uses the `state._id` to query the 
  database to find all the documents in the `cities` collection
  (excluding the fields `__v` and `_id`) with populating the 
  linked documents from the `states` and `countries` collections
  (excluding the fields `__v` and `_id`). */
  const cities = await City.find({ state: state?._id }, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  /* The below code snippet is checking if the `cities` variable
  is falsy, which means that no document was found in the database
  that matches the found `state` document. If no document is found
  (`cities` is falsy), it returns an error response using the 
  `next` function with an `ExpressResponse` object. */
  if (!cities || !Array.isArray(cities) || cities?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITIES_NOT_FOUND
      )
    );
  }

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CITY_SUCCESS,
        cities
      )
    );
};

module.exports.GetCitiesByCountryCode = async (req, res, next) => {
  /* The below code snippet is extracting the `countryCode` 
  property from the request body. */
  const { countryCode } = req.body;

  /* The below code snippet uses the `countryCode` to query the 
  database to find a document in the `countries` collection
  (excluding the fields `__v` and `_id`). */
  const country = await Country.findOne({ countryCode });

  /* The below code snippet is checking if the `country` variable
  is falsy, which means that no document was found in the database
  that matches the specified `countryCode` provided in the request
  parameters. If no document is found (`country` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!country) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  /* The below code snippet uses the `country._id` to query the 
  database to find all the documents in the `cities` collection
  (excluding the fields `__v` and `_id`) with populating the 
  linked documents from the `states` and `countries` collections
  (excluding the fields `__v` and `_id`). */
  const cities = await City.find({ country: country?._id }, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  /* The below code snippet is checking if the `cities` variable
  is falsy, which means that no document was found in the database
  that matches the found `state` document. If no document is found
  (`cities` is falsy), it returns an error response using the 
  `next` function with an `ExpressResponse` object. */
  if (!cities || !Array.isArray(cities) || cities?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITIES_NOT_FOUND
      )
    );
  }

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CITY_SUCCESS,
        cities
      )
    );
};

module.exports.CreateCity = async (req, res, next) => {
  /* The below code snippet is extracting the `name` property
  from the request body. */
  const { name, stateCode, countryCode } = req.body;

  /* The below code snippet query the database for a single 
  document in the `cities` collection. */
  const existingCity = await City.findOne({ name: toCapitalize(name) });

  /* The below code snippet is checking if there is an existing
  city with the same `name` in the database. If `existingCity` 
  is truthy (meaning a city with the same `name` already exists),
  it returns an error response using the `next` function with an 
  `ExpressResponse` object. */
  if (existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_EXIST
      )
    );
  }

  /* The below code snippet is using the `stateCode` to query the
  database for a single document in the `states` collection. */
  const existingState = await State.findOne({
    stateCode,
  });

  /* The below code snippet is checking if no document is found 
  with the given `stateCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is using the `countryCode` to query 
  the database for a single document in the `countries` 
  collection. */
  const existingCountry = await Country.findOne({
    countryCode,
  });

  /* The below code snippet is checking if no document is found 
  with the given `countryCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is generating a unique `cityCode` for 
  a new city being created. */
  const cityCode = generateCityCode();

  /* The below code snippet is creating a new instance of the `City` 
  model with the provided data. */
  const city = new City({
    name: toCapitalize(name),
    cityCode,
    state: existingState?._id,
    country: existingCountry?._id,
  });

  /* The below code snippet is saving the newly created `City` 
  object to the database. */
  await city.save();

  /* The below code snippet is querying the database to find the 
  newly created city document using the above generated `cityCode`
  (excluding the fields `__v` and `_id`) with populating the linked 
  documents from the `state` and `countries` collections (excluding 
  the fields `__v` and `_id`). */
  const createdCity = await City.findOne(
    {
      cityCode,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

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
    auditCollections?.CITIES,
    createdCity?.cityCode,
    auditChanges?.CREATE_CITY,
    null,
    createdCity?.toObject(),
    currentUser?.toObject()
  );

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_CITY_SUCCESS,
        createdCity
      )
    );
};

module.exports.UpdateCity = async (req, res, next) => {
  /* The below code snippet is extracting the `cityCode`, `name`, 
  `stateCode`, and `countryCode` properties from the request 
  body. */
  const { cityCode, name, stateCode, countryCode } = req.body;

  /* The below code snippet is using the `cityCode` to query the 
  database for a single document in the `cities` collection. */
  const existingCity = await City.findOne({
    cityCode,
  });

  /* The below code snippet is checking if no document is found 
  with the given `cityCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is using the `stateCode` to query the
  database for a single document in the `states` collection. */
  const existingState = await State.findOne({
    stateCode,
  });

  /* The below code snippet is checking if no document is found 
  with the given `stateCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is using the `countryCode` to query 
  the database for a single document in the `countries` 
  collection. */
  const existingCountry = await Country.findOne({
    countryCode,
  });

  /* The below code snippet is checking if no document is found 
  with the given `countryCode`. If so, it returns an error response 
  using the `next` function with an `ExpressResponse` object. */
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
  find document without the `cityCode` from the request
  body and with `name` from the request body. */
  const otherCities = await City.find({
    cityCode: { $ne: cityCode },
    name: toCapitalize(name),
  });

  /* The below code snippet is checking if there is a
  document in the `states` collection with the given 
  `name` other than the document with the given 
  `cityCode`. If so, then it returns an error response
  using the `next` function with an `ExpressResponse` 
  object. */
  if (otherCities?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_TAKEN
      )
    );
  }

  /* The below code snippet is querying the database to find
  and retrieve the city document (excluding the fields 
  `__v` and `_id`). */
  const cityBeforeUpdate = await City.findOne(
    { cityCode },
    hiddenFieldsDefault
  );

  /* The below code snippet is updating the instance of the `City` 
  model with the provided data. */
  const city = await City.findOneAndUpdate(
    { cityCode },
    {
      name: toCapitalize(name),
      state: existingState?._id,
      country: existingCountry?._id,
      updatedAt: moment().valueOf(),
    }
  );

  /* The below code snippet is saving the updated `city` object to 
  the database. */
  await city.save();

  /* The below code snippet is querying the database to find and 
  retrieve an updated city document (excluding the fields `__v` 
  and `_id`) with populating the linked documents from the `states`
  and `countries` collections (excluding the fields `__v` and 
  `_id`). */
  const updatedCity = await City.findOne({ cityCode }, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

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
    auditCollections?.CITIES,
    updatedCity?.cityCode,
    auditChanges?.UPDATE_CITY,
    cityBeforeUpdate?.toObject(),
    updatedCity?.toObject(),
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
        MESSAGE_UPDATE_CITY_SUCCESS,
        updatedCity
      )
    );
};

module.exports.DeleteCity = async (req, res, next) => {
  /* The below code snippet is extracting the `cityCode`
  property from the request body. */
  const { cityCode } = req.body;

  /* The below code snippet is using the `cityCode` to 
  query the database for a single document in the `states` 
  collection. */
  const existingCity = await City.findOne({
    cityCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `cityCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the city is being 
  used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingCity._id);

  /* The below code snippet returns an error response using 
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The below code snippet is querying the database to find
  and retrieve the city document (excluding the fields 
  `__v` and `_id`). */
  const cityBeforeDelete = await City.findOne(
    { cityCode },
    hiddenFieldsDefault
  );

  /* The the below code snippet is querying the database to
  delete the document with the given `cityCode` in the `states`
  collection (excluding the fields `__v` and `_id`). */
  const state = await City.deleteOne({ cityCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (state?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CITY_ERROR
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
    auditCollections?.CITIES,
    cityBeforeDelete?.cityCode,
    auditChanges?.DELETE_CITY,
    cityBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  /* The below code snippet returns an success response with an 
  `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_DELETE_CITY_SUCCESS
      )
    );
};
