const express = require("express");
const router = express.Router({ mergeParams: true });
const genders = require("../controllers/genders");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateGenderCode,
  validateGender,
  validateUpdateGender,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetGenders",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_GENDERS),
  catchAsync(genders.GetGenders)
);

router.post(
  "/GetGenderByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_GENDERS),
  validateGenderCode,
  catchAsync(genders.GetGenderByCode)
);

router.post(
  "/CreateGender",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_GENDER),
  validateGender,
  catchAsync(genders.CreateGender)
);

router.post(
  "/UpdateGender",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_GENDER),
  validateUpdateGender,
  catchAsync(genders.UpdateGender)
);

router.post(
  "/DeleteGender",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_GENDER),
  validateGenderCode,
  catchAsync(genders.DeleteGender)
);

module.exports.genderRoutes = router;
