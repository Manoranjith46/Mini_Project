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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearbyDuplicates = exports.calculateDistance = void 0;
const issue_model_1 = require("../models/issue.model");
// Calculate distance between two coordinates (in meters) using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
const findNearbyDuplicates = (latitude_1, longitude_1, issueType_1, ...args_1) => __awaiter(void 0, [latitude_1, longitude_1, issueType_1, ...args_1], void 0, function* (latitude, longitude, issueType, radiusMeters = 100 // 100 meters default
) {
    try {
        console.log(`🔍 Searching for duplicates near (${latitude}, ${longitude}) with type ${issueType}`);
        // Find all open issues with the same type
        const openIssues = yield issue_model_1.IssueModel.find({
            issueType: issueType,
            status: { $in: ["Pending", "In Progress"] },
        }).select("title description location issueType status reporters");
        console.log(`📋 Found ${openIssues.length} open issues with same type`);
        // Filter by distance
        const nearbyIssues = openIssues
            .map((issue) => {
            const distance = (0, exports.calculateDistance)(latitude, longitude, issue.location.latitude, issue.location.longitude);
            return {
                issue,
                distance,
            };
        })
            .filter((item) => item.distance <= radiusMeters)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3) // Top 3 closest issues
            .map((item) => {
            const reporterCount = Array.isArray(item.issue.reporters)
                ? item.issue.reporters.length
                : 1;
            return {
                _id: item.issue._id.toString(),
                title: item.issue.title,
                description: item.issue.description,
                issueType: item.issue.issueType,
                status: item.issue.status || "Pending",
                location: item.issue.location,
                reporterCount: reporterCount,
                distance: Math.round(item.distance),
            };
        });
        console.log(`✅ Found ${nearbyIssues.length} nearby duplicates within ${radiusMeters}m`);
        return nearbyIssues;
    }
    catch (error) {
        console.error("❌ Error finding nearby duplicates:", error);
        return [];
    }
});
exports.findNearbyDuplicates = findNearbyDuplicates;
