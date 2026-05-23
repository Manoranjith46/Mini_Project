"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlerware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const issues_controllers_1 = require("../controllers/issues.controllers");
const router = (0, express_1.Router)();
// Auth routes removed — now handled by unified auth.routes.ts
router.get("/admin/profile/:id", auth_middleware_1.authMiddleware, admin_controller_1.getAdminProfile);
router.get("/admin/issues", auth_middleware_1.authMiddleware, issues_controllers_1.getIssues);
router.get("/admin/handled-issues", auth_middleware_1.authMiddleware, admin_controller_1.getHandledIssuesByAdmin);
router.get("/admin/dashboard-stats", auth_middleware_1.authMiddleware, admin_controller_1.getDashboardStats);
router.get("/admin/analytics", auth_middleware_1.authMiddleware, admin_controller_1.getAnalyticsData);
router.put("/admin/:id", auth_middleware_1.authMiddleware, admin_controller_1.updateAdminProfile);
router.put("/admin/issue/:id/status", auth_middleware_1.authMiddleware, admin_controller_1.updateIssueStatus);
router.put("/admin/issue/:id/cost", auth_middleware_1.authMiddleware, admin_controller_1.updateIssueCost);
router.delete("/issue/admin/:issueid", auth_middleware_1.authMiddleware, admin_controller_1.deleteIssueByAdmin);
exports.default = router;
