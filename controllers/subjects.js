const moment = require("moment-timezone");
const Subject = require("../models/subject");
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleSuccess,
  handleError,
  toCapitalize,
  IsObjectIdReferenced,
  generateAuditCode,
  generateSubjectCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_SUBJECTS_SUCCESS,
  MESSAGE_SUBJECT_NOT_FOUND,
  MESSAGE_GET_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_EXIST,
  MESSAGE_CREATE_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_TAKEN,
  MESSAGE_UPDATE_SUBJECT_SUCCESS,
  MESSAGE_SUBJECT_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_SUBJECT_ERROR,
  MESSAGE_DELETE_SUBJECT_SUCCESS,
} = require("../utils/messages");

/**
 * Retrieves the current user along with their role and permissions.
 *
 * @param {String} userCode - Unique identifier for the user
 * @returns {Object} - User object with populated role and permissions
 */
const getCurrentUser = async (userCode) => {
  // Find the user by userCode, hiding specific fields
  return await User.findOne({ userCode }, hiddenFieldsUser).populate({
    // Populate the role details
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      // Further populate the rolePermissions under role
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });
};

module.exports = {
  /**
   * Retrieves all subjects from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSubjects: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Fetch all subjects from the database, excluding hidden fields
    const subjects = await Subject.find({}, hiddenFieldsDefault).limit(entries);

    // Send success response with the list of subjects
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_SUBJECTS_SUCCESS,
          subjects
        )
      );
  },

  /**
   * Retrieves a subject by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSubjectByCode: async (req, res, next) => {
    // Extract subject code from request body
    const { subjectCode } = req.body;

    // Find subject in the database using the subject code
    const subject = await Subject.findOne({ subjectCode }, hiddenFieldsDefault);

    // Handle case where subject is not found
    if (!subject) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SUBJECT_NOT_FOUND
      );
    }

    // Send success response with the subject details
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_SUBJECT_SUCCESS, subject)
      );
  },

  /**
   * Creates a new subject in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateSubject: async (req, res, next) => {
    // Extract and capitalize the subject name from the request body
    const { name } = req.body;
    const capitalizedName = toCapitalize(name);

    // Check if a subject with the same name already exists
    const existingSubject = await Subject.findOne({ name: capitalizedName });
    if (existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_EXIST);
    }

    // Generate a new subject code and create the subject
    const subjectCode = generateSubjectCode();
    const subject = new Subject({ subjectCode, name: capitalizedName });
    await subject.save();

    // Retrieve the newly created subject details
    const createdSubject = await Subject.findOne(
      { subjectCode },
      hiddenFieldsDefault
    );

    // Get the current user information
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the audit details for subject creation
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.SUBJECTS,
      createdSubject.subjectCode,
      auditChanges.CREATE_SUBJECT,
      null,
      createdSubject.toObject(),
      currentUser.toObject()
    );

    // Send success response with the created subject details
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_SUBJECT_SUCCESS,
          createdSubject
        )
      );
  },

  /**
   * Updates an existing subject in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateSubject: async (req, res, next) => {
    // Extract subject code and new name from request body
    const { subjectCode, name } = req.body;
    const capitalizedName = toCapitalize(name);

    // Check if the subject exists in the database
    const existingSubject = await Subject.findOne({ subjectCode });
    if (!existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);
    }

    // Ensure no other subject has the same new name
    const duplicateSubjects = await Subject.find({
      subjectCode: { $ne: subjectCode },
      name: capitalizedName,
    });
    if (duplicateSubjects.length > 0) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_TAKEN);
    }

    // Retrieve the subject before updating
    const subjectBeforeUpdate = await Subject.findOne(
      { subjectCode },
      hiddenFieldsDefault
    );

    // Update the subject details in the database
    await Subject.findOneAndUpdate(
      { subjectCode },
      { name: capitalizedName, updatedAt: moment().valueOf() }
    );

    // Retrieve the updated subject details
    const updatedSubject = await Subject.findOne(
      { subjectCode },
      hiddenFieldsDefault
    );

    // Get current user information
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the audit details for subject update
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.SUBJECTS,
      updatedSubject.subjectCode,
      auditChanges.UPDATE_SUBJECT,
      subjectBeforeUpdate.toObject(),
      updatedSubject.toObject(),
      currentUser.toObject()
    );

    // Send success response with the updated subject details
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_SUBJECT_SUCCESS,
          updatedSubject
        )
      );
  },

  /**
   * Deletes a subject from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteSubject: async (req, res, next) => {
    // Extract subject code from request body
    const { subjectCode } = req.body;

    // Check if the subject exists in the database
    const existingSubject = await Subject.findOne({ subjectCode });
    if (!existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);
    }

    // Verify if the subject is referenced elsewhere in the database
    const { isReferenced } = await IsObjectIdReferenced(existingSubject._id);
    if (isReferenced) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );
    }

    // Retrieve subject details before deletion
    const subjectBeforeDelete = await Subject.findOne(
      { subjectCode },
      hiddenFieldsDefault
    );

    // Delete the subject from the database
    const subject = await Subject.deleteOne({ subjectCode });
    if (subject.deletedCount === 0) {
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SUBJECT_ERROR
      );
    }

    // Get current user information
    const currentUser = await getCurrentUser(req.user.userCode);

    // Log the audit details for subject deletion
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.SUBJECTS,
      subjectBeforeDelete.subjectCode,
      auditChanges.DELETE_SUBJECT,
      subjectBeforeDelete.toObject(),
      null,
      currentUser.toObject()
    );

    // Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_SUBJECT_SUCCESS));
  },
};
