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
const mongoose_1 = __importDefault(require("mongoose"));
const issue_model_1 = require("../models/issue.model");
/**
 * Migration script to update all issues with "Reported" status to "Pending"
 * Run this script once to migrate existing data
 */
function migrateReportedToPending() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to database
            yield mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mini-project");
            console.log("Connected to database");
            // Update all issues with "Reported" status to "Pending"
            const result = yield issue_model_1.IssueModel.updateMany({ status: "Reported" }, { status: "Pending" });
            console.log(`Migration completed successfully!`);
            console.log(`Issues updated: ${result.modifiedCount}`);
            console.log(`Issues matched: ${result.matchedCount}`);
            // Verify the changes
            const reportedCount = yield issue_model_1.IssueModel.countDocuments({
                status: "Reported",
            });
            const pendingCount = yield issue_model_1.IssueModel.countDocuments({
                status: "Pending",
            });
            console.log(`\nVerification:`);
            console.log(`Remaining "Reported" issues: ${reportedCount}`);
            console.log(`Total "Pending" issues: ${pendingCount}`);
            yield mongoose_1.default.connection.close();
            console.log("Database connection closed");
        }
        catch (error) {
            console.error("Migration failed:", error);
            process.exit(1);
        }
    });
}
// Run the migration
migrateReportedToPending();
