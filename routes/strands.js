const express = require("express");
const router = express.Router({ mergeParams: true });
const strands = require("../controllers/strands");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateStrandCode,
  validateStrand,
  validateUpdateStrand,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetStrands",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STRANDS),
  catchAsync(strands.GetStrands)
);

router.post(
  "/GetStrandByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STRANDS),
  validateStrandCode,
  catchAsync(strands.GetStrandByCode)
);

router.post(
  "/CreateStrand",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_STRAND),
  validateStrand,
  catchAsync(strands.CreateStrand)
);

router.post(
  "/UpdateStrand",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_STRAND),
  validateUpdateStrand,
  catchAsync(strands.UpdateStrand)
);

router.post(
  "/DeleteStrand",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_STRAND),
  validateStrandCode,
  catchAsync(strands.DeleteStrand)
);

module.exports.strandRoutes = router;
