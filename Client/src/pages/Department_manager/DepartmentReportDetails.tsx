import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Users,
  UserPlus,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";

interface ReportDetail {
  issue: {
    _id: string;
    title: string;
    description: string;
    issueType: string;
    status: string;
    departmentAssigned?: string;
    costAmount?: number;
    createdAt: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    citizenId?: {
      fullName: string;
      phonenumber: string;
      email?: string;
    };
    reporters?: Array<{
      _id: string;
      fullName: string;
      phonenumber: string;
    }>;
  };
  statusHistory: Array<{
    _id: string;
    status: string;
    title?: string;
    description?: string;
    costAdded: number;
    changedAt: string;
  }>;
}

interface Worker {
  _id: string;
  fullName: string;
  phonenumber: string;
  employeeId: string;
  zone: string;
  isActive: boolean;
  assignedIssues: string[];
  specialization?: string[];
}

const DepartmentReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Worker assignment state
  const [assignedWorkers, setAssignedWorkers] = useState<Worker[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [unassigning, setUnassigning] = useState<string | null>(null);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateCost, setUpdateCost] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/reports/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setDetail(result.data);
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // Re-fetch report after status update
  const refetchReport = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/reports/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setDetail(result.data);
        setSelectedStatus("");
      }
    } catch (error) {
      console.error("Error re-fetching report:", error);
    }
  };

  // Fetch assigned workers for this issue
  const fetchAssignedWorkers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/issue/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAssignedWorkers(data.data);
      }
    } catch (error) {
      console.error("Error fetching assigned workers:", error);
    }
  };

  // Fetch all available workers in this zone
  const fetchAvailableWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const zone = user?.place || "Unassigned";
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/zone/${zone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAvailableWorkers(data.data);
      }
    } catch (error) {
      console.error("Error fetching available workers:", error);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAssignedWorkers();
      fetchAvailableWorkers();
    }
  }, [id]);

  // Assign a worker to this issue
  const handleAssignWorker = async (workerId: string) => {
    setAssigning(workerId);
    showLoader();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ workerId, issueId: id }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Worker assigned successfully");
        await fetchAssignedWorkers();
        await fetchAvailableWorkers();
      } else {
        toast.error(data.message || "Failed to assign worker");
      }
    } catch (error) {
      console.error("Error assigning worker:", error);
      toast.error("Failed to assign worker");
    } finally {
      setAssigning(null);
      hideLoader();
    }
  };

  // Unassign a worker from this issue
  const handleUnassignWorker = async (workerId: string) => {
    setUnassigning(workerId);
    showLoader();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/unassign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ workerId, issueId: id }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Worker removed from this issue");
        await fetchAssignedWorkers();
        await fetchAvailableWorkers();
      } else {
        toast.error(data.message || "Failed to remove worker");
      }
    } catch (error) {
      console.error("Error unassigning worker:", error);
      toast.error("Failed to remove worker");
    } finally {
      setUnassigning(null);
      hideLoader();
    }
  };

  // Workers not yet assigned to this issue
  const unassignedWorkers = availableWorkers.filter(
    (w) => !assignedWorkers.some((aw) => aw._id === w._id)
  );

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    setUpdatingStatus(true);
    showLoader();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issue/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            status: selectedStatus,
            title: updateTitle,
            description: updateDescription,
            costAmount: updateCost ? parseFloat(updateCost) : undefined,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(`Status updated to ${selectedStatus}`);
        setUpdateTitle("");
        setUpdateDescription("");
        setUpdateCost("");
        await refetchReport();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
      hideLoader();
    }
  };

  if (loading) {
    return (
      <div className="px-4 space-y-6 animate-pulse">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return <p className="p-6 text-center text-gray-500">Report not found.</p>;
  }

  const { issue, statusHistory } = detail;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-orange-100 text-orange-800";
    }
  };

  return (
    <div className="px-4 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/department/reports")}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Issue Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
            <p className="text-gray-600 mt-2">{issue.description}</p>
          </div>
          <span className={`self-start px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(issue.status)}`}>
            {issue.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{issue.location.address}</p>
              <p className="text-sm text-gray-500">
                {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">{issue.issueType}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <User className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {issue.citizenId?.fullName || "Anonymous"}
              </p>
              <p className="text-sm text-gray-500">Primary reporter</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <Phone className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {issue.citizenId?.phonenumber || "Not available"}
              </p>
              <p className="text-sm text-gray-500">Reporter contact</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assigned Workers Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Assigned Workers</h2>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              {assignedWorkers.length} assigned
            </span>
          </div>
          <Button
            onClick={() => setShowAssignPanel(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Assign Workers
          </Button>
        </div>

        {/* Already assigned workers list */}
        {assignedWorkers.length > 0 ? (
          <div className="space-y-3">
            {assignedWorkers.map((worker) => (
              <div
                key={worker._id}
                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-semibold text-sm">
                    {worker.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{worker.fullName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>ID: {worker.employeeId}</span>
                      <span>•</span>
                      <span>{worker.phonenumber}</span>
                      <span>•</span>
                      <span>{worker.zone}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleUnassignWorker(worker._id)}
                  disabled={unassigning === worker._id}
                >
                  {unassigning === worker._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No workers assigned to this issue yet</p>
            <p className="text-sm mt-1">Click "Assign Workers" to add workers</p>
          </div>
        )}
      </motion.div>

      {/* Assign Workers Modal Popup */}
      <AnimatePresence>
        {showAssignPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAssignPanel(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-orange-600" />
                    Assign Workers
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Select workers from {user?.place || "your zone"} to assign to this issue
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignPanel(false)}
                  className="p-2 hover:bg-orange-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingWorkers ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 animate-pulse"
                      >
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 h-12 rounded-full animate-pulse" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 animate-pulse" />
                            <Skeleton className="h-3 w-48 animate-pulse" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-20 rounded-md animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : unassignedWorkers.length > 0 ? (
                  <div className="space-y-3">
                    {unassignedWorkers.map((worker) => (
                      <div
                        key={worker._id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {worker.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{worker.fullName}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                ID: {worker.employeeId}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                {worker.phonenumber}
                              </span>
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {Array.isArray(worker.assignedIssues) ? worker.assignedIssues.length : 0} active tasks
                              </span>
                              {worker.specialization && worker.specialization.length > 0 && (
                                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                  {worker.specialization.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shadow-sm"
                          onClick={() => handleAssignWorker(worker._id)}
                          disabled={assigning === worker._id}
                        >
                          {assigning === worker._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-lg font-medium">All Workers Assigned</p>
                    <p className="text-sm mt-1">Every available worker in your zone is already assigned to this issue</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {unassignedWorkers.length} worker{unassignedWorkers.length !== 1 ? "s" : ""} available
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAssignPanel(false)}
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Update Status</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors"
            >
              <option value="">Select status...</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Title</label>
            <input
              type="text"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="e.g. Workers dispatched to site"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              placeholder="Describe the progress or update details..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment / Expenditure Amount (₹) (Optional)</label>
            <input
              type="number"
              min="0"
              value={updateCost}
              onChange={(e) => setUpdateCost(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors"
            />
          </div>

          <Button
            onClick={handleStatusUpdate}
            disabled={updatingStatus || !selectedStatus}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 w-full sm:w-auto"
          >
            {updatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {updatingStatus ? "Updating..." : "Submit Update"}
          </Button>
        </div>

        {/* Current status indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Current status: <span className={`inline-block ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(issue.status)}`}>{issue.status}</span>
          </p>
        </div>
      </motion.div>

      {/* Status History (Timeline) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Timeline</h2>
        {statusHistory.length === 0 ? (
          <p className="text-gray-500">No status updates yet.</p>
        ) : (
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            {statusHistory.map((item, idx) => (
              <div key={item._id} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center ${
                  item.status === "Resolved" ? "bg-green-100" :
                  item.status === "In Progress" ? "bg-blue-100" :
                  item.status === "Rejected" ? "bg-red-100" : "bg-yellow-100"
                }`}>
                  {item.status === "Resolved" ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  ) : item.status === "Rejected" ? (
                    <X className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.changedAt).toLocaleString()}
                    </span>
                  </div>
                  {item.title && (
                    <p className="text-sm font-semibold text-gray-900 mt-2">{item.title}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  {item.costAdded > 0 && (
                    <p className="text-sm text-orange-600 font-medium mt-2">
                      Cost recorded: ₹ {item.costAdded.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DepartmentReportDetails;
