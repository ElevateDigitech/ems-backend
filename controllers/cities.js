const moment = require("moment-timezone");
const City = require("../models/city");
const State = require("../models/state");
const Country = require("../models/country");
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
  generateCityCode,
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

module.exports.GetCities = async (req, res, next) => {
  // Query the `cities` collection to retrieve all documents, excluding specific fields, and populate related `states` and `countries` data
  const cities = await City.find({}, hiddenFieldsDefault)
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // Send a success response with the retrieved city data
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_CITIES_SUCCESS,
        cities
      )
    );
};

module.exports.GetCityByCode = async (req, res, next) => {
  // Extract `cityCode` from the request body and query the `cities` collection for a matching document,
  // excluding specific fields and populating related `state` and `country` data.
  const { cityCode } = req.body;
  const city = await City.findOne(
    {
      cityCode,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // If no matching city is found, return an error response.
  if (!city) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  // Send a success response with the retrieved city data.
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
  // Extract `stateCode` from the request body.
  const { stateCode } = req.body;

  // Query the database to find a state document matching the provided `stateCode`.
  const state = await State.findOne({
    stateCode,
  });

  // If no matching state is found, return an error response.
  if (!state) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Retrieve all cities associated with the found state's `_id`,
  // excluding specific fields and populating related `state` and `country` data.
  const cities = await City.find(
    {
      state: state?._id,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // If no cities are found, return an error response.
  if (!cities || !Array.isArray(cities) || cities.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITIES_NOT_FOUND
      )
    );
  }

  // Send a success response with the retrieved city data.
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
  // Extract `countryCode` from the request body.
  const { countryCode } = req.body;

  // Query the database to find the country document corresponding to the provided `countryCode`.
  const country = await Country.findOne({
    countryCode,
  });

  // If no matching country is found, return an error response.
  if (!country) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Retrieve all cities related to the found country using the `country._id`,
  // excluding specific fields and populating linked `state` and `country` data.
  const cities = await City.find(
    {
      country: country?._id,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // If no cities are found, return an error response.
  if (!cities || !Array.isArray(cities) || cities.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CITIES_NOT_FOUND
      )
    );
  }

  // Send a success response with the list of cities.
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
  // Extract `name`, `stateCode`, and `countryCode` from the request body.
  const { name, stateCode, countryCode } = req.body;

  // Check if a city with the same `name` already exists in the database.
  const existingCity = await City.findOne({
    name: toCapitalize(name),
  });

  // If a city with the same `name` is found, return a conflict error.
  if (existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_EXIST
      )
    );
  }

  // Query the database to find the state corresponding to the provided `stateCode`.
  const existingState = await State.findOne({
    stateCode,
  });

  // If no matching state is found, return an error response.
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Query the database to find the country corresponding to the provided `countryCode`.
  const existingCountry = await Country.findOne({
    countryCode,
  });

  // If no matching country is found, return an error response.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Generate a unique `cityCode` for the new city.
  const cityCode = generateCityCode();

  // Create a new `City` document with the provided data and related state and country.
  const city = new City({
    name: toCapitalize(name),
    cityCode,
    state: existingState?._id,
    country: existingCountry?._id,
  });

  // Save the newly created city to the database.
  await city.save();

  // Query the database to retrieve the newly created city using the generated `cityCode`,
  // populating related `state` and `country` documents while excluding specific fields.
  const createdCity = await City.findOne(
    {
      cityCode,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // Retrieve the current logged-in user's details using their `userCode`.
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

  // Create an audit log entry for this city creation.
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

  // Return a success response with the created city details.
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
  // Extract `cityCode`, `name`, `stateCode`, and `countryCode` from the request body.
  const { cityCode, name, stateCode, countryCode } = req.body;

  // Query the database to find a city document using the provided `cityCode`.
  const existingCity = await City.findOne({
    cityCode,
  });

  // If no city is found with the given `cityCode`, return a conflict error.
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  // Query the database to find a state document using the provided `stateCode`.
  const existingState = await State.findOne({
    stateCode,
  });

  // If no state is found with the given `stateCode`, return a conflict error.
  if (!existingState) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_FOUND
      )
    );
  }

  // Query the database to find a country document using the provided `countryCode`.
  const existingCountry = await Country.findOne({
    countryCode,
  });

  // If no country is found with the given `countryCode`, return a conflict error.
  if (!existingCountry) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_COUNTRY_NOT_FOUND
      )
    );
  }

  // Query the database to find other cities with the same `name` (excluding the current `cityCode`).
  const otherCities = await City.find({
    cityCode: { $ne: cityCode },
    name: toCapitalize(name),
  });

  // If another city with the same `name` exists (excluding the current city), return a conflict error.
  if (otherCities?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_TAKEN
      )
    );
  }

  // Retrieve the city document before updating it, excluding certain fields.
  const cityBeforeUpdate = await City.findOne(
    { cityCode },
    hiddenFieldsDefault
  );

  // Update the city document with the new data.
  const city = await City.findOneAndUpdate(
    { cityCode },
    {
      name: toCapitalize(name),
      state: existingState?._id,
      country: existingCountry?._id,
      updatedAt: moment().valueOf(),
    }
  );

  // Save the updated city document.
  await city.save();

  // Retrieve the updated city document, including the populated `state` and `country` documents.
  const updatedCity = await City.findOne(
    {
      cityCode,
    },
    hiddenFieldsDefault
  )
    .populate("state", hiddenFieldsDefault)
    .populate("country", hiddenFieldsDefault);

  // Retrieve the current logged-in user's details using their `userCode`.
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

  // Create an audit log for the city update.
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

  // Return a success response with the updated city details.
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
  // Extract the `cityCode` from the request body.
  const { cityCode } = req.body;

  // Query the database to find the city document matching the provided `cityCode`.
  const existingCity = await City.findOne({
    cityCode,
  });

  // If no city document is found, return a conflict error response.
  if (!existingCity) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_FOUND
      )
    );
  }

  // Check if the city is referenced elsewhere in the database.
  const { isReferenced } = await IsObjectIdReferenced(existingCity._id);

  // If the city is referenced, return an error response.
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  // Retrieve the city document before deletion (excluding `__v` and `_id` fields).
  const cityBeforeDelete = await City.findOne(
    { cityCode },
    hiddenFieldsDefault
  );

  // Delete the city document matching the provided `cityCode`.
  const deletionResult = await City.deleteOne({
    cityCode,
  });

  // If no document is deleted, return an internal server error response.
  if (deletionResult?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CITY_ERROR
      )
    );
  }

  // Query the database to retrieve the current logged-in user's details using their `userCode`.
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

  // Create an audit log for the city deletion action.
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

  // Return a success response indicating that the city was deleted successfully.
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
