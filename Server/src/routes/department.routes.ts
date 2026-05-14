import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  getDepartmentProfile,
  updateDepartmentProfile,
  getDepartmentIssues,
} from "../controllers/department.controller";

const router = Router();

router.get("/department/profile", authMiddleware, getDepartmentProfile);

router.put("/department/:id", authMiddleware, updateDepartmentProfile);

router.get("/department/issues", authMiddleware, getDepartmentIssues);

export default router;
