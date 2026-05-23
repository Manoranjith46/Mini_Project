"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentModel = void 0;
const mongoose_1 = require("mongoose");
const DepartmentSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    phonenumber: {
        type: String,
        unique: true,
        required: [true, "Phone number required"],
    },
    designation: { type: String, default: "Department Manager" },
    employeeId: { type: String, unique: true, required: true },
    place: { type: String, default: "Unassigned" },
}, { timestamps: true });
exports.DepartmentModel = (0, mongoose_1.model)("Department", DepartmentSchema);
