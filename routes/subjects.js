const express = require("express");
const subjects = require("../controllers/subjects");
const {
  isLoggedIn,
  checkPermission,
  validateSubjectCode,
  validateSubject,
  validateUpdateSubject,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetSubjects",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USERS),
  catchAsync(subjects.GetSubjects)
);

router.post(
  "/GetSubjectByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USERS),
  validateSubjectCode,
  catchAsync(subjects.GetSubjectByCode)
);

router.post(
  "/CreateSubject",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_USER),
  validateSubject,
  catchAsync(subjects.CreateSubject)
);

router.post(
  "/UpdateSubject",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_COUNTRY),
  validateUpdateSubject,
  catchAsync(subjects.UpdateSubject)
);

router.post(
  "/DeleteSubject",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_COUNTRY),
  validateSubjectCode,
  catchAsync(subjects.DeleteSubject)
);

module.exports.subjectRoutes = router;
