import { Schema, model } from "mongoose";

const CitizenSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    phonenumber: {
      type: String,
      unique: true,
      required: [true, "User phone number required"],
      index: true,
    },
  },
  { timestamps: true }
);

export const CitizenModel = model("Citizen", CitizenSchema);
