const moment = require("moment-timezone");
const Country = require("../models/country");
const State = require("../models/state");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  toCapitalize,
  IsObjectIdReferenced,
  generateStateCode,
  hiddenFieldsDefault,
} = require("../utils/helpers");
const {
  MESSAGE_STATE_EXIST,
  MESSAGE_CREATE_STATE_SUCCESS,
  MESSAGE_GET_STATES_SUCCESS,
  MESSAGE_GET_STATE_SUCCESS,
  MESSAGE_STATE_NOT_FOUND,
  MESSAGE_UPDATE_STATE_SUCCESS,
  MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_STATE_SUCCESS,
  MESSAGE_DELETE_STATE_ERROR,
  MESSAGE_STATES_NOT_FOUND,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_STATE_TAKEN,
} = require("../utils/messages");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");

module.exports.GetStates = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `states` collection (excluding
  the fields `__v` and `_id`) with populating the linked 
  documents from the `countries` collection (excluding the 
  fields `__v` and `_id`). */
  const states = await State.find({}, hiddenFieldsDefault).populate(
    "country",
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
        MESSAGE_GET_STATES_SUCCESS,
        states
      )
    );
};

module.exports.GetStateByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `stateCode` property 
  from the request body. It then uses this `stateCode`
  to query the database for a single document in the `states`
  collection (excluding the fields `__v` and `_id`) with 
  populating the linked documents from the `countries` 
  collection (excluding the fields `__v` and `_id`). */
  const { stateCode } = req.body;
  const states = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  /* The below code snippet is checking if the `states` variable
  is falsy, which means that no document was found in the database
  that matches the specified `stateCode` provided in the request
  parameters. If no document is found (`states` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!states) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
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
        MESSAGE_GET_STATE_SUCCESS,
        states
      )
    );
};

module.exports.GetStatesByCountryCode = async (req, res, next) => {
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
  database to find all the documents in the `states` collection
  (excluding the fields `__v` and `_id`) with populating the 
  linked documents from the `countries` collection (excluding the 
  fields `__v` and `_id`). */
  const states = await State.find(
    { country: country?._id },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  /* The below code snippet is checking if the `states` variable
  is falsy, which means that no document was found in the database
  that matches the specified `countryCode` provided in the request
  parameters. If no document is found (`states` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!states || !Array.isArray(states) || states?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATES_NOT_FOUND
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
        MESSAGE_GET_STATE_SUCCESS,
        states
      )
    );
};

module.exports.CreateState = async (req, res, next) => {
  /* The below code snippet is extracting the `name`, `iso`, 
  and `countryCode` properties from the request body. */
  const { name, iso, countryCode } = req.body;

  /* The below code snippet capitalize the `name`, make all
  letters capital for `iso` and then the uses it to query 
  the database for a single document in the `states` 
  collection. */
  const existingState = await State.findOne({
    $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
  });

  /* The below code snippet is checking if there is an existing
  state with the same `name` or `iso` in the database. If
  `existingState` is truthy (meaning a state with the same 
  `name` or `iso` already exists), it returns an error 
  response using the `next` function with an `ExpressResponse`
  object. */
  if (existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_EXIST
      )
    );
  }

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

  /* The below code snippet is generating a unique `stateCode`
  for a new state being created. */
  const stateCode = generateStateCode();

  /* The below code snippet is creating a new instance of the
  `State` model with the provided data. */
  const state = new State({
    name: toCapitalize(name),
    stateCode,
    iso: iso.toUpperCase(),
    country: existingCountry?._id,
  });

  /* The below code snippet is saving the newly created
  `State` object to the database. */
  await state.save();

  /* The below code snippet is querying the database to find
  the newly created state document using the above
  generated `stateCode` (excluding the fields `__v` and
  `_id`) with populating the linked documents from the 
  `countries` collection (excluding the fields `__v` and 
  `_id`). */
  const createdState = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_STATE_SUCCESS,
        createdState
      )
    );
};

module.exports.UpdateState = async (req, res, next) => {
  /* The below code snippet is extracting the `stateCode`,
  `name`, `iso`, and `countryCode` properties from the 
  request body. */
  const { stateCode, name, iso, countryCode } = req.body;

  /* The below code snippet is using the `stateCode`
  to query the database for a single document in the
  `states` collection. */
  const existingState = await State.findOne({
    stateCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `stateCode`. If so, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

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
  find document without the `stateCode` from the request
  body and with either `name` (or) `iso` from the 
  request body.  */
  const otherStates = await State.find({
    stateCode: { $ne: stateCode },
    $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
  });

  /* The below code snippet is checking if there is a
  document in the `states` collection with the given 
  `name` (or) `iso` other than the document with the 
  given `stateCode`. If so, then it returns an error 
  response using the `next` function with an 
  `ExpressResponse` object. */
  if (otherStates?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_TAKEN
      )
    );
  }

  /* The below code snippet is updating the instance of the
  `State` model with the provided data. */
  const state = await State.findOneAndUpdate(
    { stateCode },
    {
      name: toCapitalize(name),
      iso: iso.toUpperCase(),
      country: existingCountry?._id,
      updatedAt: moment().valueOf(),
    }
  );

  /* The below code snippet is saving the updated `state`
  object to the database. */
  await state.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated state document (excluding the
  fields `__v` and `_id`) with populating the linked documents
  from the `countries` collection (excluding the fields `__v`
  and `_id`). */
  const updatedState = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_STATE_SUCCESS,
        updatedState
      )
    );
};

module.exports.DeleteState = async (req, res, next) => {
  /* The below code snippet is extracting the `stateCode`
  property from the request body. */
  const { stateCode } = req.body;

  /* The below code snippet is using the `stateCode`
  to query the database for a single document in the
  `states` collection. */
  const existingState = await State.findOne({
    stateCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `stateCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the state is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingState._id);

  /* The below code snippet returns an error response using
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The the below code snippet is querying the database to
  delete the document with the given `stateCode` in the
  `states` collection (excluding the fields `__v` and
  `_id`). */
  const state = await State.deleteOne({ stateCode });

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
        MESSAGE_DELETE_STATE_ERROR
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
        MESSAGE_DELETE_STATE_SUCCESS
      )
    );
};
