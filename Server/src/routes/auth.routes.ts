import { Router } from "express";
import { sendOtp, verifyOtp } from "../controllers/auth.controller";

const router = Router();

router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);

export default router;
