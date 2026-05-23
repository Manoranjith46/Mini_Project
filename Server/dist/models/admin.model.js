"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModel = void 0;
const mongoose_1 = require("mongoose");
const AdminSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    phonenumber: {
        type: String,
        required: [true, "Phone number required"],
    },
    department: { type: String, required: true },
    adminAccessCode: { type: Number, required: true, unique: true },
    employeeId: { type: String, unique: true, sparse: true },
}, { timestamps: true });
exports.AdminModel = (0, mongoose_1.model)("Admin", AdminSchema);
