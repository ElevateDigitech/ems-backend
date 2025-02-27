const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  getCurrentUser,
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
const {
  findSections,
  findSection,
  formatSectionName,
  createSectionObj,
  updateSectionObj,
  deleteSectionObj,
  getSectionPaginationObject,
} = require("../queries/sections");
const { findClass } = require("../queries/classes");

module.exports = {
  /**
   * Retrieves all sections from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSections: async (req, res, next) => {
    const { page = 1, perPage = 10 } = req.query; // Step 1: Extract pagination parameters
    const sections = await findSections({
      page,
      perPage,
      options: true,
      populated: true,
    }); // Step 2: Fetch sections from the database
    const pagination = await getSectionPaginationObject(page, perPage);
    // Step 3: Send the retrieved sections in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_SECTIONS_SUCCESS,
          sections,
          pagination
        )
      );
  },

  /**
   * Retrieves a section by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSectionByCode: async (req, res, next) => {
    const { sectionCode } = req.body;
    const section = await findSection({
      query: { sectionCode },
      options: true,
      populated: true,
    }); // Step 1: Find the section using the provided section code

    if (!section) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
      );
    } // Step 2: Handle error if section not found

    // Step 3: Send the retrieved section in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_SECTION_SUCCESS, section)
      );
  },

  /**
   * Retrieves sections associated with a specific class code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSectionsByClassCode: async (req, res, next) => {
    const { page = 1, perPage = 10 } = req.query; // Step 1: Extract pagination parameters
    const { classCode } = req.body;
    const foundClass = await findClass({
      query: {
        classCode,
      },
    }); // Step 2: Find the class using the provided class code

    if (!foundClass)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
      ); // Step 3: Handle error if class not found

    const sections = await findSections({
      query: { class: foundClass._id },
      page,
      perPage,
      options: true,
      populated: true,
    }); // Step 4: Fetch sections using the found class

    if (!sections.length) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTIONS_NOT_FOUND
      );
    } // Step 5: Handle error if no section found
    const pagination = await getSectionPaginationObject(page, perPage);
    // Step 3: Send the retrieved sections in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STATE_SUCCESS,
          sections,
          pagination
        )
      );
  },

  /**
   * Creates a new section in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateSection: async (req, res, next) => {
    const { name, classCode } = req.body;
    const capitalizedName = formatSectionName(name); // Step 1: Format section fields

    const existingSection = await findSection({
      query: { name: capitalizedName },
    });
    if (existingSection) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_EXIST);
    } // Step 2: Check if section already exists

    const existingClass = await findClass({ query: { classCode } });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);
    // Step 3: Validate class

    const section = await createSectionObj({
      name: capitalizedName,
      classId: existingClass._id,
    }); // Step 4: Create new section

    await section.save(); // Step 5: Save the new section

    const createdSection = await findSection({
      query: { sectionCode: section.sectionCode },
      options: true,
      populated: true,
    }); // Step 6: Retrieve the newly created section

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.SECTIONS,
      createdSection.sectionCode,
      auditChanges.CREATE_SECTION,
      null,
      createdSection.toObject(),
      currentUser.toObject()
    ); // Step 7: Log the creation action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_SECTION_SUCCESS,
          createdSection
        )
      ); // Step 8: Send the created section in the response
  },

  /**
   * Updates an existing section's details.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateSection: async (req, res, next) => {
    const { sectionCode, name, classCode } = req.body;
    const capitalizedName = formatSectionName(name); // Step 1: Format section fields

    const existingSection = await findSection({ query: { sectionCode } });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);
    // Step 2: Find the existing section

    const existingClass = await findClass({ query: { classCode } });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);
    // Step 3: Validate class

    const nameConflict = await findSection({
      query: { name: capitalizedName, sectionCode: { $ne: sectionCode } },
    });
    if (nameConflict)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_TAKEN);
    // Step 4: Check for section name conflicts

    const previousData = await findSection({
      query: { sectionCode },
      options: true,
      populated: true,
    });

    await updateSectionObj({
      sectionCode,
      name: capitalizedName,
      class: existingClass._id,
    }); // Step 5: Update the role in the database

    const updatedSection = await findSection({
      query: { sectionCode },
      options: true,
      populated: true,
    }); // Step 6: Log the update action

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.SECTIONS,
      sectionCode,
      auditChanges.UPDATE_SECTION,
      previousData.toObject(),
      updatedSection.toObject(),
      currentUser.toObject()
    ); // Step 6: Log the update action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_SECTION_SUCCESS,
          updatedSection
        )
      ); // Step 7: Send the updated role in the response
  },

  /**
   * Deletes a section from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteSection: async (req, res, next) => {
    const { sectionCode } = req.body;
    const existingSection = await findSection({ query: { sectionCode } });
    // Step 1: Find the section to be deleted

    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    const { isReferenced } = await IsObjectIdReferenced(existingSection._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      ); // Step 2: Check for references

    const previousData = await findSection({
      query: { sectionCode },
      options: true,
      populated: true,
    });

    const deletionResult = await deleteSectionObj(sectionCode);

    if (deletionResult.deletedCount === 0) {
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SECTION_ERROR
      );
    } // Step 3: Handle deletion error

    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.SECTIONS,
      sectionCode,
      auditChanges.DELETE_SECTION,
      previousData.toObject(),
      null,
      currentUser.toObject()
    ); // Step 4: Log the deletion action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_SECTION_SUCCESS));
    // Step 5: Send a success response
  },
};
