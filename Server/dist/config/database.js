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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
require("dotenv/config");
const DATABASE_URL = process.env.DATABASE_URL || "";
if (!DATABASE_URL) {
    throw new Error("Please provide a database URL");
}
const gridfs_1 = require("./gridfs");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(DATABASE_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        // Initialize GridFS bucket after connection
        const bucket = new mongodb_1.GridFSBucket(conn.connection.db, { bucketName: "uploads" });
        (0, gridfs_1.setGridFSBucket)(bucket);
        // Drop old unique index on title if it exists (from previous schema)
        try {
            const issuesCollection = conn.connection.db.collection("issues");
            const indexes = yield issuesCollection.listIndexes().toArray();
            const titleIndex = indexes.find(idx => idx.name === "title_1");
            if (titleIndex) {
                yield issuesCollection.dropIndex("title_1");
                console.log("✅ Dropped old unique index on 'title' field");
            }
        }
        catch (indexErr) {
            console.log("Index cleanup info:", indexErr.message);
        }
        console.log(`🛰️  MongoDB Connected: ${conn.connection.host}`);
    }
    catch (err) {
        console.error("DB connection error:", err);
    }
});
exports.connectDB = connectDB;
