"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlerware/auth.middleware");
const citizen_controller_1 = require("../controllers/citizen.controller");
const router = (0, express_1.Router)();
// Auth routes removed — now handled by unified auth.routes.ts
router.get("/citizen/profile/", auth_middleware_1.authMiddleware, citizen_controller_1.getCitizenProfile);
router.put("/citizen/:id", auth_middleware_1.authMiddleware, citizen_controller_1.updateCitizenProfile);
router.get("/citizen/issues", auth_middleware_1.authMiddleware, citizen_controller_1.getIssuesByCitizen);
router.delete("/citizen/issues/:id", auth_middleware_1.authMiddleware, citizen_controller_1.deleteIssue);
exports.default = router;
