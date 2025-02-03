const express = require("express");
const router = express.Router({ mergeParams: true });
const classes = require("../controllers/classes");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateClassCode,
  validateClass,
  validateUpdateClass,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetClasses",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CLASS),
  catchAsync(classes.GetClasses)
);

router.get(
  "/GetClassByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CLASS),
  validateClassCode,
  catchAsync(classes.GetClassByCode)
);

router.post(
  "/CreateClass",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_CLASS),
  validateClass,
  catchAsync(classes.CreateClass)
);

router.post(
  "/UpdateClass",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_CLASS),
  validateUpdateClass,
  catchAsync(classes.UpdateClass)
);

router.post(
  "/DeleteClass",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_CLASS),
  validateClassCode,
  catchAsync(classes.DeleteClass)
);

module.exports.classRoutes = router;
