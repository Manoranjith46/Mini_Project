import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  getAnalyticsOverview,
  getSpendingAnalytics,
  getIssueTypeAnalytics,
  getDepartmentPerformance,
  getTimelineAnalytics,
} from "../controllers/analytics.controller";

const router = Router();

// Analytics overview
router.get("/analytics/overview", authMiddleware, getAnalyticsOverview);

// Spending analytics
router.get("/analytics/spending", authMiddleware, getSpendingAnalytics);

// Issue type analytics
router.get("/analytics/issue-types", authMiddleware, getIssueTypeAnalytics);

// Department performance
router.get("/analytics/department-performance", authMiddleware, getDepartmentPerformance);

// Timeline analytics
router.get("/analytics/timeline", authMiddleware, getTimelineAnalytics);

export default router;
