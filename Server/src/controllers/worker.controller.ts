import { Request, Response } from "express";
import { WorkerModel } from "../models/worker.model";
import { IssueModel } from "../models/issue.model";

interface AuthRequest extends Request {
  departmentId?: string;
  adminId?: string;
  role?: "admin" | "citizen" | "department";
}

export const createWorker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phonenumber, email, employeeId, departmentId, zone, specialization } = req.body;

    if (!fullName || !phonenumber || !employeeId || !departmentId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingWorker = await WorkerModel.findOne({
      $or: [{ phonenumber }, { employeeId }],
    });

    if (existingWorker) {
      res.status(400).json({ message: "Worker with this phone or employee ID already exists" });
      return;
    }

    const worker = await WorkerModel.create({
      fullName,
      phonenumber,
      email,
      employeeId,
      departmentId,
      zone,
      specialization,
    });

    res.status(201).json({ success: true, data: worker });
  } catch (error) {
    console.error("Error creating worker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkersByDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;

    const workers = await WorkerModel.find({ departmentId }).lean();
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkersByZone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { zone } = req.params;

    const workers = await WorkerModel.find({ zone, isActive: true }).lean();
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error("Error fetching workers by zone:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const worker = await WorkerModel.findById(workerId)
      .populate("departmentId", "fullName place employeeId")
      .populate("assignedIssues", "title issueType status location createdAt costAmount")
      .lean();

    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    res.json({ success: true, data: worker });
  } catch (error) {
    console.error("Error fetching worker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignWorkerToIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId, issueId } = req.body;

    if (!workerId || !issueId) {
      res.status(400).json({ message: "Worker ID and Issue ID required" });
      return;
    }

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Add issue to worker's assigned issues
    if (!worker.assignedIssues.includes(issueId as any)) {
      worker.assignedIssues.push(issueId as any);
      await worker.save();
    }

    res.json({ success: true, message: "Worker assigned to issue", data: worker });
  } catch (error) {
    console.error("Error assigning worker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkerAssignedIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;

    const worker = await WorkerModel.findById(workerId).populate("assignedIssues");
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    res.json({ success: true, data: worker.assignedIssues });
  } catch (error) {
    console.error("Error fetching worker issues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWorkerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const updates = req.body;

    const allowedUpdates = ["fullName", "email", "zone", "specialization", "isActive"];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const worker = await WorkerModel.findByIdAndUpdate(workerId, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    res.json({ success: true, data: worker });
  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
