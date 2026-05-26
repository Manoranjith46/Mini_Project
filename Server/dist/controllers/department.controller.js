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
exports.updateIssueCostByDepartment = exports.updateIssueStatusByDepartment = exports.getDepartmentAnalytics = exports.getDepartmentIssues = exports.updateDepartmentProfile = exports.getDepartmentProfile = exports.createDepartmentManager = exports.getAllDepartments = void 0;
const department_model_1 = require("../models/department.model");
const issue_model_1 = require("../models/issue.model");
const multimedia_model_1 = require("../models/multimedia.model");
const user_model_1 = require("../models/user.model");
const issueStatusHistory_model_1 = require("../models/issueStatusHistory.model");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield department_model_1.DepartmentModel.find({}).select("fullName phonenumber email designation employeeId place createdAt");
        res.json({ departments });
    }
    catch (error) {
        console.error("Error fetching all departments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getAllDepartments = getAllDepartments;
const createDepartmentManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingManager = yield department_model_1.DepartmentModel.findOne({
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
        const existingUser = yield user_model_1.UserModel.findOne({
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
        const manager = yield department_model_1.DepartmentModel.create({
            fullName: String(fullName).trim(),
            phonenumber: normalizedPhoneNumber,
            employeeId: normalizedEmployeeId,
            place: String(place).trim(),
            designation: (designation === null || designation === void 0 ? void 0 : designation.trim()) || "Department Manager",
        });
        yield user_model_1.UserModel.create({
            phonenumber: normalizedPhoneNumber,
            employeeId: normalizedEmployeeId,
            role: "department",
            roleRefId: manager._id,
        });
        res.status(201).json({
            message: "Manager created successfully",
            manager,
        });
    }
    catch (error) {
        console.error("Error creating department manager:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.createDepartmentManager = createDepartmentManager;
const getDepartmentProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departmentId = req.departmentId;
        const department = yield department_model_1.DepartmentModel.findById(departmentId).lean();
        if (!department) {
            res.status(404).json({ message: "Department manager not found" });
            return;
        }
        res.json(department);
    }
    catch (error) {
        console.error("Error fetching department profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getDepartmentProfile = getDepartmentProfile;
const updateDepartmentProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const departmentId = req.departmentId;
        if (id !== departmentId) {
            res.status(403).json({ message: "Unauthorized access" });
            return;
        }
        const { fullName, designation } = req.body;
        const updated = yield department_model_1.DepartmentModel.findByIdAndUpdate(id, { fullName, designation }, { new: true });
        if (!updated) {
            res.status(404).json({ message: "Department manager not found" });
            return;
        }
        res.json({ message: "Profile updated successfully", department: updated });
    }
    catch (error) {
        console.error("Error updating department profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateDepartmentProfile = updateDepartmentProfile;
const getDepartmentIssues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departmentId = req.departmentId;
        // Get the department manager's place/corporation.
        const department = yield department_model_1.DepartmentModel.findById(departmentId).lean();
        if (!department) {
            res.status(404).json({ message: "Department manager not found" });
            return;
        }
        // Fetch issues assigned to the manager's zone.
        const issues = yield issue_model_1.IssueModel.find({
            departmentAssigned: department.place,
        })
            .populate("citizenId", "fullName phonenumber")
            .sort({ createdAt: -1 });
        const issuesWithMedia = yield Promise.all(issues.map((issue) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const media = yield multimedia_model_1.MultimediaModel.find({ issueID: issue._id });
            const issueObj = issue.toObject ? issue.toObject() : issue;
            return {
                _id: issueObj._id,
                title: issueObj.title,
                description: issueObj.description,
                type: issueObj.issueType,
                location: issueObj.location,
                reportedBy: ((_a = issueObj.citizenId) === null || _a === void 0 ? void 0 : _a.fullName) || "Anonymous",
                reportedAt: issueObj.createdAt,
                image: media.length > 0 ? media[0].url : null,
                status: issueObj.status === "Reported" ? "Pending" : issueObj.status,
                upvotes: issueObj.upvotes || 0,
            };
        })));
        res.json({ issues: issuesWithMedia });
    }
    catch (error) {
        console.error("Error fetching department issues:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getDepartmentIssues = getDepartmentIssues;
const getDepartmentAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const departmentId = req.departmentId;
        const { timeRange = "all" } = req.query;
        const department = yield department_model_1.DepartmentModel.findById(departmentId).lean();
        if (!department) {
            res.status(404).json({ message: "Department manager not found" });
            return;
        }
        const zone = department.place;
        const getDateFilter = (range) => {
            const now = new Date();
            switch (range) {
                case "30": return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                case "60": return { $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) };
                case "90": return { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                default: return null;
            }
        };
        const dateFilter = getDateFilter(timeRange);
        const zoneFilter = { departmentAssigned: zone };
        const baseFilter = dateFilter ? Object.assign(Object.assign({}, zoneFilter), { createdAt: dateFilter }) : Object.assign({}, zoneFilter);
        // 1. Counts by status
        const totalIssues = yield issue_model_1.IssueModel.countDocuments(baseFilter);
        const resolvedIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { status: "Resolved" }));
        const inProgressIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { status: "In Progress" }));
        const pendingIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { status: "Pending" }));
        const rejectedIssues = yield issue_model_1.IssueModel.countDocuments(Object.assign(Object.assign({}, baseFilter), { status: "Rejected" }));
        // 2. Cost analytics (resolved only)
        const costData = yield issue_model_1.IssueModel.aggregate([
            { $match: Object.assign(Object.assign({}, baseFilter), { status: "Resolved" }) },
            { $group: { _id: null, totalSpent: { $sum: "$costAmount" }, avgCost: { $avg: "$costAmount" }, count: { $sum: 1 } } },
        ]);
        const { totalSpent = 0, avgCost = 0 } = costData[0] || {};
        // 3. Cost by issue type
        const costByType = yield issue_model_1.IssueModel.aggregate([
            { $match: Object.assign(Object.assign({}, baseFilter), { status: "Resolved" }) },
            { $group: { _id: "$issueType", totalCost: { $sum: "$costAmount" }, count: { $sum: 1 }, avgCost: { $avg: "$costAmount" } } },
            { $sort: { totalCost: -1 } },
        ]);
        // 4. Cost by status
        const costByStatus = yield issue_model_1.IssueModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$status", totalCost: { $sum: "$costAmount" }, count: { $sum: 1 } } },
            { $sort: { totalCost: -1 } },
        ]);
        // 5. Issue breakdown by type
        const topIssueTypes = yield issue_model_1.IssueModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$issueType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        // 6. Resolution trends by date
        const resolutionTrends = yield issue_model_1.IssueModel.aggregate([
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
        const topUpvotedIssues = yield issue_model_1.IssueModel.find(baseFilter)
            .sort({ upvotes: -1 })
            .limit(5)
            .select("title upvotes issueType status");
        // 8. Top reported addresses within this zone
        const topReportedZones = yield issue_model_1.IssueModel.aggregate([
            { $match: baseFilter },
            { $group: { _id: { address: "$location.address" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        // 9. Avg resolution time
        const avgResolutionTimeData = yield issue_model_1.IssueModel.aggregate([
            { $match: Object.assign(Object.assign({}, baseFilter), { status: "Resolved", resolvedAt: { $exists: true } }) },
            { $group: { _id: null, avgTime: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } } } },
        ]);
        const avgResolutionTimeMs = ((_a = avgResolutionTimeData[0]) === null || _a === void 0 ? void 0 : _a.avgTime) || 0;
        const avgResolutionTimeDays = Math.round(avgResolutionTimeMs / (1000 * 60 * 60 * 24));
        // 10. Resolution rate
        const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
        // 11. Recent resolved issues
        const recentResolvedIssues = yield issue_model_1.IssueModel.find(Object.assign(Object.assign({}, baseFilter), { status: "Resolved" }))
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
    }
    catch (error) {
        console.error("Error fetching department analytics:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getDepartmentAnalytics = getDepartmentAnalytics;
const updateIssueStatusByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, title, description, costAmount } = req.body;
        const departmentId = req.departmentId;
        const validStatuses = ["In Progress", "Resolved", "Rejected", "Pending"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }
        const updateData = { status };
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
        const updatedIssue = yield issue_model_1.IssueModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedIssue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Create status history record with title, description, and costAdded
        yield issueStatusHistory_model_1.IssueStatusHistoryModel.create({
            issueID: new mongoose_1.default.Types.ObjectId(id),
            status,
            title: (title === null || title === void 0 ? void 0 : title.trim()) || "",
            description: (description === null || description === void 0 ? void 0 : description.trim()) || "",
            handledBy: new mongoose_1.default.Types.ObjectId(departmentId),
            changedBy: new mongoose_1.default.Types.ObjectId(departmentId),
            costAdded: costToAdd,
            changedAt: new Date(),
        });
        res.json({ message: "Issue status updated successfully", issue: updatedIssue });
    }
    catch (error) {
        console.error("Error updating issue status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateIssueStatusByDepartment = updateIssueStatusByDepartment;
const updateIssueCostByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updatedIssue = yield issue_model_1.IssueModel.findByIdAndUpdate(id, { costAmount }, { new: true });
        if (!updatedIssue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Create status history record with cost
        yield issueStatusHistory_model_1.IssueStatusHistoryModel.create({
            issueID: new mongoose_1.default.Types.ObjectId(id),
            status: updatedIssue.status,
            handledBy: new mongoose_1.default.Types.ObjectId(departmentId),
            changedBy: new mongoose_1.default.Types.ObjectId(departmentId),
            costAdded: costAmount,
            changedAt: new Date(),
        });
        res.json({ message: "Cost updated successfully", issue: updatedIssue });
    }
    catch (error) {
        console.error("Error updating issue cost:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateIssueCostByDepartment = updateIssueCostByDepartment;
