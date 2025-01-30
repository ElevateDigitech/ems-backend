const express = require("express");
const router = express.Router({ mergeParams: true });
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo, isLoggedIn, checkPermission } = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router
  .route("/register")
  .post(
    checkPermission(allPermissions?.CREATE_USER),
    catchAsync(users.register)
  );

router.route("/login").post(storeReturnTo, users.login);

router.get("/logout", users.logout);

router.post(
  "/changePassword",
  checkPermission(allPermissions?.CHANGE_PASSWORDS),
  isLoggedIn,
  users.changePassword
);

router.post(
  "/changeOwnPassword",
  checkPermission(allPermissions?.CHANGE_OWN_PASSWORD),
  isLoggedIn,
  users.changeOwnPassword
);

router.get(
  "/Getusers",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USER),
  users.GetUsers
);

router.get(
  "/GetOwnUser",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_OWN_USER_ONLY),
  users.GetOwnUser
);

router.get(
  "/GetUserById",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USER),
  users.GetUserById
);

router.post(
  "/DeleteUser",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_USER),
  users.DeleteUser
);

module.exports.usersRoutes = router;
