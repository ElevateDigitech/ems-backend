const express = require("express");
const router = express.Router({ mergeParams: true });
const exams = require("../controllers/exams");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateExamCode,
  validateExam,
  validateUpdateExam,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetExams",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_EXAM_TYPES),
  catchAsync(exams.GetExams)
);

router.get(
  "/GetExamByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_EXAM_TYPES),
  validateExamCode,
  catchAsync(exams.GetExamByCode)
);

router.post(
  "/CreateExam",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_EXAM_TYPE),
  validateExam,
  catchAsync(exams.CreateExam)
);

router.post(
  "/UpdateExam",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_EXAM_TYPE),
  validateUpdateExam,
  catchAsync(exams.UpdateExam)
);

router.post(
  "/DeleteExam",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_EXAM_TYPE),
  validateExamCode,
  catchAsync(exams.DeleteExam)
);

module.exports.examRoutes = router;
