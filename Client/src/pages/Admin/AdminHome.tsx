import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLoader } from "../../context/LoaderContext";
import AdminLoader from "./components/loader/loader";
import { Skeleton } from "../components/ui/skeleton";

interface DashboardStats {
  totalIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  pendingIssues: number;
  rejectedIssues: number;
  handledByAdmin: number;
  resolutionRate: number;
  issuesByType: Array<{ _id: string; count: number }>;
  recentIssues: Array<{
    _id: string;
    title: string;
    status: string;
    type: string;
    createdAt: string;
  }>;
}

const AdminHome = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { hideLoader } = useLoader();

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [hideLoader]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-emerald-700" />;
      case "Pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-emerald-100 text-emerald-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 animate-pulse" />
            <Skeleton className="h-4 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-24 animate-pulse" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 space-y-3 shadow-sm border">
              <Skeleton className="h-4 w-24 animate-pulse" />
              <Skeleton className="h-8 w-16 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <Skeleton className="h-6 w-48 animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 animate-pulse" />
                    <Skeleton className="h-3 w-32 animate-pulse" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <Skeleton className="h-6 w-32 animate-pulse" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-4 w-12 animate-pulse" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 py-8"
    >
      <div className="px-4 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor community civic issues
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchDashboardStats}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link to="/admin/profile">
              <Button className="bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white">
                My Profile
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Issues Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalIssues}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
          </motion.div>

          {/* Resolved Issues Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Resolved Issues
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.resolvedIssues}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* In Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  {stats.inProgressIssues}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-emerald-700" />
              </div>
            </div>
          </motion.div>

          {/* Resolution Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Resolution Rate
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.resolutionRate}%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingIssues}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Rejected Issues */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejectedIssues}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Handled by Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Handled by You
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.handledByAdmin}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issues by Type */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Issues by Type
            </h2>
            <div className="space-y-3">
              {stats.issuesByType.length > 0 ? (
                stats.issuesByType.map((type) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-700 to-green-600"></div>
                      <span className="text-gray-700 font-medium">{type._id}</span>
                    </div>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                      {type.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No issues yet</p>
              )}
            </div>
          </motion.div>

          {/* Recent Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Issues
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.recentIssues.length > 0 ? (
                stats.recentIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div>{getStatusIcon(issue.status)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {issue.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent issues</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminHome;
