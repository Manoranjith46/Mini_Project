"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseModel = void 0;
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    issueId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Issue",
        required: true,
    },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    amount: {
        type: Number,
        required: [true, "Expense amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
    },
    category: {
        type: String,
        enum: ["Labor", "Materials", "Equipment", "Transportation", "Other"],
        default: "Other",
    },
    attachmentUrl: {
        type: String,
        sparse: true,
    },
    attachmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Multimedia",
        sparse: true,
    },
    submittedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
        sparse: true,
    },
    approvalStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    rejectionReason: {
        type: String,
        sparse: true,
    },
}, { timestamps: true });
exports.ExpenseModel = (0, mongoose_1.model)("Expense", ExpenseSchema);
