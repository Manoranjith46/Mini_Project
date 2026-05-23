"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    phonenumber: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
    },
    employeeId: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
    },
    role: {
        type: String,
        enum: ["citizen", "admin", "department"],
        required: true,
    },
    roleRefId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    otpHash: { type: String },
    otpExpiry: { type: Date },
}, { timestamps: true });
exports.UserModel = (0, mongoose_1.model)("User", UserSchema);
