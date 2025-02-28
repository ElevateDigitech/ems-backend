const express = require("express");
const router = express.Router({ mergeParams: true });
const questions = require("../controllers/questions");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  checkPermission,
  validateQuestionCode,
  validateQuestion,
  validateUpdateQuestion,
} = require("../middleware");
const { allPermissions } = require("../seeds/basePermissions");

router.get(
  "/GetQuestions",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTIONS),
  catchAsync(questions.GetQuestions)
);

router.post(
  "/GetQuestionByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_QUESTIONS),
  validateQuestionCode,
  catchAsync(questions.GetQuestionByCode)
);

router.post(
  "/CreateQuestion",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_QUESTION),
  validateQuestion,
  catchAsync(questions.CreateQuestion)
);

router.post(
  "/UpdateQuestion",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_QUESTION),
  validateUpdateQuestion,
  catchAsync(questions.UpdateQuestion)
);

router.post(
  "/DeleteQuestion",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_QUESTION),
  validateQuestionCode,
  catchAsync(questions.DeleteQuestion)
);

module.exports.questionRoutes = router;
