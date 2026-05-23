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
exports.updateWorkerProfile = exports.getWorkerAssignedIssues = exports.assignWorkerToIssue = exports.getWorkerById = exports.getWorkersByZone = exports.getWorkersByDepartment = exports.createWorker = void 0;
const worker_model_1 = require("../models/worker.model");
const issue_model_1 = require("../models/issue.model");
const createWorker = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, phonenumber, email, employeeId, departmentId, zone, specialization } = req.body;
        if (!fullName || !phonenumber || !employeeId || !departmentId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const existingWorker = yield worker_model_1.WorkerModel.findOne({
            $or: [{ phonenumber }, { employeeId }],
        });
        if (existingWorker) {
            res.status(400).json({ message: "Worker with this phone or employee ID already exists" });
            return;
        }
        const worker = yield worker_model_1.WorkerModel.create({
            fullName,
            phonenumber,
            email,
            employeeId,
            departmentId,
            zone,
            specialization,
        });
        res.status(201).json({ success: true, data: worker });
    }
    catch (error) {
        console.error("Error creating worker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createWorker = createWorker;
const getWorkersByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departmentId } = req.params;
        const workers = yield worker_model_1.WorkerModel.find({ departmentId }).lean();
        res.json({ success: true, data: workers });
    }
    catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWorkersByDepartment = getWorkersByDepartment;
const getWorkersByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { zone } = req.params;
        const workers = yield worker_model_1.WorkerModel.find({ zone, isActive: true }).lean();
        res.json({ success: true, data: workers });
    }
    catch (error) {
        console.error("Error fetching workers by zone:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWorkersByZone = getWorkersByZone;
const getWorkerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = req.params;
        const worker = yield worker_model_1.WorkerModel.findById(workerId)
            .populate("departmentId", "fullName place employeeId")
            .populate("assignedIssues", "title issueType status location createdAt costAmount")
            .lean();
        if (!worker) {
            res.status(404).json({ message: "Worker not found" });
            return;
        }
        res.json({ success: true, data: worker });
    }
    catch (error) {
        console.error("Error fetching worker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWorkerById = getWorkerById;
const assignWorkerToIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId, issueId } = req.body;
        if (!workerId || !issueId) {
            res.status(400).json({ message: "Worker ID and Issue ID required" });
            return;
        }
        const worker = yield worker_model_1.WorkerModel.findById(workerId);
        if (!worker) {
            res.status(404).json({ message: "Worker not found" });
            return;
        }
        const issue = yield issue_model_1.IssueModel.findById(issueId);
        if (!issue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Add issue to worker's assigned issues
        if (!worker.assignedIssues.includes(issueId)) {
            worker.assignedIssues.push(issueId);
            yield worker.save();
        }
        res.json({ success: true, message: "Worker assigned to issue", data: worker });
    }
    catch (error) {
        console.error("Error assigning worker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.assignWorkerToIssue = assignWorkerToIssue;
const getWorkerAssignedIssues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = req.params;
        const worker = yield worker_model_1.WorkerModel.findById(workerId).populate("assignedIssues");
        if (!worker) {
            res.status(404).json({ message: "Worker not found" });
            return;
        }
        res.json({ success: true, data: worker.assignedIssues });
    }
    catch (error) {
        console.error("Error fetching worker issues:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWorkerAssignedIssues = getWorkerAssignedIssues;
const updateWorkerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId } = req.params;
        const updates = req.body;
        const allowedUpdates = ["fullName", "email", "zone", "specialization", "isActive"];
        const filteredUpdates = Object.keys(updates)
            .filter((key) => allowedUpdates.includes(key))
            .reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
        }, {});
        const worker = yield worker_model_1.WorkerModel.findByIdAndUpdate(workerId, filteredUpdates, {
            new: true,
            runValidators: true,
        });
        if (!worker) {
            res.status(404).json({ message: "Worker not found" });
            return;
        }
        res.json({ success: true, data: worker });
    }
    catch (error) {
        console.error("Error updating worker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateWorkerProfile = updateWorkerProfile;
