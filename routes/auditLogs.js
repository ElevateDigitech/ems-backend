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
  checkPermission(allPermissions?.VIEW_AUDIT),
  catchAsync(auditLogs.GetAudits)
);

router.get(
  "/GetAuditByCode",
  isLoggedIn,
  checkPermission(allPermissions?.VIEW_USER),
  validateAuditCode,
  catchAsync(auditLogs.GetAuditByCode)
);

module.exports.auditLogRoutes = router;
