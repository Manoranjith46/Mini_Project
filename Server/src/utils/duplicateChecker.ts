import { IssueModel } from "../models/issue.model";

interface NearbyIssue {
  _id: string;
  title: string;
  description: string;
  issueType: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  reporterCount: number;
  distance: number;
}

// Calculate distance between two coordinates (in meters) using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearbyDuplicates = async (
  latitude: number,
  longitude: number,
  issueType: string,
  radiusMeters: number = 100 // 100 meters default
): Promise<NearbyIssue[]> => {
  try {
    console.log(`🔍 Searching for duplicates near (${latitude}, ${longitude}) with type ${issueType}`);
    
    // Find all open issues with the same type
    const openIssues = await IssueModel.find({
      issueType: issueType,
      status: { $in: ["Pending", "In Progress"] },
    }).select("title description location issueType status reporters");

    console.log(`📋 Found ${openIssues.length} open issues with same type`);

    // Filter by distance
    const nearbyIssues = openIssues
      .map((issue) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          issue.location.latitude,
          issue.location.longitude
        );
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
          _id: (item.issue._id as any).toString(),
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
  } catch (error) {
    console.error("❌ Error finding nearby duplicates:", error);
    return [];
  }
};
