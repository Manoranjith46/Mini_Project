import mongoose from "mongoose";
import { IssueModel } from "../models/issue.model";

/**
 * Migration script to update all issues with "Reported" status to "Pending"
 * Run this script once to migrate existing data
 */
async function migrateReportedToPending() {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mini-project"
    );
    console.log("Connected to database");

    // Update all issues with "Reported" status to "Pending"
    const result = await IssueModel.updateMany(
      { status: "Reported" },
      { status: "Pending" }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Issues updated: ${result.modifiedCount}`);
    console.log(`Issues matched: ${result.matchedCount}`);

    // Verify the changes
    const reportedCount = await IssueModel.countDocuments({
      status: "Reported",
    });
    const pendingCount = await IssueModel.countDocuments({
      status: "Pending",
    });

    console.log(`\nVerification:`);
    console.log(`Remaining "Reported" issues: ${reportedCount}`);
    console.log(`Total "Pending" issues: ${pendingCount}`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateReportedToPending();
