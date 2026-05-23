"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlerware/auth.middleware");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// Analytics overview
router.get("/analytics/overview", auth_middleware_1.authMiddleware, analytics_controller_1.getAnalyticsOverview);
// Spending analytics
router.get("/analytics/spending", auth_middleware_1.authMiddleware, analytics_controller_1.getSpendingAnalytics);
// Issue type analytics
router.get("/analytics/issue-types", auth_middleware_1.authMiddleware, analytics_controller_1.getIssueTypeAnalytics);
// Department performance
router.get("/analytics/department-performance", auth_middleware_1.authMiddleware, analytics_controller_1.getDepartmentPerformance);
// Timeline analytics
router.get("/analytics/timeline", auth_middleware_1.authMiddleware, analytics_controller_1.getTimelineAnalytics);
exports.default = router;
