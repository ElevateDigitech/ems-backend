const moment = require("moment-timezone");
const Country = require("../models/country");
const State = require("../models/state");
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
  IsObjectIdReferenced,
  generateStateCode,
  generateAuditCode,
} = require("../utils/helpers");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
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

module.exports.GetStates = async (req, res, next) => {
  // Query the `states` collection for all documents, excluding `__v` and `_id` fields,
  // and populate the linked documents from the `countries` collection, excluding the `__v` and `_id` fields.
  const states = await State.find({}, hiddenFieldsDefault).populate(
    "country",
    hiddenFieldsDefault
  );

  // Return a success response with the retrieved states data.
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
  // Extract `stateCode` from the request body and use it to find a document in the `states` collection,
  // excluding the `__v` and `_id` fields, and populating the linked `country` document, also excluding `__v` and `_id`.
  const { stateCode } = req.body;
  const state = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  // Check if no matching state document was found in the database. If so, return an error response.
  if (!state) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Return a success response with the retrieved state data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_STATE_SUCCESS,
        state
      )
    );
};

module.exports.GetStatesByCountryCode = async (req, res, next) => {
  // Extract `countryCode` from the request body.
  const { countryCode } = req.body;

  // Use `countryCode` to query the `countries` collection and retrieve the country document.
  const country = await Country.findOne({
    countryCode,
  });

  // Check if no matching country document is found. If not, return an error response.
  if (!country) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Use `country._id` to find all documents in the `states` collection, populating the linked `country` document.
  const states = await State.find(
    { country: country?._id },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  // Check if no matching state documents are found or if the `states` array is empty. If so, return an error response.
  if (!states || !Array.isArray(states) || states.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATES_NOT_FOUND
      )
    );
  }

  // Return a success response with the retrieved states data.
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
  // Extract `name`, `iso`, and `countryCode` from the request body.
  const { name, iso, countryCode } = req.body;

  // Capitalize the `name` and make `iso` uppercase, then check if a state with the same `name` or `iso` exists in the database.
  const existingState = await State.findOne({
    $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
  });

  // If a state with the same `name` or `iso` exists, return a conflict error.
  if (existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_EXIST
      )
    );
  }

  // Query the database to find the country by `countryCode`.
  const existingCountry = await Country.findOne({
    countryCode,
  });

  // If no country is found, return a conflict error.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Generate a unique `stateCode` for the new state.
  const stateCode = generateStateCode();

  // Create a new state instance with the provided data.
  const state = new State({
    name: toCapitalize(name),
    stateCode,
    iso: iso.toUpperCase(),
    country: existingCountry?._id,
  });

  // Save the new state to the database.
  await state.save();

  // Retrieve the newly created state using the generated `stateCode` and populate the linked country document.
  const createdState = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  // Retrieve the current user's data using their `userCode`.
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

  // Log the action to the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.STATES,
    createdState?.stateCode,
    auditChanges?.CREATE_STATE,
    null,
    createdState?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the created state data.
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
  // Extract `stateCode`, `name`, `iso`, and `countryCode` from the request body.
  const { stateCode, name, iso, countryCode } = req.body;

  // Query the database to find a state document by `stateCode`.
  const existingState = await State.findOne({
    stateCode,
  });

  // If no state is found with the provided `stateCode`, return a conflict error.
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Query the database to find a country by `countryCode`.
  const existingCountry = await Country.findOne({
    countryCode,
  });

  // If no country is found with the provided `countryCode`, return a conflict error.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Query the `states` collection for documents where `stateCode` is different
  // and either `name` or `iso` matches the provided values.
  const otherStates = await State.find({
    stateCode: { $ne: stateCode },
    $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
  });

  // If any such state exists, return a conflict error.
  if (otherStates?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_TAKEN
      )
    );
  }

  // Query the database to retrieve the state document before updating.
  const stateBeforeUpdate = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  );

  // Update the `State` document with the new data.
  const state = await State.findOneAndUpdate(
    { stateCode },
    {
      name: toCapitalize(name),
      iso: iso.toUpperCase(),
      country: existingCountry?._id,
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated `State` object to the database.
  await state.save();

  // Retrieve the updated state document, including populated country data.
  const updatedState = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  ).populate("country", hiddenFieldsDefault);

  // Query the database to find the current logged-in user's `_id` using their `userCode`.
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

  // Log the update action in the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.STATES,
    updatedState?.stateCode,
    auditChanges?.UPDATE_STATE,
    stateBeforeUpdate?.toObject(),
    updatedState?.toObject(),
    currentUser?.toObject()
  );

  // Return a success response with the updated state data.
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
  // Extract `stateCode` from the request body.
  const { stateCode } = req.body;

  // Use the `stateCode` to query the database for a state document.
  const existingState = await State.findOne({
    stateCode,
  });

  // If no state is found, return a conflict error response.
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Check if the state is being referenced anywhere in the database.
  const { isReferenced } = await IsObjectIdReferenced(existingState._id);

  // If the state is in use, return an error response indicating it cannot be deleted.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the state document before deletion (excluding `__v` and `_id`).
  const stateBeforeDelete = await State.findOne(
    { stateCode },
    hiddenFieldsDefault
  );

  // Delete the state document from the database.
  const state = await State.deleteOne({
    stateCode,
  });

  // If the document wasn't deleted, return an error response.
  if (state?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STATE_ERROR
      )
    );
  }

  // Query the database to find the current logged-in user's `_id` using their `userCode`.
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

  // Create an audit log for the delete action.
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.STATES,
    stateBeforeDelete?.stateCode,
    auditChanges?.DELETE_STATE,
    stateBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  // Return a success response indicating the state was deleted.
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
