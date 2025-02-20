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
  MESSAGE_GENDER_EXIST,
  MESSAGE_CREATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_FOUND,
  MESSAGE_UPDATE_GENDERS_SUCCESS,
  MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_GENDERS_ERROR,
  MESSAGE_DELETE_GENDERS_SUCCESS,
  MESSAGE_GET_GENDER_SUCCESS,
  MESSAGE_GET_GENDERS_SUCCESS,
  MESSAGE_GENDER_TAKEN,
} = require("../utils/messages");
const {
  findGender,
  findGenders,
  formatGenderName,
  createGenderObj,
  updateGenderObj,
  deleteGenderObj,
} = require("../queries/genders");

module.exports = {
  /**
   * Retrieves all genders from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetGenders: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findGenders({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      projection: true,
    });
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS,
        MESSAGE_GET_GENDERS_SUCCESS,
        results,
        totalCount
      ) // Step 3: Send success response
    );
  },

  /**
   * Retrieves a gender by its unique gender code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetGenderByCode: async (req, res, next) => {
    const { genderCode } = req.body; // Step 1: Extract genderCode from request
    const gender = await findGender({
      query: { genderCode },
      projection: true,
    }); // Step 2: Find gender
    return gender
      ? res.status(STATUS_CODE_SUCCESS).send(
          handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_GENDER_SUCCESS, gender) // Step 3: Send success response
        )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_GENDER_NOT_FOUND); // Step 4: Handle error if not found
  },

  /**
   * Creates a new gender in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateGender: async (req, res, next) => {
    const { genderName } = req.body; // Step 1: Extract genderName
    const formattedName = formatGenderName(genderName); // Step 2: Format name
    const existingGender = await findGender({
      query: { genderName: formattedName },
    }); // Step 3: Check if gender exists
    if (existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_EXIST);
    const newGender = await createGenderObj({ genderName: formattedName }); // Step 4: Create gender object
    await newGender.save(); // Step 5: Save to database
    const createdGender = await findGender({
      query: { genderCode: newGender.genderCode },
      projection: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.GENDERS,
      createdGender.genderCode,
      auditChanges.CREATE_GENDER,
      null,
      createdGender,
      currentUser // Step 6: Log audit
    );
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS,
        MESSAGE_CREATE_GENDERS_SUCCESS,
        createdGender
      ) // Step 7: Send response
    );
  },

  /**
   * Updates an existing gender in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateGender: async (req, res, next) => {
    const { genderCode, genderName } = req.body; // Step 1: Extract data
    const formattedName = formatGenderName(genderName); // Step 2: Format name
    const existingGender = await findGender({ query: { genderCode } }); // Step 3: Check existence
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);
    const duplicateGender = await findGender({
      query: { genderCode: { $ne: genderCode }, genderName: formattedName },
    });
    if (duplicateGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_TAKEN);
    const previousData = await findGender({
      query: { genderCode },
      projection: true,
    }); // Step 4: Get previous data
    await updateGenderObj({ genderCode, genderName: formattedName }); // Step 5: Update
    const updatedGender = await findGender({
      query: { genderCode },
      projection: true,
    });
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.GENDERS,
      genderCode,
      auditChanges.UPDATE_GENDER,
      previousData,
      updatedGender,
      currentUser // Step 6: Log audit
    );
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(
        STATUS_CODE_SUCCESS,
        MESSAGE_UPDATE_GENDERS_SUCCESS,
        updatedGender
      ) // Step 7: Send response
    );
  },

  /**
   * Deletes a gender from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteGender: async (req, res, next) => {
    const { genderCode } = req.body; // Step 1: Extract genderCode
    const existingGender = await findGender({ query: { genderCode } }); // Step 2: Check existence
    if (!existingGender)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_GENDER_NOT_FOUND);
    const { isReferenced } = await IsObjectIdReferenced(existingGender._id); // Step 3: Check references
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );
    const previousData = await findGender({
      query: { genderCode },
      projection: true,
    }); // Step 4: Get previous data
    const deletionResult = await deleteGenderObj(genderCode); // Step 5: Delete
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_GENDERS_ERROR
      );
    console.log(req.user.userCode);
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.GENDERS,
      genderCode,
      auditChanges.DELETE_GENDER,
      previousData,
      null,
      currentUser // Step 6: Log audit
    );
    res.status(STATUS_CODE_SUCCESS).send(
      handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_GENDERS_SUCCESS) // Step 7: Send response
    );
  },
};
