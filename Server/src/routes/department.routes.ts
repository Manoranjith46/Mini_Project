import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  createDepartmentManager,
  getAllDepartments,
  getDepartmentProfile,
  updateDepartmentProfile,
  getDepartmentIssues,
  getDepartmentAnalytics,
  updateIssueStatusByDepartment,
  updateIssueCostByDepartment,
} from "../controllers/department.controller";

const router = Router();

router.get("/department/managers", authMiddleware, getAllDepartments);

router.post("/department/managers", authMiddleware, createDepartmentManager);

router.get("/department/profile", authMiddleware, getDepartmentProfile);

router.put("/department/:id", authMiddleware, updateDepartmentProfile);

router.get("/department/issues", authMiddleware, getDepartmentIssues);
router.get("/department/analytics", authMiddleware, getDepartmentAnalytics);
router.put("/department/issue/:id/status", authMiddleware, updateIssueStatusByDepartment);
router.put("/department/issue/:id/cost", authMiddleware, updateIssueCostByDepartment);

export default router;
