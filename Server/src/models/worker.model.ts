import { model, Schema } from "mongoose";

const WorkerSchema = new Schema(
  {
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
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
  },
  { timestamps: true }
);

export const WorkerModel = model("Worker", WorkerSchema);
