const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");
const { VALID_DATE, VALID_PHONE } = require("./utils/allRegex");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
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

module.exports.permissionCodeSchema = Joi.object({
  permissionCode: Joi.string().required(),
});

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

module.exports.profileSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  profilePicture: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
  }).required(),
  dob: Joi.string().pattern(VALID_DATE),
  gender: Joi.string().required(),
  phoneNumber: Joi.string().pattern(VALID_PHONE),
  address: Joi.object({
    addressLineOne: Joi.string(),
    addressLineTwo: Joi.string(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  social: Joi.object({
    linkedin: Joi.string(),
    twitter: Joi.string(),
    facebook: Joi.string(),
    instagram: Joi.string(),
    websiteProtfolioUrl: Joi.string(),
  }),
  notification: Joi.object({
    email: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    push: Joi.boolean().required(),
  }).required(),
  user: Joi.string().required(),
});

module.exports.profileCodeSchema = Joi.object({
  profileCode: Joi.string().required(),
});

module.exports.updateProfileSchema = Joi.object({
  profileCode: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string(),
  profilePicture: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
  }).required(),
  dob: Joi.string().pattern(VALID_DATE),
  gender: Joi.string().required(),
  phoneNumber: Joi.string().pattern(VALID_PHONE),
  address: Joi.object({
    addressLineOne: Joi.string(),
    addressLineTwo: Joi.string(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required(),
  }).required(),
  social: Joi.object({
    linkedin: Joi.string(),
    twitter: Joi.string(),
    facebook: Joi.string(),
    instagram: Joi.string(),
    websiteProtfolioUrl: Joi.string(),
  }),
  notification: Joi.object({
    email: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    push: Joi.boolean().required(),
  }).required(),
  user: Joi.string().required(),
});

module.exports.auditCodeSchema = Joi.object({
  auditCode: Joi.string().required(),
});
