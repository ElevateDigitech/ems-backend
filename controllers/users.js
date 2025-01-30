const passport = require("passport");
const User = require("../models/user");
const allRegex = require("../utils/allRegex");
const ExpressResponse = require("../utils/ExpressResponse");
const {
  trimAndTestRegex,
  getInvalidRole,
  getRoleId,
  IsObjectIdReferenced,
  generateUserCode,
  hiddenFieldsUser,
  hiddenFieldsDefault,
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
const { STATUS_ERROR, STATUS_SUCCESS } = require("../utils/status");

module.exports.register = async (req, res, next) => {
  /* The below code snippet is extracting the `email`,
  `username`, `password`, `userAllowDeletion`, and
  `roleCode` properties from the request body. 
  `userAllowDeletion` and `roleCode` are optional and
  has a default values `true`. */
  const {
    email,
    username,
    password,
    userAllowDeletion = true,
    roleCode,
  } = req.body;

  /* The below code snippet is performing a check to
  ensure that all required fields (email, username, and
  password) are not empty or only contain whitespace
  characters. */
  if (![email, username, password].every((field) => field?.trim()?.length)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_MISSING_REQUIRED_FIELDS
      )
    );
  }

  /* The below code snippet is checking if the `email`
  provided in the registration process passes a regex
  test for a valid email format. */
  if (!trimAndTestRegex(email, allRegex?.VALID_EMAIL)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_INVALID_EMAIL_FORMAT
      )
    );
  }

  /* The below code snippet is checking if the `password`
  provided in the registration process passes a regex 
  test for meeting certain constraints defined by the 
  `VALID_PASSWORD` regex pattern stored in the `allRegex`
  object. */
  if (!trimAndTestRegex(password, allRegex?.VALID_PASSWORD)) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET
      )
    );
  }

  /* The below code snippet is querying the database to
  find a user record where either the email or username
  matches the values provided during the registration
  process. */
  const existingUser = await User.findOne({
    $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
  });

  /* The below code snippet is checking if there is an
  existing user in the database with the same email or
  username provided during the registration process. If
  an existing user is found, it returns an error response
  using `next()` function with a message indicating 
  that the email or username already exists */
  if (existingUser) {
    return next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_CONFLICT,
        MESSAGE_EMAIL_USERNAME_EXIST
      )
    );
  }

  /* The below code snippet is calling a function
  `getInvalidRole` with the `roleCode` parameter to check
  if the provided `roleCode` is valid or not. If the 
  `roleCode` is found to be invalid based on certain 
  criteria within the `getInvalidRole` function, it will
  return a truthy value indicating that the role is
  invalid. */
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

  /* The below code snippet is calling a function 
  `getRoleId` with the `roleCode` parameter to 
  retrieve the role ID associated with the provided
  `roleCode`. */
  const roleId = await getRoleId(roleCode);

  /* The below code snippet is generating a unique
  `userCode` for a new user being created. */
  const userCode = generateUserCode();

  /* The below code snippet is creating a new instance
  of the `User` model with the properties extracted 
  from the `req.body` object. */
  const user = new User({
    userCode,
    email: email?.trim()?.toLowerCase(),
    username,
    userAllowDeletion,
    role: roleId,
  });

  /* `The below code snippet is calling a method named
  `register` on the `User` model. */
  const registeredUser = await User.register(user, password);

  /* The below code snippet is querying the database to find
  the newly created user document using the above generated
  `userCode` (excluding the fields `__v`, `_id`, `salt`, and
  `hash`) with populating the linked documents from the 
  `roles` collection (excluding the fields `__v` and `_id`)
  and populating the linked documents from the `permissions`
  collection (excluding the fields `__v` and `_id`) in the
  role. */
  const createdUser = await User.findOne(
    {
      userCode,
    },
    hiddenFieldsUser
  ).populate({
    path: "role",
    select: hiddenFieldsDefault,
    populate: {
      path: "rolePermissions",
      select: hiddenFieldsDefault,
    },
  });

  /* The code snippet is trying to login the user */
  req.login(registeredUser, (err) => {
    /* The code snipppet will return an error response using
    the `next` function with an `ExpressResponse` object. */
    if (err) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
        )
      );
    }

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
  });
};

