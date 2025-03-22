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
  MESSAGE_GET_SUB_STRANDS_SUCCESS,
  MESSAGE_SUB_STRAND_NOT_FOUND,
  MESSAGE_GET_SUB_STRAND_SUCCESS,
  MESSAGE_SUB_STRAND_EXIST,
  MESSAGE_CREATE_SUB_STRANDS_SUCCESS,
  MESSAGE_SUB_STRAND_TAKEN,
  MESSAGE_UPDATE_SUB_STRANDS_SUCCESS,
  MESSAGE_SUB_STRAND_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_SUB_STRANDS_ERROR,
  MESSAGE_DELETE_SUB_STRANDS_SUCCESS,
  MESSAGE_STRAND_NOT_FOUND,
  MESSAGE_STRAND_EXIST,
} = require("../utils/messages");
const {
  findSubStrands,
  findSubStrand,
  formatSubStrandTitle,
  createSubStrandObj,
  updateSubStrandObj,
  deleteSubStrandObj,
} = require("../queries/subStrands");
const { findUser } = require("../queries/users");
const { findStrand } = require("../queries/strands");

module.exports = {
  /**
   * Retrieves all sub strands from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetSubStrands: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findSubStrands({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 3: Send the retrieved sub strands in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_SUB_STRANDS_SUCCESS,
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
  GetSubStrandByCode: async (req, res, next) => {
    const { subStrandCode } = req.body; // Step 1: Extract sub strand code from request
    const subStrandDetails = await findSubStrand({
      query: { subStrandCode },
      populate: true,
      projection: true,
    }); // Step 2: Find sub strand in database

    // Step 3: Return the sub strand details if found, otherwise handle error
    return subStrandDetails
      ? res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_GET_SUB_STRAND_SUCCESS,
              subStrandDetails
            )
          )
      : handleError(
          next,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_SUB_STRAND_NOT_FOUND
        );
  },

  /**
   * Retrieves sub strands associated with a specific strand code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetSubStrandsByStrandCode: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const { strandCode } = req.body;
    const foundStrand = await findStrand({
      query: {
        strandCode,
      },
    }); // Step 2: Find the strand using the provided strand code

    if (!foundStrand)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STRAND_NOT_FOUND
      ); // Step 3: Handle error if strand not found

    const { results, totalCount } = await findSubStrands({
      query: { strand: foundStrand._id },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });
    // Step 3: Send the retrieved sub strands in the response
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          results?.length === 0
            ? MESSAGE_STRAND_NOT_FOUND
            : MESSAGE_GET_SUB_STRANDS_SUCCESS,
          results?.length === 0 ? [] : results,
          results?.length === 0 ? 0 : totalCount
        )
      );
  },

  /**
   * Creates a new sub strand in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateSubStrand: async (req, res, next) => {
    const { title, strandCode } = req.body;
    const formattedTitle = formatSubStrandTitle(title); // Step 1: Format sub strand fields

    const existingSubStrand = await findSubStrand({
      query: { title: formattedTitle },
    });
    if (existingSubStrand) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_EXIST);
    } // Step 2: Check if sub strand already exists

    const existingStrand = await findStrand({ query: { strandCode } });
    if (!existingStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_NOT_FOUND);
    // Step 3: Validate strand

    const subStrand = createSubStrandObj({
      title: formattedTitle,
      strandId: existingStrand._id,
    }); // Step 4: Create new sub strand

    await subStrand.save(); // Step 5: Save the new sub strand

    const createdSubStrand = await findSubStrand({
      query: { subStrandCode: subStrand.subStrandCode },
      projection: true,
      populate: true,
    }); // Step 6: Retrieve the newly created sub strand

    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.CREATE,
      auditCollections.SUB_STRANDS,
      createdSubStrand.subStrandCode,
      auditChanges.CREATE_SUB_STRAND,
      null,
      createdSubStrand,
      currentUser
    ); // Step 7: Log the creation action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_SUB_STRANDS_SUCCESS,
          createdSubStrand
        )
      ); // Step 8: Send the created sub strand in the response
  },

  /**
   * Updates an existing sub strand's details.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateSubStrand: async (req, res, next) => {
    const { subStrandCode, title, strandCode } = req.body;
    const formattedTitle = formatSubStrandTitle(title); // Step 1: Format sub strand fields

    const existingSubStrand = await findSubStrand({ query: { subStrandCode } });
    if (!existingSubStrand)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUB_STRAND_NOT_FOUND
      );
    // Step 2: Find the existing sub strand

    const existingStrand = await findStrand({ query: { strandCode } });
    if (!existingStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STRAND_NOT_FOUND);
    // Step 3: Validate class

    const duplicateSubStrand = await findSubStrand({
      query: { title: formattedTitle, subStrandCode: { $ne: subStrandCode } },
    });
    if (duplicateSubStrand)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SUB_STRAND_TAKEN);
    // Step 4: Check for sub strand title conflicts

    const previousData = await findSubStrand({
      query: { subStrandCode },
      projection: true,
      populate: true,
    });

    await updateSubStrandObj({
      subStrandCode,
      title: formattedTitle,
      strandId: existingStrand._id,
    }); // Step 5: Update the sun strand in the database

    const updatedSection = await findSubStrand({
      query: { subStrandCode },
      projection: true,
      populate: true,
    }); // Step 6: Log the update action

    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    await logAudit(
      auditActions.UPDATE,
      auditCollections.SUB_STRANDS,
      subStrandCode,
      auditChanges.UPDATE_SUB_STRAND,
      previousData,
      updatedSection,
      currentUser
    ); // Step 6: Log the update action

    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_SUB_STRANDS_SUCCESS,
          updatedSection
        )
      ); // Step 7: Send the updated sub strand in the response
  },

  /**
   * Deletes a sub strand from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteSubStrand: async (req, res, next) => {
    const { subStrandCode } = req.body; // Step 1: Extract sub strand code from request

    // Step 2: Validate if the sub strand exists
    const existingSubStrand = await findSubStrand({ query: { subStrandCode } });
    if (!existingSubStrand)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUB_STRAND_NOT_FOUND
      );

    // Step 3: Check if the sub strand is referenced elsewhere
    const { isReferenced } = await isObjectIdReferenced(existingSubStrand._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_SUB_STRAND_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Delete the sub strand
    const previousData = await findSubStrand({
      query: { subStrandCode },
      populate: true,
      projection: true,
    });
    const deletionResult = await deleteSubStrandObj(subStrandCode);
    if (deletionResult.deletedCount === 0)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_SUB_STRANDS_ERROR
      );

    // Step 5: Log the deletion in the audit logs
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.DELETE,
      auditCollections.SUB_STRANDS,
      subStrandCode,
      auditChanges.DELETE_SUB_STRAND,
      previousData,
      null,
      currentUser
    );

    // Step 6: Send deletion success message
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_SUB_STRANDS_SUCCESS)
      );
  },
};
