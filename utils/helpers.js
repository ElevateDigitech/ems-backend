const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const Permission = require("../models/permission");
const mongoose = require("mongoose");
const Role = require("../models/role");
const ExpressResponse = require("./ExpressResponse");
const fsPromises = require("fs").promises;
const { STATUS_SUCCESS, STATUS_ERROR } = require("./status");
const { referenceFields } = require("./referenceFields");
const { findUser } = require("../queries/users");

const hiddenFieldsDefault = { __v: 0, _id: 0, id: 0 };
const hiddenFieldsUser = { __v: 0, _id: 0, salt: 0, hash: 0 };
const removeIdsForSubSchemas = { _id: 0, id: 0 };

const handleError = (next, status, message) =>
  next(new ExpressResponse(STATUS_ERROR, status, message));
const handleSuccess = (status, message, data = null) =>
  new ExpressResponse(STATUS_SUCCESS, status, message, data);

const trimAndTestRegex = (value, regex) =>
  value?.trim() && regex?.test(value.trim());

const generateAuditCode = () => `AUDIT-${uuidv4()}`;
const generatePermissionCode = () => `PRIV-${uuidv4()}`;
const generateRoleCode = () => `ROLE-${uuidv4()}`;
const generateUserCode = () => `USER-${uuidv4()}`;
const generateGenderCode = () => `GENDER-${uuidv4()}`;
const generateCountryCode = () => `COUNTRY-${uuidv4()}`;
const generateStateCode = () => `STATE-${uuidv4()}`;
const generateCityCode = () => `CITY-${uuidv4()}`;
const generateProfileCode = () => `PROFILE-${uuidv4()}`;
const generateClassCode = () => `CLASS-${uuidv4()}`;
const generateSectionCode = () => `SECTION-${uuidv4()}`;
const generateSubjectCode = () => `SUBJECT-${uuidv4()}`;
const generateStudentCode = () => `STUDENT-${uuidv4()}`;
const generateExamCode = () => `EXAM-${uuidv4()}`;
const generateMarkCode = () => `MARK-${uuidv4()}`;

const validateDob = (value) => {
  const dob = moment(new Date(value).setHours(0, 0, 0, 0)).valueOf();
  const today = moment(new Date().setHours(0, 0, 0, 0)).valueOf();

  return dob <= today;
};

const getInvalidPermissions = async (permissions) => {
  return await Promise.all(
    permissions.map(async (rp) => {
      const permission = await Permission.findOne({ permissionCode: rp });
      return !permission;
    })
  );
};

const getPermissionIds = async (permissions) => {
  return await Promise.all(
    permissions.map(async (rp) => {
      const permission = await Permission.findOne({ permissionCode: rp });
      return permission?._id;
    })
  );
};

const IsObjectIdReferenced = async (id) => {
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
  const permission = await Role.findOne({ roleCode });
  return !permission;
};

const getRoleId = async (roleCode) => {
  const permission = await Role.findOne({ roleCode });
  return permission?._id;
};

const toCapitalize = (str) => {
  const words = str?.split(" ") ?? [];
  const updatedWords =
    words?.map((w) => w?.[0]?.toUpperCase() + w?.substr(1)) ?? [];
  return updatedWords?.join(" ") ?? "";
};

const writeToFile = async (path, content) => {
  try {
    await fsPromises.writeFile(path, JSON.stringify(content, null, 2));
    console.log(`File written successfully at ${path}`);
  } catch (err) {
    console.error("Error writing to file:", err);
  }
};

const getCurrentUser = async (userCode) => {
  return await findUser({
    query: { userCode },
    options: true,
    populated: true,
  });
};

const getLimitAndSkip = (start, end) => {
  const parsedStart = parseInt(start) > 0 ? start : 1;
  const parsedEnd = parseInt(end) > 0 ? end : 10;
  const limit = parsedEnd - parsedStart + 1;
  const skip = parsedStart - 1;
  return { limit, skip };
};

module.exports = {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  removeIdsForSubSchemas,
  handleError,
  handleSuccess,
  trimAndTestRegex,
  generateAuditCode,
  generatePermissionCode,
  generateRoleCode,
  generateUserCode,
  generateGenderCode,
  generateCountryCode,
  generateStateCode,
  generateCityCode,
  generateProfileCode,
  generateClassCode,
  generateSectionCode,
  generateSubjectCode,
  generateStudentCode,
  generateExamCode,
  generateMarkCode,
  validateDob,
  getInvalidPermissions,
  getPermissionIds,
  IsObjectIdReferenced,
  getInvalidRole,
  getRoleId,
  toCapitalize,
  writeToFile,
  getCurrentUser,
  getLimitAndSkip,
};
