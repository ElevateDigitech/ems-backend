const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");
const { VALID_DATE, VALID_PHONE } = require("./utils/allRegex");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} should not contain HTML content!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

/**
 * Permission schemas.
 */
module.exports.permissionCodeSchema = Joi.object({
  permissionCode: Joi.string().required(),
});

/**
 * Audit schemas.
 */
module.exports.auditCodeSchema = Joi.object({
  auditCode: Joi.string().required(),
});

/**
 * Role schemas.
 */
module.exports.roleCodeSchema = Joi.object({
  roleCode: Joi.string().required(),
});

module.exports.roleSchema = Joi.object({
  roleName: Joi.string().required(),
  roleDescription: Joi.string(),
  roleAllowDeletion: Joi.boolean(),
  rolePermissions: Joi.array().items(Joi.string()).required(),
});

module.exports.updateRoleSchema = Joi.object({
  roleCode: Joi.string().required(),
  roleName: Joi.string().required(),
  roleDescription: Joi.string(),
  rolePermissions: Joi.array().items(Joi.string()).required(),
});

/**
 * Gender schemas.
 */
module.exports.genderCodeSchema = Joi.object({
  genderCode: Joi.string().required(),
});

module.exports.genderSchema = Joi.object({
  genderName: Joi.string().required(),
});

module.exports.updateGenderSchema = Joi.object({
  genderCode: Joi.string().required(),
  genderName: Joi.string().required(),
});

/**
 * Country schemas.
 */
module.exports.countryCodeSchema = Joi.object({
  countryCode: Joi.string().required(),
});

module.exports.countrySchema = Joi.object({
  name: Joi.string().required(),
  iso2: Joi.string().required(),
  iso3: Joi.string().required(),
});

module.exports.updateCountrySchema = Joi.object({
  countryCode: Joi.string().required(),
  name: Joi.string().required(),
  iso2: Joi.string().required(),
  iso3: Joi.string().required(),
});

/**
 * State schemas.
 */
module.exports.stateCodeSchema = Joi.object({
  stateCode: Joi.string().required(),
});

module.exports.stateSchema = Joi.object({
  name: Joi.string().required(),
  iso: Joi.string().required(),
  countryCode: Joi.string().required(),
});

module.exports.updateStateSchema = Joi.object({
  stateCode: Joi.string().required(),
  name: Joi.string().required(),
  iso: Joi.string().required(),
  countryCode: Joi.string().required(),
});

/**
 * City schemas.
 */
module.exports.cityCodeSchema = Joi.object({
  cityCode: Joi.string().required(),
});

module.exports.citySchema = Joi.object({
  name: Joi.string().required(),
  stateCode: Joi.string().required(),
  countryCode: Joi.string().required(),
});

module.exports.updateCitySchema = Joi.object({
  cityCode: Joi.string().required(),
  name: Joi.string().required(),
  stateCode: Joi.string().required(),
  countryCode: Joi.string().required(),
});

/**
 * Profile schemas.
 */
module.exports.profileCodeSchema = Joi.object({
  profileCode: Joi.string().required(),
});

module.exports.profileSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  profilePicture: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
    extension: Joi.string().required(),
  }).required(),
  dob: Joi.string().required().pattern(VALID_DATE),
  genderCode: Joi.string().required(),
  phoneNumber: Joi.string().required().pattern(VALID_PHONE),
  address: Joi.object({
    addressLineOne: Joi.string(),
    addressLineTwo: Joi.string(),
    cityCode: Joi.string().required(),
    stateCode: Joi.string().required(),
    countryCode: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  social: Joi.object({
    linkedin: Joi.string(),
    twitter: Joi.string(),
    facebook: Joi.string(),
    instagram: Joi.string(),
    websitePortfolioUrl: Joi.string(),
  }),
  notification: Joi.object({
    email: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    push: Joi.boolean().required(),
  }).required(),
  userCode: Joi.string().required(),
});

