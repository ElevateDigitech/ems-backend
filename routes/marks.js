const express = require("express");
const marks = require("../controllers/marks");
const {
  isLoggedIn,
  checkPermission,
  validateMarkCode,
  validateMark,
  validateUpdateMark,
  validateExamCode,
  validateStudentCode,
  validateSubjectCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetMarks",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  catchAsync(marks.GetMarks)
);

router.post(
  "/GetMarkByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateMarkCode,
  catchAsync(marks.GetMarkByCode)
);

router.post(
  "/GetMarksByExamCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateExamCode,
  catchAsync(marks.GetMarksByExamCode)
);

router.post(
  "/GetMarksByStudentCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateStudentCode,
  catchAsync(marks.GetMarksByStudentCode)
);

router.post(
  "/GetMarksBySubjectCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateSubjectCode,
  catchAsync(marks.GetMarksBySubjectCode)
);

router.post(
  "/CreateMark",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_CITY),
  validateMark,
  catchAsync(marks.CreateMark)
);

router.post(
  "/UpdateMark",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_CITY),
  validateUpdateMark,
  catchAsync(marks.UpdateMark)
);

router.post(
  "/DeleteMark",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_CITY),
  validateMarkCode,
  catchAsync(marks.DeleteMark)
);

module.exports.markRoutes = router;
