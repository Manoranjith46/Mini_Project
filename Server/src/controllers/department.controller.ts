import { Request, Response } from "express";
import { DepartmentModel } from "../models/department.model";
import { IssueModel } from "../models/issue.model";
import { MultimediaModel } from "../models/multimedia.model";

interface AuthRequest extends Request {
  departmentId?: string;
}

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
    // For now, return all issues (can filter by department type later)
    const issues = await IssueModel.find({})
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
