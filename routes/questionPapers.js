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
  validateSectionCode,
  validateQueryQuestionPaper,
  validateDuplicateQuestionPaper,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetQuestionPapers",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  catchAsync(questionPapers.GetQuestionPapers)
);

router.post(
  "/GetQuestionPaperByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  validateQuestionPaperCode,
  catchAsync(questionPapers.GetQuestionPaperByCode)
);

router.post(
  "/GetQuestionPapersBySubjectCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  validateSubjectCode,
  catchAsync(questionPapers.GetQuestionPapersBySubjectCode)
);

router.post(
  "/GetQuestionPapersByExamCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  validateExamCode,
  catchAsync(questionPapers.GetQuestionPapersByExamCode)
);

router.post(
  "/GetQuestionPapersBySectionCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  validateSectionCode,
  catchAsync(questionPapers.GetQuestionPapersBySectionCode)
);

router.post(
  "/GetQuestionPapersByQuery",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  validateQueryQuestionPaper,
  catchAsync(questionPapers.GetQuestionPapersByQuery)
);

router.get(
  "/GetPendingQuestionPapers",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTION_PAPERS),
  catchAsync(questionPapers.GetPendingQuestionPapers)
);

router.post(
  "/CreateQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_QUESTION_PAPER),
  validateQuestionPaper,
  catchAsync(questionPapers.CreateQuestionPaper)
);

router.post(
  "/UpdateQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_QUESTION_PAPER),
  validateUpdateQuestionPaper,
  catchAsync(questionPapers.UpdateQuestionPaper)
);

router.post(
  "/CreateDuplicateQuestionPapers",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_QUESTION_PAPER),
  validateDuplicateQuestionPaper,
  catchAsync(questionPapers.CreateDuplicateQuestionPapers)
);

router.post(
  "/DeleteQuestionPaper",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_QUESTION_PAPER),
  validateQuestionPaperCode,
  catchAsync(questionPapers.DeleteQuestionPaper)
);

module.exports.questionPaperRoutes = router;
