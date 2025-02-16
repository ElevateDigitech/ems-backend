const express = require("express");
const sections = require("../controllers/sections");
const {
  isLoggedIn,
  checkPermission,
  validateSectionCode,
  validateClassCode,
  validateSection,
  validateUpdateSection,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetSections",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_SECTIONS),
  catchAsync(sections.GetSections)
);

router.post(
  "/GetSectionByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_SECTIONS),
  validateSectionCode,
  catchAsync(sections.GetSectionByCode)
);

router.post(
  "/GetSectionsByClassCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_SECTIONS),
  validateClassCode,
  catchAsync(sections.GetSectionsByClassCode)
);

router.post(
  "/CreateSection",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_SECTION),
  validateSection,
  catchAsync(sections.CreateSection)
);

router.post(
  "/UpdateSection",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_SECTION),
  validateUpdateSection,
  catchAsync(sections.UpdateSection)
);

router.post(
  "/DeleteSection",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_SECTION),
  validateSectionCode,
  catchAsync(sections.DeleteSection)
);

module.exports.sectionRoutes = router;
