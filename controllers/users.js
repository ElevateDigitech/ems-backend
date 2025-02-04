const passport = require("passport");
const User = require("../models/user");
const ExpressResponse = require("../utils/ExpressResponse");
const allRegex = require("../utils/allRegex");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  trimAndTestRegex,
  getInvalidRole,
  getRoleId,
  IsObjectIdReferenced,
  generateUserCode,
  generateAuditCode,
} = require("../utils/helpers");
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");
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

module.exports.register = async (req, res, next) => {
  // Extract relevant properties from the request body, setting `userAllowDeletion` to `true` by default.
  const {
    email,
    username,
    password,
    userAllowDeletion = true,
    roleCode,
  } = req.body;

  // Validate that required fields (email, username, and password) are not empty or contain only whitespace.
  if (![email, username, password].every((field) => field?.trim()?.length)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      )
    );
  }

  // Verify if the provided email matches the required format using a regex pattern.
  if (!trimAndTestRegex(email, allRegex?.VALID_EMAIL)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_INVALID_EMAIL_FORMAT
      )
    );
  }

  // Validate if the password meets the required constraints defined by a regex pattern.
  if (!trimAndTestRegex(password, allRegex?.VALID_PASSWORD)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET
      )
    );
  }

  // Check if a user with the same email or username already exists in the database.
  const existingUser = await User.findOne({
    $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
  });

  // If a duplicate email or username is found, return a conflict error response.
  if (existingUser) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_EXIST
      )
    );
  }

  // Validate if the provided `roleCode` is valid.
  const isRoleInvalid = await getInvalidRole(roleCode);
  if (isRoleInvalid) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_ROLE_NOT_FOUND
      )
    );
  }

  // Retrieve the role ID associated with the given `roleCode`.
  const roleId = await getRoleId(roleCode);

  // Generate a unique `userCode` for the new user.
  const userCode = generateUserCode();

  // Create a new `User` instance with the provided details.
  const user = new User({
    userCode,
    email: email?.trim()?.toLowerCase(),
    username,
    userAllowDeletion,
    role: roleId,
  });

  // Register the new user with the provided password.
  const registeredUser = await User.register(user, password);

  // Retrieve the newly created user from the database, excluding certain fields,
  // and populate associated role and permission details.
  const createdUser = await User.findOne(
    { userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Retrieve the currently logged-in user's `_id` using their `userCode`.
  const currentUser = await User.findOne(
    { userCode: req.user.userCode },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  // Log the creation of a new user in the audit system.
  await logAudit(
    generateAuditCode(),
    auditActions?.CREATE,
    auditCollections?.USERS,
    createdUser?.userCode,
    auditChanges?.CREATE_USER,
    null,
    createdUser?.toObject(),
    currentUser?.toObject()
  );

  // Send a success response with the newly registered user details.
  res
    .status(STATUS_CODE_SUCCESS)
    .send(
      new ExpressResponse(
        STATUS_SUCCESS,
        STATUS_CODE_SUCCESS,
        MESSAGE_USER_REGISTER_SUCCESS,
        createdUser
      )
    );
};

module.exports.login = async (req, res, next) => {
  try {
    // Authenticate the user using the provided `username` and `password` from the request body.
    passport.authenticate("local", async (err, user, info) => {
      // Handle any errors that occur during the authentication process.
      if (err) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_INTERNAL_SERVER_ERROR,
            info?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
      }

      // If authentication fails and no user object is returned, send an unauthenticated response.
      if (!user) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_UNAUTHENTICATED,
            MESSAGE_UNAUTHENTICATED
          )
        );
      }

      // Retrieve the authenticated user's details from the database, excluding certain fields,
      // and populate role and permission information.
      const currentUser = await User.findOne(
        { userCode: user.userCode },
        hiddenFieldsUser
      ).populate({
        path: "role",
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions",
          select: hiddenFieldsDefault,
        },
      });

      // Attempt to log the user in.
      req.login(user, async (err) => {
        // If an error occurs during login, return an internal server error response.
        if (err) {
          return next(
            new ExpressResponse(
              STATUS_ERROR,
              STATUS_CODE_INTERNAL_SERVER_ERROR,
              err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
            )
          );
        }

        // Log the successful login action in the audit system.
        await logAudit(
          generateAuditCode(),
          auditActions?.LOGIN,
          auditCollections?.USERS,
          currentUser?.userCode,
          auditChanges?.LOGIN_USER,
          null,
          null,
          currentUser?.toObject()
        );

        // Send a success response with the logged-in user's details.
        res
          .status(STATUS_CODE_SUCCESS)
          .send(
            new ExpressResponse(
              STATUS_SUCCESS,
              STATUS_CODE_SUCCESS,
              MESSAGE_USER_LOGIN_SUCCESS,
              currentUser
            )
          );
      });
    })(req, res, next);
  } catch (e) {
    // Handle any unexpected errors and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        e?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.logout = (req, res, next) => {
  const currentUserCode = req?.user?.userCode;

  try {
    // Attempt to log the user out.
    req.logout(async function (err) {
      // If an error occurs during logout, return an internal server error response.
      if (err) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_INTERNAL_SERVER_ERROR,
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
      }

      // Retrieve the current user's details from the database, excluding certain fields,
      // and populate role and permission information.
      const currentUser = await User.findOne(
        { userCode: currentUserCode },
        hiddenFieldsUser
      ).populate({
        path: "role",
        select: hiddenFieldsDefault,
        populate: {
          path: "rolePermissions",
          select: hiddenFieldsDefault,
        },
      });

      // Log the successful logout action in the audit system.
      await logAudit(
        generateAuditCode(),
        auditActions?.LOGOUT,
        auditCollections?.USERS,
        currentUser?.userCode,
        auditChanges?.LOGOUT_USER,
        null,
        null,
        currentUser?.toObject()
      );

      // Send a success response indicating the user has been logged out.
      res
        .status(STATUS_CODE_SUCCESS)
        .send(
          new ExpressResponse(
            STATUS_SUCCESS,
            STATUS_CODE_SUCCESS,
            MESSAGE_USER_LOGOUT_SUCCESS
          )
        );
    });
  } catch (e) {
    // Handle any unexpected errors and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        e?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    // Extract relevant fields from the request body.
    const { email, username, oldPassword, newPassword } = req.body;

    // Validate that either email or username, along with oldPassword and newPassword, are provided and not empty.
    if (
      ![email, oldPassword, newPassword].every(
        (field) => field?.trim()?.length
      ) &&
      ![username, oldPassword, newPassword].every(
        (field) => field?.trim()?.length
      )
    ) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    // Search the database for a user with the provided email or username.
    const existingUser = await User.findOne({
      $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
    });

    // If no matching user is found, return an error response.
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_EMAIL_USERNAME_NOT_EXIST
        )
      );
    }

    // Authenticate the user using the provided old password.
    const isAuthenticated = await existingUser.authenticate(oldPassword);

    // If authentication fails, return an error response.
    if (!isAuthenticated.user) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_OLD_PASSWORD_ERROR
        )
      );
    }

    // Update the user's password with the new password.
    await existingUser.setPassword(newPassword);

    // Save the updated user information in the database.
    await existingUser.save();

    // Retrieve the current logged-in user's details, including role and permissions.
    const currentUser = await User.findOne(
      { userCode: req.user.userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    // Log the password change action for auditing purposes.
    await logAudit(
      generateAuditCode(),
      auditActions?.CHANGE,
      auditCollections?.USERS,
      currentUser?.userCode,
      auditChanges?.CHANGE_PASSWORD,
      null,
      null,
      currentUser?.toObject()
    );

    // Send a success response indicating that the password has been changed.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_PASSWORD_CHANGE_SUCCESS
        )
      );
  } catch (error) {
    // Handle any errors and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.changeOwnPassword = async (req, res, next) => {
  try {
    // Extract email, username, old password, and new password from the request body.
    const { email, username, oldPassword, newPassword } = req.body;

    // Validate that either email or username is provided along with old and new passwords.
    if (
      ![email, oldPassword, newPassword].every(
        (field) => field?.trim()?.length
      ) &&
      ![username, oldPassword, newPassword].every(
        (field) => field?.trim()?.length
      )
    ) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    // Search for a user in the database by email or username.
    const existingUser = await User.findOne({
      $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
    });

    // If no user is found, return an error response.
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_EMAIL_USERNAME_NOT_EXIST
        )
      );
    }

    // Check if the logged-in user's userCode matches the target user's userCode.
    if (req.user?.userCode && req.user?.userCode !== existingUser.userCode) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_ACCESS_DENIED_NO_PERMISSION
        )
      );
    }

    // Authenticate the user using the provided old password.
    const isAuthenticated = await existingUser.authenticate(oldPassword);

    // If authentication fails, return an error response.
    if (!isAuthenticated.user) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_OLD_PASSWORD_ERROR
        )
      );
    }

    // Set and save the new password for the user.
    await existingUser.setPassword(newPassword);
    await existingUser.save();

    // Retrieve the currently logged-in user details, including role and permissions.
    const currentUser = await User.findOne(
      { userCode: req.user.userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    // Log the password change event for auditing.
    await logAudit(
      generateAuditCode(),
      auditActions?.CHANGE,
      auditCollections?.USERS,
      currentUser?.userCode,
      auditChanges?.CHANGE_PASSWORD,
      null,
      null,
      currentUser?.toObject()
    );

    // Respond with a success message indicating the password change was successful.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_PASSWORD_CHANGE_SUCCESS
        )
      );
  } catch (error) {
    // Handle any errors and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.GetUsers = async (req, res, next) => {
  try {
    // Retrieve all users from the database, excluding specified fields.
    // Populate each user's role and associated role permissions while excluding unnecessary fields.
    const allUsers = await User.find({}, hiddenFieldsUser).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    // Respond with a success message and the retrieved user data.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_USERS_SUCCESS,
          allUsers
        )
      );
  } catch (error) {
    // Handle any errors that occur and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.GetOwnUser = async (req, res, next) => {
  try {
    // Send a success response with the currently logged-in user object.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_USERS_SUCCESS,
          req.user
        )
      );
  } catch (error) {
    // Handle any errors that occur and return an internal server error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.GetUserById = async (req, res, next) => {
  try {
    // Extract the `userCode` property from the request body.
    const { userCode } = req.body;

    // Validate that `userCode` is provided and is not empty or just whitespace.
    // If invalid, return an error response.
    if (!userCode?.trim()) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    // Query the database to find a user matching the provided `userCode`,
    // while excluding specific fields (`__v`, `_id`, `salt`, `hash`).
    // Populate the associated role and its permissions, excluding certain fields.
    const requestedUser = await User.findOne(
      { userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    // If no user is found, return an error response.
    if (!requestedUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    // Respond with success, returning the retrieved user data.
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_USERS_SUCCESS,
          requestedUser
        )
      );
  } catch (error) {
    // Handle any errors that occur, returning an error response.
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.UpdateUser = async (req, res, next) => {
  try {
    /* Extract the `userCode`, `email`, and `username` 
    properties from the request body. */
    const { userCode, email, username } = req.body;

    /* Validate that none of the required fields are empty or
    contain only whitespace characters. If any are missing, 
    return an error response using `next`. */
    if (![userCode, email, username].every((field) => field?.trim()?.length)) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    /* Query the database for a user document matching the `userCode`. */
    const existingUser = await User.findOne({
      userCode,
    });

    /* If no user is found, return an error response using `next`. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    /* Check if another user exists with the same `email` or `username`,
    but a different `userCode`. */
    const otherUsers = await User.find({
      userCode: { $ne: userCode },
      $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
    });

    /* If such a user exists, return an error response. */
    if (otherUsers?.length > 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_EMAIL_USERNAME_EXIST
        )
      );
    }

    /* Retrieve the current user details along with role information. */
    const userBeforeUpdate = await User.findOne(
      { userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    /* Update the user document with the provided `username` and `email`. */
    const user = await User.findOneAndUpdate(
      { userCode },
      {
        username,
        email: email?.trim()?.toLowerCase(),
      }
    );

    /* Save the updated user object to the database. */
    await user.save();

    /* Retrieve the updated user details and populate role and permission information. */
    const updatedUser = await User.findOne(
      { userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    /* Query the database for the current logged-in user's `_id`. */
    const currentUser = await User.findOne(
      { userCode: req.user.userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    /* Create an audit log for the update action. */
    await logAudit(
      generateAuditCode(),
      auditActions?.UPDATE,
      auditCollections?.USERS,
      updatedUser?.userCode,
      auditChanges?.UPDATE_USER,
      userBeforeUpdate?.toObject(),
      updatedUser?.toObject(),
      currentUser?.toObject()
    );

    /* Send a success response with the updated user data. */
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_USER_SUCCESS,
          updatedUser
        )
      );
  } catch (error) {
    /* Catch any errors that occur during execution and return an error response. */
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};

module.exports.DeleteUser = async (req, res, next) => {
  try {
    /* Extract the `userCode` property from the request body. */
    const { userCode } = req.body;

    /* Validate that `userCode` is provided and not just empty or whitespace. 
    If validation fails, return an error response. */
    if (!userCode || userCode?.trim()?.length === 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    /* Query the database for a user document matching the `userCode`. */
    const existingUser = await User.findOne({ userCode });

    /* If no user is found, return an error response indicating the user doesn't exist. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    /* Check if the user is allowed to be deleted. If not, return an error response. */
    if (!existingUser?.userAllowDeletion) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_ALLOWED_DELETE
        )
      );
    }

    /* Check if the user is referenced anywhere else in the database. */
    const { isReferenced } = await IsObjectIdReferenced(existingUser._id);

    /* If the user is in use, return an error response. */
    if (isReferenced) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
        )
      );
    }

    /* Retrieve the current user details, including their role and permissions. */
    const userBeforeDelete = await User.findOne(
      { userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    /* Perform the deletion of the user from the database. */
    const userDeletionResult = await User.deleteOne({ userCode });

    /* If no document was deleted, return an error response. */
    if (userDeletionResult?.deletedCount === 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          MESSAGE_DELETE_USER_ERROR
        )
      );
    }

    /* Retrieve the current logged-in user details. */
    const currentUser = await User.findOne(
      { userCode: req.user.userCode },
      hiddenFieldsUser
    ).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

    /* Create an audit log for the user deletion. */
    await logAudit(
      generateAuditCode(),
      auditActions?.DELETE,
      auditCollections?.USERS,
      userCode,
      auditChanges?.DELETE_USER,
      userBeforeDelete?.toObject(),
      null,
      currentUser?.toObject()
    );

    /* Return a success response confirming the user deletion. */
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_DELETE_USER_SUCCESS
        )
      );
  } catch (error) {
    /* Catch any errors during execution and return an error response. */
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};
