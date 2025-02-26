const {
  STATUS_CODE_BAD_REQUEST,
  STATES_CODE_UNAUTHORIZED,
  STATUS_CODE_UNAUTHENTICATED,
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
const { getFileExtension } = require("./utils/helpers");

/**
 * Middleware for validating request bodies against a provided schema.
 * @param {Object} passedSchema - Joi schema for validation.
 * @returns {Function} Middleware function.
 */
const validateSchema = (passedSchema) =>
  catchAsync(async (req, res, next) => {
    // Validate the request body using the provided schema
    const { error } = passedSchema.validate(req.body);
    if (error) {
      // Extract error messages and throw a custom error response
      const msg = error.details.map((d) => d.message).join(", ");
      throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
    }
    // Proceed to the next middleware if validation passes
    next();
  });

/**
 * Middleware to handle file uploads using Multer.
 * Catches Multer-specific errors and sends an appropriate response.
 *
 * @param {Function} upload - Multer upload function to process the file upload.
 * @returns {Function} Middleware function to handle file uploads and errors.
 */
const handleUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(req.file);
      console.log(req.files);
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
};

/**
 * Middleware for validating request bodies against a provided schema.
 * Handles file uploads (e.g., profile pictures) and cleans up invalid files from Cloudinary if validation fails.
 *
 * @param {Object} passedSchema - Joi schema for validation.
 * @returns {Function} Middleware function to validate request data.
 */
const validateProfileSchema = (passedSchema) =>
  catchAsync(async (req, res, next) => {
    // Construct file object from the uploaded file data
    console.log(req.file);
    const file = {
      url: req?.file?.path ?? "",
      filename: req?.file?.filename ?? "",
      extension: getFileExtension(req?.file?.originalname ?? ""),
    };

    // Add file data to the request body under the appropriate field name
    req.body[req?.file?.fieldname ?? IMAGE_FIELD_PROFILE_PICTURE] = file;

    // Validate the request body using the provided schema
    const { error } = passedSchema.validate(req.body);

    if (error) {
      // If validation fails and a file was uploaded, delete the file from Cloudinary
      if (file?.filename && file?.filename?.trim()?.length) {
        await cloudinary.uploader.destroy(file.filename);
      }

      // Extract error messages and throw a custom error response
      const msg = error.details.map((d) => d.message).join(", ");
      throw new ExpressResponse(STATUS_ERROR, STATUS_CODE_BAD_REQUEST, msg);
    }

    // Proceed to the next middleware if validation passes
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
        STATUS_CODE_UNAUTHENTICATED,
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
  validateProfilePicture: handleUpload(uploadProfilePicture),

  /**
   * Middleware for validating profile schemas.
   */
  validateProfileCode: validateSchema(schemas.profileCodeSchema),
  validateProfile: validateProfileSchema(schemas.profileSchema),
  validateUpdateProfile: validateProfileSchema(schemas.updateProfileSchema),

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

  /**
   * Middleware for validating student schemas.
   */
  validateStudentCode: validateSchema(schemas.studentCodeSchema),
  validateStudent: validateSchema(schemas.studentSchema),
  validateUpdateStudent: validateSchema(schemas.updateStudentSchema),

  /**
   * Middleware for validating student schemas.
   */
  validateExamCode: validateSchema(schemas.examCodeSchema),
  validateExam: validateSchema(schemas.examSchema),
  validateUpdateExam: validateSchema(schemas.updateExamSchema),

  /**
   * Middleware for validating mark schemas.
   */
  validateMarkCode: validateSchema(schemas.markCodeSchema),
  validateMark: validateSchema(schemas.markSchema),
  validateUpdateMark: validateSchema(schemas.updateMarkSchema),
};
