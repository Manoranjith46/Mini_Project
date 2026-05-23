"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueModel = exports.LocationModel = void 0;
const mongoose_1 = require("mongoose");
const locationSchema = new mongoose_1.Schema({
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    address: String,
}, { _id: false });
const IssueSchema = new mongoose_1.Schema({
    citizenId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Citizen",
        required: true,
    },
    reporters: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Citizen",
        }],
    issueType: {
        type: String,
        enum: [
            "Road Infrastructure",
            "Waste Management",
            "Environmental Issues",
            "Utilities & Infrastructure",
            "Public Safety",
            "Other",
        ],
        default: "Road Infrastructure",
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 100,
        minlength: 5,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["In Progress", "Resolved", "Rejected", "Pending"],
        default: "Pending",
    },
    location: {
        type: locationSchema,
        required: true,
    },
    media: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Multimedia",
    },
    handledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0,
    },
    upvotedBy: [{
            type: String,
        }],
    costAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    resolvedAt: {
        type: Date,
        sparse: true,
    },
    departmentAssigned: {
        type: String,
        sparse: true,
    },
}, { timestamps: true });
// Create geospatial index for location-based queries
IssueSchema.index({ "location.latitude": 1, "location.longitude": 1 });
exports.LocationModel = (0, mongoose_1.model)("Location", locationSchema);
exports.IssueModel = (0, mongoose_1.model)("Issue", IssueSchema);
