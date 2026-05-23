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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const citizen_model_1 = require("../models/citizen.model");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        console.log("Invalid token or missing authorization header");
        res.status(401).json({
            message: "Authorization header is missing or malformed",
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    // JWT_PASSWORD is expected to be set in the environment variables
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PASSWORD);
        console.log("Decoded JWT:", decoded);
        //@ts-ignore
        if (decoded.role === "citizen") {
            req.citizenId = decoded.id;
            req.citizenPhone = decoded.phone;
            // If phone is not in JWT (old tokens), fetch from database
            if (!req.citizenPhone) {
                try {
                    const citizen = yield citizen_model_1.CitizenModel.findById(decoded.id);
                    if (citizen) {
                        req.citizenPhone = citizen.phonenumber;
                        console.log("Fetched phone from DB:", req.citizenPhone);
                    }
                }
                catch (err) {
                    console.error("Error fetching citizen phone:", err);
                }
            }
        }
        else if (decoded.role === "admin") {
            req.adminId = decoded.id;
        }
        else if (decoded.role === "department") {
            req.departmentId = decoded.id;
        }
        req.role = decoded.role;
        next();
    }
    catch (e) {
        console.error("Error verifying JWT:", e);
        res.status(403).json({
            message: "Invalid token or expired",
        });
    }
});
exports.authMiddleware = authMiddleware;