module.exports.login = async (req, res, next) => {
  try {
    /* The below code snippet will use the `username' and
    `password` properties provided in the request body to
    authenticate the user. */
    passport.authenticate("local", (err, user, info) => {
      /* The below code snippet is handling an error 
      scenario during the authentication process. */
      if (err) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_INTERNAL_SERVER_ERROR,
            info?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
      }

      /* The below code snippet is handling a scenario in 
      the authentication process where it does not return a
      valid user object. */
      if (!user) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_UNAUTHENTICATED,
            MESSAGE_UNAUTHENTICATED
          )
        );
      }

      /* The below code snippet is trying to login the user */
      req.login(user, (err) => {
        /* The code snipppet will return an error response using
        the `next` function with an `ExpressResponse` object. */
        if (err) {
          return next(
            new ExpressResponse(
              STATUS_ERROR,
              STATUS_CODE_INTERNAL_SERVER_ERROR,
              err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
            )
          );
        }
        /* The below code snippet returns an success response with
        an `ExpressResponse` object. */
        res.status(STATUS_CODE_SUCCESS).send(
          new ExpressResponse(
            STATUS_SUCCESS,
            STATUS_CODE_SUCCESS,
            MESSAGE_USER_LOGIN_SUCCESS,
            {
              email: user?.email || "",
              username: user?.username || "",
            }
          )
        );
      });
    })(req, res, next);
  } catch (e) {
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
  try {
    /* The below code snippet is trying to logout the user */
    req.logout(function (err) {
      /* The code snipppet will return an error response using
      the `next` function with an `ExpressResponse` object. */
      if (err) {
        return next(
          new ExpressResponse(
            STATUS_ERROR,
            STATUS_CODE_INTERNAL_SERVER_ERROR,
            err?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
          )
        );
      }
      /* The below code snippet returns an success response with
      an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet is extracting the `email`,
    `username`, `oldpassword`, and `newPassword` properties 
    from the request body. */
    const { email, username, oldPassword, newPassword } = req.body;

    /* This below code snippet is performing a validation 
    check to ensures either `username` or `email` field 
    along with the `oldpassword` and `newpassword` fields 
    are not empty or only contain whitespace characters. 
    If so, then it returns an error response using the 
    `next` function with an `ExpressResponse` object.*/
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

    /* This below code snippet is querying the database 
    to find a user record where either the email or 
    username matches the values provided. */
    const existingUser = await User.findOne({
      $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
    });

    /* The below code snippet is checking if no document is
    found with the given `username` or `email`. If so, then
    it returns an error response using the `next` function 
    with an `ExpressResponse` object. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_EMAIL_USERNAME_NOT_EXIST
        )
      );
    }

    /* The below code snippet will use the `oldPassword'
    property provided in the request body to authenticate 
    the `existingUser`. */
    const isAuthenticated = await existingUser.authenticate(oldPassword);

    /* The below code snippet is checking if the user is
    authenticated. If not, it returns an error response
    using `next()` function with an `ExpressResponse` 
    object. */
    if (!isAuthenticated.user) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_OLD_PASSWORD_ERROR
        )
      );
    }

    /* The below code snippet is a method call that sets a 
    new password for the `existingUser` object. */
    await existingUser.setPassword(newPassword);

    /* The bwlow code snippet saving the changes in 
    `existingUser` object to the database. */
    await existingUser.save();

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet is extracting the `email`,
    `username`, `oldpassword`, and `newPassword` properties 
    from the request body. */
    const { email, username, oldPassword, newPassword } = req.body;

    /* This below code snippet is performing a validation 
    check to ensures either `username` or `email` field 
    along with the `oldpassword` and `newpassword` fields 
    are not empty or only contain whitespace characters. 
    If so, then it returns an error response using the 
    `next` function with an `ExpressResponse` object.*/
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

    /* This below code snippet is querying the database 
    to find a user record where either the email or 
    username matches the values provided. */
    const existingUser = await User.findOne({
      $or: [{ email: email?.trim()?.toLowerCase() }, { username }],
    });

    /* The below code snippet is checking if no document is
    found with the given `username` or `email`. If so, then
    it returns an error response using the `next` function 
    with an `ExpressResponse` object. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_EMAIL_USERNAME_NOT_EXIST
        )
      );
    }

    /* The below code snippet is checking if the `userCode` in
    the request body is same as the current logged in user. If
    not, it will return an error response using the `next` function 
    with an `ExpressResponse` object. */
    if (req.user?.userCode && req.user?.userCode !== existingUser.userCode) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_ACCESS_DENIED_NO_PERMISSION
        )
      );
    }

    /* The below code snippet will use the `oldPassword'
    property provided in the request body to authenticate 
    the `existingUser`. */
    const isAuthenticated = await existingUser.authenticate(oldPassword);

    /* The below code snippet is checking if the user is
    authenticated. If not, it returns an error response
    using `next()` function with an `ExpressResponse` 
    object. */
    if (!isAuthenticated.user) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_OLD_PASSWORD_ERROR
        )
      );
    }

    /* The below code snippet is a method call that sets a 
    new password for the `existingUser` object. */
    await existingUser.setPassword(newPassword);

    /* The bwlow code snippet saving the changes in 
    `existingUser` object to the database. */
    await existingUser.save();

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code is fetching all users with their roles 
    and role permissions from the database (excluding the fields 
    `__v`, `_id`, `salt`, and `hash`) with populating the linked 
    documents from the `roles` collection (excluding the fields 
    `__v` and `_id`) and populating the linked documents from 
    the `permissions` collection (excluding the fields `__v` and 
    `_id`) in the role. */
    const allUsers = await User.find({}, hiddenFieldsUser).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });
    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet returns an success response with
    an `ExpressResponse` object along with the logged in user
    object */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet is extracting the `userCode`,
    property from the request body. */
    const { userCode } = req.body;

    /* This below code snippet is performing a validation 
    check to ensures `userCode` is not empty or only contain 
    whitespace characters. If so, then it returns an error 
    response using the `next` function with an 
    `ExpressResponse` object.*/
    if (!userCode || userCode?.trim()?.length === 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    /* The below code is quering the database to find an document
    in the `users` collection with the given `userCode` with their
    roles and role permissions (excluding the fields `__v`, `_id`, 
    `salt`, and `hash`) with populating the linked documents from 
    the `roles` collection (excluding the fields `__v` and `_id`) 
    and populating the linked documents from the `permissions` 
    collection (excluding the fields `__v` and `_id`) in the 
    role. */
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

    /* The below code snippet is checking if no document is
    found with the given `userCode`. If so, then it returns 
    an error response using the `next` function with an 
    `ExpressResponse` object. */
    if (!requestedUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet is extracting the `userCode`,
    `email`, and `username` properties from the request 
    body. */
    const { userCode, email, username } = req.body;

    /* The below code snippet is performing a validation 
    check to ensures `userCode`, `email`, and `username`
    fields are not empty or only contain whitespace 
    characters. If so, then it returns an error response 
    using the `next` function with an `ExpressResponse` 
    object.*/
    if (![userCode, email, username].every((field) => field?.trim()?.length)) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    /* The below code snippet using the given `userCode` to
    query the database for a single document in the `users`
    collection. */
    const existingUser = await User.findOne({ userCode });

    /* The below code snippet is checking if no document is
    found with the given `userCode`. If so, then it returns
    an error response using the `next` function with an
    `ExpressResponse` object. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    /* The below code snippet is finding and updating the instance
    of the `User` model with the provided data. */
    const user = await User.findOneAndUpdate(
      { userCode },
      {
        username,
        email: email?.trim()?.toLowerCase(),
      }
    );

    /* The below code snippet is saving the updated `user`
    object to the database. */
    await user.save();

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        new ExpressResponse(
          STATUS_SUCCESS,
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_USER_SUCCESS
        )
      );
  } catch (error) {
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
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
    /* The below code snippet is extracting the `userCode`,
    property from the request body. */
    const { userCode } = req.body;

    /* The below code snippet is performing a validation 
    check to ensures `userCode`, is not empty or only contain 
    whitespace characters. If so, then it returns an error 
    response using the `next` function with an `ExpressResponse` 
    object.*/
    if (!userCode || userCode?.trim()?.length === 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_BAD_REQUEST,
          MESSAGE_MISSING_REQUIRED_FIELDS
        )
      );
    }

    /* The below code snippet using the given `userCode` to
    query the database for a single document in the `users`
    collection. */
    const existingUser = await User.findOne({ userCode });

    /* The below code snippet is checking if no document is
    found with the given `userCode`. If so, then it returns
    an error response using the `next` function with an
    `ExpressResponse` object. */
    if (!existingUser) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_FOUND
        )
      );
    }

    /* The below code snippet is checking if the found
    document is allowed to be deleted. If not, it returns
    an error response using the `next` function with an
    `ExpressResponse` object. */
    if (!existingUser?.userAllowDeletion) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_ALLOWED_DELETE
        )
      );
    }

    /* The below code snippet is checking if the user is
    being used anywhere in the database. */
    const { isReferenced } = await IsObjectIdReferenced(existingUser._id);

    /* The below code snippet returns an error response
    using the `next` function with an `ExpressResponse`
    object, when the found document is in use. */
    if (isReferenced) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_CONFLICT,
          MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST
        )
      );
    }

    /* The the below code snippet is querying the database
    to delete the document with the given `userCode` in the 
    `users` collection. */
    const user = await User.deleteOne({ userCode });

    /* The the below code snippet is using `deletedCount` in the
    `deleteOne` mongoose function response to confirm the document
    deletion. If it is `0` then the document is not deleted, then
    it return an error response using the `next` function with
    an `ExpressResponse` object. */
    if (user?.deletedCount === 0) {
      return next(
        new ExpressResponse(
          STATUS_ERROR,
          STATUS_CODE_INTERNAL_SERVER_ERROR,
          MESSAGE_DELETE_USER_ERROR
        )
      );
    }

    /* The below code snippet returns an success response with
    an `ExpressResponse` object. */
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
    /* The below code snippet catches any error that might occur
    during executing the above try block and returns and error
    response using the `next` function with an `ExpressResponse`
    object. */
    next(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        error?.message ?? MESSAGE_INTERNAL_SERVER_ERROR
      )
    );
  }
};