module.exports.updateProfileSchema = Joi.object({
  profileCode: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  profilePicture: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
    extension: Joi.string().required(),
  }).required(),
  dob: Joi.string().required().pattern(VALID_DATE),
  genderCode: Joi.string().required(),
  phoneNumber: Joi.string().required().pattern(VALID_PHONE),
  address: Joi.object({
    addressLineOne: Joi.string(),
    addressLineTwo: Joi.string(),
    cityCode: Joi.string().required(),
    stateCode: Joi.string().required(),
    countryCode: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  social: Joi.object({
    linkedin: Joi.string(),
    twitter: Joi.string(),
    facebook: Joi.string(),
    instagram: Joi.string(),
    websitePortfolioUrl: Joi.string(),
  }),
  notification: Joi.object({
    email: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    push: Joi.boolean().required(),
  }).required(),
  isProfilePictureChanged: Joi.boolean().required(),
});

/**
 * Class schemas.
 */
module.exports.classCodeSchema = Joi.object({
  classCode: Joi.string().required(),
});

module.exports.classSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports.updateClassSchema = Joi.object({
  classCode: Joi.string().required(),
  name: Joi.string().required(),
});

/**
 * Section schemas.
 */
module.exports.sectionCodeSchema = Joi.object({
  sectionCode: Joi.string().required(),
});

module.exports.sectionSchema = Joi.object({
  name: Joi.string().required(),
  classCode: Joi.string().required(),
});

module.exports.updateSectionSchema = Joi.object({
  sectionCode: Joi.string().required(),
  name: Joi.string().required(),
  classCode: Joi.string().required(),
});

/**
 * Subject schemas.
 */
module.exports.subjectCodeSchema = Joi.object({
  subjectCode: Joi.string().required(),
});

module.exports.subjectSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports.updateSubjectSchema = Joi.object({
  subjectCode: Joi.string().required(),
  name: Joi.string().required(),
});

/**
 * Student schemas.
 */
module.exports.studentCodeSchema = Joi.object({
  studentCode: Joi.string().required(),
});

module.exports.studentSchema = Joi.object({
  name: Joi.string().required(),
  rollNumber: Joi.string().required(),
  sectionCode: Joi.string().required(),
});

module.exports.updateStudentSchema = Joi.object({
  studentCode: Joi.string().required(),
  name: Joi.string().required(),
  rollNumber: Joi.string().required(),
  sectionCode: Joi.string().required(),
});

/**
 * Question schemas.
 */
module.exports.questionCodeSchema = Joi.object({
  questionCode: Joi.string().required(),
});

module.exports.questionSchema = Joi.object({
  level: Joi.number().required(),
  total: Joi.number().required(),
});

module.exports.updateQuestionSchema = Joi.object({
  questionCode: Joi.string().required(),
  level: Joi.number().required(),
  total: Joi.number().required(),
});

/**
 * EXAM schemas.
 */
module.exports.examCodeSchema = Joi.object({
  examCode: Joi.string().required(),
});

module.exports.examSchema = Joi.object({
  title: Joi.string().required(),
  date: Joi.string().required().pattern(VALID_DATE),
});

module.exports.updateExamSchema = Joi.object({
  examCode: Joi.string().required(),
  title: Joi.string().required(),
  date: Joi.string().required().pattern(VALID_DATE),
});

/**
 * Mark schemas.
 */
module.exports.markCodeSchema = Joi.object({
  markCode: Joi.string().required(),
});

module.exports.markSchema = Joi.object({
  markEarned: Joi.number().required(),
  markTotal: Joi.number().required(),
  examCode: Joi.string().required(),
  studentCode: Joi.string().required(),
  subjectCode: Joi.string().required(),
});

module.exports.updateMarkSchema = Joi.object({
  markCode: Joi.string().required(),
  markEarned: Joi.number().required(),
  markTotal: Joi.number().required(),
  examCode: Joi.string().required(),
  studentCode: Joi.string().required(),
  subjectCode: Joi.string().required(),
});
