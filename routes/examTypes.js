const express = require("express");
const router = express.Router({ mergeParams: true });
const examTypes = require("../controllers/examTypes");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateExamTypeCode,
  validateExamType,
  validateUpdateExamType,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetExamTypes",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_EXAM_TYPES),
  catchAsync(examTypes.GetExamTypes)
);

router.get(
  "/GetExamTypeByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_EXAM_TYPES),
  validateExamTypeCode,
  catchAsync(examTypes.GetExamTypeByCode)
);

router.post(
  "/CreateExamType",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_EXAM_TYPE),
  validateExamType,
  catchAsync(examTypes.CreateExamType)
);

router.post(
  "/UpdateExamType",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_EXAM_TYPE),
  validateUpdateExamType,
  catchAsync(examTypes.UpdateExamType)
);

router.post(
  "/DeleteExamType",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_EXAM_TYPE),
  validateExamTypeCode,
  catchAsync(examTypes.DeleteExamType)
);

module.exports.examTypeRoutes = router;
