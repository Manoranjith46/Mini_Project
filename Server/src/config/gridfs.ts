import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gridFSBucket: GridFSBucket;

export const getGridFSBucket = (): GridFSBucket => {
  if (!gridFSBucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database not connected yet. Call connectDB() first.");
    }
    gridFSBucket = new GridFSBucket(db, { bucketName: "uploads" });
  }
  return gridFSBucket;
};

export const setGridFSBucket = (bucket: GridFSBucket) => {
  gridFSBucket = bucket;
};
