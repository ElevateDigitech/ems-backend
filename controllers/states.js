const moment = require("moment-timezone");
const Country = require("../models/country");
const State = require("../models/state");
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
  toCapitalize,
  IsObjectIdReferenced,
  generateStateCode,
  generateAuditCode,
  handleError,
  handleSuccess,
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

const findUser = async (userCode) =>
  // Find a user by userCode
  await User.findOne({ userCode }, hiddenFieldsUser)
    // Populate the role information for the user
    .populate({
      path: "role",
      select: hiddenFieldsDefault,
      // Populate the rolePermissions associated with the role
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

const findState = async (criteria) =>
  // Find a single state matching the provided criteria
  await State.findOne(criteria, hiddenFieldsDefault)
    // Populate the associated country information for the state
    .populate("country", hiddenFieldsDefault);

const findStates = async (criteria = {}, limit) =>
  // Find all states that match the provided criteria (or all if none specified)
  await State.find(criteria, hiddenFieldsDefault)
    // Populate the associated country information for each state
    .populate("country", hiddenFieldsDefault)
    .limit(limit);

module.exports = {
  /**
   * Retrieves all states from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetStates: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Retrieve all states from the database
    const states = await findStates({}, entries);

    // Send success response with the list of states
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
    // Extract state code from request body
    const { stateCode } = req.body;

    // Find the state by its code
    const state = await findState({ stateCode });

    // Handle case when state is not found
    if (!state)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATE_NOT_FOUND
      );

    // Send success response with the found state
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
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Extract country code from request body
    const { countryCode } = req.body;

    // Find the country by its code
    const country = await Country.findOne({ countryCode });

    // Handle case when country is not found
    if (!country)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_COUNTRY_NOT_FOUND
      );

    // Retrieve states associated with the country
    const states = await findStates({ country: country._id }, entries);

    // Handle case when no states are found
    if (!states?.length)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STATES_NOT_FOUND
      );

    // Send success response with the list of states
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
    // Extract state details from request body
    const { name, iso, countryCode } = req.body;

    // Check if the state already exists
    const existingState = await State.findOne({
      $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
    });
    if (existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_EXIST);

    // Verify if the provided country exists
    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Generate unique code for the new state
    const stateCode = generateStateCode();

    // Create a new state document
    const newState = new State({
      stateCode,
      name: toCapitalize(name),
      iso: iso.toUpperCase(),
      country: existingCountry._id,
    });
    await newState.save();

    // Retrieve the newly created state
    const createdState = await findState({ stateCode });

    // Log the creation action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.STATES,
      createdState.stateCode,
      auditChanges.CREATE_STATE,
      null,
      createdState.toObject(),
      currentUser.toObject()
    );

    // Send success response with the created state
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
    // Extract state details from request body
    const { stateCode, name, iso, countryCode } = req.body;

    // Verify if the state exists
    const existingState = await State.findOne({ stateCode });
    if (!existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    // Verify if the provided country exists
    const existingCountry = await Country.findOne({ countryCode });
    if (!existingCountry)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_COUNTRY_NOT_FOUND);

    // Check for duplicate state details
    const otherStates = await State.find({
      stateCode: { $ne: stateCode },
      $or: [{ name: toCapitalize(name) }, { iso: iso.toUpperCase() }],
    });
    if (otherStates?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_TAKEN);

    // Retrieve state before updating (for audit)
    const stateBeforeUpdate = await findState({ stateCode });

    // Update state details
    await State.findOneAndUpdate(
      { stateCode },
      {
        name: toCapitalize(name),
        iso: iso.toUpperCase(),
        country: existingCountry._id,
        updatedAt: moment().valueOf(),
      }
    );

    // Retrieve updated state
    const updatedState = await findState({ stateCode });

    // Log the update action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.STATES,
      updatedState.stateCode,
      auditChanges.UPDATE_STATE,
      stateBeforeUpdate.toObject(),
      updatedState.toObject(),
      currentUser.toObject()
    );

    // Send success response with the updated state
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
    // Extract state code from request body
    const { stateCode } = req.body;

    // Verify if the state exists
    const existingState = await State.findOne({ stateCode });
    if (!existingState)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STATE_NOT_FOUND);

    // Check if the state is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingState._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Retrieve state before deletion (for audit)
    const previousData = await findState({ stateCode });

    // Delete the state
    const deleteResult = await State.deleteOne({ stateCode });
    if (!deleteResult?.deletedCount)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STATE_ERROR
      );

    // Log the deletion action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.STATES,
      previousData.stateCode,
      auditChanges.DELETE_STATE,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_STATE_SUCCESS));
  },
};
