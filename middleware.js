const {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
  STATES_CODE_UNAUTHORIZED,
} = require("./utils/statusCodes");
const {
  MESSAGE_NOT_LOGGED_IN_YET,
  MESSAGE_NOT_AUTHORIZED,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_ACCESS_DENIED_NO_ROLES,
  MESSAGE_ACCESS_DENIED_NO_PERMISSION,
} = require("./utils/messages");
const { STATUS_ERROR } = require("./utils/status");
const ExpressResponse = require("./utils/ExpressResponse");
const {
  permissionSchema,
  permissionCodeSchema,
  updatePermissionSchema,
  roleCodeSchema,
  roleSchema,
  updateRoleSchema,
  genderCodeSchema,
  genderSchema,
  updateGenderSchema,
  profileSchema,
  countrySchema,
  countryCodeSchema,
  updateCountrySchema,
  stateCodeSchema,
  stateSchema,
  updateStateSchema,
  cityCodeSchema,
  citySchema,
  updateCitySchema,
  profileCodeSchema,
  updateProfileSchema,
  auditCodeSchema,
} = require("./schemas");
const Role = require("./models/role");
const { cloudinary } = require("./cloudinary");
const { IMAGE_FIELD_PROFILE_PICTURE } = require("./utils/imageFields");
const { uploadProfilePicture } = require("./multer");
const { MulterError } = require("multer");
const catchAsync = require("./utils/catchAsync");
const AuditLog = require("./models/auditLog");

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    throw new ExpressResponse(
      STATUS_ERROR,
      STATUS_CODE_BAD_REQUEST,
      MESSAGE_NOT_LOGGED_IN_YET
    );
  } else {
    next();
  }
};

module.exports.checkPermission = (requiredPermission) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) {
      throw new ExpressResponse(
        STATUS_ERROR,
        STATES_CODE_UNAUTHORIZED,
        MESSAGE_ACCESS_DENIED_NO_ROLES
      );
    }

    const userPermissions = user.role?.rolePermissions || [];
    if (
      !userPermissions.find((p) => p?.permissionName === requiredPermission)
    ) {
      throw new ExpressResponse(
        STATUS_ERROR,
        STATES_CODE_UNAUTHORIZED,
        MESSAGE_ACCESS_DENIED_NO_PERMISSION
      );
    }

    next();
  });
};

module.exports.logAudit = async (
  auditCode,
  action,
  collection,
  document,
  changes,
  before = null,
  after = null,
  user
) => {
  try {
    const audit = new AuditLog({
      auditCode,
      action,
      collection,
      document,
      changes,
      before,
      after,
      user,
    });
    await audit.save();

    const audits = await AuditLog.find({});
    const auditJSON = audits.map((a) => a.toJSON());
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
};

module.exports.validatePermissionCode = (req, res, next) => {
  const { error } = permissionCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateRoleCode = (req, res, next) => {
  const { error } = roleCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateRole = (req, res, next) => {
  const { error } = roleSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateRole = (req, res, next) => {
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateGenderCode = (req, res, next) => {
  const { error } = genderCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateGender = (req, res, next) => {
  const { error } = genderSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateGender = (req, res, next) => {
  const { error } = updateGenderSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateCountryCode = (req, res, next) => {
  const { error } = countryCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateCountry = (req, res, next) => {
  const { error } = countrySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateCountry = (req, res, next) => {
  const { error } = updateCountrySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateStateCode = (req, res, next) => {
  const { error } = stateCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateState = (req, res, next) => {
  const { error } = stateSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateState = (req, res, next) => {
  const { error } = updateStateSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateCityCode = (req, res, next) => {
  const { error } = cityCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateCity = (req, res, next) => {
  const { error } = citySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateCity = (req, res, next) => {
  const { error } = updateCitySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateProfilePicture = async (req, res, next) => {
  uploadProfilePicture(req, res, (err) => {
    if (err instanceof MulterError) {
      return res
        .status(STATUS_CODE_BAD_REQUEST)
        .send(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_BAD_REQUEST,
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
    } else if (err) {
      return res
        .status(err?.statusCode ?? STATUS_CODE_BAD_REQUEST)
        .send(
          new ExpressResponse(
            err?.status ?? STATUS_ERROR,
            err?.statusCode ?? STATUS_CODE_BAD_REQUEST,
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
    }
    next();
  });
};

module.exports.validateProfile = async (req, res, next) => {
  const file = {
    url: req?.file?.path ?? "",
    filename: req?.file?.filename ?? "",
  };

  const fieldName = req?.file?.fieldname ?? IMAGE_FIELD_PROFILE_PICTURE;
  req.body[fieldName] = file;

  const { error } = profileSchema.validate(req.body);
  if (error) {
    if (file?.filename && file?.filename?.trim()?.length) {
      await cloudinary.uploader.destroy(file.filename);
    }
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateProfileCode = (req, res, next) => {
  const { error } = profileCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateUpdateProfile = async (req, res, next) => {
  const file = {
    url: req?.file?.path ?? "",
    filename: req?.file?.filename ?? "",
  };

  const fieldName = req?.file?.fieldname ?? IMAGE_FIELD_PROFILE_PICTURE;
  req.body[fieldName] = file;

  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    if (file?.filename && file?.filename?.trim()?.length) {
      await cloudinary.uploader.destroy(file.filename);
    }
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};

module.exports.validateAuditCode = (req, res, next) => {
  const { error } = auditCodeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((d) => d.message).join(", ");
    throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
  } else {
    next();
  }
};
