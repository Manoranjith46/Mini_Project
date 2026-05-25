import { Request, Response } from "express";
import { DepartmentModel } from "../models/department.model";
import { IssueModel } from "../models/issue.model";
import { MultimediaModel } from "../models/multimedia.model";
import { UserModel } from "../models/user.model";
import { IssueStatusHistoryModel } from "../models/issueStatusHistory.model";
import mongoose from "mongoose";

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

    // Fetch issues assigned to the manager's zone.
    const issues = await IssueModel.find({
      departmentAssigned: department.place,
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

export const getDepartmentAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const departmentId = req.departmentId;
    const { timeRange = "all" } = req.query;

    const department = await DepartmentModel.findById(departmentId).lean();
    if (!department) {
      res.status(404).json({ message: "Department manager not found" });
      return;
    }

    const zone = department.place;

    const getDateFilter = (range: string): { $gte: Date } | null => {
      const now = new Date();
      switch (range) {
        case "30": return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        case "60": return { $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) };
        case "90": return { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        default: return null;
      }
    };

    const dateFilter = getDateFilter(timeRange as string);
    const zoneFilter: any = { departmentAssigned: zone };
    const baseFilter: any = dateFilter ? { ...zoneFilter, createdAt: dateFilter } : { ...zoneFilter };

    // 1. Counts by status
    const totalIssues = await IssueModel.countDocuments(baseFilter);
    const resolvedIssues = await IssueModel.countDocuments({ ...baseFilter, status: "Resolved" });
    const inProgressIssues = await IssueModel.countDocuments({ ...baseFilter, status: "In Progress" });
    const pendingIssues = await IssueModel.countDocuments({ ...baseFilter, status: "Pending" });
    const rejectedIssues = await IssueModel.countDocuments({ ...baseFilter, status: "Rejected" });

    // 2. Cost analytics (resolved only)
    const costData = await IssueModel.aggregate([
      { $match: { ...baseFilter, status: "Resolved" } },
      { $group: { _id: null, totalSpent: { $sum: "$costAmount" }, avgCost: { $avg: "$costAmount" }, count: { $sum: 1 } } },
    ]);
    const { totalSpent = 0, avgCost = 0 } = costData[0] || {};

    // 3. Cost by issue type
    const costByType = await IssueModel.aggregate([
      { $match: { ...baseFilter, status: "Resolved" } },
      { $group: { _id: "$issueType", totalCost: { $sum: "$costAmount" }, count: { $sum: 1 }, avgCost: { $avg: "$costAmount" } } },
      { $sort: { totalCost: -1 } },
    ]);

    // 4. Cost by status
    const costByStatus = await IssueModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", totalCost: { $sum: "$costAmount" }, count: { $sum: 1 } } },
      { $sort: { totalCost: -1 } },
    ]);

    // 5. Issue breakdown by type
    const topIssueTypes = await IssueModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$issueType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 6. Resolution trends by date
    const resolutionTrends = await IssueModel.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" }, day: { $dayOfMonth: "$updatedAt" } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          cost: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, "$costAmount", 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // 7. Top upvoted issues in this zone
    const topUpvotedIssues = await IssueModel.find(baseFilter)
      .sort({ upvotes: -1 })
      .limit(5)
      .select("title upvotes issueType status");

    // 8. Top reported addresses within this zone
    const topReportedZones = await IssueModel.aggregate([
      { $match: baseFilter },
      { $group: { _id: { address: "$location.address" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // 9. Avg resolution time
    const avgResolutionTimeData = await IssueModel.aggregate([
      { $match: { ...baseFilter, status: "Resolved", resolvedAt: { $exists: true } } },
      { $group: { _id: null, avgTime: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } } } },
    ]);
    const avgResolutionTimeMs = avgResolutionTimeData[0]?.avgTime || 0;
    const avgResolutionTimeDays = Math.round(avgResolutionTimeMs / (1000 * 60 * 60 * 24));

    // 10. Resolution rate
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // 11. Recent resolved issues
    const recentResolvedIssues = await IssueModel.find({ ...baseFilter, status: "Resolved" })
      .sort({ resolvedAt: -1 })
      .limit(10)
      .select("title issueType costAmount resolvedAt upvotes");

    // Response matches admin analytics shape exactly so frontend can reuse AnalyticsData type
    res.status(200).json({
      success: true,
      timeRange,
      analytics: {
        summary: { totalIssues, resolvedIssues, inProgressIssues, pendingIssues, rejectedIssues, resolutionRate },
        costs: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgCostPerIssue: Math.round(avgCost * 100) / 100,
          costByType,
          costByStatus,
          costByDepartment: [],
        },
        performance: {
          avgResolutionTimeDays,
          managerPerformance: [],
          topIssueTypes,
        },
        trends: { resolutionTrends },
        engagement: { topUpvotedIssues, topReportedZones, recentResolvedIssues },
      },
    });
  } catch (error) {
    console.error("Error fetching department analytics:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateIssueStatusByDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, title, description, costAmount } = req.body;
    const departmentId = req.departmentId;

    const validStatuses = ["In Progress", "Resolved", "Rejected", "Pending"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const updateData: any = { status };
    if (status === "Resolved") {
      updateData.resolvedAt = new Date();
    }

    let costToAdd = 0;
    if (costAmount !== undefined && costAmount !== null) {
      costToAdd = Number(costAmount);
      if (isNaN(costToAdd) || costToAdd < 0) {
        res.status(400).json({ message: "Cost must be a non-negative number" });
        return;
      }
      updateData.$inc = { costAmount: costToAdd };
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedIssue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Create status history record with title, description, and costAdded
    await IssueStatusHistoryModel.create({
      issueID: new mongoose.Types.ObjectId(id),
      status,
      title: title?.trim() || "",
      description: description?.trim() || "",
      handledBy: new mongoose.Types.ObjectId(departmentId!),
      changedBy: new mongoose.Types.ObjectId(departmentId!),
      costAdded: costToAdd,
      changedAt: new Date(),
    });

    res.json({ message: "Issue status updated successfully", issue: updatedIssue });
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateIssueCostByDepartment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { costAmount } = req.body;
    const departmentId = req.departmentId;

    if (costAmount === undefined || costAmount === null) {
      res.status(400).json({ message: "Cost amount is required" });
      return;
    }

    if (typeof costAmount !== "number" || costAmount < 0) {
      res.status(400).json({ message: "Cost must be a non-negative number" });
      return;
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(
      id,
      { costAmount },
      { new: true }
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Create status history record with cost
    await IssueStatusHistoryModel.create({
      issueID: new mongoose.Types.ObjectId(id),
      status: updatedIssue.status,
      handledBy: new mongoose.Types.ObjectId(departmentId!),
      changedBy: new mongoose.Types.ObjectId(departmentId!),
      costAdded: costAmount,
      changedAt: new Date(),
    });

    res.json({ message: "Cost updated successfully", issue: updatedIssue });
  } catch (error) {
    console.error("Error updating issue cost:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
