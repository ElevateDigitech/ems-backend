const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleSuccess,
  handleError,
  IsObjectIdReferenced,
  getCurrentUser,
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
const {
  findSubjects,
  findSubject,
  formatSubjectName,
  createSubjectObj,
  updateSubjectObj,
  deleteSubjectObj,
  getSubjectPaginationObject,
  getTotalSubjects,
} = require("../queries/subjects");

module.exports = {
  /**
   * Retrieves all subjects from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSubjects: async (req, res, next) => {
    const {
      page = 1,
      perPage = 10,
      sortField = "",
      sortValue = "",
      keyword = "",
    } = req.query; // Step 1: Extract pagination parameters
    const subjects = await findSubjects({
      page,
      perPage,
      sortField,
      sortValue,
      keyword,
      options: true,
    }); // Step 2: Fetch subjects from the database
    const total = await getTotalSubjects(keyword);
    // Step 3: Send success response with the list of subjects
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_SUBJECTS_SUCCESS,
          subjects,
          total
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
    const { subjectCode } = req.body; // Step 1: Extract subject code from request body

    // Step 2: Find subject in the database using the subject code
    const subject = await findSubject({
      query: { subjectCode },
      options: true,
    });

    // Step 3: Handle case where subject is not found
    if (!subject) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SUBJECT_NOT_FOUND
      );
    }

    // Step 4: Send success response with the subject details
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
    const { name } = req.body; // Step 1: Extract and format subject name from request body
    const capitalizedName = formatSubjectName(name);

    // Step 2: Check if a subject with the same name already exists
    const existingSubject = await findSubject({
      query: { name: capitalizedName },
    });
    if (existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_EXIST);
    }

    // Step 3: Create new subject object and save to database
    const subject = await createSubjectObj({ name: capitalizedName });
    await subject.save();

    // Step 4: Retrieve the newly created subject details
    const createdSubject = await findSubject({
      query: { subjectCode: subject.subjectCode },
      options: true,
    });

    // Step 5: Get current user information for audit logging
    const currentUser = await getCurrentUser(req.user.userCode);

    // Step 6: Log the audit details for subject creation
    await logAudit(
      auditActions.CREATE,
      auditCollections.SUBJECTS,
      createdSubject.subjectCode,
      auditChanges.CREATE_SUBJECT,
      null,
      createdSubject.toObject(),
      currentUser.toObject()
    );

    // Step 7: Send success response with created subject details
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
    const { subjectCode, name } = req.body; // Step 1: Extract subject code and new name from request body
    const capitalizedName = formatSubjectName(name);

    // Step 2: Check if the subject exists in the database
    const existingSubject = await findSubject({ query: { subjectCode } });
    if (!existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);
    }

    // Step 3: Ensure no other subject has the same new name
    const duplicateSubjects = await findSubjects({
      query: { subjectCode: { $ne: subjectCode }, name: capitalizedName },
    });
    if (duplicateSubjects.length > 0) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_TAKEN);
    }

    // Step 4: Retrieve subject details before update for audit logging
    const previousData = await findSubject({
      query: { subjectCode },
      options: true,
    });

    // Step 5: Update the subject details in the database
    await updateSubjectObj({ subjectCode, name: capitalizedName });

    // Step 6: Retrieve updated subject details
    const updatedSubject = await findSubject({
      query: { subjectCode },
      options: true,
    });

    // Step 7: Log the audit details for subject update
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.SUBJECTS,
      updatedSubject.subjectCode,
      auditChanges.UPDATE_SUBJECT,
      previousData.toObject(),
      updatedSubject.toObject(),
      currentUser.toObject()
    );

    // Step 8: Send success response with updated subject details
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
    const { subjectCode } = req.body; // Step 1: Extract subject code from request body

    // Step 2: Check if the subject exists in the database
    const existingSubject = await findSubject({ query: { subjectCode } });
    if (!existingSubject) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUBJECT_NOT_FOUND);
    }

    // Step 3: Verify if the subject is referenced elsewhere in the database
    const { isReferenced } = await IsObjectIdReferenced(existingSubject._id);
    if (isReferenced) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUBJECT_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );
    }

    // Step 4: Retrieve subject details before deletion for audit logging
    const previousData = await findSubject({
      query: { subjectCode },
      options: true,
    });

    // Step 5: Delete the subject from the database
    const subject = await deleteSubjectObj(subjectCode);
    if (subject.deletedCount === 0) {
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SUBJECT_ERROR
      );
    }

    // Step 6: Log the audit details for subject deletion
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.SUBJECTS,
      previousData.subjectCode,
      auditChanges.DELETE_SUBJECT,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 7: Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_SUBJECT_SUCCESS));
  },
};
