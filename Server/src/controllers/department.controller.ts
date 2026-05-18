import { Request, Response } from "express";
import { DepartmentModel } from "../models/department.model";
import { IssueModel } from "../models/issue.model";
import { MultimediaModel } from "../models/multimedia.model";
import { UserModel } from "../models/user.model";

interface AuthRequest extends Request {
  departmentId?: string;
}

export const getAllDepartments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const departments = await DepartmentModel.find({}).select(
      "fullName phonenumber email designation employeeId place createdAt"
    );

    res.json({ departments });
  } catch (error) {
    console.error("Error fetching all departments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createDepartmentManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullName, phonenumber, employeeId, place, designation } = req.body;

    if (!fullName || !phonenumber || !employeeId || !place) {
      res.status(400).json({
        message: "Full name, phone number, employee ID, and zone are required",
      });
      return;
    }

    const normalizedEmployeeId = String(employeeId).trim().toUpperCase();
    const normalizedPhoneNumber = String(phonenumber).trim();

    const existingManager = await DepartmentModel.findOne({
      $or: [
        { phonenumber: normalizedPhoneNumber },
        { employeeId: normalizedEmployeeId },
      ],
    });

    if (existingManager) {
      res.status(409).json({
        message: "A manager with this phone number or employee ID already exists",
      });
      return;
    }

    const existingUser = await UserModel.findOne({
      $or: [
        { phonenumber: normalizedPhoneNumber },
        { employeeId: normalizedEmployeeId },
      ],
    });

    if (existingUser) {
      res.status(409).json({
        message: "A login user with this phone number or employee ID already exists",
      });
      return;
    }

    const manager = await DepartmentModel.create({
      fullName: String(fullName).trim(),
      phonenumber: normalizedPhoneNumber,
      employeeId: normalizedEmployeeId,
      place: String(place).trim(),
      designation: designation?.trim() || "Department Manager",
    });

    await UserModel.create({
      phonenumber: normalizedPhoneNumber,
      employeeId: normalizedEmployeeId,
      role: "department",
      roleRefId: manager._id,
    });

    res.status(201).json({
      message: "Manager created successfully",
      manager,
    });
  } catch (error) {
    console.error("Error creating department manager:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDepartmentProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.departmentId;

    const department = await DepartmentModel.findById(departmentId).lean();

    if (!department) {
      res.status(404).json({ message: "Department manager not found" });
      return;
    }

    res.json(department);
  } catch (error) {
    console.error("Error fetching department profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateDepartmentProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const departmentId = req.departmentId;

    if (id !== departmentId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    const { fullName, designation } = req.body;

    const updated = await DepartmentModel.findByIdAndUpdate(
      id,
      { fullName, designation },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Department manager not found" });
      return;
    }

    res.json({ message: "Profile updated successfully", department: updated });
  } catch (error) {
    console.error("Error updating department profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDepartmentIssues = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.departmentId;

    // Get the department manager's place/corporation.
    const department = await DepartmentModel.findById(departmentId).lean();
    if (!department) {
      res.status(404).json({ message: "Department manager not found" });
      return;
    }

    // Fetch issues for the manager's place/corporation.
    const issues = await IssueModel.find({
      "location.address": department.place,
    })
      .populate("citizenId", "fullName phonenumber")
      .sort({ createdAt: -1 });

    const issuesWithMedia = await Promise.all(
      issues.map(async (issue) => {
        const media = await MultimediaModel.find({ issueID: issue._id });
        const issueObj = issue.toObject ? issue.toObject() : issue;
        return {
          _id: issueObj._id,
          title: issueObj.title,
          description: issueObj.description,
          type: issueObj.issueType,
          location: issueObj.location,
          reportedBy: (issueObj.citizenId as any)?.fullName || "Anonymous",
          reportedAt: issueObj.createdAt,
          image: media.length > 0 ? media[0].url : null,
          status: (issueObj.status as string) === "Reported" ? "Pending" : issueObj.status,
          upvotes: issueObj.upvotes || 0,
        };
      })
    );

    res.json({ issues: issuesWithMedia });
  } catch (error) {
    console.error("Error fetching department issues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
