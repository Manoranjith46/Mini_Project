"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIssueCost = exports.getAnalyticsData = exports.getDashboardStats = exports.deleteIssueByAdmin = exports.getHandledIssuesByAdmin = exports.updateIssueStatus = exports.updateAdminProfile = exports.getAdminProfile = void 0;
const admin_model_1 = require("../models/admin.model");
const issue_model_1 = require("../models/issue.model");
const issueStatusHistory_model_1 = require("../models/issueStatusHistory.model");
const mongoose_1 = __importDefault(require("mongoose"));
// Helper function to get date range filter
const getDateRangeFilter = (timeRange) => {
    const now = new Date();
    let startDate;
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
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const loggedInAdminId = req.adminId;
        if (id !== loggedInAdminId) {
            res.status(403).json({ message: "Unauthorised access" });
            return;
        }
        const admin = yield admin_model_1.AdminModel.findById(id).select("-password").lean();
        if (!admin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        res.json(admin);
    }
    catch (error) {
        console.error("Error fetching admin profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getAdminProfile = getAdminProfile;
const updateAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { fullName, email, phonenumber, department } = req.body;
        if (!fullName || !email || !phonenumber || !department) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const updatedAdmin = yield admin_model_1.AdminModel.findByIdAndUpdate(id, { fullName, email, phonenumber, department }, { new: true });
        if (!updatedAdmin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        res.json({ message: "Profile updated successfully", user: updatedAdmin });
    }
    catch (error) {
        console.error("Error updating admin profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateAdminProfile = updateAdminProfile;
const updateIssueStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updatedIssue = yield issue_model_1.IssueModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedIssue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Creating a record in IssueStatusHistory for this status change
        yield issueStatusHistory_model_1.IssueStatusHistoryModel.create({
            issueID: new mongoose_1.default.Types.ObjectId(id),
            status,
            handledBy: new mongoose_1.default.Types.ObjectId(adminId),
            changedBy: new mongoose_1.default.Types.ObjectId(adminId), // original reporter, optional
            changedAt: new Date(), // optional if timestamps enabled
        });
        res.json({ message: "Issue updated successfully", issue: updatedIssue });
    }
    catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateIssueStatus = updateIssueStatus;
const getHandledIssuesByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authReq = req;
    try {
        const adminId = authReq.adminId; // from authMiddleware
        if (!adminId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const historyRecords = yield issueStatusHistory_model_1.IssueStatusHistoryModel.aggregate([
            {
                $match: {
                    handledBy: new mongoose_1.default.Types.ObjectId(adminId),
                    status: { $in: ["In Progress", "Resolved", "Pending", "Rejected"] },
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
        const issues = historyRecords.map((record) => (Object.assign(Object.assign({}, record.issueDetails), { status: record.status === "Reported" ? "Pending" : record.status, handledBy: record.handledBy, lastStatus: record.lastStatus === "Reported" ? "Pending" : record.lastStatus, lastUpdated: record.lastUpdated, isRejected: record.status === "Rejected" })));
        res.status(200).json({ success: true, issues });
    }
    catch (error) {
        console.error("Error fetching handled issues:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getHandledIssuesByAdmin = getHandledIssuesByAdmin;
const deleteIssueByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loggedInAdminId = req.adminId; // from auth middleware
        const { issueid } = req.params;
        // Validate issueid format
        if (!mongoose_1.default.Types.ObjectId.isValid(issueid)) {
            res.status(400).json({ message: "Invalid issue ID format" });
            return;
        }
        // If allowing any admin to delete:
        const result = yield issue_model_1.IssueModel.deleteOne({ _id: issueid });
        if (result.deletedCount === 0) {
            res.status(404).json({ message: "Issue not found or unauthorized" });
            return;
        }
        res.json({ message: "Deleted Successfully!" });
    }
    catch (error) {
        console.error("Error deleting issue:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteIssueByAdmin = deleteIssueByAdmin;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.adminId;
        // Get all issues with counts by status
        const totalIssues = yield issue_model_1.IssueModel.countDocuments();
        const resolvedIssues = yield issue_model_1.IssueModel.countDocuments({
            status: "Resolved",
        });
        const inProgressIssues = yield issue_model_1.IssueModel.countDocuments({
            status: "In Progress",
        });
        const pendingIssues = yield issue_model_1.IssueModel.countDocuments({
            status: "Pending",
        });
        const rejectedIssues = yield issue_model_1.IssueModel.countDocuments({
            status: "Rejected",
        });
        // Get issues handled by current admin
        const handledByAdmin = yield issueStatusHistory_model_1.IssueStatusHistoryModel.distinct("issueID", { handledBy: new mongoose_1.default.Types.ObjectId(adminId) });
        const handledCount = handledByAdmin.length;
        // Get issue breakdown by type
        const issuesByType = yield issue_model_1.IssueModel.aggregate([
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
        const resolutionRate = totalIssues > 0
            ? Math.round((resolvedIssues / totalIssues) * 100)
            : 0;
        // Get recent issues (last 5)
        const recentIssues = yield issue_model_1.IssueModel.find()
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
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getDashboardStats = getDashboardStats;
// Comprehensive analytics endpoint with time-range filtering
const getAnalyticsData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { timeRange = "all" } = req.query;
        console.log("📊 Analytics: Starting - timeRange =", timeRange);
        const dateFilter = getDateRangeFilter(timeRange);
        console.log("📊 Analytics: dateFilter =", dateFilter);
        // 1. Issue counts by status
        const countDocumentsFilter = dateFilter ? { createdAt: dateFilter } : {};
        console.log("📊 Analytics: countDocumentsFilter =", countDocumentsFilter);
        const totalIssues = yield issue_model_1.IssueModel.countDocuments(countDocumentsFilter);
        console.log("✅ Analytics: totalIssues =", totalIssues);
        const resolvedIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign({ status: "Resolved" }, countDocumentsFilter));
        const inProgressIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign({ status: "In Progress" }, countDocumentsFilter));
        const pendingIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign({ status: "Pending" }, countDocumentsFilter));
        const rejectedIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign({ status: "Rejected" }, countDocumentsFilter));
        // 2. Cost analytics
        const costMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
        const costData = yield issue_model_1.IssueModel.aggregate([
            {
                $match: Object.assign({ status: "Resolved" }, costMatchFilter),
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
        const costByType = yield issue_model_1.IssueModel.aggregate([
            {
                $match: Object.assign({ status: "Resolved" }, costMatchFilter),
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
        const costByStatus = yield issue_model_1.IssueModel.aggregate([
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
        const costByDepartment = yield issue_model_1.IssueModel.aggregate([
            {
                $match: Object.assign({ departmentAssigned: { $exists: true, $ne: null } }, costByDepartmentMatchFilter),
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
        const topIssueTypes = yield issue_model_1.IssueModel.aggregate([
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
        const managerPerformance = yield issueStatusHistory_model_1.IssueStatusHistoryModel.aggregate([
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
        const resolutionTrends = yield issue_model_1.IssueModel.aggregate([
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
        const topUpvotedIssues = yield issue_model_1.IssueModel.find(dateFilter ? { createdAt: dateFilter } : {})
            .sort({ upvotes: -1 })
            .limit(5)
            .select("title upvotes issueType status");
        // 10. Top zones by reports
        const topReportedZones = yield issue_model_1.IssueModel.aggregate([
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
        const avgResolutionTimeData = yield issue_model_1.IssueModel.aggregate([
            {
                $match: Object.assign({ status: "Resolved", resolvedAt: { $exists: true } }, avgResolutionTimeMatchFilter),
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
        const avgResolutionTimeMs = ((_a = avgResolutionTimeData[0]) === null || _a === void 0 ? void 0 : _a.avgTime) || 0;
        const avgResolutionTimeDays = Math.round(avgResolutionTimeMs / (1000 * 60 * 60 * 24));
        // 12. Resolution rate
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
        // 13. Recent resolved issues with costs
        const recentResolvedMatchFilter = dateFilter ? { createdAt: dateFilter } : {};
        const recentResolvedIssues = yield issue_model_1.IssueModel.find(Object.assign({ status: "Resolved" }, recentResolvedMatchFilter))
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
    }
    catch (error) {
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
});
exports.getAnalyticsData = getAnalyticsData;
// Update issue with cost and resolve date
const updateIssueCost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updateData = { costAmount };
        // Set resolved date if marking as resolved
        if (status === "Resolved") {
            updateData.resolvedAt = new Date();
            updateData.status = "Resolved";
        }
        else if (status) {
            updateData.status = status;
        }
        const updatedIssue = yield issue_model_1.IssueModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedIssue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Create status history record with cost
        if (status) {
            yield issueStatusHistory_model_1.IssueStatusHistoryModel.create({
                issueID: new mongoose_1.default.Types.ObjectId(id),
                status,
                handledBy: new mongoose_1.default.Types.ObjectId(adminId),
                changedBy: new mongoose_1.default.Types.ObjectId(adminId),
                costAdded: costAmount,
                changedAt: new Date(),
            });
        }
        res.json({
            message: "Issue updated successfully",
            issue: updatedIssue,
        });
    }
    catch (error) {
        console.error("Error updating issue cost:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateIssueCost = updateIssueCost;
