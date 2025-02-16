const express = require("express");
const countries = require("../controllers/countries");
const {
  isLoggedIn,
  checkPermission,
  validateCountry,
  validateUpdateCountry,
  validateCountryCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetCountries",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_COUNTRIES),
  catchAsync(countries.GetCountries)
);

router.post(
  "/GetCountryByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_COUNTRIES),
  validateCountryCode,
  catchAsync(countries.GetCountryByCode)
);

router.post(
  "/CreateCountry",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_COUNTRY),
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
