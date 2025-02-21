const passport = require("passport");
const allRegex = require("../utils/allRegex");
const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  trimAndTestRegex,
  getInvalidRole,
  getRoleId,
  IsObjectIdReferenced,
  validateRequiredFields,
} = require("../utils/helpers");
const {
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_CONFLICT,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_UNAUTHENTICATED,
} = require("../utils/statusCodes");
const {
  MESSAGE_MISSING_REQUIRED_FIELDS,
  MESSAGE_INVALID_EMAIL_FORMAT,
  MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET,
  MESSAGE_EMAIL_USERNAME_EXIST,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_USER_REGISTER_SUCCESS,
  MESSAGE_UNAUTHENTICATED,
  MESSAGE_USER_LOGIN_SUCCESS,
  MESSAGE_USER_LOGOUT_SUCCESS,
  MESSAGE_EMAIL_USERNAME_NOT_EXIST,
  MESSAGE_OLD_PASSWORD_ERROR,
  MESSAGE_PASSWORD_CHANGE_SUCCESS,
  MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_USER_NOT_ALLOWED_DELETE,
  MESSAGE_DELETE_USER_ERROR,
  MESSAGE_DELETE_USER_SUCCESS,
  MESSAGE_GET_USERS_SUCCESS,
  MESSAGE_USER_NOT_FOUND,
  MESSAGE_ROLE_NOT_FOUND,
  MESSAGE_UPDATE_USER_SUCCESS,
  MESSAGE_ACCESS_DENIED_NO_PERMISSION,
} = require("../utils/messages");
const {
  findUsers,
  findUser,
  createUserObj,
  deleteUserObj,
} = require("../queries/users");

