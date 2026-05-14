import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
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
      type: Schema.Types.ObjectId,
      required: true,
    },
    otpHash: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = model("User", UserSchema);
