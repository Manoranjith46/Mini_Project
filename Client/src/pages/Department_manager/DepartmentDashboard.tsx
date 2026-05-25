import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";
import {
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  XCircle,
  TrendingUp,
  Users,
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const { hideLoader } = useLoader();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
    rejected: 0,
  });
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const fetchDashboardData = async () => {
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

      if (issuesRes.ok && issuesData.issues) {
        const issues = issuesData.issues;
        setStats({
          totalAssigned: issues.length,
          inProgress: issues.filter((i: any) => i.status === "In Progress").length,
          resolved: issues.filter((i: any) => i.status === "Resolved").length,
          pending: issues.filter((i: any) => i.status === "Pending").length,
          rejected: issues.filter((i: any) => i.status === "Rejected").length,
        });
        // Recent 5 issues
        setRecentIssues(issues.slice(0, 5));
        // Total spent
        const spent = issues.reduce((sum: number, i: any) => sum + (i.costAmount || 0), 0);
        setTotalSpent(spent);
      }

      // Fetch workers
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
      if (workersData.success && workersData.data) {
        setWorkers(workersData.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const resolutionRate =
    stats.totalAssigned > 0
      ? Math.round((stats.resolved / stats.totalAssigned) * 100)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="px-4 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>

        {/* Spending Banner Skeleton */}
        <Skeleton className="h-24 w-full rounded-xl" />

        {/* Grid of Recent Issues & Workers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Zone Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of issues in {user?.place || user?.department}
          </p>
        </div>
        <Button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAssigned}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Resolution Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{resolutionRate}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Workers</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{workers.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Total Spending Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Total Zone Expenditure</p>
            <p className="text-4xl font-bold mt-2">₹ {totalSpent.toLocaleString("en-IN")}</p>
            <p className="text-orange-200 text-sm mt-1">
              across {stats.resolved} resolved issues
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
                onClick={() => navigate("/department/reports")}
              >
                View All →
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue: any) => (
                <div
                  key={issue._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/department/reports/${issue._id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500 truncate">{issue.location?.address}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(issue.status)}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No issues assigned to this zone yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Workers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Field Workers</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
                onClick={() => navigate("/department/workers")}
              >
                Manage →
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {workers.length > 0 ? (
              workers.slice(0, 5).map((worker: any) => (
                <div
                  key={worker._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/department/workers/${worker._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
                        {worker.fullName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{worker.fullName}</p>
                        <p className="text-xs text-gray-500">{worker.zone || "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          worker.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {worker.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Array.isArray(worker.assignedIssues) ? worker.assignedIssues.length : 0} tasks
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No workers in this zone yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DepartmentDashboard;