module.exports = {
  /**
   * Registers a new user in the system.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  register: async (req, res, next) => {
    const {
      email,
      username,
      password,
      userAllowDeletion = true,
      roleCode,
    } = req.body; // Extracting required fields from the request body

    // Validate required fields
    if (!validateRequiredFields([email, username, password])) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      ); // Return error if required fields are missing
    }

    // Validate email format
    if (!trimAndTestRegex(email, allRegex?.VALID_EMAIL)) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_INVALID_EMAIL_FORMAT
      ); // Return error if email format is invalid
    }

    // Validate password constraints
    if (!trimAndTestRegex(password, allRegex?.VALID_PASSWORD)) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET
      ); // Return error if password does not meet constraints
    }
    const existingUser = await findUser({
      query: {
        $or: [{ email: email.trim().toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_EXIST
      ); // Return error if email or username already exists
    }

    // Validate role code
    const isRoleInvalid = await getInvalidRole(roleCode);
    if (isRoleInvalid) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_ROLE_NOT_FOUND); // Return error if role is invalid
    }

    // Retrieve role ID based on role code
    const roleId = await getRoleId(roleCode);

    const user = await createUserObj({
      email,
      username,
      userAllowDeletion,
      roleId,
    });

    // Retrieve the newly created user
    const createdUser = await findUser({
      query: { userCode: user.userCode },
      options: true,
      populated: true,
    });

    //: Retrieve the current user performing the registration
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    //: Log the audit for user creation
    await logAudit(
      auditActions.CREATE, // Specify audit action
      auditCollections.USERS, // Specify audit collection
      createdUser.userCode, // Reference created user's code
      auditChanges.CREATE_USER, // Specify change type
      null, // No old data for creation
      createdUser, // New user data
      currentUser // Current user data
    );

    //: Send success response with created user details
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_USER_REGISTER_SUCCESS,
          createdUser
        )
      );
  },

  /**
   * Handles user login using Passport.js local strategy.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  login: async (req, res, next) => {
    // Authenticate the user using the local strategy
    passport.authenticate("local", async (err, user, info) => {
      // Handle any server errors that occur during authentication
      if (err) {
        return handleError(
          next,
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          info?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
        );
      }

      // If authentication fails and no user is found, return an unauthenticated error
      if (!user) {
        return handleError(
          next,
          STATUS_CODE_UNAUTHENTICATED,
          MESSAGE_UNAUTHENTICATED
        );
      }

      // Log in the authenticated user
      req.login(user, async (err) => {
        // Handle any errors that occur during the login process
        if (err) {
          return handleError(
            next,
            STATUS_CODE_INTERNAL_SERVER_ERROR,
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          );
        }

        // Retrieve the current user details using the user code
        const currentUser = await findUser({
          query: { userCode: user.userCode },
          projection: true,
          populate: true,
        });

        // Log the login action in the audit log
        await logAudit(
          auditActions.LOGIN, // Specify the login action
          auditCollections.USERS, // Specify the collection being audited
          currentUser.userCode, // Include the current user's code
          auditChanges.LOGIN_USER, // Specify the change type (user login)
          null, // No old value for login action
          null, // No new value for login action
          currentUser // Include the current user's details
        );

        // Send a successful login response with the current user's information
        res
          .status(STATUS_CODE_SUCCESS)
          .send(
            handleSuccess(
              STATUS_CODE_SUCCESS,
              MESSAGE_USER_LOGIN_SUCCESS,
              currentUser
            )
          );
      });
    })(req, res, next);
  },

  /**
   * Handles user logout process.
   *
   * @param {Object} req - Express request object containing user session information
   * @param {Object} res - Express response object to send the response back to the client
   * @param {Function} next - Express next middleware function to handle errors
   */
  logout: async (req, res, next) => {
    try {
      // Retrieve the current user using the user code from the request object
      const currentUser = await findUser({
        query: { userCode: req.user.userCode },
        projection: true,
        populate: true,
      });

      // Call the logout function provided by the session handler (like Passport.js)
      req.logout(async (err) => {
        // Handle any errors that occur during the logout process
        if (err) {
          return handleError(
            next, // Middleware error handler
            STATUS_CODE_INTERNAL_SERVER_ERROR, // HTTP status code for internal server errors
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR // Error message to be sent
          );
        }

        // Log the logout event for audit purposes
        await logAudit(
          auditActions.LOGOUT, // Define the action as LOGOUT
          auditCollections.USERS, // Specify the collection related to the audit (USERS)
          currentUser.userCode, // Include the user code in the audit log
          auditChanges.LOGOUT_USER, // Detail the specific change (logout)
          null, // No old value required for logout
          null, // No new value required for logout
          currentUser // Convert user data to plain object for logging
        );

        // Send a success response to the client confirming successful logout
        res
          .status(STATUS_CODE_SUCCESS) // HTTP status code for success
          .send(
            handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_USER_LOGOUT_SUCCESS)
          ); // Send success message
      });
    } catch (error) {
      // Catch any unexpected errors and pass them to the error handler
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  },

  /**
   * Handles the password change request for a user.
   *
   * @param {Object} req - Express request object containing email/username, oldPassword, and newPassword.
   * @param {Object} res - Express response object for sending responses.
   * @param {Function} next - Express next middleware function for error handling.
   */
  changePassword: async (req, res, next) => {
    const { email, username, oldPassword, newPassword } = req.body;

    // Validate that all required fields are provided
    if (
      !validateRequiredFields([email, oldPassword, newPassword]) &&
      !validateRequiredFields([username, oldPassword, newPassword])
    ) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Find the existing user using either email or username
    const existingUser = await findUser({
      query: {
        $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
      },
    });

    // Handle case where user does not exist
    if (!existingUser) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_NOT_EXIST
      );
    }

    // Authenticate the user with the provided old password
    const isAuthenticated = await existingUser.authenticate(oldPassword);

    // Handle case where old password does not match
    if (!isAuthenticated?.user) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_OLD_PASSWORD_ERROR
      );
    }

    // Set the new password for the user
    await existingUser.setPassword(newPassword);

    // Save the updated user information to the database
    await existingUser.save();

    // Retrieve the current user information for auditing purposes
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    // Log the password change action in the audit logs
    await logAudit(
      auditActions.CHANGE,
      auditCollections.USERS,
      currentUser.userCode,
      auditChanges.CHANGE_PASSWORD,
      null,
      null,
      currentUser
    );

    //: Send a success response indicating password change was successful
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_PASSWORD_CHANGE_SUCCESS)
      );
  },

  /**
   * Changes the password for an existing user.
   *
   * @param {Object} req - Express request object containing email/username, oldPassword, and newPassword.
   * @param {Object} res - Express response object to send the result of the operation.
   * @param {Function} next - Express next middleware function to handle errors.
   */
  changeOwnPassword: async (req, res, next) => {
    const { email, username, oldPassword, newPassword } = req.body;

    // Validate that all required fields are provided.
    if (
      !validateRequiredFields([email, oldPassword, newPassword]) &&
      !validateRequiredFields([username, oldPassword, newPassword])
    ) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Check if the user exists in the database using email or username.
    const existingUser = await findUser({
      query: {
        $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
      },
    });

    if (!existingUser) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_NOT_EXIST
      );
    }

    // Verify if the requesting user has permission to change the password.
    if (req.user?.userCode && req.user?.userCode !== existingUser.userCode) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_ACCESS_DENIED_NO_PERMISSION
      );
    }

    // Authenticate the old password.
    const isAuthenticated = await existingUser.authenticate(oldPassword);
    if (!isAuthenticated?.user) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_OLD_PASSWORD_ERROR
      );
    }

    // Set the new password for the user and save the changes to the database.
    await existingUser.setPassword(newPassword);
    await existingUser.save();

    // Log the password change event for auditing purposes.
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });
    await logAudit(
      auditActions.CHANGE,
      auditCollections.USERS,
      currentUser.userCode,
      auditChanges.CHANGE_PASSWORD,
      null,
      null,
      currentUser
    );

    // Send a success response to the client.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_PASSWORD_CHANGE_SUCCESS)
      );
  },

  /**
   * Retrieves all users from the database along with their roles and permissions.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetUsers: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findUsers({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });
    // Send a success response with the retrieved users
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_USERS_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Retrieves the authenticated user's own information.
   *
   * @param {Object} req - Express request object containing the authenticated user
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetOwnUser: (req, res, next) => {
    // Send a success response with the authenticated user's information
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_USERS_SUCCESS, req.user)
      );
  },

  /**
   * Retrieves a specific user by their unique user code.
   *
   * @param {Object} req - Express request object containing the user code in the body
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetUserById: async (req, res, next) => {
    const { userCode } = req.query; // Extract user code from the request body

    // Validate if the user code is provided
    if (!userCode?.trim()) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Retrieve the user based on the provided user code
    const requestedUser = await findUser({
      query: { userCode },
      projection: true,
      populate: true,
    });

    // Check if the user exists
    if (!requestedUser) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);
    }

    // Send a success response with the retrieved user's information
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_USERS_SUCCESS,
          requestedUser
        )
      );
  },

  /**
   * Updates a user's information in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateUser: async (req, res, next) => {
    const { userCode, email, username } = req.body;

    // Validate required fields
    if (!validateRequiredFields([userCode, email, username])) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Check if the user exists in the database
    const existingUser = await findUser({ query: { userCode } });
    if (!existingUser) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);
    }

    // Check for duplicate email or username (excluding the current user)
    const duplicateUser = await findUser({
      query: {
        userCode: { $ne: userCode },
        $or: [{ email: email.trim().toLowerCase() }, { username }],
      },
    });
    if (duplicateUser) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_EXIST
      );
    }

    // Retrieve current user data before the update for audit logging
    const userBeforeUpdate = await findUser({
      query: { userCode },
      projection: true,
      populate: true,
    });

    // Update the user's email and username
    await updatedUser({ userCode, username, email });

    // Retrieve the updated user data
    const updatedUser = await findUser({
      query: { userCode },
      projection: true,
      populate: true,
    });

    if (!updatedUser) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);
    }

    // Retrieve current user information for audit logging
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    // Log the update action in the audit log
    await logAudit(
      auditActions.UPDATE,
      auditCollections.USERS,
      updatedUser.userCode,
      auditChanges.UPDATE_USER,
      userBeforeUpdate,
      updatedUser,
      currentUser
    );

    // Send a success response with the updated user data
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_USER_SUCCESS,
          updatedUser
        )
      );
  },

  /**
   * Deletes a user from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteUser: async (req, res, next) => {
    // Extracting userCode from the request body
    const { userCode } = req.body;

    // Validate the userCode
    if (!userCode?.trim()) {
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      );
    }

    // Check if the user exists in the database
    const existingUser = await findUser({ query: { userCode } });
    if (!existingUser) {
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_USER_NOT_FOUND);
    }

    // Verify if the user is allowed to be deleted
    if (!existingUser.userAllowDeletion) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_USER_NOT_ALLOWED_DELETE
      );
    }

    // Check if the user is referenced elsewhere in the system
    const { isReferenced } = await IsObjectIdReferenced(existingUser._id);
    if (isReferenced) {
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );
    }

    // Retrieve user details before deletion for audit purposes
    const previousData = await findUser({
      query: { userCode },
      projection: true,
      populate: true,
    });

    // Attempt to delete the user
    const userDeletionResult = await deleteUserObj(userCode);
    if (userDeletionResult?.deletedCount === 0) {
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_USER_ERROR
      );
    }

    // Retrieve the current user performing the deletion for audit logging
    const currentUser = await findUser({
      query: { userCode: req.user.userCode },
      projection: true,
      populate: true,
    });

    // Log the deletion action in the audit logs
    await logAudit(
      auditActions.DELETE,
      auditCollections.USERS,
      userCode,
      auditChanges.DELETE_USER,
      previousData,
      null,
      currentUser
    );

    // Send a success response to the client
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_USER_SUCCESS));
  },
};
