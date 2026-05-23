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
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const gridfs_1 = require("../config/gridfs");
const router = (0, express_1.Router)();
// Stream a file from GridFS by filename
router.get("/files/:filename", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filename } = req.params;
        const bucket = (0, gridfs_1.getGridFSBucket)();
        const db = mongoose_1.default.connection.db;
        // Look up the file metadata
        const files = yield db.collection("uploads.files").find({ filename }).toArray();
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
    }
    catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
