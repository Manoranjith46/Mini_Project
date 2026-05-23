"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlerware/auth.middleware");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
// Get detailed report for a specific issue
router.get("/reports/:issueId", auth_middleware_1.authMiddleware, reports_controller_1.getDetailedIssueReport);
// Get all reports with filters
router.get("/reports", auth_middleware_1.authMiddleware, reports_controller_1.getAllReports);
// Get reports summary with statistics
router.get("/reports-summary", auth_middleware_1.authMiddleware, reports_controller_1.getReportsSummary);
exports.default = router;
