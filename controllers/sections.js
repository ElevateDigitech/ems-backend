const moment = require("moment-timezone");
const Class = require("../models/class");
const Section = require("../models/section");
const ExpressResponse = require("../utils/ExpressResponse");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  hiddenFieldsDefault,
  toCapitalize,
  IsObjectIdReferenced,
  generateSectionCode,
  hiddenFieldsUser,
  generateAuditCode,
} = require("../utils/helpers");
const {
  MESSAGE_GET_STATE_SUCCESS,
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
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");

module.exports.GetSections = async (req, res, next) => {
  // Query the `sections` collection to retrieve all documents, excluding `__v` and `_id` fields,
  // and populate the linked documents from the `classes` collection, excluding their `__v` and `_id` fields.
  const sections = await Section.find({}, hiddenFieldsDefault).populate(
    "class",
    hiddenFieldsDefault
  );

  // Return a success response with the retrieved sections data.
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
  // Extract the `sectionCode` from the request body and use it to query the `sections` collection for the document.
  // Exclude `__v` and `_id` fields, and populate the linked documents from the `classes` collection, excluding their `__v` and `_id` fields.
  const { sectionCode } = req.body;
  const section = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  // Check if no matching section is found in the database. If so, return an error response.
  if (!section) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
      )
    );
  }

  // Return a success response with the retrieved section data.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_SECTION_SUCCESS,
        section
      )
    );
};

module.exports.GetSectionsByClassCode = async (req, res, next) => {
  // Extract the `classCode` from the request body.
  const { classCode } = req.body;

  // Use the `classCode` to search for a matching document in the `classes` collection.
  const foundClass = await Class.findOne({ classCode });

  // Check if no class was found with the provided `classCode`. If not, return an error response.
  if (!foundClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  // Use the `foundClass._id` to query the `sections` collection for all sections linked to the class.
  const sections = await Section.find(
    { class: foundClass?._id },
    hiddenFieldsDefault
  ).populate("Class", hiddenFieldsDefault);

  // Check if no sections were found for the specified class. If none are found, return an error response.
  if (!sections || !Array.isArray(sections) || sections?.length === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTIONS_NOT_FOUND
      )
    );
  }

  // Return a success response with the found sections data.
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
  /* Extract the `name` and `classCode` properties from the request body. */
  const { name, classCode } = req.body;

  /* Capitalize the `name` and query the database to check for 
   an existing section with the same name in the `sections` collection. */
  const existingSection = await Section.findOne({
    name: toCapitalize(name),
  });

  /* If a section with the same `name` exists, return an error response. */
  if (existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_EXIST
      )
    );
  }

  /* Use the provided `classCode` to query the database for an existing class. */
  const existingClass = await Class.findOne({
    classCode,
  });

  /* If no class is found with the given `classCode`, return an error response. */
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  /* Generate a unique `sectionCode` for the new section. */
  const sectionCode = generateSectionCode();

  /* Create a new `Section` instance with the provided data. */
  const section = new Section({
    sectionCode,
    name: toCapitalize(name),
    class: existingClass?._id,
  });

  /* Save the newly created section to the database. */
  await section.save();

  /* Retrieve the newly created section from the database, excluding 
   `__v` and `_id`, and populate the linked `class` document. */
  const createdSection = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  // Fetch the current logged-in user's data using their `userCode`.
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

  // Log the action in the audit log.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.SECTIONS,
    createdSection?.sectionCode,
    auditChanges?.CREATE_SECTION,
    null,
    createdSection?.toObject(),
    currentUser?.toObject()
  );

  /* Return a success response with the newly created section. */
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
  /* Extract `sectionCode`, `name`, and `classCode` from the request body. */
  const { sectionCode, name, classCode } = req.body;

  /* Query the database to find a section document by the provided `sectionCode`. */
  const existingSection = await Section.findOne({
    sectionCode,
  });

  /* If no section is found with the given `sectionCode`, return an error response. */
  if (!existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_FOUND
      )
    );
  }

  /* Query the database to find a class document using the provided `classCode`. */
  const existingClass = await Class.findOne({
    classCode,
  });

  /* If no class is found with the given `classCode`, return an error response. */
  if (!existingClass) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_FOUND
      )
    );
  }

  /* Query the database to check if any section with the given `name` 
   (other than the one with the provided `sectionCode`) exists. */
  const otherSections = await Section.find({
    sectionCode: { $ne: sectionCode },
    name: toCapitalize(name),
  });

  /* If another section with the same `name` is found, return an error response. */
  if (otherSections?.length > 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_TAKEN
      )
    );
  }

  /* Retrieve the section data before updating. */
  const sectionBeforeUpdate = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  );

  /* Update the section document with the new data. */
  const section = await Section.findOneAndUpdate(
    { sectionCode },
    {
      name: toCapitalize(name),
      class: existingClass?._id,
      updatedAt: moment().valueOf(),
    }
  );

  /* Save the updated section document to the database. */
  await section.save();

  /* Retrieve the updated section document (excluding `__v` and `_id`) 
   and populate the linked `class` document. */
  const updatedSection = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  ).populate("class", hiddenFieldsDefault);

  /* Find the current logged-in user's `_id` using their `userCode`. */
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

  /* Log the update action in the audit log. */
  await logAudit(
    generateAuditCode(),
    auditActions?.UPDATE,
    auditCollections?.SECTIONS,
    updatedSection?.sectionCode,
    auditChanges?.UPDATE_SECTION,
    sectionBeforeUpdate?.toObject(),
    updatedSection?.toObject(),
    currentUser?.toObject()
  );

  /* Return a success response with the updated section data. */
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
  /* Extract the `sectionCode` from the request body. */
  const { sectionCode } = req.body;

  /* Query the database to find a section document with the provided `sectionCode`. */
  const existingSection = await Section.findOne({
    sectionCode,
  });

  /* If no section is found with the given `sectionCode`, return an error response. */
  if (!existingSection) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_FOUND
      )
    );
  }

  /* Check if the section is being referenced anywhere in the database. */
  const { isReferenced } = await IsObjectIdReferenced(existingSection._id);

  /* If the section is referenced, return an error response indicating it cannot be deleted. */
  if (isReferenced) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      )
    );
  }

  /* Retrieve the section document before deletion, excluding `__v` and `_id` fields. */
  const sectionBeforeDelete = await Section.findOne(
    { sectionCode },
    hiddenFieldsDefault
  );

  /* Attempt to delete the section document by its `sectionCode`. */
  const section = await Section.deleteOne({
    sectionCode,
  });

  /* If the section was not deleted (i.e., `deletedCount` is 0), return an error response. */
  if (section?.deletedCount === 0) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SECTION_ERROR
      )
    );
  }

  /* Retrieve the current logged-in user's data by their `userCode`. */
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

  /* Create an audit log for the section deletion action. */
  await logAudit(
    generateAuditCode(),
    auditActions?.DELETE,
    auditCollections?.SECTIONS,
    sectionBeforeDelete?.sectionCode,
    auditChanges?.DELETE_SECTION,
    sectionBeforeDelete?.toObject(),
    null,
    currentUser?.toObject()
  );

  /* Return a success response indicating the section was deleted. */
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
