import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  getDetailedIssueReport,
  getAllReports,
  getReportsSummary,
} from "../controllers/reports.controller";

const router = Router();

// Get detailed report for a specific issue
router.get("/reports/:issueId", authMiddleware, getDetailedIssueReport);

// Get all reports with filters
router.get("/reports", authMiddleware, getAllReports);

// Get reports summary with statistics
router.get("/reports-summary", authMiddleware, getReportsSummary);

export default router;
