import { model, Schema } from "mongoose";

const ExpenseSchema = new Schema(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: "Multimedia",
      sparse: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

export const ExpenseModel = model("Expense", ExpenseSchema);
