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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportsSummary = exports.getAllReports = exports.getDetailedIssueReport = void 0;
const issue_model_1 = require("../models/issue.model");
const issueStatusHistory_model_1 = require("../models/issueStatusHistory.model");
const getDetailedIssueReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { issueId } = req.params;
        const issue = yield issue_model_1.IssueModel.findById(issueId)
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
        const statusHistory = yield issueStatusHistory_model_1.IssueStatusHistoryModel.find({ issueID: issueId })
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
    }
    catch (error) {
        console.error("Error fetching detailed report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getDetailedIssueReport = getDetailedIssueReport;
const getAllReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, issueType, startDate, endDate, page = "1", limit = "10", } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (issueType) {
            filter.issueType = issueType;
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }
        // For citizens, only show their own issues
        if (req.role === "citizen") {
            filter.citizenId = req.citizenId;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reports = yield issue_model_1.IssueModel.find(filter)
            .populate("citizenId", "fullName phonenumber")
            .populate("handledBy", "fullName department")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        const total = yield issue_model_1.IssueModel.countDocuments(filter);
        res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllReports = getAllReports;
const getReportsSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timeRange = "30" } = req.query;
        const dateFilter = getDateFilter(timeRange);
        const summary = yield issue_model_1.IssueModel.aggregate([
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
    }
    catch (error) {
        console.error("Error fetching reports summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getReportsSummary = getReportsSummary;
function getDateFilter(timeRange) {
    const now = new Date();
    let startDate;
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
