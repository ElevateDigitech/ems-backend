const express = require("express");
const states = require("../controllers/states");
const {
  isLoggedIn,
  validateStateCode,
  validateState,
  validateUpdateState,
  validateCountryCode,
  checkPermission,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetStates",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATE),
  catchAsync(states.GetStates)
);

router.get(
  "/GetStateByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATE),
  validateStateCode,
  catchAsync(states.GetStateByCode)
);

router.get(
  "/GetStatesByCountryCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATE),
  validateCountryCode,
  catchAsync(states.GetStatesByCountryCode)
);

router.post(
  "/CreateState",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_STATE),
  validateState,
  catchAsync(states.CreateState)
);

router.post(
  "/UpdateState",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_STATE),
  validateUpdateState,
  catchAsync(states.UpdateState)
);

router.post(
  "/DeleteState",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_STATE),
  validateStateCode,
  catchAsync(states.DeleteState)
);

module.exports.stateRoutes = router;
