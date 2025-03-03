const express = require("express");
const questionPapers = require("../controllers/questionPapers");
const {
  isLoggedIn,
  checkPermission,
  validateQuestionPaperCode,
  validateQuestionPaper,
  validateUpdateQuestionPaper,
  validateSubjectCode,
  validateExamCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetQuestionPapers",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  catchAsync(questionPapers.GetQuestionPapers)
);

router.post(
  "/GetQuestionPaperByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  validateQuestionPaperCode,
  catchAsync(questionPapers.GetQuestionPaperByCode)
);

router.post(
  "/GetQuestionPapersBySubjectCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  validateSubjectCode,
  catchAsync(questionPapers.GetQuestionPapersBySubjectCode)
);

router.post(
  "/GetQuestionPapersByExamCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_CITIES),
  validateExamCode,
  catchAsync(questionPapers.GetQuestionPapersByExamCode)
);

router.post(
  "/CreateQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_CITY),
  validateQuestionPaper,
  catchAsync(questionPapers.CreateQuestionPaper)
);

router.post(
  "/UpdateQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_CITY),
  validateUpdateQuestionPaper,
  catchAsync(questionPapers.UpdateQuestionPaper)
);

router.post(
  "/DeleteQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_CITY),
  validateQuestionPaperCode,
  catchAsync(questionPapers.DeleteQuestionPaper)
);

module.exports.questionPaperRoutes = router;
