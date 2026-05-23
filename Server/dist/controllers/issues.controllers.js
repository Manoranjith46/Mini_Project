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
exports.deleteIssue = exports.getIssues = exports.addReporterToExistingIssue = exports.createIssue = void 0;
const issue_model_1 = require("../models/issue.model");
const multimedia_model_1 = require("../models/multimedia.model");
const mongoose_1 = __importDefault(require("mongoose"));
const gridfs_1 = require("../config/gridfs");
const stream_1 = require("stream");
const imageGenerator_1 = require("../utils/imageGenerator");
const duplicateChecker_1 = require("../utils/duplicateChecker");
const createIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files || [];
        const { title = "Untitled", description, location, issueType } = req.body;
        // location stuff
        let parsedLocation = location;
        if (typeof location === "string") {
            try {
                parsedLocation = JSON.parse(location);
            }
            catch (_a) {
                res.status(400).json({ message: "Invalid location JSON format" });
                return;
            }
        }
        if (!title ||
            !description ||
            !parsedLocation ||
            !parsedLocation.latitude ||
            !parsedLocation.longitude ||
            !issueType) {
            res.status(400).json({ message: "Please fill all the required fields " });
            return;
        }
        // Check for nearby duplicate issues
        console.log("🔍 Checking for nearby duplicate issues...");
        const nearbyDuplicates = yield (0, duplicateChecker_1.findNearbyDuplicates)(parsedLocation.latitude, parsedLocation.longitude, issueType, 100 // 100 meters radius
        );
        if (nearbyDuplicates.length > 0) {
            console.log(`⚠️  Found ${nearbyDuplicates.length} nearby similar issues`);
            res.status(200).json({
                isDuplicate: true,
                duplicates: nearbyDuplicates,
                message: `Found ${nearbyDuplicates.length} similar issue(s) nearby. Is this the same issue?`,
                draftIssue: {
                    title,
                    description,
                    location: parsedLocation,
                    issueType,
                    files: files.map((f) => f.originalname),
                },
            });
            return;
        }
        // Convert citizenId to ObjectId if it's a string
        const citizenObjectId = typeof req.citizenId === 'string'
            ? new mongoose_1.default.Types.ObjectId(req.citizenId)
            : req.citizenId;
        const issue = yield issue_model_1.IssueModel.create({
            citizenId: citizenObjectId,
            reporters: [citizenObjectId],
            issueType,
            title,
            description,
            location: parsedLocation,
            status: "Pending",
            multimediaId: req.multimediaId,
        });
        // Upload files to GridFS and create multimedia records
        let mediaDocs = [];
        console.log("Files received:", files.length);
        if (Array.isArray(files) && files.length > 0) {
            // Upload provided files
            console.log("Uploading user-provided files...");
            mediaDocs = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const bucket = (0, gridfs_1.getGridFSBucket)();
                    const filename = `${Date.now()}-${file.originalname}`;
                    // Create a readable stream from the buffer
                    const readableStream = stream_1.Readable.from(file.buffer);
                    // Upload to GridFS
                    const uploadStream = bucket.openUploadStream(filename, {
                        contentType: file.mimetype,
                        metadata: {
                            originalName: file.originalname,
                            issueId: issue._id,
                        },
                    });
                    // Return a promise that resolves when upload completes
                    return new Promise((resolve, reject) => {
                        readableStream.pipe(uploadStream);
                        uploadStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                            // Create multimedia record
                            const mediaDoc = yield multimedia_model_1.MultimediaModel.create({
                                issueID: issue._id,
                                fileType: file.mimetype.startsWith("video") ? "video" : "image",
                                url: "/api/v1/files/" + filename,
                                filename: file.originalname,
                            });
                            resolve(mediaDoc);
                        }));
                        uploadStream.on("error", (err) => {
                            console.error("GridFS upload error:", err);
                            reject(err);
                        });
                        readableStream.on("error", (err) => {
                            console.error("Stream error:", err);
                            reject(err);
                        });
                    });
                }
                catch (err) {
                    console.error("File upload error:", err);
                    throw err;
                }
            })));
        }
        else {
            // Generate image if no file uploaded (try AI first, then fallback to placeholder)
            console.log("No files uploaded. Attempting to generate AI image...");
            try {
                // Try to generate realistic AI image
                const aiImageBuffer = yield (0, imageGenerator_1.generateImageFromIssue)(issueType, title, description);
                let imageBuffer = aiImageBuffer;
                // If AI generation fails, use placeholder
                if (!imageBuffer) {
                    console.log("AI generation failed. Using placeholder image...");
                    imageBuffer = yield (0, imageGenerator_1.generatePlaceholderImage)(issueType);
                }
                const bucket = (0, gridfs_1.getGridFSBucket)();
                const filename = `generated-${Date.now()}.png`;
                console.log("Uploading generated image:", filename);
                const readableStream = stream_1.Readable.from(imageBuffer);
                const uploadStream = bucket.openUploadStream(filename, {
                    contentType: "image/png",
                    metadata: {
                        originalName: "Auto-Generated Image",
                        issueId: issue._id,
                        autoGenerated: true,
                    },
                });
                yield new Promise((resolve, reject) => {
                    readableStream.pipe(uploadStream);
                    uploadStream.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            const mediaDoc = yield multimedia_model_1.MultimediaModel.create({
                                issueID: issue._id,
                                fileType: "image",
                                url: "/api/v1/files/" + filename,
                                filename: "Auto-Generated Image",
                            });
                            mediaDocs.push(mediaDoc);
                            console.log("Generated image saved successfully");
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    }));
                    uploadStream.on("error", (err) => {
                        console.error("Upload stream error:", err);
                        reject(err);
                    });
                    readableStream.on("error", (err) => {
                        console.error("Read stream error:", err);
                        reject(err);
                    });
                });
            }
            catch (err) {
                console.error("Error generating/uploading image:", err);
                // Continue without image if generation fails
            }
        }
        console.log("Issue created successfully:", {
            issueId: issue._id,
            mediaCount: mediaDocs.length,
        });
        res.status(200).json({ message: "Issue created", issue, media: mediaDocs });
    }
    catch (error) {
        console.error("❌ Error creating issue:");
        console.error("   Message:", error.message);
        console.error("   Code:", error.code);
        console.error("   Stack:", error.stack);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            details: error.code
        });
    }
});
exports.createIssue = createIssue;
// Add current citizen as an additional reporter to an existing issue
const addReporterToExistingIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { existingIssueId } = req.body;
        const citizenId = req.citizenId;
        console.log("🔗 Adding reporter to issue:", existingIssueId);
        console.log("📋 Citizen ID:", citizenId);
        if (!existingIssueId) {
            res.status(400).json({ message: "Issue ID is required" });
            return;
        }
        if (!citizenId) {
            res.status(400).json({ message: "User not authenticated" });
            return;
        }
        // Validate and convert IDs
        if (!mongoose_1.default.Types.ObjectId.isValid(existingIssueId)) {
            res.status(400).json({ message: "Invalid issue ID format" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(citizenId)) {
            res.status(400).json({ message: "Invalid citizen ID format" });
            return;
        }
        // Find the issue and add reporter
        const issueObjectId = new mongoose_1.default.Types.ObjectId(existingIssueId);
        const citizenObjectId = new mongoose_1.default.Types.ObjectId(citizenId);
        console.log("🔄 Updating issue with reporter...");
        const issue = yield issue_model_1.IssueModel.findByIdAndUpdate(issueObjectId, {
            $addToSet: { reporters: citizenObjectId },
        }, { new: true });
        if (!issue) {
            console.log("❌ Issue not found:", existingIssueId);
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        const reporterCount = Array.isArray(issue.reporters) ? issue.reporters.length : 1;
        console.log(`✅ Added reporter to existing issue. Total reporters: ${reporterCount}`);
        res.status(200).json({
            message: "Added your report to the existing issue",
            issue: {
                _id: issue._id,
                title: issue.title,
                status: issue.status,
                reporters: issue.reporters,
            },
            reporterCount: reporterCount,
        });
    }
    catch (error) {
        console.error("❌ Error adding reporter:");
        console.error("   Message:", error.message);
        console.error("   Stack:", error.stack);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});
exports.addReporterToExistingIssue = addReporterToExistingIssue;
const getIssues = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issues = yield issue_model_1.IssueModel.find({})
            .populate("citizenId", "fullName phonenumber")
            .populate("reporters", "fullName phonenumber");
        const issuesWithMedia = yield Promise.all(issues.map((issue) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const media = yield multimedia_model_1.MultimediaModel.find({ issueID: issue._id });
            const issueObj = issue.toObject ? issue.toObject() : issue;
            // Get reporter count - use reporters array or fallback to 1
            const reporterCount = Array.isArray(issueObj.reporters)
                ? issueObj.reporters.length
                : 1;
            return {
                _id: issueObj._id,
                title: issueObj.title,
                description: issueObj.description,
                type: issueObj.issueType,
                location: issueObj.location,
                reportedBy: ((_a = issueObj.citizenId) === null || _a === void 0 ? void 0 : _a.fullName) || "Anonymous",
                reportedByID: ((_b = issueObj.citizenId) === null || _b === void 0 ? void 0 : _b._id) || null,
                reportedByPhone: ((_c = issueObj.citizenId) === null || _c === void 0 ? void 0 : _c.phonenumber) || null,
                reportedAt: issueObj.createdAt,
                image: media.length > 0 ? media[0].url : null,
                status: issueObj.status === "Reported" ? "Pending" : issueObj.status,
                reporterCount: reporterCount,
                reporters: issueObj.reporters,
            };
        })));
        res.json({ issues: issuesWithMedia });
    }
    catch (err) {
        console.error("❌ Error fetching issues:");
        console.error("   Message:", err.message);
        console.error("   Stack:", err.stack);
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
});
exports.getIssues = getIssues;
const deleteIssue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { issueId } = req.params;
        const citizenId = req.citizenId;
        if (!issueId || !citizenId) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const issue = yield issue_model_1.IssueModel.findById(issueId);
        if (!issue) {
            res.status(404).json({ message: "Issue not found" });
            return;
        }
        // Check if the citizen owns this issue
        if (issue.citizenId.toString() !== citizenId.toString()) {
            res.status(403).json({ message: "You can only delete your own issues" });
            return;
        }
        // Check if issue is In Progress
        if (issue.status === "In Progress") {
            res.status(400).json({ message: "Cannot delete issue that is In Progress" });
            return;
        }
        // Delete associated multimedia and GridFS files
        const mediaFiles = yield multimedia_model_1.MultimediaModel.find({ issueID: issueId });
        try {
            const bucket = (0, gridfs_1.getGridFSBucket)();
            const db = mongoose_1.default.connection.db;
            for (const media of mediaFiles) {
                const filename = media.url.split("/").pop();
                if (filename) {
                    const gridFiles = yield db.collection("uploads.files").find({ filename }).toArray();
                    for (const gf of gridFiles) {
                        yield bucket.delete(gf._id);
                    }
                }
            }
        }
        catch (gridErr) {
            console.error("Error cleaning up GridFS files:", gridErr);
        }
        yield multimedia_model_1.MultimediaModel.deleteMany({ issueID: issueId });
        // Delete the issue
        yield issue_model_1.IssueModel.findByIdAndDelete(issueId);
        res.json({ message: "Issue deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting issue:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteIssue = deleteIssue;
