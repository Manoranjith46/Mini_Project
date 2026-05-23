import { AdminModel } from "../models/admin.model";
import { IssueModel } from "../models/issue.model";
import { Request, Response } from "express";
import { IssueStatusHistoryModel } from "../models/issueStatusHistory.model";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  adminId?: string;
}

// Helper function to get date range filter
const getDateRangeFilter = (timeRange: string): { $gte: Date } | null => {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
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
      return null; // No filter for all time
  }

  return { $gte: startDate };
};

export const getAdminProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const loggedInAdminId = req.adminId;

    if (id !== loggedInAdminId) {
      res.status(403).json({ message: "Unauthorised access" });
      return;
    }

    const admin = await AdminModel.findById(id).select("-password").lean();

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    res.json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAdminProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const { fullName, email, phonenumber, department } = req.body;

    if (!fullName || !email || !phonenumber || !department) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      id,
      { fullName, email, phonenumber, department },
      { new: true }
    );

    if (!updatedAdmin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    res.json({ message: "Profile updated successfully", user: updatedAdmin });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateIssueStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.adminId;

    const validStatuses = [
      "In Progress",
      "Resolved",
      "Rejected",
      "Pending",
    ];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }
    // Creating a record in IssueStatusHistory for this status change

    await IssueStatusHistoryModel.create({
      issueID: new mongoose.Types.ObjectId(id),
      status,
      handledBy: new mongoose.Types.ObjectId(adminId!),
      changedBy: new mongoose.Types.ObjectId(adminId!), // original reporter, optional
      changedAt: new Date(), // optional if timestamps enabled
    });

    res.json({ message: "Issue updated successfully", issue: updatedIssue });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHandledIssuesByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const adminId = authReq.adminId; // from authMiddleware

    if (!adminId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const historyRecords = await IssueStatusHistoryModel.aggregate([
  {
    $match: {
      handledBy: new mongoose.Types.ObjectId(adminId),
      status: { $in: ["In Progress", "Resolved","Pending","Rejected"] },
    },
  },
  {
    $sort: { changedAt: -1 },
  },
  {
    $group: {
      _id: "$issueID",
      latestRecord: { $first: "$$ROOT" },
    },
  },
  {
    $replaceRoot: { newRoot: "$latestRecord" },
  },
  {
    $lookup: {
      from: "issues",
      localField: "issueID",
      foreignField: "_id",
      as: "issueDetails",
    },
  },
  {
    $unwind: "$issueDetails",
  },
  {
    $project: {
      status: 1,
      handledBy: 1,
      lastStatus: "$status",
      lastUpdated: "$changedAt",
      issueDetails: 1,
    },
  },
]);
const issues = historyRecords.map((record) => ({
  ...record.issueDetails,
  status: record.status === "Reported" ? "Pending" : record.status,
  handledBy: record.handledBy,
  lastStatus: record.lastStatus === "Reported" ? "Pending" : record.lastStatus,
  lastUpdated: record.lastUpdated,
  isRejected: record.status === "Rejected",
}));


    res.status(200).json({ success: true, issues });
  } catch (error) {
    console.error("Error fetching handled issues:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteIssueByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const loggedInAdminId = req.adminId; // from auth middleware
    const { issueid } = req.params;

    // Validate issueid format
    if (!mongoose.Types.ObjectId.isValid(issueid)) {
      res.status(400).json({ message: "Invalid issue ID format" });
      return;
    }
    // If allowing any admin to delete:

    const result = await IssueModel.deleteOne({ _id: issueid });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Issue not found or unauthorized" });
      return;
    }
    res.json({ message: "Deleted Successfully!" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.adminId;

    // Get all issues with counts by status
    const totalIssues = await IssueModel.countDocuments();
    const resolvedIssues = await IssueModel.countDocuments({
      status: "Resolved",
    });
    const inProgressIssues = await IssueModel.countDocuments({
      status: "In Progress",
    });
    const pendingIssues = await IssueModel.countDocuments({
      status: "Pending",
    });
    const rejectedIssues = await IssueModel.countDocuments({
      status: "Rejected",
    });

    // Get issues handled by current admin
    const handledByAdmin = await IssueStatusHistoryModel.distinct(
      "issueID",
      { handledBy: new mongoose.Types.ObjectId(adminId!) }
    );
    const handledCount = handledByAdmin.length;

    // Get issue breakdown by type
    const issuesByType = await IssueModel.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get issue resolution rate
    const resolutionRate =
      totalIssues > 0
        ? Math.round((resolvedIssues / totalIssues) * 100)
        : 0;

    // Get recent issues (last 5)
    const recentIssues = await IssueModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status type createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalIssues,
        resolvedIssues,
        inProgressIssues,
        pendingIssues,
        rejectedIssues,
        handledByAdmin: handledCount,
        resolutionRate,
        issuesByType,
        recentIssues,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Comprehensive analytics endpoint with time-range filtering
export const getAnalyticsData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { timeRange = "all" } = req.query;
    console.log("📊 Analytics: Starting - timeRange =", timeRange);
    const dateFilter = getDateRangeFilter(timeRange as string);
    console.log("📊 Analytics: dateFilter =", dateFilter);

    // 1. Issue counts by status
    const countDocumentsFilter = dateFilter ? { createdAt: dateFilter } : {};
    console.log("📊 Analytics: countDocumentsFilter =", countDocumentsFilter);
    
    const totalIssues = await IssueModel.countDocuments(countDocumentsFilter);
    console.log("✅ Analytics: totalIssues =", totalIssues);
    const resolvedIssues = await IssueModel.countDocuments({
      status: "Resolved",
      ...countDocumentsFilter,
    });
    const inProgressIssues = await IssueModel.countDocuments({
      status: "In Progress",
      ...countDocumentsFilter,
    });
    const pendingIssues = await IssueModel.countDocuments({
      status: "Pending",
      ...countDocumentsFilter,
    });
    const rejectedIssues = await IssueModel.countDocuments({
      status: "Rejected",
      ...countDocumentsFilter,
    });

    // 2. Cost analytics
    const costMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
    const costData = await IssueModel.aggregate([
      {
        $match: {
          status: "Resolved",
          ...costMatchFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$costAmount" },
          avgCost: { $avg: "$costAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { totalSpent = 0, avgCost = 0 } = costData[0] || {};

    // 3. Cost by issue type
    const costByType = await IssueModel.aggregate([
      {
        $match: {
          status: "Resolved",
          ...costMatchFilter,
        },
      },
      {
        $group: {
          _id: "$issueType",
          totalCost: { $sum: "$costAmount" },
          count: { $sum: 1 },
          avgCost: { $avg: "$costAmount" },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);

    // 4. Cost by status
    const costByStatus = await IssueModel.aggregate([
      {
        $match: costMatchFilter,
      },
      {
        $group: {
          _id: "$status",
          totalCost: { $sum: "$costAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);

    // 5. Cost by department
    const costByDepartmentMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
    const costByDepartment = await IssueModel.aggregate([
      {
        $match: {
          departmentAssigned: { $exists: true, $ne: null },
          ...costByDepartmentMatchFilter,
        },
      },
      {
        $group: {
          _id: "$departmentAssigned",
          totalCost: { $sum: "$costAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalCost: -1 },
      },
    ]);

    // 6. Issue breakdown by type
    const topIssueTypes = await IssueModel.aggregate([
      {
        $match: costMatchFilter,
      },
      {
        $group: {
          _id: "$issueType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // 7. Manager/Department performance
    const managerPerformance = await IssueStatusHistoryModel.aggregate([
      {
        $match: dateFilter ? { changedAt: dateFilter } : {},
      },
      {
        $lookup: {
          from: "admins",
          localField: "handledBy",
          foreignField: "_id",
          as: "adminDetails",
        },
      },
      {
        $unwind: {
          path: "$adminDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "issueID",
          foreignField: "_id",
          as: "issueDetails",
        },
      },
      {
        $unwind: {
          path: "$issueDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$handledBy",
          managerName: { $first: "$adminDetails.fullName" },
          handledCount: { $sum: 1 },
          totalCostHandled: { $sum: "$issueDetails.costAmount" },
        },
      },
      {
        $sort: { handledCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // 8. Resolution trends by date
    const resolutionTrends = await IssueModel.aggregate([
      {
        $match: costMatchFilter,
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
            },
          },
          cost: {
            $sum: {
              $cond: [{ $eq: ["$status", "Resolved"] }, "$costAmount", 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // 9. Top upvoted issues
    const topUpvotedIssues = await IssueModel.find(
      dateFilter ? { createdAt: dateFilter } : {}
    )
      .sort({ upvotes: -1 })
      .limit(5)
      .select("title upvotes issueType status");

    // 10. Top zones by reports
    const topReportedZones = await IssueModel.aggregate([
      {
        $match: costMatchFilter,
      },
      {
        $group: {
          _id: {
            address: "$location.address",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // 11. Average resolution time
    const avgResolutionTimeMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
    const avgResolutionTimeData = await IssueModel.aggregate([
      {
        $match: {
          status: "Resolved",
          resolvedAt: { $exists: true },
          ...avgResolutionTimeMatchFilter,
        },
      },
      {
        $group: {
          _id: null,
          avgTime: {
            $avg: {
              $subtract: ["$resolvedAt", "$createdAt"],
            },
          },
        },
      },
    ]);

    const avgResolutionTimeMs = avgResolutionTimeData[0]?.avgTime || 0;
    const avgResolutionTimeDays = Math.round(avgResolutionTimeMs / (1000 * 60 * 60 * 24));

    // 12. Resolution rate
    const resolutionRate =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // 13. Recent resolved issues with costs
    const recentResolvedMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
    const recentResolvedIssues = await IssueModel.find(
      { status: "Resolved", ...recentResolvedMatchFilter }
    )
      .sort({ resolvedAt: -1 })
      .limit(10)
      .select("title issueType costAmount resolvedAt upvotes");

    res.status(200).json({
      success: true,
      timeRange,
      analytics: {
        // Summary metrics
        summary: {
          totalIssues,
          resolvedIssues,
          inProgressIssues,
          pendingIssues,
          rejectedIssues,
          resolutionRate,
        },
        // Cost metrics
        costs: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgCostPerIssue: Math.round(avgCost * 100) / 100,
          costByType,
          costByStatus,
          costByDepartment,
        },
        // Performance metrics
        performance: {
          avgResolutionTimeDays,
          managerPerformance,
          topIssueTypes,
        },
        // Trends
        trends: {
          resolutionTrends,
        },
        // User engagement
        engagement: {
          topUpvotedIssues,
          topReportedZones,
          recentResolvedIssues,
        },
      },
    });
  } catch (error) {
    console.error("🚨 Error fetching analytics data:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};

// Update issue with cost and resolve date
export const updateIssueCost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { costAmount, status } = req.body;
    const adminId = req.adminId;

    // Validate inputs
    if (costAmount === undefined || costAmount === null) {
      res.status(400).json({ message: "Cost amount is required" });
      return;
    }

    if (typeof costAmount !== "number" || costAmount < 0) {
      res.status(400).json({ message: "Cost amount must be a non-negative number" });
      return;
    }

    const validStatuses = ["In Progress", "Resolved", "Rejected", "Pending"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return;
    }

    const updateData: any = { costAmount };
    
    // Set resolved date if marking as resolved
    if (status === "Resolved") {
      updateData.resolvedAt = new Date();
      updateData.status = "Resolved";
    } else if (status) {
      updateData.status = status;
    }

    const updatedIssue = await IssueModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedIssue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Create status history record with cost
    if (status) {
      await IssueStatusHistoryModel.create({
        issueID: new mongoose.Types.ObjectId(id),
        status,
        handledBy: new mongoose.Types.ObjectId(adminId!),
        changedBy: new mongoose.Types.ObjectId(adminId!),
        costAdded: costAmount,
        changedAt: new Date(),
      });
    }

    res.json({
      message: "Issue updated successfully",
      issue: updatedIssue,
    });
  } catch (error) {
    console.error("Error updating issue cost:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
