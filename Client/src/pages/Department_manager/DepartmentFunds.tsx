import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";
import { toast } from "sonner";
import {
  DollarSign,
  MapPin,
  Edit3,
  X,
  Loader2,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";

const DepartmentFunds = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [assignedIssueIds, setAssignedIssueIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cost update modal state
  const [editingIssue, setEditingIssue] = useState<any | null>(null);
  const [costInput, setCostInput] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      // Fetch issues
      const issuesRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const issuesData = await issuesRes.json();

      // Fetch workers in this zone to find assigned issues
      const zone = user?.place || "Unassigned";
      const workersRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/zone/${zone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const workersData = await workersRes.json();

      if (issuesRes.ok && issuesData.issues) {
        setAllIssues(issuesData.issues);
      }

      // Collect all issue IDs that have at least one worker assigned
      if (workersData.success && workersData.data) {
        const ids = new Set<string>();
        workersData.data.forEach((worker: any) => {
          if (Array.isArray(worker.assignedIssues)) {
            worker.assignedIssues.forEach((issueId: any) => {
              ids.add(typeof issueId === "object" ? issueId._id || String(issueId) : String(issueId));
            });
          }
        });
        setAssignedIssueIds(ids);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Issues that have at least one worker assigned
  const issuesWithWorkers = allIssues.filter((issue) => assignedIssueIds.has(String(issue._id)));
  const totalSpent = issuesWithWorkers.reduce((sum, i) => sum + (i.costAmount || 0), 0);
  const issuesWithCost = issuesWithWorkers.filter((i) => i.costAmount && i.costAmount > 0);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const openCostEditor = (issue: any) => {
    setEditingIssue(issue);
    setCostInput(issue.costAmount ? String(issue.costAmount) : "");
  };

  const handleUpdateCost = async () => {
    if (!editingIssue) return;

    const amount = parseFloat(costInput);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    setUpdating(true);
    showLoader();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issue/${editingIssue._id}/cost`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ costAmount: amount }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Expenditure updated successfully");
        setEditingIssue(null);
        await fetchData();
      } else {
        toast.error(data.message || "Failed to update cost");
      }
    } catch (error) {
      console.error("Error updating cost:", error);
      toast.error("Failed to update cost");
    } finally {
      setUpdating(false);
      hideLoader();
    }
  };

  if (loading) {
    return (
      <div className="px-4 space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4">
          <div className="flex justify-between border-b pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-4 border-b last:border-0">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Funds History
          </h1>
          <p className="text-gray-600 mt-2">
            Track and update expenditure for assigned issues in {user?.place || user?.department}
          </p>
        </div>
        <Button
          onClick={fetchData}
          disabled={refreshing}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Total Expenditure</p>
              <p className="text-3xl font-bold">₹ {totalSpent.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-blue-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Issues with Workers</p>
              <p className="text-3xl font-bold text-blue-600">{issuesWithWorkers.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-green-100"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Issues with Cost Set</p>
              <p className="text-3xl font-bold text-green-600">{issuesWithCost.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Assigned Issues Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Issues — Expenditure</h2>
          <p className="text-sm text-gray-500 mt-1">Issues with workers assigned. Click "Edit Cost" to update the expenditure.</p>
        </div>

        {issuesWithWorkers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No issues with assigned workers yet</p>
            <p className="text-sm mt-1">Assign workers to issues from the report details page to track costs here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Issue Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Cost (₹)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issuesWithWorkers.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{issue.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                        {issue.type || issue.issueType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{issue.location?.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-lg font-bold ${issue.costAmount > 0 ? "text-orange-600" : "text-gray-400"}`}>
                        {issue.costAmount > 0 ? `₹ ${issue.costAmount.toLocaleString("en-IN")}` : "Not set"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                        onClick={() => openCostEditor(issue)}
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Cost
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Cost Update Modal */}
      <AnimatePresence>
        {editingIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditingIssue(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    Update Expenditure
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {editingIssue.title}
                  </p>
                </div>
                <button
                  onClick={() => setEditingIssue(null)}
                  className="p-2 hover:bg-orange-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 space-y-5">
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {editingIssue.location?.address}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Type: <span className="font-medium text-gray-700">{editingIssue.type || editingIssue.issueType}</span></span>
                    <span>•</span>
                    <span>Status: <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(editingIssue.status)}`}>{editingIssue.status}</span></span>
                  </div>
                  {editingIssue.costAmount > 0 && (
                    <div className="text-sm text-gray-500">
                      Current cost: <span className="font-bold text-orange-600">₹ {editingIssue.costAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expenditure Amount (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    placeholder="Enter amount e.g. 25000"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingIssue(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                  onClick={handleUpdateCost}
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4" />
                  )}
                  {updating ? "Updating..." : "Update Cost"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DepartmentFunds;
