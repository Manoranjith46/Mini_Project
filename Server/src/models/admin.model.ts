import { model, Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    phonenumber: {
      type: String,
      required: [true, "Phone number required"],
    },
    department: { type: String, required: true },
    adminAccessCode: { type: Number, required: true, unique: true },
    employeeId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const AdminModel = model("Admin", AdminSchema);
