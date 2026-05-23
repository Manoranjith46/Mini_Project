"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModel = void 0;
const mongoose_1 = require("mongoose");
const WorkerSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    phonenumber: {
        type: String,
        unique: true,
        required: [true, "Phone number required"],
        index: true,
    },
    email: { type: String, sparse: true, lowercase: true },
    employeeId: { type: String, unique: true, required: true },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    zone: { type: String, default: "Unassigned" },
    specialization: {
        type: [String],
        default: ["General"],
    },
    isActive: { type: Boolean, default: true },
    assignedIssues: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Issue",
        },
    ],
}, { timestamps: true });
exports.WorkerModel = (0, mongoose_1.model)("Worker", WorkerSchema);
