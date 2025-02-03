const moment = require("moment-timezone");
const Country = require("../models/country");
const State = require("../models/state");
const Class = require("../models/class");
const Section = require("../models/section");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  toCapitalize,
  IsObjectIdReferenced,
  generateStateCode,
  hiddenFieldsDefault,
  generateSectionCode,
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
  MESSAGE_GET_SECTIONS_SUCCESS,
  MESSAGE_SECTION_NOT_FOUND,
  MESSAGE_GET_SECTION_SUCCESS,
  MESSAGE_CLASS_NOT_FOUND,
  MESSAGE_SECTIONS_NOT_FOUND,
  MESSAGE_SECTION_EXIST,
  MESSAGE_CREATE_SECTION_SUCCESS,
  MESSAGE_SECTION_TAKEN,
  MESSAGE_UPDATE_SECTION_SUCCESS,
  MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_SECTION_ERROR,
  MESSAGE_DELETE_SECTION_SUCCESS,
} = require("../utils/messages");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");

module.exports.GetSections = async (req, res, next) => {
  /* The below code snippet is used to query the database for 
  all the documents in the `sections` collection (excluding
  the fields `__v` and `_id`) with populating the linked 
  documents from the `classes` collection (excluding the 
  fields `__v` and `_id`). */
  const sections = await Section.find({}, hiddenFieldsDefault).populate(
    "class",
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
        MESSAGE_GET_SECTIONS_SUCCESS,
        sections
      )
    );
};

