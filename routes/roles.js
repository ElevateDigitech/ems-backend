const express = require("express");
const router = express.Router({ mergeParams: true });
const roles = require("../controllers/roles");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateRoleCode,
  validateRole,
  validateUpdateRole,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetRoles",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_ROLES),
  catchAsync(roles.GetRoles)
);

router.get(
  "/GetOwnRole",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_OWN_ROLE_ONLY),
  catchAsync(roles.GetOwnRole)
);

router.post(
  "/GetRoleByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_ROLES),
  validateRoleCode,
  catchAsync(roles.GetRoleByCode)
);

router.post(
  "/CreateRole",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_ROLE),
  validateRole,
  catchAsync(roles.CreateRole)
);

router.post(
  "/UpdateRole",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_ROLE),
  validateUpdateRole,
  catchAsync(roles.UpdateRole)
);

router.post(
  "/DeleteRole",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_ROLE),
  validateRoleCode,
  catchAsync(roles.DeleteRole)
);

module.exports.rolesRoutes = router;
