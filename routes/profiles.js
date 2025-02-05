const express = require("express");
const router = express.Router({ mergeParams: true });
const profiles = require("../controllers/profiles");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateProfile,
  validateProfilePicture,
  validateProfileCode,
  validateUpdateProfile,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetProfiles",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PROFILES),
  catchAsync(profiles.getProfiles)
);

router.get(
  "/GetOwnProfile",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_OWN_PROFILE_ONLY),
  profiles.GetOwnProfile
);

router.get(
  "/GetProfileByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PROFILES),
  validateProfileCode,
  profiles.GetProfileByCode
);

router.get(
  "/GetProfileByUserCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_PROFILES),
  profiles.GetProfileByUserCode
);

router.post(
  "/CreateProfile",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_PROFILE),
  validateProfilePicture,
  validateProfile,
  profiles.CreateProfile
);

router.post(
  "/UpdateProfile",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_PROFILE),
  validateProfilePicture,
  validateUpdateProfile,
  profiles.UpdateProfile
);

router.post(
  "/DeleteProfile",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_PROFILE),
  validateProfileCode,
  catchAsync(profiles.DeleteProfile)
);

module.exports.profileRoutes = router;
