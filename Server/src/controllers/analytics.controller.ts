import { Request, Response } from "express";
import { IssueModel } from "../models/issue.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";

interface AuthRequest extends Request {
  adminId?: string;
  role?: "admin" | "citizen" | "department";
}

export const getAnalyticsOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = "all" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    // Total issues
    const totalIssues = await IssueModel.countDocuments(
      dateFilter ? { createdAt: dateFilter } : {}
    );

    // Issues by status
    const issuesByStatus = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Total spending
    const totalSpending = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$costAmount" },
        },
      },
    ]);

    // Average resolution time
    const resolutionTimes = await IssueModel.find(
      { status: "Resolved", resolvedAt: { $exists: true } },
      { createdAt: 1, resolvedAt: 1 }
    ).lean();

    const avgResolutionDays =
      resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, issue: any) => {
            const days = (issue.resolvedAt - issue.createdAt) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / resolutionTimes.length
        : 0;

    res.json({
      success: true,
      data: {
        totalIssues,
        issuesByStatus: issuesByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalSpending: totalSpending[0]?.total || 0,
        avgResolutionDays: Math.round(avgResolutionDays * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSpendingAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = "all" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    const spendingByDepartment = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: "$handledBy",
          totalSpending: { $sum: "$costAmount" },
          issueCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "_id",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          adminName: { $ifNull: ["$admin.fullName", "Unassigned"] },
          totalSpending: 1,
          issueCount: 1,
          avgSpendingPerIssue: {
            $cond: [
              { $gt: ["$issueCount", 0] },
              { $divide: ["$totalSpending", "$issueCount"] },
              0,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: spendingByDepartment,
    });
  } catch (error) {
    console.error("Error fetching spending analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIssueTypeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = "all" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    const issueTypeData = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: "$issueType",
          count: { $sum: 1 },
          totalSpending: { $sum: "$costAmount" },
          avgSpending: { $avg: "$costAmount" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: issueTypeData,
    });
  } catch (error) {
    console.error("Error fetching issue type analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDepartmentPerformance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { timeRange = "all" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    const departmentPerformance = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: "$handledBy",
          totalIssues: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          inProgressCount: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
          totalSpending: { $sum: "$costAmount" },
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "_id",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          adminName: { $ifNull: ["$admin.fullName", "Unassigned"] },
          totalIssues: 1,
          resolvedCount: 1,
          rejectedCount: 1,
          pendingCount: 1,
          inProgressCount: 1,
          totalSpending: 1,
          resolutionRate: {
            $cond: [
              { $gt: ["$totalIssues", 0] },
              { $divide: ["$resolvedCount", "$totalIssues"] },
              0,
            ],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: departmentPerformance,
    });
  } catch (error) {
    console.error("Error fetching department performance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTimelineAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = "30" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    const timelineData = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
          spending: { $sum: "$costAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      data: timelineData,
    });
  } catch (error) {
    console.error("Error fetching timeline analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function getDateFilter(timeRange: string): { $gte: Date } | null {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "7":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "60":
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    case "90":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      return null;
  }

  return { $gte: startDate };
}
