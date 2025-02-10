const moment = require("moment-timezone");
const Class = require("../models/class");
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
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  generateClassCode,
  generateAuditCode,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_CLASSES_SUCCESS,
  MESSAGE_CLASS_NOT_FOUND,
  MESSAGE_GET_CLASS_SUCCESS,
  MESSAGE_CLASS_EXIST,
  MESSAGE_CREATE_CLASSS_SUCCESS,
  MESSAGE_CLASS_TAKEN,
  MESSAGE_UPDATE_CLASSS_SUCCESS,
  MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_CLASSS_ERROR,
  MESSAGE_DELETE_CLASSS_SUCCESS,
} = require("../utils/messages");

// Utility Functions
const findClassesByQuery = async (query, limit) =>
  await Class.find(query, hiddenFieldsDefault).limit(limit);
const findClassByQuery = async (query) =>
  await Class.findOne(query, hiddenFieldsDefault);
const findUserByCode = async (userCode) =>
  await User.findOne({ userCode }, hiddenFieldsUser).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: { path: "rolePermissions", select: hiddenFieldsDefault },
  });

// Class Controller
module.exports = {
  /**
   * Retrieves all classes from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetClasses: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Fetch all classes from the database
    const classes = await findClassesByQuery({}, entries);

    // Send the retrieved classes in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_CLASSES_SUCCESS, classes)
      );
  },

  /**
   * Retrieves a class by its unique class code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetClassByCode: async (req, res, next) => {
    // Extract the class code from the request
    const { classCode } = req.body;

    // Find the class by its code
    const classDetails = await findClassByQuery({ classCode });

    // Return the class details if found, otherwise handle error
    return classDetails
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_CLASS_SUCCESS,
              classDetails
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_CLASS_NOT_FOUND);
  },

  /**
   * Creates a new class in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateClass: async (req, res, next) => {
    // Extract and format the class name
    const { name } = req.body;
    const formattedName = name.trim().toUpperCase();

    // Check if the class already exists
    if (await Class.findOne({ name: formattedName }))
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_EXIST);

    // Create a new class object and save it
    const newClass = new Class({
      classCode: generateClassCode(),
      name: formattedName,
    });
    await newClass.save();

    // Retrieve the newly created class and log the audit
    const createdClass = await findClassByQuery({
      classCode: newClass.classCode,
    });
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.CLASSES,
      createdClass.classCode,
      auditChanges.CREATE_CLASS,
      null,
      createdClass.toObject(),
      currentUser.toObject()
    );

    // Send the created class as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_CLASSS_SUCCESS,
          createdClass
        )
      );
  },

  /**
   * Updates an existing class in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateClass: async (req, res, next) => {
    // Extract class code and new name from request
    const { classCode, name } = req.body;
    const formattedName = name.trim().toUpperCase();

    // Validate if the class exists
    const existingClass = await findClassByQuery({ classCode });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Check for name conflicts with other classes
    if (
      await Class.findOne({
        classCode: { $ne: classCode },
        name: formattedName,
      })
    )
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_TAKEN);

    // Class details before update
    const classBeforeUpdate = existingClass.toObject();

    // Update the class details
    await Class.findOneAndUpdate(
      { classCode },
      {
        name: formattedName,
        updatedAt: moment().valueOf(),
      }
    );

    // Log the update in the audit logs
    const updatedClass = await findClassByQuery({ classCode });
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.CLASSES,
      classCode,
      auditChanges.UPDATE_CLASS,
      classBeforeUpdate,
      updatedClass.toObject(),
      currentUser.toObject()
    );

    // Send the updated class as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_CLASSS_SUCCESS,
          updatedClass
        )
      );
  },

  /**
   * Deletes a class from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteClass: async (req, res, next) => {
    // Extract the class code from the request
    const { classCode } = req.body;

    // Validate if the class exists
    const existingClass = await findClassByQuery({ classCode });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Check if the class is referenced elsewhere in the database
    const { isReferenced } = await IsObjectIdReferenced(existingClass._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Delete the class
    const deletionResult = await Class.deleteOne({ classCode });
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CLASSS_ERROR
      );

    // Log the deletion in the audit logs
    const currentUser = await findUserByCode(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.CLASSES,
      classCode,
      auditChanges.DELETE_CLASS,
      existingClass.toObject(),
      null,
      currentUser.toObject()
    );

    // Send the deletion success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_CLASSS_SUCCESS));
  },
};
