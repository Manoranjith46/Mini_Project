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
exports.getDepartmentIssues = exports.updateDepartmentProfile = exports.getDepartmentProfile = exports.createDepartmentManager = exports.getAllDepartments = void 0;
const department_model_1 = require("../models/department.model");
const issue_model_1 = require("../models/issue.model");
const multimedia_model_1 = require("../models/multimedia.model");
const user_model_1 = require("../models/user.model");
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
