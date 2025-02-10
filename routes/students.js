const express = require("express");
const students = require("../controllers/students");
const {
  isLoggedIn,
  checkPermission,
  validateStudentCode,
  validateStudent,
  validateUpdateStudent,
  validateSectionCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetStudents",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STUDENTS),
  catchAsync(students.GetStudents)
);

router.get(
  "/GetStudentByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STUDENTS),
  validateStudentCode,
  catchAsync(students.GetStudentByCode)
);

router.get(
  "/GetStudentsBySectionCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_STUDENTS),
  validateSectionCode,
  catchAsync(students.GetStudentsBySectionCode)
);

router.post(
  "/CreateStudent",
  isLoggedIn,
  checkPermission(allPermissions?.CREATE_STUDENT),
  validateStudent,
  catchAsync(students.CreateStudent)
);

router.post(
  "/UpdateStudent",
  isLoggedIn,
  checkPermission(allPermissions?.UPDATE_STUDENT),
  validateUpdateStudent,
  catchAsync(students.UpdateStudent)
);

router.post(
  "/DeleteStudent",
  isLoggedIn,
  checkPermission(allPermissions?.DELETE_STUDENT),
  validateStudentCode,
  catchAsync(students.DeleteStudent)
);

module.exports.studentRoutes = router;
