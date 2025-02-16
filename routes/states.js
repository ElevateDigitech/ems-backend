const express = require("express");
const states = require("../controllers/states");
const {
  isLoggedIn,
  checkPermission,
  validateStateCode,
  validateState,
  validateUpdateState,
  validateCountryCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetStates",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATES),
  catchAsync(states.GetStates)
);

router.post(
  "/GetStateByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATES),
  validateStateCode,
  catchAsync(states.GetStateByCode)
);

router.post(
  "/GetStatesByCountryCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STATES),
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
