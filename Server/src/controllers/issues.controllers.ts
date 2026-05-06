import { Request, Response } from "express";
import { IssueModel } from "../models/issue.model";
import { MultimediaModel } from "../models/multimedia.model";

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

    const existingIssue = await IssueModel.findOne({ title });
    if (existingIssue) {
      res
        .status(400)
        .json({ message: " Issue with this title already exists" });
      return;
    }

    const issue = await IssueModel.create({
      citizenId: (req as any).citizenId, // Adapt as per your auth
      issueType,
      title,
      description,
      location: parsedLocation,
      status: "Pending",
      multimediaId: (req as any).multimediaId,
    });

    const mediaDocs = await Promise.all(
      files.map((file) =>
        MultimediaModel.create({
          issueID: issue._id,
          fileType: file.mimetype.startsWith("video") ? "video" : "image",
          url: "/uploads/" + file.filename,
          filename: file.originalname,
        })
      )
    );
    console.log("Response body:", {
      message: "Issue created",
      media: mediaDocs,
    });

    res.status(200).json({ message: "Issue created", issue, media: mediaDocs });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const issues = await IssueModel.find({})
      .populate("citizenId", "fullName phonenumber");

    const issuesWithMedia = await Promise.all(
      issues.map(async (issue) => {
        const media = await MultimediaModel.find({ issueID: issue._id });
        const issueObj = issue.toObject ? issue.toObject() : issue;
        
        // Clean up upvotedBy array - remove null, undefined, and invalid entries
        let upvotedByList = Array.isArray(issueObj.upvotedBy) ? issueObj.upvotedBy : [];
        upvotedByList = upvotedByList.filter(
          (phone) => phone && phone !== null && phone !== 'undefined' && phone !== 'null' && String(phone).trim() !== ''
        );
        
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
          status: issueObj.status === "Reported" ? "Pending" : issueObj.status,
          upvotes: Math.max(0, upvotedByList.length), // Ensure upvotes matches array length
          upvotedBy: upvotedByList,
        };
      })
    );

    res.json({ issues: issuesWithMedia });
  } catch (err) {
    console.error("Error fetching issues:", err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const upvoteIssue = async (req: Request, res: Response) => {
  try {
    const { issueId } = req.params;
    const citizenPhone = (req as any).citizenPhone;

    console.log("Upvote request - citizenPhone:", citizenPhone);

    if (!citizenPhone) {
      res.status(401).json({ message: "Phone number not found in token" });
      return;
    }

    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }

    // Initialize upvotedBy if it doesn't exist
    if (!issue.upvotedBy) {
      issue.upvotedBy = [];
    }

    // Clean up garbage data
    issue.upvotedBy = issue.upvotedBy.filter(
      (phone) => phone && phone !== null && phone !== 'undefined' && phone !== 'null' && String(phone).trim() !== ''
    );

    const phoneStr = String(citizenPhone).trim();
    
    // Check if citizen has already upvoted (using phone number)
    const hasUpvoted = issue.upvotedBy.includes(phoneStr);
    console.log("Has upvoted:", hasUpvoted, "phoneStr:", phoneStr, "array:", issue.upvotedBy);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvotedBy = issue.upvotedBy.filter((phone) => String(phone).trim() !== phoneStr);
    } else {
      // Add upvote
      issue.upvotedBy.push(phoneStr);
    }

    // Keep upvotes in sync with array length
    issue.upvotes = issue.upvotedBy.length;
    
    // Mark the array as modified for Mongoose
    issue.markModified('upvotedBy');
    
    await issue.save();
    console.log("After upvote - upvotes:", issue.upvotes, "upvotedBy:", issue.upvotedBy);

    res.json({
      message: hasUpvoted ? "Upvote removed" : "Upvoted successfully",
      upvotes: issue.upvotes,
      isUpvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error("Error upvoting issue:", error);
    res.status(500).json({ message: "Internal server error" });
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

    // Delete associated multimedia
    await MultimediaModel.deleteMany({ issueID: issueId });

    // Delete the issue
    await IssueModel.findByIdAndDelete(issueId);

    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
