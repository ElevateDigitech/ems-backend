const path = require("path");
const moment = require("moment");
const mongoose = require("mongoose");
const ExpressResponse = require("./ExpressResponse");
const fsPromises = require("fs").promises;
const { STATUS_SUCCESS, STATUS_ERROR } = require("./status");
const { referenceFields } = require("./referenceFields");
const { findPermission } = require("../queries/permissions");
const { findRole } = require("../queries/roles");
const { findQuestion } = require("../queries/questions");
const { findStrand } = require("../queries/strands");
const { findSubStrand } = require("../queries/subStrands");
const { findSection } = require("../queries/sections");

const handleError = (next, status, message) =>
  next(new ExpressResponse(STATUS_ERROR, status, message));
const handleSuccess = (status, message, data = null, total = null) =>
  new ExpressResponse(STATUS_SUCCESS, status, message, data, total);

const trimAndTestRegex = (value, regex) => {
  if (!value) return false;
  const trimmed = value?.trim();
  return trimmed && regex?.test(trimmed);
};

const validateDob = (value) => {
  const dob = moment(new Date(value).setHours(0, 0, 0, 0)).valueOf();
  const today = moment(new Date().setHours(0, 0, 0, 0)).valueOf();
  return dob <= today;
};

const getInvalidPermissions = async (permissions) => {
  return Promise.all(
    permissions.map(async (permCode) => {
      const permission = await findPermission({
        query: { permissionCode: permCode },
      });
      return !permission;
    })
  );
};

const getPermissionIds = async (permissions) => {
  return Promise.all(
    permissions.map(async (permCode) => {
      const permission = await findPermission({
        query: { permissionCode: permCode },
      });
      return permission?._id;
    })
  );
};

const isObjectIdReferenced = async (id) => {
  const objectId = new mongoose.Types.ObjectId(id);
  const existenceChecks = referenceFields?.map(async ({ model, field }) => {
    const Model = mongoose.model(model);
    const exists = await Model.exists({ [field]: objectId });
    return { exists, model };
  });

  const results = await Promise.all(existenceChecks || []);
  const referencedField = results.find((result) => result.exists);
  if (referencedField) {
    return {
      isReferenced: true,
      by: referencedField.model.toLowerCase(),
    };
  }
  return { isReferenced: false };
};

const getInvalidRole = async (roleCode) => {
  const role = await findRole({ query: { roleCode } });
  return !role;
};

const getRoleId = async (roleCode) => {
  const role = await findRole({ query: { roleCode } });
  return role?._id;
};

const toCapitalize = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const writeToFile = async (filePath, content) => {
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(content, null, 2));
    console.log(`File written successfully at ${filePath}`);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
};

const validateRequiredFields = (fields) => {
  return fields.every((field) => field && field.trim().length);
};

const getFileExtension = (filename) => path.extname(filename);

const getInvalidQuestions = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const question = await findQuestion({
        query: { questionCode: item?.questionCode },
      });
      return !question;
    })
  );
};

const getInvalidStrands = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const strand = await findStrand({
        query: { strandCode: item?.strandCode },
      });
      return !strand;
    })
  );
};

const getInvalidSubStrands = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const subStrand = await findSubStrand({
        query: { subStrandCode: item?.subStrandCode },
      });
      return !subStrand;
    })
  );
};

const getQuestionsWithIds = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const question = await findQuestion({
        query: { questionCode: item?.questionCode },
      });
      const strand = await findStrand({
        query: { strandCode: item?.strandCode },
      });
      const subStrand = await findSubStrand({
        query: { subStrandCode: item?.subStrandCode },
      });
      return {
        ...item,
        question: question?._id,
        strand: strand?._id,
        subStrand: subStrand?._id,
      };
    })
  );
};

const hasDuplicates = (arr) => new Set(arr).size !== arr.length;

const getInvalidSections = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const section = await findSection({
        query: { sectionCode: item },
      });
      return !section;
    })
  );
};

const getSectionDetails = async (sections) => {
  return Promise.all(
    sections.map(async (secCode) => {
      const section = await findSection({
        query: { sectionCode: secCode },
      });
      return section;
    })
  );
};

module.exports = {
  handleError,
  handleSuccess,
  trimAndTestRegex,
  validateDob,
  getInvalidPermissions,
  getPermissionIds,
  isObjectIdReferenced,
  getInvalidRole,
  getRoleId,
  toCapitalize,
  writeToFile,
  validateRequiredFields,
  getFileExtension,
  getInvalidQuestions,
  getInvalidStrands,
  getInvalidSubStrands,
  getQuestionsWithIds,
  hasDuplicates,
  getInvalidSections,
  getSectionDetails,
};
