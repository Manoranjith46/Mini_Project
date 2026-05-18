import { Request, Response } from "express";
import { IssueModel } from "../models/issue.model";
import { MultimediaModel } from "../models/multimedia.model";
import mongoose from "mongoose";
import { getGridFSBucket } from "../config/gridfs";
import { Readable } from "stream";
import { generatePlaceholderImage, generateImageFromIssue } from "../utils/imageGenerator";
import { findNearbyDuplicates } from "../utils/duplicateChecker";

export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    const { title = "Untitled", description, location, issueType } = req.body;
    // location stuff

    let parsedLocation = location;
    if (typeof location === "string") {
      try {
        parsedLocation = JSON.parse(location);
      } catch {
        res.status(400).json({ message: "Invalid location JSON format" });
        return;
      }
    }

    if (
      !title ||
      !description ||
      !parsedLocation ||
      !parsedLocation.latitude ||
      !parsedLocation.longitude ||
      !issueType
    ) {
      res.status(400).json({ message: "Please fill all the required fields " });
      return;
    }

    // Check for nearby duplicate issues
    console.log("🔍 Checking for nearby duplicate issues...");
    const nearbyDuplicates = await findNearbyDuplicates(
      parsedLocation.latitude,
      parsedLocation.longitude,
      issueType,
      100 // 100 meters radius
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
    const citizenObjectId = typeof (req as any).citizenId === 'string' 
      ? new mongoose.Types.ObjectId((req as any).citizenId)
      : (req as any).citizenId;

    const issue = await IssueModel.create({
      citizenId: citizenObjectId,
      reporters: [citizenObjectId],
      issueType,
      title,
      description,
      location: parsedLocation,
      status: "Pending",
      multimediaId: (req as any).multimediaId,
    });

    // Upload files to GridFS and create multimedia records
    let mediaDocs: any[] = [];
    
    console.log("Files received:", files.length);

    if (Array.isArray(files) && files.length > 0) {
      // Upload provided files
      console.log("Uploading user-provided files...");
      mediaDocs = await Promise.all(
        files.map(async (file) => {
          try {
            const bucket = getGridFSBucket();
            const filename = `${Date.now()}-${file.originalname}`;
            
            // Create a readable stream from the buffer
            const readableStream = Readable.from(file.buffer);
            
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

              uploadStream.on("finish", async () => {
                // Create multimedia record
                const mediaDoc = await MultimediaModel.create({
                  issueID: issue._id,
                  fileType: file.mimetype.startsWith("video") ? "video" : "image",
                  url: "/api/v1/files/" + filename,
                  filename: file.originalname,
                });
                resolve(mediaDoc);
              });

              uploadStream.on("error", (err) => {
                console.error("GridFS upload error:", err);
                reject(err);
              });

              readableStream.on("error", (err) => {
                console.error("Stream error:", err);
                reject(err);
              });
            });
          } catch (err) {
            console.error("File upload error:", err);
            throw err;
          }
        })
      );
    } else {
      // Generate image if no file uploaded (try AI first, then fallback to placeholder)
      console.log("No files uploaded. Attempting to generate AI image...");
      try {
        // Try to generate realistic AI image
        const aiImageBuffer = await generateImageFromIssue(issueType, title, description);
        
        let imageBuffer = aiImageBuffer;
        
        // If AI generation fails, use placeholder
        if (!imageBuffer) {
          console.log("AI generation failed. Using placeholder image...");
          imageBuffer = await generatePlaceholderImage(issueType);
        }

        const bucket = getGridFSBucket();
        const filename = `generated-${Date.now()}.png`;
        
        console.log("Uploading generated image:", filename);
        
        const readableStream = Readable.from(imageBuffer);
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: "image/png",
          metadata: {
            originalName: "Auto-Generated Image",
            issueId: issue._id,
            autoGenerated: true,
          },
        });

        await new Promise<void>((resolve, reject) => {
          readableStream.pipe(uploadStream);

          uploadStream.on("finish", async () => {
            try {
              const mediaDoc = await MultimediaModel.create({
                issueID: issue._id,
                fileType: "image",
                url: "/api/v1/files/" + filename,
                filename: "Auto-Generated Image",
              });
              mediaDocs.push(mediaDoc);
              console.log("Generated image saved successfully");
              resolve();
            } catch (err) {
              reject(err);
            }
          });

          uploadStream.on("error", (err) => {
            console.error("Upload stream error:", err);
            reject(err);
          });
          
          readableStream.on("error", (err) => {
            console.error("Read stream error:", err);
            reject(err);
          });
        });
      } catch (err) {
        console.error("Error generating/uploading image:", err);
        // Continue without image if generation fails
      }
    }

    console.log("Issue created successfully:", {
      issueId: issue._id,
      mediaCount: mediaDocs.length,
    });

    res.status(200).json({ message: "Issue created", issue, media: mediaDocs });
  } catch (error: any) {
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
};

// Add current citizen as an additional reporter to an existing issue
export const addReporterToExistingIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { existingIssueId } = req.body;
    const citizenId = (req as any).citizenId;

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
    if (!mongoose.Types.ObjectId.isValid(existingIssueId)) {
      res.status(400).json({ message: "Invalid issue ID format" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(citizenId)) {
      res.status(400).json({ message: "Invalid citizen ID format" });
      return;
    }

    // Find the issue and add reporter
    const issueObjectId = new mongoose.Types.ObjectId(existingIssueId);
    const citizenObjectId = new mongoose.Types.ObjectId(citizenId);

    console.log("🔄 Updating issue with reporter...");

    const issue = await IssueModel.findByIdAndUpdate(
      issueObjectId,
      {
        $addToSet: { reporters: citizenObjectId },
      },
      { new: true }
    );

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
  } catch (error: any) {
    console.error("❌ Error adding reporter:");
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await IssueModel.find({})
      .populate("citizenId", "fullName phonenumber")
      .populate("reporters", "fullName phonenumber");

    const issuesWithMedia = await Promise.all(
      issues.map(async (issue) => {
        const media = await MultimediaModel.find({ issueID: issue._id });
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
          reportedBy: (issueObj.citizenId as any)?.fullName || "Anonymous",
          reportedByID: (issueObj.citizenId as any)?._id || null,
          reportedByPhone: (issueObj.citizenId as any)?.phonenumber || null,
          reportedAt: issueObj.createdAt,
          image: media.length > 0 ? media[0].url : null,
          status: (issueObj.status as string) === "Reported" ? "Pending" : issueObj.status,
          reporterCount: reporterCount,
          reporters: issueObj.reporters,
        };
      })
    );

    res.json({ issues: issuesWithMedia });
  } catch (err: any) {
    console.error("❌ Error fetching issues:");
    console.error("   Message:", err.message);
    console.error("   Stack:", err.stack);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const citizenId = (req as any).citizenId;

    if (!issueId || !citizenId) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const issue = await IssueModel.findById(issueId);
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
    const mediaFiles = await MultimediaModel.find({ issueID: issueId });
    try {
      const bucket = getGridFSBucket();
      const db = mongoose.connection.db!;
      for (const media of mediaFiles) {
        const filename = media.url.split("/").pop();
        if (filename) {
          const gridFiles = await db.collection("uploads.files").find({ filename }).toArray();
          for (const gf of gridFiles) {
            await bucket.delete(gf._id);
          }
        }
      }
    } catch (gridErr) {
      console.error("Error cleaning up GridFS files:", gridErr);
    }
    await MultimediaModel.deleteMany({ issueID: issueId });

    // Delete the issue
    await IssueModel.findByIdAndDelete(issueId);

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
