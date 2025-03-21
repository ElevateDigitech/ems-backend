const express = require("express");
const router = express.Router({ mergeParams: true });
const subStrands = require("../controllers/subStrands");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateSubStrandCode,
  validateSubStrand,
  validateUpdateSubStrand,
  validateStrandCode,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetSubStrands",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STRANDS),
  catchAsync(subStrands.GetSubStrands)
);

router.post(
  "/GetSubStrandByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STRANDS),
  validateSubStrandCode,
  catchAsync(subStrands.GetSubStrandByCode)
);

router.post(
  "/GetSubStrandsByStrandCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STRANDS),
  validateStrandCode,
  catchAsync(subStrands.GetSubStrandsByStrandCode)
);

router.post(
  "/CreateSubStrand",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_STRAND),
  validateSubStrand,
  catchAsync(subStrands.CreateSubStrand)
);

router.post(
  "/UpdateSubStrand",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_STRAND),
  validateUpdateSubStrand,
  catchAsync(subStrands.UpdateSubStrand)
);

router.post(
  "/DeleteSubStrand",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_STRAND),
  validateSubStrandCode,
  catchAsync(subStrands.DeleteSubStrand)
);

module.exports.subStrandRoutes = router;
