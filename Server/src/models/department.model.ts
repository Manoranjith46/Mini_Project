import { model, Schema } from "mongoose";

const DepartmentSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phonenumber: {
      type: String,
      unique: true,
      required: [true, "Phone number required"],
    },
    designation: { type: String, default: "Department Manager" },
    employeeId: { type: String, unique: true, required: true },
    place: { type: String, default: "Unassigned" },
  },
  { timestamps: true }
);

export const DepartmentModel = model("Department", DepartmentSchema);
