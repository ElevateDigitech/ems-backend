const express = require("express");
const router = express.Router({ mergeParams: true });
const permissions = require("../controllers/permissions");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validatePermissionCode,
  validateRoleCode,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetPermissions",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PERMISSIONS),
  catchAsync(permissions.GetPermissions)
);

router.post(
  "/GetPermissionByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PERMISSIONS),
  validatePermissionCode,
  catchAsync(permissions.GetPermissionByCode)
);

router.post(
  "/GetPermissionsByRoleCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PERMISSIONS),
  validateRoleCode,
  catchAsync(permissions.GetPermissionsByRoleCode)
);

module.exports.permissionsRoutes = router;
