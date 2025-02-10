const moment = require("moment-timezone");
const Class = require("../models/class");
const Section = require("../models/section");
const User = require("../models/user");
const { logAudit } = require("../middleware");
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
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleError,
  handleSuccess,
  toCapitalize,
  IsObjectIdReferenced,
  generateSectionCode,
  generateAuditCode,
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

// Function to find a user along with their role and role permissions
const findUserWithRole = async (userCode) => {
  return await User.findOne({ userCode }, hiddenFieldsUser) // Find a user by userCode, excluding hidden fields
    .populate({
      // Populate the 'role' field with role details
      path: "role", // Path to the 'role' field in the User model
      select: hiddenFieldsDefault, // Exclude hidden fields in the role
      populate: {
        // Further populate the 'rolePermissions' field inside the role
        path: "rolePermissions", // Path to 'rolePermissions' within the role
        select: hiddenFieldsDefault, // Exclude hidden fields in the rolePermissions
      },
    });
};

// Function to find multiple sections and populate the related class information
const populateSections = async (query, limit) => {
  return await Section.find(query, hiddenFieldsDefault) // Find sections matching the query, excluding hidden fields
    .populate(
      "class", // Populate the 'class' field in each section
      hiddenFieldsDefault // Exclude hidden fields in the class
    )
    .limit(limit);
};

// Function to find a single section and populate the related class information
const populateSection = async (query) => {
  return await Section.findOne(query, hiddenFieldsDefault) // Find a single section matching the query, excluding hidden fields
    .populate(
      "class", // Populate the 'class' field in the section
      hiddenFieldsDefault // Exclude hidden fields in the class
    );
};

module.exports = {
  /**
   * Retrieves all sections from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSections: async (req, res, next) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Fetch all sections from the database
    const sections = await populateSections({}, entries);

    // Send a success response with the fetched sections
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_SECTIONS_SUCCESS,
          sections
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
    // Extract sectionCode from the request body
    const { sectionCode } = req.body;

    // Find the section in the database using sectionCode
    const section = await populateSection({ sectionCode });

    // Handle error if section is not found
    if (!section) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
      );
    }

    // Send success response with the retrieved section
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
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Extract classCode from the request body
    const { classCode } = req.body;

    // Find the class in the database using classCode
    const foundClass = await Class.findOne({ classCode });

    // Handle error if class is not found
    if (!foundClass)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_CLASS_NOT_FOUND
      );

    // Fetch all sections associated with the class
    const sections = await populateSections({ class: foundClass._id }, entries);

    // Handle error if no sections are found
    if (!sections.length) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTIONS_NOT_FOUND
      );
    }

    // Send success response with the fetched sections
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_STATE_SUCCESS, sections)
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
    // Extract name and classCode from the request body
    const { name, classCode } = req.body;
    const capitalizedName = toCapitalize(name);

    // Check if a section with the same name already exists
    const existingSection = await populateSection({ name: capitalizedName });
    if (existingSection) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_EXIST);
    }

    // Find the class in the database using classCode
    const existingClass = await Class.findOne({ classCode });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Create a new section with the provided data
    const section = new Section({
      sectionCode: generateSectionCode(),
      name: capitalizedName,
      class: existingClass._id,
    });

    // Save the new section to the database
    await section.save();

    // Fetch the created section for confirmation
    const createdSection = await populateSection({
      sectionCode: section.sectionCode,
    });

    // Find the current user and log the creation action
    const currentUser = await findUserWithRole(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.SECTIONS,
      createdSection.sectionCode,
      auditChanges.CREATE_SECTION,
      null,
      createdSection.toObject(),
      currentUser.toObject()
    );

    // Send success response with the created section
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_SECTION_SUCCESS,
          createdSection
        )
      );
  },

  /**
   * Updates an existing section's details.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateSection: async (req, res, next) => {
    // Extract sectionCode, name, and classCode from the request body
    const { sectionCode, name, classCode } = req.body;

    // Find the existing section in the database
    const existingSection = await populateSection({ sectionCode });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Find the class in the database using classCode
    const existingClass = await Class.findOne({ classCode });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Check for name conflicts with other sections
    const nameConflict = await populateSection({
      name: toCapitalize(name),
      sectionCode: { $ne: sectionCode },
    });
    if (nameConflict)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_TAKEN);

    // Update the section with the new data
    await Section.findOneAndUpdate(
      { sectionCode },
      {
        name: toCapitalize(name),
        class: existingClass._id,
        updatedAt: moment().valueOf(),
      }
    );

    // Fetch the updated section for confirmation
    const updatedSection = await populateSection({ sectionCode });

    // Find the current user and log the update action
    const currentUser = await findUserWithRole(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.SECTIONS,
      sectionCode,
      auditChanges.UPDATE_SECTION,
      existingSection.toObject(),
      updatedSection.toObject(),
      currentUser.toObject()
    );

    // Send success response with the updated section
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_SECTION_SUCCESS,
          updatedSection
        )
      );
  },

  /**
   * Deletes a section from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteSection: async (req, res, next) => {
    // Extract sectionCode from the request body
    const { sectionCode } = req.body;

    // Find the existing section in the database
    const existingSection = await Section.findOne({ sectionCode });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Check if the section is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingSection._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete the section from the database
    const previousData = await populateSection({ sectionCode });
    const deletionResult = await Section.deleteOne({ sectionCode });
    if (deletionResult.deletedCount === 0) {
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SECTION_ERROR
      );
    }

    // Find the current user and log the deletion action
    const currentUser = await findUserWithRole(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.SECTIONS,
      sectionCode,
      auditChanges.DELETE_SECTION,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Send success response confirming the deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_SECTION_SUCCESS));
  },
};
