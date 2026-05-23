"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/auth/send-otp", auth_controller_1.sendOtp);
router.post("/auth/verify-otp", auth_controller_1.verifyOtp);
exports.default = router;
