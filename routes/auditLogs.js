const express = require("express");
const auditLogs = require("../controllers/auditLogs");
const {
  isLoggedIn,
  checkPermission,
  validateAuditCode,
} = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { allPermissions } = require("../seeds/basePermissions");

const router = express.Router();

router.get(
  "/GetAudits",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_AUDITS),
  catchAsync(auditLogs.GetAudits)
);

router.post(
  "/GetAuditByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_AUDITS),
  validateAuditCode,
  catchAsync(auditLogs.GetAuditByCode)
);

module.exports.auditLogRoutes = router;
