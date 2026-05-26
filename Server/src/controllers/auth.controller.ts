import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";
import { sendSmsOtp, verifySmsOtp } from "../utils/messenger";

/**
 * Normalize an Indian phone number to E.164 format (+91XXXXXXXXXX).
 * Accepts: 10-digit number, +91 prefixed, or 91 prefixed.
 * Returns null if the number is not a valid Indian mobile number.
 */
const normalizeIndianPhone = (input: string): string | null => {
  // Remove all spaces, dashes, and parentheses
  const cleaned = input.replace(/[\s\-()]/g, "");

  let digits = cleaned;

  // If it starts with +91, strip the +91
  if (digits.startsWith("+91")) {
    digits = digits.slice(3);
  }
  // If it starts with 91 and is 12 digits, strip the 91
  else if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  // If it starts with 0, strip the leading 0
  else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Must be exactly 10 digits and start with 6-9 (valid Indian mobile)
  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  return null;
};

export const sendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phonenumber: credential } = req.body;

    if (!credential) {
      res.status(400).json({ success: false, message: "Phone number is required" });
      return;
    }

    // Check if the credential is an employeeId (for department logins)
    const isEmployeeId = /^[A-Za-z]/.test(credential);

    let phoneNumber: string | null = null;
    let user;

    if (isEmployeeId) {
      // Look up user by employeeId
      user = await UserModel.findOne({ employeeId: credential.toUpperCase() });
      if (!user || !user.phonenumber) {
        res.status(400).json({
          success: false,
          message: "No phone number associated with this Employee ID",
        });
        return;
      }
      phoneNumber = normalizeIndianPhone(user.phonenumber);
    } else {
      // Normalize the Indian phone number
      phoneNumber = normalizeIndianPhone(credential);

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit Indian mobile number",
        });
        return;
      }

      // Look up or create user
      user = await UserModel.findOne({ phonenumber: { $regex: credential.replace(/^\+91|^91|^0/, ''), $options: 'i' } });

      if (!user) {
        // Also try exact match with normalized number
        user = await UserModel.findOne({ phonenumber: phoneNumber });
      }

      if (!user) {
        // Try matching just the last 10 digits
        const last10 = phoneNumber.slice(-10);
        user = await UserModel.findOne({
          phonenumber: { $regex: last10 + "$" }
        });
      }

      if (!user) {
        const newCitizen = await CitizenModel.create({
          phonenumber: phoneNumber,
          fullName: "Anonymous",
          email: undefined,
        });
        user = await UserModel.create({
          phonenumber: phoneNumber,
          role: "citizen",
          roleRefId: newCitizen._id,
        });
      }
    }

    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: "Could not determine a valid Indian phone number",
      });
      return;
    }

    // Send OTP via Twilio Verify API
    const result = await sendSmsOtp(phoneNumber);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
      });
      return;
    }

    console.log(`📱 OTP sent to ${phoneNumber} via Twilio Verify`);

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
      res.status(400).json({ success: false, message: "Phone number and OTP are required" });
      return;
    }

    // Validate OTP format
    if (!/^\d{4,6}$/.test(otp)) {
      res.status(400).json({
        success: false,
        message: "OTP must be a 4-6 digit code",
      });
      return;
    }

    // Check if the credential is an employeeId
    const isEmployeeId = /^[A-Za-z]/.test(credential);

    let phoneNumber: string | null = null;
    let user;

    if (isEmployeeId) {
      user = await UserModel.findOne({ employeeId: credential.toUpperCase() });
      if (!user || !user.phonenumber) {
        res.status(400).json({
          success: false,
          message: "No phone number associated with this Employee ID",
        });
        return;
      }
      phoneNumber = normalizeIndianPhone(user.phonenumber);
    } else {
      phoneNumber = normalizeIndianPhone(credential);

      if (!phoneNumber) {
        res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit Indian mobile number",
        });
        return;
      }

      // Find user by phone number (try multiple formats)
      user = await UserModel.findOne({ phonenumber: phoneNumber });

      if (!user) {
        const last10 = phoneNumber.slice(-10);
        user = await UserModel.findOne({
          phonenumber: { $regex: last10 + "$" }
        });
      }

      if (!user) {
        // Auto-create citizen if not found
        const newCitizen = await CitizenModel.create({
          phonenumber: phoneNumber,
          fullName: "Anonymous",
          email: undefined,
        });
        user = await UserModel.create({
          phonenumber: phoneNumber,
          role: "citizen",
          roleRefId: newCitizen._id,
        });
      }
    }

    if (!phoneNumber) {
      res.status(400).json({
        success: false,
        message: "Could not determine a valid Indian phone number",
      });
      return;
    }

    // Verify OTP via Twilio Verify API
    const verifyResult = await verifySmsOtp(phoneNumber, otp);

    if (!verifyResult.success) {
      res.status(401).json({ success: false, message: verifyResult.message });
      return;
    }

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
        phone: phoneNumber,
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

    // Return token and user
    res.json({
      success: true,
      token,
      user: responseUser,
    });

    console.log(`✅ ${role} logged in: ${profile.fullName} (${phoneNumber})`);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
