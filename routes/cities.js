const express = require("express");
const cities = require("../controllers/cities");
const {
  isLoggedIn,
  checkPermission,
  validateCityCode,
  validateCity,
  validateUpdateCity,
  validateStateCode,
  validateCountryCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetCities",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  catchAsync(cities.GetCities)
);

router.post(
  "/GetCityByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  validateCityCode,
  catchAsync(cities.GetCityByCode)
);

router.post(
  "/GetCitiesByStateCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  validateStateCode,
  catchAsync(cities.GetCitiesByStateCode)
);

router.post(
  "/GetCitiesByCountryCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
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
