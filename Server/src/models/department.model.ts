import { model, Schema } from "mongoose";

const DepartmentSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phonenumber: {
      type: String,
      unique: true,
      required: [true, "Phone number required"],
    },
    department: {
      type: String,
      enum: [
        "electricity",
        "water-supply",
        "roads",
        "sanitation",
        "parks",
        "public-health",
      ],
      required: true,
    },
    designation: { type: String, default: "Department Manager" },
    employeeId: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export const DepartmentModel = model("Department", DepartmentSchema);
