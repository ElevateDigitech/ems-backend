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
  validateQuestionPaperCode,
  validateCreateUpdateMarks,
  validateQuestionPaperCodeAndStudentCodes,
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
  "/GetMarksByQuestionPaperCodeAndStudentCodes",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateQuestionPaperCodeAndStudentCodes,
  catchAsync(marks.GetMarksByQuestionPaperCodeAndStudentCodes)
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

router.post(
  "/CreateUpdateMarks",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_MARK),
  checkPermission(allPermissions?.UPDATE_MARK),
  validateCreateUpdateMarks,
  catchAsync(marks.CreateUpdateMarks)
);

router.post(
  "/GetTotalsByQuestionPaperCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_MARKS),
  validateQuestionPaperCode,
  catchAsync(marks.GetTotalsByQuestionPaperCode)
);

module.exports.markRoutes = router;
