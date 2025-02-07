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

router.route("/login").post(storeReturnTo, catchAsync(users.login));

router.get("/logout", isLoggedIn, catchAsync(users.logout));

router.post(
  "/changePassword",
  isLoggedIn,
  checkPermission(allPermissions?.CHANGE_PASSWORDS),
  catchAsync(users.changePassword)
);

router.post(
  "/changeOwnPassword",
  isLoggedIn,
  checkPermission(allPermissions?.CHANGE_OWN_PASSWORD),
  catchAsync(users.changeOwnPassword)
);

router.get(
  "/Getusers",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USERS),
  catchAsync(users.GetUsers)
);

router.get(
  "/GetOwnUser",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_OWN_USER_ONLY),
  catchAsync(users.GetOwnUser)
);

router.get(
  "/GetUserById",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USERS),
  catchAsync(users.GetUserById)
);

router.post(
  "/UpdateUser",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_USER),
  catchAsync(users.UpdateUser)
);

router.post(
  "/DeleteUser",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_USER),
  catchAsync(users.DeleteUser)
);

module.exports.usersRoutes = router;
