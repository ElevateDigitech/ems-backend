const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  IsObjectIdReferenced,
  handleError,
  handleSuccess,
  getCurrentUser,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_STATE_EXIST,
  MESSAGE_CREATE_STATE_SUCCESS,
  MESSAGE_GET_STATES_SUCCESS,
  MESSAGE_GET_STATE_SUCCESS,
  MESSAGE_STATE_NOT_FOUND,
  MESSAGE_UPDATE_STATE_SUCCESS,
  MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_STATE_SUCCESS,
  MESSAGE_DELETE_STATE_ERROR,
  MESSAGE_STATES_NOT_FOUND,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_STATE_TAKEN,
} = require("../utils/messages");
const {
  findStates,
  findState,
  createStateObj,
  formatStateFields,
  updateStateObj,
  deleteStateObj,
} = require("../queries/states");
const { findCountry } = require("../queries/countries");

module.exports = {
  /**
   * Retrieves all states from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStates: async (req, res, next) => {
    const { start = 1, end = 10 } = req.query; // Step 1: Extract pagination parameters

    // Step 2: Retrieve all states from the database
    const states = await findStates({
      start,
      end,
      options: true,
      populated: true,
    });

    // Step 3: Send success response with the list of states
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_STATES_SUCCESS, states)
      );
  },

  /**
   * Retrieves a specific state by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStateByCode: async (req, res, next) => {
    const { stateCode } = req.body; // Step 1: Extract state code from request body

    // Step 2: Find the state by its code
    const state = await findState({
      query: { stateCode },
      options: true,
      populated: true,
    });

    // Step 3: Handle case when state is not found
    if (!state)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      );

    // Step 4: Send success response with the found state
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_STATE_SUCCESS, state)
      );
  },

  /**
   * Retrieves states by the associated country code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStatesByCountryCode: async (req, res, next) => {
    const { start = 1, end = 10 } = req.query; // Step 1: Extract pagination parameters
    const { countryCode } = req.body; // Step 2: Extract country code from request body

    // Step 3: Find the country by its code
    const country = await findCountry({ query: { countryCode } });

    // Step 4: Handle case when country is not found
    if (!country)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      );

    // Step 5: Retrieve states associated with the country
    const states = await findStates({
      query: { country: country._id },
      start,
      end,
      options: true,
      populated: true,
    });

    // Step 6: Handle case when no states are found
    if (!states?.length)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATES_NOT_FOUND
      );

    // Step 7: Send success response with the list of states
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_STATE_SUCCESS, states)
      );
  },

  /**
   * Creates a new state in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateState: async (req, res, next) => {
    const { name, iso, countryCode } = req.body; // Step 1: Extract state details from request body
    const { formattedName, formattedISO } = formatStateFields({ name, iso }); // Step 2: Format state fields

    // Step 3: Check if the state already exists
    const existingState = await findState({
      query: { $or: [{ name: formattedName }, { iso: formattedISO }] },
    });
    if (existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_EXIST);

    // Step 4: Verify if the provided country exists
    const existingCountry = await findCountry({ query: { countryCode } });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Step 5: Create a new state document
    const newState = await createStateObj({
      name: formattedName,
      iso: formattedISO,
      country: existingCountry._id,
    });
    await newState.save();

    // Step 6: Retrieve the newly created state
    const createdState = await findState({
      query: { stateCode: newState.stateCode },
      options: true,
      populated: true,
    });

    // Step 7: Log the creation action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.STATES,
      createdState.stateCode,
      auditChanges.CREATE_STATE,
      null,
      createdState.toObject(),
      currentUser.toObject()
    );

    // Step 8: Send success response with the created state
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_STATE_SUCCESS,
          createdState
        )
      );
  },

  /**
   * Updates an existing state's details in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateState: async (req, res, next) => {
    const { stateCode, name, iso, countryCode } = req.body; // Step 1: Extract state details from request body
    const { formattedName, formattedISO } = formatStateFields({ name, iso }); // Step 2: Format state fields

    // Step 3: Verify if the state exists
    const existingState = await findState({ query: { stateCode } });
    if (!existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    // Step 4: Verify if the provided country exists
    const existingCountry = await findCountry({ query: { countryCode } });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Step 5: Check for duplicate state details
    const otherStates = await findStates({
      query: {
        stateCode: { $ne: stateCode },
        $or: [{ name: formattedName }, { iso: formattedISO }],
      },
    });
    if (otherStates?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_TAKEN);

    // Step 6: Retrieve state before updating (for audit)
    const previousData = await findState({
      query: { stateCode },
      options: true,
      populated: true,
    });

    // Step 7: Update state details
    await updateStateObj({
      stateCode,
      name: formattedName,
      iso: formattedISO,
      country: existingCountry._id,
    });

    // Step 8: Retrieve updated state
    const updatedState = await findState({
      query: { stateCode },
      options: true,
      populated: true,
    });

    // Step 9: Log the update action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.STATES,
      updatedState.stateCode,
      auditChanges.UPDATE_STATE,
      previousData.toObject(),
      updatedState.toObject(),
      currentUser.toObject()
    );

    // Step 10: Send success response with the updated state
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_STATE_SUCCESS,
          updatedState
        )
      );
  },

  /**
   * Deletes a state from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteState: async (req, res, next) => {
    const { stateCode } = req.body; // Step 1: Extract state code from request body

    // Step 2: Verify if the state exists
    const existingState = await findState({ query: { stateCode } });
    if (!existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    // Step 3: Check if the state is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingState._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Retrieve state before deletion (for audit)
    const previousData = await findState({
      query: { stateCode },
      options: true,
      populated: true,
    });

    // Step 5: Delete the state
    const deleteResult = await deleteStateObj(stateCode);
    if (!deleteResult?.deletedCount)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STATE_ERROR
      );

    // Step 6: Log the deletion action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.STATES,
      previousData.stateCode,
      auditChanges.DELETE_STATE,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 7: Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_STATE_SUCCESS));
  },
};