module.exports.GetSectionByCode = async (req, res, next) => {
  /* The below code snippet is extracting the `sectionCode` property 
  from the request body. It then uses this `sectionCode`
  to query the database for a single document in the `sections`
  collection (excluding the fields `__v` and `_id`) with 
  populating the linked documents from the `classes` 
  collection (excluding the fields `__v` and `_id`). */
  const { sectionCode } = req.body;
  const sections = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  /* The below code snippet is checking if the `sections` variable
  is falsy, which means that no document was found in the database
  that matches the specified `sectionCode` provided in the request
  parameters. If no document is found (`sections` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!sections) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
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
        MESSAGE_GET_SECTION_SUCCESS,
        sections
      )
    );
};

module.exports.GetSectionsByClassCode = async (req, res, next) => {
  /* The below code snippet is extracting the `classCode` 
  property from the request body. */
  const { classCode } = req.body;

  /* The below code snippet uses the `classCode` to query the 
  database to find a document in the `classes` collection
  (excluding the fields `__v` and `_id`). */
  const foundClass = await Class.findOne({ classCode });

  /* The below code snippet is checking if the `foundClass` variable
  is falsy, which means that no document was found in the database
  that matches the specified `classCode` provided in the request
  parameters. If no document is found (`foundClass` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!foundClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  /* The below code snippet uses the `foundClass._id` to query the 
  database to find all the documents in the `sections` collection
  (excluding the fields `__v` and `_id`) with populating the 
  linked documents from the `classes` collection (excluding the 
  fields `__v` and `_id`). */
  const sections = await Section.find(
    { class: foundClass?._id },
    hiddenFieldsDefault
  ).populate("Class", hiddenFieldsDefault);

  /* The below code snippet is checking if the `sections` variable
  is falsy, which means that no document was found in the database
  that matches the specified `classCode` provided in the request
  parameters. If no document is found (`sections` is falsy), it
  returns an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!sections || !Array.isArray(sections) || sections?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTIONS_NOT_FOUND
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
        sections
      )
    );
};

module.exports.CreateSection = async (req, res, next) => {
  /* The below code snippet is extracting the `name`, and 
  `classCode` properties from the request body. */
  const { name, classCode } = req.body;

  /* The below code snippet capitalize the `name` and then 
  the uses it to query the database for a single document 
  in the `sections` collection. */
  const existingSection = await Section.findOne({
    name: toCapitalize(name),
  });

  /* The below code snippet is checking if there is an existing
  section with the same `name` in the database. If 
  `existingSection` is truthy (meaning a section with the same 
  `name` already exists), it returns an error response using 
  the `next` function with an `ExpressResponse` object. */
  if (existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_EXIST
      )
    );
  }

  /* The below code snippet is using the `classCode` to query 
  the database for a single document in the `classes` 
  collection. */
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

  /* The below code snippet is generating a unique `sectionCode`
  for a new section being created. */
  const sectionCode = generateSectionCode();

  /* The below code snippet is creating a new instance of the
  `Section` model with the provided data. */
  const section = new Section({
    sectionCode,
    name: toCapitalize(name),
    class: existingClass?._id,
  });

  /* The below code snippet is saving the newly created
  `Section` object to the database. */
  await section.save();

  /* The below code snippet is querying the database to find
  the newly created section document using the above generated 
  `sectionCode` (excluding the fields `__v` and `_id`) with 
  populating the linked documents from the `classes` 
  collection (excluding the fields `__v` and `_id`). */
  const createdSection = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  /* The below code snippet returns an success response with
  an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_SECTION_SUCCESS,
        createdSection
      )
    );
};

module.exports.UpdateSection = async (req, res, next) => {
  /* The below code snippet is extracting the `sectionCode`,
  `name`, and `classCode` properties from the request 
  body. */
  const { sectionCode, name, classCode } = req.body;

  /* The below code snippet is using the `sectionCode`
  to query the database for a single document in the
  `section` collection. */
  const existingSection = await Section.findOne({
    sectionCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `sectionCode`. If so, it returns
  an error response using the `next` function with an
  `ExpressResponse` object. */
  if (!existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_FOUND
      )
    );
  }

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
  find document without the `sectionCode` from the request
  body and with either `name` from the request body.  */
  const otherSections = await Section.find({
    sectionCode: { $ne: sectionCode },
    name: toCapitalize(name),
  });

  /* The below code snippet is checking if there is a
  document in the `sections` collection with the given 
  `name` other than the document with the given 
  `sectionCode`. If so, then it returns an error response 
  using the `next` function with an `ExpressResponse` 
  object. */
  if (otherSections?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_TAKEN
      )
    );
  }

  /* The below code snippet is updating the instance of the
  `Section` model with the provided data. */
  const section = await Section.findOneAndUpdate(
    { sectionCode },
    {
      name: toCapitalize(name),
      class: existingClass?._id,
      updatedAt: moment().valueOf(),
    }
  );

  /* The below code snippet is saving the updated `section`
  object to the database. */
  await section.save();

  /* The below code snippet is querying the database to find
  and retrieve an updated section document (excluding the
  fields `__v` and `_id`) with populating the linked documents
  from the `classes` collection (excluding the fields `__v`
  and `_id`). */
  const updatedSection = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_SECTION_SUCCESS,
        updatedSection
      )
    );
};

module.exports.DeleteSection = async (req, res, next) => {
  /* The below code snippet is extracting the `sectionCode`
  property from the request body. */
  const { sectionCode } = req.body;

  /* The below code snippet is using the `sectionCode`
  to query the database for a single document in the
  `sections` collection. */
  const existingSection = await Section.findOne({
    sectionCode,
  });

  /* The below code snippet is checking if no document is
  found with the given `sectionCode`. It returns an error
  response using the `next` function with an `ExpressResponse`
  object. */
  if (!existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_FOUND
      )
    );
  }

  /* The below code snippet is checking if the section is
  being used anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingSection._id);

  /* The below code snippet returns an error response using
  the `next` function with an `ExpressResponse` object, when
  the found document is in use. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* The the below code snippet is querying the database to
  delete the document with the given `sectionCode` in the
  `sections` collection (excluding the fields `__v` and
  `_id`). */
  const section = await Section.deleteOne({ sectionCode });

  /* The the below code snippet is using `deletedCount` in the
  `deleteOne` mongoose function response to confirm the document
  deletion. If it is `0` then the document is not deleted, then
  it return an error response using the `next` function with
  an `ExpressResponse` object. */
  if (section?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SECTION_ERROR
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
        MESSAGE_DELETE_SECTION_SUCCESS
      )
    );
};
