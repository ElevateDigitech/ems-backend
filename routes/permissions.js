const express = require("express");
const router = express.Router({ mergeParams: true });
const permissions = require("../controllers/permissions");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  validatePermissionCode,
  checkPermission,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetPermissions",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PERMISSIONS),
  catchAsync(permissions.GetPermissions)
);

router.get(
  "/GetPermissionByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PERMISSIONS),
  validatePermissionCode,
  catchAsync(permissions.GetPermissionByCode)
);

module.exports.permissionsRoutes = router;
