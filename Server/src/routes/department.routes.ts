import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  createDepartmentManager,
  getAllDepartments,
  getDepartmentProfile,
  updateDepartmentProfile,
  getDepartmentIssues,
} from "../controllers/department.controller";

const router = Router();

router.get("/department/managers", authMiddleware, getAllDepartments);

router.post("/department/managers", authMiddleware, createDepartmentManager);

router.get("/department/profile", authMiddleware, getDepartmentProfile);

router.put("/department/:id", authMiddleware, updateDepartmentProfile);

router.get("/department/issues", authMiddleware, getDepartmentIssues);

export default router;
