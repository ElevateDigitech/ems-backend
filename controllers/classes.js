const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  getCurrentUser,
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
const {
  findClasses,
  findClass,
  formatClassName,
  createClassObj,
  updateClassObj,
  deleteClassObj,
} = require("../queries/classes");

module.exports = {
  /**
   * Retrieves all classes from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetClasses: async (req, res) => {
    const { start = 1, end = 10 } = req.query; // Step 1: Extract pagination parameters
    const classes = await findClasses({ start, end, options: true }); // Step 2: Fetch classes from database

    // Step 3: Send the retrieved classes in the response
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
    const { classCode } = req.body; // Step 1: Extract class code from request
    const classDetails = await findClass({
      query: { classCode },
      options: true,
    }); // Step 2: Find class in database

    // Step 3: Return the class details if found, otherwise handle error
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
    const { name } = req.body; // Step 1: Extract class name from request
    const formattedName = formatClassName(name); // Step 2: Format class name

    // Step 3: Check if the class already exists
    const existingClass = await findClass({ query: { name: formattedName } });
    if (existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_EXIST);

    // Step 4: Create and save the new class
    const newClass = createClassObj({ name: formattedName });
    await newClass.save();

    // Step 5: Log the creation in audit logs
    const createdClass = await findClass({
      query: { classCode: newClass.classCode },
      options: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.CLASSES,
      createdClass.classCode,
      auditChanges.CREATE_CLASS,
      null,
      createdClass.toObject(),
      currentUser.toObject()
    );

    // Step 6: Send the created class as the response
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
    const { classCode, name } = req.body; // Step 1: Extract class code and new name
    const formattedName = formatClassName(name); // Step 2: Format class name

    // Step 3: Validate if the class exists
    const existingClass = await findClass({ query: { classCode } });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Step 4: Check for name conflicts with other classes
    const otherClasses = await findClass({
      query: { classCode: { $ne: classCode }, name: formattedName },
    });
    if (otherClasses)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_TAKEN);

    // Step 5: Capture current class data before update
    const previousData = await findClass({
      query: { classCode },
      options: true,
    });

    // Step 6: Update the class details
    await updateClassObj({ classCode, name: formattedName });

    // Step 7: Log the update in the audit logs
    const updatedClass = await findClass({
      query: { classCode },
      options: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.CLASSES,
      classCode,
      auditChanges.UPDATE_CLASS,
      previousData.toObject(),
      updatedClass.toObject(),
      currentUser.toObject()
    );

    // Step 8: Send the updated class as the response
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
    const { classCode } = req.body; // Step 1: Extract class code from request

    // Step 2: Validate if the class exists
    const existingClass = await findClass({ query: { classCode } });
    if (!existingClass)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_CLASS_NOT_FOUND);

    // Step 3: Check if the class is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingClass._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the class
    const previousData = await findClass({
      query: { classCode },
      options: true,
    });
    const deletionResult = await deleteClassObj(classCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_CLASSS_ERROR
      );

    // Step 5: Log the deletion in the audit logs
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.CLASSES,
      classCode,
      auditChanges.DELETE_CLASS,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 6: Send deletion success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_CLASSS_SUCCESS));
  },
};
