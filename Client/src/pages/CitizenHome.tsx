import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import { Plus, MapPin, Clock, User, X } from "lucide-react";
import { Link } from "react-router-dom";
import { VITE_BACKEND_URL } from "../config/config";
import Player from "lottie-react";
import emptyAnimation from "../assets/animations/empty.json";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import starloader from "../assets/animations/starloder.json";
import { motion } from "framer-motion";
import { useLoader } from "../contexts/LoaderContext";

interface Issues {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reportedBy: string;
  reportedByID: string;
  reportedByPhone: string;
  reportedAt: string;
  image: string;
  status: string;
  upvotes: number;
  upvotedBy: string[];
}

const MIN_LOADER_DURATION = 2500; // Minimum loader display time (ms)

const CitizenHome = () => {
  const [reportedIssues, setReportedIssues] = useState<Issues[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserPhone, setCurrentUserPhone] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<Issues | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const { hideLoader } = useLoader();

  const statusOptions = ["In Progress", "Resolved", "Rejected", "Pending"];

  useEffect(() => {
    const fetchIssues = async () => {
      const startTime = Date.now();

      try {
        // Get current user info from localStorage
        let userPhone = "";
        const userInfo = localStorage.getItem("auth_user");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          userPhone = user.phonenumber;
          setCurrentUserPhone(userPhone); // Use phone number for identification
          console.log("Current user phone:", userPhone); // Debug log
        }

        const response = await fetch(`${VITE_BACKEND_URL}/api/v1/all-issues`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });

        const data = await response.json();
        if (Array.isArray(data.issues)) {
          // Transform any "Reported" status to "Pending" for display
          const transformedIssues = data.issues.map((issue: any) => ({
            ...issue,
            status: issue.status === "Reported" ? "Pending" : issue.status,
          }));
          setReportedIssues(transformedIssues);
        } else {
          setReportedIssues([]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        const elapsed = Date.now() - startTime;
        const delay = Math.max(MIN_LOADER_DURATION - elapsed, 0);

        setTimeout(() => {
          setLoading(false);
          hideLoader();
        }, delay);
      }
    };

    fetchIssues();
  }, [hideLoader]);

  const filteredIssues = reportedIssues;

  // Filter to show only user's reports
  const tabFilteredIssues = filteredIssues.filter((issue) => {
    const userMatch = issue.reportedByPhone === currentUserPhone;

    const statusMatch =
      statusFilters.size === 0 || statusFilters.has(issue.status);

    return userMatch && statusMatch;
  });

  // Group issues by type
  const groupIssuesByType = (issues: Issues[]) => {
    const grouped: { [key: string]: Issues[] } = {};
    
    issues.forEach((issue) => {
      const type = issue.type || "Other";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(issue);
    });

    return grouped;
  };

  const groupedIssues = groupIssuesByType(tabFilteredIssues);
  const issueTypes = [
    "Road Infrastructure",
    "Waste Management",
    "Environmental Issues",
    "Utilities & Infrastructure",
    "Public Safety",
    "Other",
  ];

  const toggleStatusFilter = (status: string) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  const handleDeleteIssue = async (issueId: string) => {
    const issue = reportedIssues.find(i => i._id === issueId);
    
    // Check if issue is In Progress
    if (issue?.status === "In Progress") {
      alert("Cannot delete issue that is In Progress. Please wait until it's completed.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      const response = await fetch(
        `${VITE_BACKEND_URL}/api/v1/issue/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (response.ok) {
        setReportedIssues((prev) => prev.filter((i) => i._id !== issueId));
        setSelectedIssue(null);
      } else {
        alert("Failed to delete issue");
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Error deleting issue");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Rejected":
        return "bg-red-200/70 text-red-900";
      case "Reported":
      case "Pending":
        return "bg-yellow-200/70 text-yellow-900";
      case "Resolved":
        return "bg-green-200/70 text-green-900";
      case "In Progress":
        return "bg-blue-200/70 text-blue-900";
      default:
        return "bg-gray-200/70 text-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <Player
          autoplay
          loop
          animationData={starloader}
          style={{ height: "200px", width: "200px" }}
        />
        <p className="text-muted-foreground mt-4">Fetching issues...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <HeaderAfterAuth />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-[#0577b7] tracking-wide">
                Welcome, Citizen!
              </h1>
              <p className="text-gray-500 mt-2 text-base">
                Help improve your community by reporting issues
              </p>
            </div>
            <Link to={`/citizen/profile`}>
              <Button
                variant="outline"
                className="flex items-center space-x-2 rounded-full shadow-sm hover:shadow-md transition-all text-slate-500"
              >
                <User className="h-4 w-4 text-purple-700" />
                <span>My Profile</span>
              </Button>
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-sky-600 flex items-center gap-3">
                  My Reports
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                    {tabFilteredIssues.length}
                  </span>
                </h2>
                
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm font-semibold text-gray-600 self-center">Filter by Status:</span>
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        statusFilters.has(status)
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  {statusFilters.size > 0 && (
                    <button
                      onClick={() => setStatusFilters(new Set())}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-700 hover:bg-red-300 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Issues grouped by type */}
            <div className="space-y-10">
              {issueTypes.map((type) => {
                const typeIssues = groupedIssues[type] || [];
                if (typeIssues.length === 0) return null;

                let typeColor = "from-blue-50 to-blue-100";
                let typeBgColor = "bg-blue-100";
                let typeTextColor = "text-blue-700";

                // Assign colors based on issue type
                switch (type) {
                  case "Road Infrastructure":
                    typeColor = "from-orange-50 to-orange-100";
                    typeBgColor = "bg-orange-100";
                    typeTextColor = "text-orange-700";
                    break;
                  case "Waste Management":
                    typeColor = "from-green-50 to-green-100";
                    typeBgColor = "bg-green-100";
                    typeTextColor = "text-green-700";
                    break;
                  case "Environmental Issues":
                    typeColor = "from-emerald-50 to-emerald-100";
                    typeBgColor = "bg-emerald-100";
                    typeTextColor = "text-emerald-700";
                    break;
                  case "Utilities & Infrastructure":
                    typeColor = "from-purple-50 to-purple-100";
                    typeBgColor = "bg-purple-100";
                    typeTextColor = "text-purple-700";
                    break;
                  case "Public Safety":
                    typeColor = "from-red-50 to-red-100";
                    typeBgColor = "bg-red-100";
                    typeTextColor = "text-red-700";
                    break;
                  case "Other":
                    typeColor = "from-gray-50 to-gray-100";
                    typeBgColor = "bg-gray-100";
                    typeTextColor = "text-gray-700";
                    break;
                }

                return (
                  <div key={type} className="space-y-4">
                    {/* Category Header */}
                    <div className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${typeColor} border-2 border-gray-200`}>
                      <div>
                        <h3 className={`text-2xl font-bold ${typeTextColor}`}>
                          {type}
                        </h3>
                        <p className={`text-sm ${typeTextColor} opacity-75`}>
                          {typeIssues.length} issue{typeIssues.length !== 1 ? "s" : ""} reported
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold text-lg ${typeBgColor} ${typeTextColor}`}>
                        {typeIssues.length}
                      </div>
                    </div>

                    {/* Issues Grid for this type */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {typeIssues.map((issue, index) => (
                        <Card
                          key={issue._id}
                          onClick={() => setSelectedIssue(issue)}
                          className={`rounded-lg bg-white/70 backdrop-blur-md border border-gray-200 shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col h-full cursor-pointer ${
                            issue.status === "Rejected"
                              ? "opacity-30 grayscale"
                              : "opacity-100"
                          }`}
                        >
                          <div className="relative h-24 overflow-hidden rounded-t-lg">
                            <img
                              src={
                                issue.image
                                  ? issue.image.startsWith("http")
                                    ? issue.image
                                    : `${VITE_BACKEND_URL}${issue.image}`
                                  : "/placeholder.jpg"
                              }
                              alt={issue.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            <div
                              className={`absolute top-1 left-1 px-2 py-1 rounded-full text-xs font-bold bg-white text-blue-600 shadow-md`}
                            >
                              #{index + 1}
                            </div>
                            <div
                              className={`absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                issue.status
                              )}`}
                            >
                              {issue.status}
                            </div>
                          </div>
                          <CardContent className="p-3 space-y-2 flex-1 flex flex-col">
                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                              {issue.title}
                            </h3>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="line-clamp-1">{issue.location.address}</span>
                            </div>
                            <div className="text-xs font-semibold text-gray-700 mt-auto">
                              {issue.status === "Pending" && <span className="text-yellow-600">⏳ Pending</span>}
                              {issue.status === "In Progress" && <span className="text-blue-600">🔄 In Progress</span>}
                              {issue.status === "Resolved" && <span className="text-green-600">✅ Resolved</span>}
                              {issue.status === "Rejected" && <span className="text-red-600">❌ Rejected</span>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail Modal */}
            {selectedIssue && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedIssue(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-lg">
                        #{tabFilteredIssues.findIndex(i => i._id === selectedIssue._id) + 1}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedIssue.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="p-2 hover:bg-gray-200 rounded-full transition"
                    >
                      <X className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Image */}
                    {selectedIssue.image && (
                      <div className="relative h-96 rounded-lg overflow-hidden">
                        <img
                          src={
                            selectedIssue.image.startsWith("http")
                              ? selectedIssue.image
                              : `${VITE_BACKEND_URL}${selectedIssue.image}`
                          }
                          alt={selectedIssue.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                            selectedIssue.status
                          )}`}
                        >
                          {selectedIssue.status}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {selectedIssue.description}
                      </p>
                    </div>

                    {/* Status Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Timeline</h3>
                      <div className="space-y-3">
                        {/* Pending */}
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedIssue.status === "Pending" 
                              ? "bg-yellow-500 text-white" 
                              : selectedIssue.status === "In Progress" || selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected"
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}>
                            {selectedIssue.status === "Pending" ? "📋" : selectedIssue.status === "In Progress" || selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected" ? "✓" : ""}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">Pending</p>
                            <p className="text-sm text-gray-600">Issue has been reported and is waiting for review</p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex">
                          <div className={`w-8 flex justify-center ${
                            selectedIssue.status === "In Progress" || selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected"
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}>
                            <div className="w-1 h-8 bg-current"></div>
                          </div>
                        </div>

                        {/* In Progress */}
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedIssue.status === "In Progress" 
                              ? "bg-blue-500 text-white" 
                              : selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected"
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}>
                            {selectedIssue.status === "In Progress" ? "🔄" : selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected" ? "✓" : ""}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">In Progress</p>
                            <p className="text-sm text-gray-600">The authorities are working on resolving this issue</p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="flex">
                          <div className={`w-8 flex justify-center ${
                            selectedIssue.status === "Resolved" || selectedIssue.status === "Rejected"
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}>
                            <div className="w-1 h-8 bg-current"></div>
                          </div>
                        </div>

                        {/* Resolved */}
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            selectedIssue.status === "Resolved" 
                              ? "bg-green-500 text-white" 
                              : selectedIssue.status === "Rejected"
                              ? "bg-red-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}>
                            {selectedIssue.status === "Resolved" ? "✓" : ""}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">Resolved</p>
                            <p className="text-sm text-gray-600">The issue has been successfully resolved</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Location</p>
                            <p className="text-gray-800">{selectedIssue.location.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <User className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Reported By</p>
                            <p className="text-gray-800">{selectedIssue.reportedBy}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Clock className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Reported At</p>
                            <p className="text-gray-800">{selectedIssue.reportedAt}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-5 w-5 text-blue-600 mt-1">📋</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">Issue Type</p>
                            <p className="text-gray-800">{selectedIssue.type}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Section */}
                    <div className="border-t pt-4">
                      {selectedIssue.reportedByPhone === currentUserPhone && (
                        <button
                          onClick={() => handleDeleteIssue(selectedIssue._id)}
                          disabled={selectedIssue.status === "In Progress"}
                          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all text-lg ${
                            selectedIssue.status === "In Progress"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          title={selectedIssue.status === "In Progress" ? "Cannot delete issue in progress" : "Delete issue"}
                        >
                          <X className="h-5 w-5" />
                          <span>Delete Issue</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {tabFilteredIssues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="max-w-xs mx-auto mb-4">
                  <Player
                    autoplay
                    loop
                    animationData={emptyAnimation}
                    style={{ height: "180px", width: "180px" }}
                  />
                </div>
                <p className="text-gray-400 text-lg">
                  {statusFilters.size > 0 ? (
                    <>
                      No issues found with status{" "}
                      <span className="font-semibold">
                        {Array.from(statusFilters).join(", ")}
                      </span>
                    </>
                  ) : (
                    "You haven't reported any issues yet. Start by creating your first report!"
                  )}
                </p>
              </motion.div>
            )}
          </div>

          <div className="fixed bottom-8 right-8 z-50">
            <Link to="/citizen/create-issue">
              <Button
                size="lg"
                className="civic-gradient text-white border-0 h-14 px-6 rounded-full 
                shadow-lg hover:shadow-2xl hover:scale-105 
                transition-transform duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default CitizenHome;
