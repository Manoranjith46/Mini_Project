import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) {
  throw new Error("Please provide a database URL");
}

import { setGridFSBucket } from "./gridfs";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    // Initialize GridFS bucket after connection
    const bucket = new GridFSBucket(conn.connection.db!, { bucketName: "uploads" });
    setGridFSBucket(bucket);
    
    // Drop old unique index on title if it exists (from previous schema)
    try {
      const issuesCollection = conn.connection.db!.collection("issues");
      const indexes = await issuesCollection.listIndexes().toArray();
      const titleIndex = indexes.find(idx => idx.name === "title_1");
      if (titleIndex) {
        await issuesCollection.dropIndex("title_1");
        console.log("✅ Dropped old unique index on 'title' field");
      }
    } catch (indexErr) {
      console.log("Index cleanup info:", (indexErr as any).message);
    }
    
    console.log(`🛰️  MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("DB connection error:", err);
  }
};
