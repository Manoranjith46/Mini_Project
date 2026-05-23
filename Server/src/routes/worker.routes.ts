import { Router } from "express";
import { authMiddleware } from "../middlerware/auth.middleware";
import {
  createWorker,
  getWorkersByDepartment,
  getWorkersByZone,
  getWorkerById,
  assignWorkerToIssue,
  getWorkerAssignedIssues,
  updateWorkerProfile,
} from "../controllers/worker.controller";

const router = Router();

// Create a new worker
router.post("/workers", authMiddleware, createWorker);

// Get workers by department
router.get("/workers/department/:departmentId", authMiddleware, getWorkersByDepartment);

// Get workers by zone
router.get("/workers/zone/:zone", authMiddleware, getWorkersByZone);

// Get worker profile
router.get("/workers/:workerId", authMiddleware, getWorkerById);

// Assign worker to issue
router.post("/workers/assign", authMiddleware, assignWorkerToIssue);

// Get issues assigned to a worker
router.get("/workers/:workerId/issues", authMiddleware, getWorkerAssignedIssues);

// Update worker profile
router.put("/workers/:workerId", authMiddleware, updateWorkerProfile);

export default router;
