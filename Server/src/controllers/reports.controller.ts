import { Request, Response } from "express";
import { IssueModel } from "../models/issue.model";
import { IssueStatusHistoryModel } from "../models/issueStatusHistory.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";

interface AuthRequest extends Request {
  adminId?: string;
  citizenId?: string;
  role?: "admin" | "citizen" | "department";
}

export const getDetailedIssueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { issueId } = req.params;

    const issue = await IssueModel.findById(issueId)
      .populate("citizenId", "fullName phonenumber email")
      .populate("reporters", "fullName phonenumber")
      .populate("handledBy", "fullName department employeeId")
      .populate("media")
      .lean();

    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Check authorization
    if (req.role === "citizen" && issue.citizenId._id.toString() !== req.citizenId) {
      res.status(403).json({ message: "Unauthorized access" });
      return;
    }

    // Get status history
    const statusHistory = await IssueStatusHistoryModel.find({ issueID: issueId })
      .populate("changedBy", "fullName role")
      .sort({ changedAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        issue,
        statusHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching detailed report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      issueType,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (issueType) {
      filter.issueType = issueType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // For citizens, only show their own issues
    if (req.role === "citizen") {
      filter.citizenId = req.citizenId;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const reports = await IssueModel.find(filter)
      .populate("citizenId", "fullName phonenumber")
      .populate("handledBy", "fullName department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean();

    const total = await IssueModel.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReportsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = "30" } = req.query;

    const dateFilter = getDateFilter(timeRange as string);

    const summary = await IssueModel.aggregate([
      {
        $match: dateFilter ? { createdAt: dateFilter } : {},
      },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byType: [
            {
              $group: {
                _id: "$issueType",
                count: { $sum: 1 },
              },
            },
          ],
          financialSummary: [
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$costAmount" },
                avgSpent: { $avg: "$costAmount" },
                maxSpent: { $max: "$costAmount" },
                minSpent: { $min: "$costAmount" },
              },
            },
          ],
          recentReports: [
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                title: 1,
                status: 1,
                issueType: 1,
                costAmount: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: summary[0],
    });
  } catch (error) {
    console.error("Error fetching reports summary:", error);
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
