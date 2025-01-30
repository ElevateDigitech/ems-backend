const Gender = require("../models/gender");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  IsObjectIdReferenced,
  generateGenderCode,
  hiddenFieldsDefault,
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
} = require("../utils/messages");

module.exports.GetGenders = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `genders` collection (excluding
  the fields `__v` and `_id`). */
  const genders = await Gender.find({}, hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
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
  /* The below code snippet is extracting the `genderCode`
  property from the request body. It then uses this `genderCode`
  to query the database for a single document in the `genders`
  collection (excluding the fields `__v` and `_id`). */
  const { genderCode } = req.body;
  const genders = await Gender.findOne({ genderCode }, hiddenFieldsDefault);

  /* The below code snippet is checking if the `genders` variable
  is falsy, which means that no document was found in the database
  that matches the specified `genderCode` provided in the request
  parameters. If no document is found (`genders` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!genders) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_GENDER_NOT_FOUND
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
        MESSAGE_GET_GENDER_SUCCESS,
        genders
      )
    );
};

module.exports.CreateGender = async (req, res, next) => {
  /* The below code snippet is extracting the `genderName`
  property from the request body. */
  const { genderName } = req.body;

  /* The below code snippet remove extra spaces and capitalize
  the `genderName` and the use it to query the database for
  a single document in the `genders` collection. */
  const existingGender = await Gender.findOne({
    genderName: genderName?.trim()?.toUpperCase(),
  });

  /* The below code snippet is checking if there is an existing
  gender with the same `genderName` in the database. If
  `existingGender` is truthy (meaning a gender with the same 
  name already exists), it returns an error response using the 
  `next` function with an `ExpressResponse` object. */
  if (existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_EXIST
      )
    );
  }

  /* The below code snippet is generating a unique `genderCode`
  for a new gender being created. */
  const genderCode = generateGenderCode();

  /* The below code snippet is creating a new instance of the
  `Gender` model with the provided data. */
  const gender = new Gender({
    genderCode,
    genderName: genderName?.trim()?.toUpperCase(),
  });

  /* The below code snippet is saving the newly created
  `gender` object to the database. */
  await gender.save();

  /* The below code snippet is querying the database to find
  the newly created gender document using the above
  generated `genderCode` (excluding the fields `__v` and
  `_id`). */
  const createdGender = await Gender.findOne(
    { genderCode },
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
        MESSAGE_CREATE_GENDERS_SUCCESS,
        createdGender
      )
    );
};

module.exports.UpdateGender = async (req, res, next) => {
  /* The below code snippet is extracting the `genderCode`,
  `genderName` properties from the request body. */
  const { genderCode, genderName } = req.body;

  /* The below code snippet is using the `genderCode`
  to query the database for a single document in the
  `genders` collection. */
  const existingGender = await Gender.findOne({
    genderCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `genderCode`. If so, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  /* The below code snippet is updating the instance of the
  `Gender` model with the provided data. */
  const gender = await Gender.findOneAndUpdate(
    { genderCode },
    {
      genderName: genderName?.trim()?.toUpperCase(),
    }
  );

  /* The below code snippet is saving the updated `gender`
  object to the database. */
  await gender.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated gender document (excluding the
  fields `__v` and `_id`). */
  const updatedGender = await Gender.findOne(
    { genderCode },
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
        MESSAGE_UPDATE_GENDERS_SUCCESS,
        updatedGender
      )
    );
};

module.exports.DeleteGender = async (req, res, next) => {
  /* The below code snippet is extracting the `genderCode`
  property from the request body. */
  const { genderCode } = req.body;

  /* The below code snippet is using the `genderCode`
  to query the database for a single document in the
  `genders` collection. */
  const existingGender = await Gender.findOne({
    genderCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `genderCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingGender) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the gender is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingGender._id);

  /* The below code snippet returns an error response using 
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The the below code snippet is querying the database to
  delete the document with the given `genderCode` in the
  genders collection (excluding the fields `__v` and 
  `_id`). */
  const gender = await Gender.deleteOne({ genderCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (gender?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_GENDERS_ERROR
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
        MESSAGE_DELETE_GENDERS_SUCCESS
      )
    );
};
