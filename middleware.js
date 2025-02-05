const {
  STATUS_CODE_BAD_REQUEST,
  STATES_CODE_UNAUTHORIZED,
} = require("./utils/statusCodes");
const {
  MESSAGE_NOT_LOGGED_IN_YET,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_ACCESS_DENIED_NO_ROLES,
  MESSAGE_ACCESS_DENIED_NO_PERMISSION,
} = require("./utils/messages");
const { STATUS_ERROR } = require("./utils/status");
const ExpressResponse = require("./utils/ExpressResponse");
const schemas = require("./schemas");
const { cloudinary } = require("./cloudinary");
const { IMAGE_FIELD_PROFILE_PICTURE } = require("./utils/imageFields");
const { uploadProfilePicture } = require("./multer");
const { MulterError } = require("multer");
const catchAsync = require("./utils/catchAsync");
const AuditLog = require("./models/auditLog");

/**
 * Middleware for validating request bodies against a provided schema.
 * @param {Object} passedSchema - Joi schema for validation.
 * @returns {Function} Middleware function.
 */
const validateSchema = (passedSchema) =>
  catchAsync(async (req, res, next) => {
    const { error } = passedSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((d) => d.message).join(", ");
      throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
    }
    next();
  });

module.exports = {
  /**
   * Middleware to store return URL in session before redirecting.
   */
  storeReturnTo(req, res, next) {
    if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo;
    }
    next();
  },

  /**
   * Middleware to check if the user is authenticated.
   */
  isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl;
      throw new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_NOT_LOGGED_IN_YET
      );
    }
    next();
  },

  /**
   * Middleware to check if the user has the required permission.
   * @param {string} requiredPermission - The required permission name.
   */
  checkPermission: (requiredPermission) =>
    catchAsync(async (req, res, next) => {
      const user = req.user;
      if (!user || !user.role) {
        throw new ExpressResponse(
          STATUS_ERROR,
          STATES_CODE_UNAUTHORIZED,
          MESSAGE_ACCESS_DENIED_NO_ROLES
        );
      }

      const hasPermission = user.role?.rolePermissions?.some(
        (p) => p?.permissionName === requiredPermission
      );
      if (!hasPermission) {
        throw new ExpressResponse(
          STATUS_ERROR,
          STATES_CODE_UNAUTHORIZED,
          MESSAGE_ACCESS_DENIED_NO_PERMISSION
        );
      }
      next();
    }),

  /**
   * Function to log audit trail for actions performed.
   * @param {string} auditCode - Unique audit identifier.
   * @param {string} action - Action performed.
   * @param {string} collection - Database collection involved.
   * @param {string} document - Specific document ID.
   * @param {Object} changes - Changes made.
   * @param {Object} [before] - Previous state.
   * @param {Object} [after] - New state.
   * @param {Object} user - User performing the action.
   */
  async logAudit(
    auditCode,
    action,
    collection,
    document,
    changes,
    before = null,
    after = null,
    user
  ) {
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
    } catch (error) {
      console.error("Failed to log audit:", error);
    }
  },

  /**
   * Middleware for validating permission schemas.
   */
  validatePermissionCode: validateSchema(schemas.permissionCodeSchema),

  /**
   * Middleware for validating audit schemas.
   */
  validateAuditCode: validateSchema(schemas.auditCodeSchema),

  /**
   * Middleware for validating role schemas.
   */
  validateRoleCode: validateSchema(schemas.roleCodeSchema),
  validateRole: validateSchema(schemas.roleSchema),
  validateUpdateRole: validateSchema(schemas.updateRoleSchema),

  /**
   * Middleware for validating gender schemas.
   */
  validateGenderCode: validateSchema(schemas.genderCodeSchema),
  validateGender: validateSchema(schemas.genderSchema),
  validateUpdateGender: validateSchema(schemas.updateGenderSchema),

  /**
   * Middleware for validating country schemas.
   */
  validateCountryCode: validateSchema(schemas.countryCodeSchema),
  validateCountry: validateSchema(schemas.countrySchema),
  validateUpdateCountry: validateSchema(schemas.updateCountrySchema),

  /**
   * Middleware for validating state schemas.
   */
  validateStateCode: validateSchema(schemas.stateCodeSchema),
  validateState: validateSchema(schemas.stateSchema),
  validateUpdateState: validateSchema(schemas.updateStateSchema),

  /**
   * Middleware for validating city schemas.
   */
  validateCityCode: validateSchema(schemas.cityCodeSchema),
  validateCity: validateSchema(schemas.citySchema),
  validateUpdateCity: validateSchema(schemas.updateCitySchema),

  /**
   * Middleware for validating and uploading profile pictures.
   */
  validateProfilePicture(req, res, next) {
    uploadProfilePicture(req, res, (err) => {
      if (err) {
        const statusCode =
          err instanceof MulterError
            ? STATUS_CODE_BAD_REQUEST
            : err?.statusCode ?? STATUS_CODE_BAD_REQUEST;
        return res
          .status(statusCode)
          .send(
            new ExpressResponse(
              STATUS_ERROR,
              statusCode,
              err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
            )
          );
      }
      next();
    });
  },

  /**
   * Middleware for validating profile schemas.
   */
  validateProfileCode: validateSchema(schemas.profileCodeSchema),
  validateProfile: async (req, res, next) => {
    const file = {
      url: req?.file?.path ?? "",
      filename: req?.file?.filename ?? "",
    };
    req.body[req?.file?.fieldname ?? IMAGE_FIELD_PROFILE_PICTURE] = file;
    const { error } = schemas.profileSchema.validate(req.body);
    if (error) {
      if (file?.filename && file?.filename?.trim()?.length) {
        await cloudinary.uploader.destroy(file.filename);
      }
      const msg = error.details.map((d) => d.message).join(", ");
      throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
    }
    next();
  },
  validateUpdateProfile: validateSchema(schemas.updateProfileSchema),

  /**
   * Middleware for validating class schemas.
   */
  validateClassCode: validateSchema(schemas.classCodeSchema),
  validateClass: validateSchema(schemas.classSchema),
  validateUpdateClass: validateSchema(schemas.updateClassSchema),

  /**
   * Middleware for validating section schemas.
   */
  validateSectionCode: validateSchema(schemas.sectionCodeSchema),
  validateSection: validateSchema(schemas.sectionSchema),
  validateUpdateSection: validateSchema(schemas.updateSectionSchema),

  /**
   * Middleware for validating subject schemas.
   */
  validateSubjectCode: validateSchema(schemas.subjectCodeSchema),
  validateSubject: validateSchema(schemas.subjectSchema),
  validateUpdateSubject: validateSchema(schemas.updateSubjectSchema),
};
