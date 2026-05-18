import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  deleteIssueByAdmin,
  getAdminProfile,
  getHandledIssuesByAdmin,
  updateAdminProfile,
  updateIssueStatus,
  getDashboardStats,
} from "../controllers/admin.controller";
import { getIssues } from "../controllers/issues.controllers";

const router = Router();

// Auth routes removed — now handled by unified auth.routes.ts

router.get("/admin/profile/:id", authMiddleware, getAdminProfile);

router.get("/admin/issues", authMiddleware, getIssues);

router.get("/admin/handled-issues", authMiddleware, getHandledIssuesByAdmin);

router.get("/admin/dashboard-stats", authMiddleware, getDashboardStats);

router.put("/admin/:id", authMiddleware, updateAdminProfile);

router.put("/admin/issue/:id/status", authMiddleware, updateIssueStatus);

router.delete("/issue/admin/:issueid", authMiddleware, deleteIssueByAdmin);

export default router;
