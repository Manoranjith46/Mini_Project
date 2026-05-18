import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";

// Demo OTP - always accepted in development
const DEMO_OTP = "123456";

export const sendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phonenumber: credential } = req.body;

    if (!credential) {
      res.status(400).json({ success: false, message: "Phone number or Employee ID required" });
      return;
    }

    // Look up the user by phonenumber OR employeeId
    let user = await UserModel.findOne({
      $or: [
        { phonenumber: credential },
        { employeeId: credential.toUpperCase() }
      ]
    });

    // If user does not exist, create a new citizen profile and corresponding user entry
    if (!user) {
      const newCitizen = await CitizenModel.create({
        phonenumber: credential,
        fullName: "Anonymous",
        email: undefined,
      });
      user = await UserModel.create({
        phonenumber: credential,
        role: "citizen",
        roleRefId: newCitizen._id,
      });
    }

    // In demo mode, just store a dummy OTP
    const otp = DEMO_OTP;
    user.otpHash = otp; // In production, store bcrypt hash
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    console.log(`📱 OTP for ${credential}: ${otp} (Demo Mode)`);

    res.json({
      success: true,
      role: user.role,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phonenumber: credential, otp } = req.body;

    if (!credential || !otp) {
      res.status(400).json({ success: false, message: "Credential and OTP required" });
      return;
    }

    let user = await UserModel.findOne({
      $or: [
        { phonenumber: credential },
        { employeeId: credential.toUpperCase() }
      ]
    });

    // If user does not exist, create a new citizen account and associated user record
    if (!user) {
      // Create a basic citizen profile (you may extend with additional fields as needed)
      const newCitizen = await CitizenModel.create({
        phonenumber: credential,
        fullName: "Anonymous",
        email: undefined,
      });

      // Create the corresponding user entry linking to the citizen profile
      user = await UserModel.create({
        phonenumber: credential,
        role: "citizen",
        roleRefId: newCitizen._id,
      });
    }

    // Demo mode: accept DEMO_OTP always
    const isValidOtp = otp === DEMO_OTP || otp === user.otpHash;

    if (!isValidOtp) {
      res.status(401).json({ success: false, message: "Invalid OTP" });
      return;
    }

    // Check expiry
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      res.status(401).json({ success: false, message: "OTP expired" });
      return;
    }

    // Clear OTP
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Fetch the role-specific profile
    let profile: any = null;
    const role = user.role;

    if (role === "citizen") {
      profile = await CitizenModel.findById(user.roleRefId).lean();
    } else if (role === "admin") {
      profile = await AdminModel.findById(user.roleRefId).lean();
    } else if (role === "department") {
      profile = await DepartmentModel.findById(user.roleRefId).lean();
    }

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.roleRefId.toString(),
        role: user.role,
        phone: profile.phonenumber || credential,
      },
      process.env.JWT_PASSWORD!,
      { expiresIn: "1d" }
    );

    // Build response user object
    const responseUser: any = {
      id: profile._id,
      fullName: profile.fullName,
      phonenumber: profile.phonenumber,
      role: user.role,
    };

    // Add role-specific fields
    if (role === "admin") {
      responseUser.department = profile.department;
      responseUser.adminAccessCode = profile.adminAccessCode;
      responseUser.email = profile.email;
    } else if (role === "department") {
      responseUser.designation = profile.designation;
      responseUser.employeeId = profile.employeeId;
      responseUser.place = profile.place;
    } else if (role === "citizen") {
      responseUser.email = profile.email;
    }

    // Store role & userId in localStorage-friendly format
    res.json({
      success: true,
      token,
      user: responseUser,
    });

    console.log(`✅ ${role} logged in: ${profile.fullName} (${credential})`);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
