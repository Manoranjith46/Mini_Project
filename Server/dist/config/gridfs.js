"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGridFSBucket = exports.getGridFSBucket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
let gridFSBucket;
const getGridFSBucket = () => {
    if (!gridFSBucket) {
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error("Database not connected yet. Call connectDB() first.");
        }
        gridFSBucket = new mongodb_1.GridFSBucket(db, { bucketName: "uploads" });
    }
    return gridFSBucket;
};
exports.getGridFSBucket = getGridFSBucket;
const setGridFSBucket = (bucket) => {
    gridFSBucket = bucket;
};
exports.setGridFSBucket = setGridFSBucket;
