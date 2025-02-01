const express = require("express");
const countries = require("../controllers/countries");
const {
  isLoggedIn,
  validateCountry,
  validateUpdateCountry,
  validateCountryCode,
  checkPermission,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetCountries",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USER),
  catchAsync(countries.GetCountries)
);

router.get(
  "/GetCountryByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USER),
  validateCountryCode,
  catchAsync(countries.GetCountryByCode)
);

router.post(
  "/CreateCountry",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_USER),
  validateCountry,
  catchAsync(countries.CreateCountry)
);

router.post(
  "/UpdateCountry",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_COUNTRY),
  validateUpdateCountry,
  catchAsync(countries.UpdateCountry)
);

router.post(
  "/DeleteCountry",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_COUNTRY),
  validateCountryCode,
  catchAsync(countries.DeleteCountry)
);

module.exports.countryRoutes = router;
