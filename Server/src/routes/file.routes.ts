import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { getGridFSBucket } from "../config/gridfs";

const router = Router();

// Stream a file from GridFS by filename
router.get("/files/:filename", async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const bucket = getGridFSBucket();
    const db = mongoose.connection.db!;

    // Look up the file metadata
    const files = await db.collection("uploads.files").find({ filename }).toArray();

    if (!files || files.length === 0) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    const file = files[0];

    // Set content type
    const contentType = file.contentType || "application/octet-stream";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");

    // Stream the file from GridFS
    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on("error", (err) => {
      console.error("GridFS download error:", err);
      res.status(500).json({ message: "Error streaming file" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
