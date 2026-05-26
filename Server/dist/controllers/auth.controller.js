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
const messenger_1 = require("../utils/messenger");
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
        // Determine the phone number to send OTP to.
        // If the credential is an employeeId (not starting with +), resolve the phone from the user record.
        let phoneNumber = credential;
        if (!credential.startsWith("+")) {
            // credential is an employeeId, get the actual phone number from the user record
            if (user.phonenumber) {
                phoneNumber = user.phonenumber;
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "No phone number associated with this Employee ID",
                });
                return;
            }
        }
        // Ensure phone number is in E.164 format
        if (!/^\+\d{1,15}$/.test(phoneNumber)) {
            res.status(400).json({
                success: false,
                message: "Invalid phone number format. Use E.164 format: +91XXXXXXXXXX",
            });
            return;
        }
        // Send OTP via Twilio Verify API
        const result = yield (0, messenger_1.sendSmsOtp)(phoneNumber);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.message,
            });
            return;
        }
        console.log(`📱 OTP sent to ${phoneNumber} via Twilio Verify`);
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
        // Determine the phone number used for Twilio verification
        let phoneNumber = credential;
        if (!credential.startsWith("+")) {
            if (user.phonenumber) {
                phoneNumber = user.phonenumber;
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "No phone number associated with this Employee ID",
                });
                return;
            }
        }
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            res.status(400).json({
                success: false,
                message: "OTP must be a 6-digit code",
            });
            return;
        }
        // Verify OTP via Twilio Verify API
        const verifyResult = yield (0, messenger_1.verifySmsOtp)(phoneNumber, otp);
        if (!verifyResult.success) {
            res.status(401).json({ success: false, message: verifyResult.message });
            return;
        }
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
        // Return token and user
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
