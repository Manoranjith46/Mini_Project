"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlerware/auth.middleware");
const worker_controller_1 = require("../controllers/worker.controller");
const router = (0, express_1.Router)();
// Create a new worker
router.post("/workers", auth_middleware_1.authMiddleware, worker_controller_1.createWorker);
// Get workers by department
router.get("/workers/department/:departmentId", auth_middleware_1.authMiddleware, worker_controller_1.getWorkersByDepartment);
// Get workers by zone
router.get("/workers/zone/:zone", auth_middleware_1.authMiddleware, worker_controller_1.getWorkersByZone);
// Get worker profile
router.get("/workers/:workerId", auth_middleware_1.authMiddleware, worker_controller_1.getWorkerById);
// Assign worker to issue
router.post("/workers/assign", auth_middleware_1.authMiddleware, worker_controller_1.assignWorkerToIssue);
// Get issues assigned to a worker
router.get("/workers/:workerId/issues", auth_middleware_1.authMiddleware, worker_controller_1.getWorkerAssignedIssues);
// Update worker profile
router.put("/workers/:workerId", auth_middleware_1.authMiddleware, worker_controller_1.updateWorkerProfile);
exports.default = router;
