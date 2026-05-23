"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.sendOtp = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const citizen_model_1 = require("../models/citizen.model");
const admin_model_1 = require("../models/admin.model");
const department_model_1 = require("../models/department.model");
// Demo OTP - always accepted in development
const DEMO_OTP = "123456";
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phonenumber: credential } = req.body;
        if (!credential) {
            res.status(400).json({ success: false, message: "Phone number or Employee ID required" });
            return;
        }
        // Look up the user by phonenumber OR employeeId
        let user = yield user_model_1.UserModel.findOne({
            $or: [
                { phonenumber: credential },
                { employeeId: credential.toUpperCase() }
            ]
        });
        // If user does not exist, create a new citizen profile and corresponding user entry
        if (!user) {
            const newCitizen = yield citizen_model_1.CitizenModel.create({
                phonenumber: credential,
                fullName: "Anonymous",
                email: undefined,
            });
            user = yield user_model_1.UserModel.create({
                phonenumber: credential,
                role: "citizen",
                roleRefId: newCitizen._id,
            });
        }
        // In demo mode, just store a dummy OTP
        const otp = DEMO_OTP;
        user.otpHash = otp; // In production, store bcrypt hash
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        yield user.save();
        console.log(`📱 OTP for ${credential}: ${otp} (Demo Mode)`);
        res.json({
            success: true,
            role: user.role,
            message: "OTP sent successfully",
        });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phonenumber: credential, otp } = req.body;
        if (!credential || !otp) {
            res.status(400).json({ success: false, message: "Credential and OTP required" });
            return;
        }
        let user = yield user_model_1.UserModel.findOne({
            $or: [
                { phonenumber: credential },
                { employeeId: credential.toUpperCase() }
            ]
        });
        // If user does not exist, create a new citizen account and associated user record
        if (!user) {
            // Create a basic citizen profile (you may extend with additional fields as needed)
            const newCitizen = yield citizen_model_1.CitizenModel.create({
                phonenumber: credential,
                fullName: "Anonymous",
                email: undefined,
            });
            // Create the corresponding user entry linking to the citizen profile
            user = yield user_model_1.UserModel.create({
                phonenumber: credential,
                role: "citizen",
                roleRefId: newCitizen._id,
            });
        }
        // Demo mode: accept DEMO_OTP always
        const isValidOtp = otp === DEMO_OTP || otp === user.otpHash;
        if (!isValidOtp) {
            res.status(401).json({ success: false, message: "Invalid OTP" });
            return;
        }
        // Check expiry
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            res.status(401).json({ success: false, message: "OTP expired" });
            return;
        }
        // Clear OTP
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        yield user.save();
        // Fetch the role-specific profile
        let profile = null;
        const role = user.role;
        if (role === "citizen") {
            profile = yield citizen_model_1.CitizenModel.findById(user.roleRefId).lean();
        }
        else if (role === "admin") {
            profile = yield admin_model_1.AdminModel.findById(user.roleRefId).lean();
        }
        else if (role === "department") {
            profile = yield department_model_1.DepartmentModel.findById(user.roleRefId).lean();
        }
        if (!profile) {
            res.status(404).json({ success: false, message: "Profile not found" });
            return;
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            id: user.roleRefId.toString(),
            role: user.role,
            phone: profile.phonenumber || credential,
        }, process.env.JWT_PASSWORD, { expiresIn: "1d" });
        // Build response user object
        const responseUser = {
            id: profile._id,
            fullName: profile.fullName,
            phonenumber: profile.phonenumber,
            role: user.role,
        };
        // Add role-specific fields
        if (role === "admin") {
            responseUser.department = profile.department;
            responseUser.adminAccessCode = profile.adminAccessCode;
            responseUser.email = profile.email;
        }
        else if (role === "department") {
            responseUser.designation = profile.designation;
            responseUser.employeeId = profile.employeeId;
            responseUser.place = profile.place;
        }
        else if (role === "citizen") {
            responseUser.email = profile.email;
        }
        // Store role & userId in localStorage-friendly format
        res.json({
            success: true,
            token,
            user: responseUser,
        });
        console.log(`✅ ${role} logged in: ${profile.fullName} (${credential})`);
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.verifyOtp = verifyOtp;
