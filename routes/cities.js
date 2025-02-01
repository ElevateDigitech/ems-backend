const express = require("express");
const cities = require("../controllers/cities");
const {
  isLoggedIn,
  validateCityCode,
  validateCity,
  validateUpdateCity,
  validateStateCode,
  validateCountryCode,
  checkPermission,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetCities",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITY),
  catchAsync(cities.GetCities)
);

router.get(
  "/GetCityByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITY),
  validateCityCode,
  catchAsync(cities.GetCityByCode)
);

router.get(
  "/GetCitiesByStateCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITY),
  validateStateCode,
  catchAsync(cities.GetCitiesByStateCode)
);

router.get(
  "/GetCitiesByCountryCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITY),
  validateCountryCode,
  catchAsync(cities.GetCitiesByCountryCode)
);

router.post(
  "/CreateCity",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_CITY),
  validateCity,
  catchAsync(cities.CreateCity)
);

router.post(
  "/UpdateCity",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_CITY),
  validateUpdateCity,
  catchAsync(cities.UpdateCity)
);

router.post(
  "/DeleteCity",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_CITY),
  validateCityCode,
  catchAsync(cities.DeleteCity)
);

module.exports.cityRoutes = router;
