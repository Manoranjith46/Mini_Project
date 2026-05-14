import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  deleteIssue,
  getCitizenProfile,
  getIssuesByCitizen,
  updateCitizenProfile,
} from "../controllers/citizen.controller";

const router = Router();

// Auth routes removed — now handled by unified auth.routes.ts

router.get("/citizen/profile/", authMiddleware, getCitizenProfile);

router.put("/citizen/:id", authMiddleware, updateCitizenProfile);

router.get("/citizen/issues", authMiddleware, getIssuesByCitizen);

router.delete("/citizen/issues/:id", authMiddleware, deleteIssue);

export default router;
