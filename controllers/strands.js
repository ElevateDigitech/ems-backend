const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  isObjectIdReferenced,
} = require("../utils/helpers");
const {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_GET_STRANDS_SUCCESS,
  MESSAGE_STRAND_NOT_FOUND,
  MESSAGE_GET_STRAND_SUCCESS,
  MESSAGE_STRAND_EXIST,
  MESSAGE_CREATE_STRANDS_SUCCESS,
  MESSAGE_STRAND_TAKEN,
  MESSAGE_UPDATE_STRANDS_SUCCESS,
  MESSAGE_STRAND_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_STRANDS_ERROR,
  MESSAGE_DELETE_STRANDS_SUCCESS,
} = require("../utils/messages");
const {
  findStrands,
  findStrand,
  formatStrandTitle,
  createStrandObj,
  updateStrandObj,
  deleteStrandObj,
} = require("../queries/strands");
const { findUser } = require("../queries/users");

module.exports = {
  /**
   * Retrieves all strands from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetStrands: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findStrands({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      projection: true,
    });

    // Step 3: Send the retrieved strands in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STRANDS_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Retrieves a strand by its unique strand code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStrandByCode: async (req, res, next) => {
    const { strandCode } = req.body; // Step 1: Extract strand code from request
    const strandDetails = await findStrand({
      query: { strandCode },
      projection: true,
    }); // Step 2: Find strand in database

    // Step 3: Return the strand details if found, otherwise handle error
    return strandDetails
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_STRAND_SUCCESS,
              strandDetails
            )
          )
      : handleError(next, STATUS_CODE_BAD_REQUEST, MESSAGE_STRAND_NOT_FOUND);
  },

  /**
   * Creates a new strand in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateStrand: async (req, res, next) => {
    const { title } = req.body; // Step 1: Extract strand title from request
    const formattedTitle = formatStrandTitle(title); // Step 2: Format strand title

    // Step 3: Check if the strand already exists
    const existingStrand = await findStrand({
      query: { title: formattedTitle },
    });
    if (existingStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_EXIST);

    // Step 4: Create and save the new strand
    const newStrand = createStrandObj({ title: formattedTitle });
    await newStrand.save();

    // Step 5: Log the creation in audit logs
    const createdStrand = await findStrand({
      query: { strandCode: newStrand.strandCode },
      projection: true,
    });

    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.CREATE,
      auditCollections.STRANDS,
      createdStrand.strandCode,
      auditChanges.CREATE_STRAND,
      null,
      createdStrand,
      currentUser
    );

    // Step 6: Send the created strand as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_STRANDS_SUCCESS,
          createdStrand
        )
      );
  },

  /**
   * Updates an existing strand in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateStrand: async (req, res, next) => {
    const { strandCode, title } = req.body; // Step 1: Extract strand code and new title
    const formattedTitle = formatStrandTitle(title); // Step 2: Format strand title

    // Step 3: Validate if the strand exists
    const existingStrand = await findStrand({ query: { strandCode } });
    if (!existingStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_NOT_FOUND);

    // Step 4: Check for title conflicts with other strands
    const duplicateStrand = await findStrand({
      query: { strandCode: { $ne: strandCode }, title: formattedTitle },
    });
    if (duplicateStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_TAKEN);

    // Step 5: Capture current strand data before update
    const previousData = await findStrand({
      query: { strandCode },
      projection: true,
    });

    // Step 6: Update the strand details
    await updateStrandObj({ strandCode, title: formattedTitle });

    // Step 7: Log the update in the audit logs
    const updatedStrand = await findStrand({
      query: { strandCode },
      projection: true,
    });
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.UPDATE,
      auditCollections.STRANDS,
      strandCode,
      auditChanges.UPDATE_STRAND,
      previousData,
      updatedStrand,
      currentUser
    );

    // Step 8: Send the updated strand as the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_STRANDS_SUCCESS,
          updatedStrand
        )
      );
  },

  /**
   * Deletes a strand from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteStrand: async (req, res, next) => {
    const { strandCode } = req.body; // Step 1: Extract strand code from request

    // Step 2: Validate if the strand exists
    const existingStrand = await findStrand({ query: { strandCode } });
    if (!existingStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_NOT_FOUND);

    // Step 3: Check if the sub strand is referenced elsewhere
    const { isReferenced } = await isObjectIdReferenced(existingStrand._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STRAND_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the sub strand
    const previousData = await findStrand({
      query: { strandCode },
      projection: true,
    });
    const deletionResult = await deleteStrandObj(strandCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STRANDS_ERROR
      );

    // Step 5: Log the deletion in the audit logs
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.DELETE,
      auditCollections.STRANDS,
      strandCode,
      auditChanges.DELETE_STRAND,
      previousData,
      null,
      currentUser
    );

    // Step 6: Send deletion success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_STRANDS_SUCCESS));
  },
};
