import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  RefreshCw,
  MapPin,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import type { AnalyticsData } from "../../lib/analyticsUtils";
import {
  formatCurrency,
  chartColors,
  formatIssueTypeData,
  formatCostByType,
  getSummaryStats,
} from "../../lib/analyticsUtils";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";

const DepartmentAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"30" | "60" | "90" | "all">("all");
  const { user } = useAuth();
  const { hideLoader } = useLoader();

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/analytics?timeRange=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoading(true);
      fetchAnalyticsData();
    }
  }, [timeRange]);

  if (loading) {
    return (
      <div className="px-4 space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 rounded-lg bg-white p-4 shadow-sm">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-md" />
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        {/* Extra KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[360px] w-full rounded-xl" />
          <Skeleton className="h-[360px] w-full rounded-xl" />
        </div>

        <Skeleton className="h-[360px] w-full rounded-xl" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="text-slate-700">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { summary, costs, performance, trends, engagement } = analytics.analytics;

  const pieChartData = formatIssueTypeData(performance.topIssueTypes);
  const costByTypeData = formatCostByType(costs.costByType);
  const summaryStats = getSummaryStats(analytics.analytics);

  const trendData = trends.resolutionTrends.map((trend: any) => ({
    date: `${trend._id.day}/${trend._id.month}`,
    resolved: trend.resolved,
    cost: Math.round(trend.cost / 1000),
    pending: trend.pending,
    inProgress: trend.inProgress,
  }));

  const statusData = [
    { name: "Resolved", value: summary.resolvedIssues, fill: chartColors.resolved },
    { name: "In Progress", value: summary.inProgressIssues, fill: chartColors.inProgress },
    { name: "Pending", value: summary.pendingIssues, fill: chartColors.pending },
    { name: "Rejected", value: summary.rejectedIssues, fill: chartColors.rejected },
  ].filter((item) => item.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Zone Analytics
          </h1>
          <p className="mt-1 text-slate-500">
            Performance analytics for {user?.place || "your zone"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={fetchAnalyticsData}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Filters */}
      <div className="flex gap-2 rounded-lg bg-white p-4 shadow-sm">
        {(["30", "60", "90", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === range
                ? "bg-orange-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {range === "all" ? "All Time" : `Last ${range} Days`}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {summaryStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-lg border border-slate-200 p-4 ${stat.bgColor} shadow-sm`}
          >
            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
            <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.percentage && (
              <p className="mt-1 text-xs text-slate-600">{stat.percentage}% resolved</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Extra zone KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-orange-100">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Resolution Rate</p>
            <p className="text-2xl font-bold text-orange-600">{summary.resolutionRate}%</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-blue-100">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Avg Resolution Time</p>
            <p className="text-2xl font-bold text-blue-600">{performance.avgResolutionTimeDays} days</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm flex items-center gap-4"
        >
          <div className="p-3 rounded-lg bg-green-100">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Avg Cost/Issue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(costs.avgCostPerIssue)}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart: Issue Types */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Issues by Type</h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-slate-500 py-20">No issue type data available</p>
          )}
        </motion.div>

        {/* Pie Chart: Status Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-slate-500 py-20">No status data available</p>
          )}
        </motion.div>
      </div>

      {/* Cost Analysis */}
      {costByTypeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Cost Breakdown by Issue Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="cost" fill={chartColors.primary} name="Total Cost" />
              <Bar dataKey="count" fill={chartColors.info} name="Issue Count" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Resolution Trends */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Resolution Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="resolved" stroke={chartColors.resolved} name="Resolved" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke={chartColors.pending} name="Pending" strokeWidth={2} />
              <Line type="monotone" dataKey="inProgress" stroke={chartColors.inProgress} name="In Progress" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Cost by Status + Top Issues */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost by Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Cost by Status</h3>
          <div className="space-y-3">
            {costs.costByStatus.length > 0 ? costs.costByStatus.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: (chartColors as any)[item._id.toLowerCase()] || "#9ca3af" }}
                  />
                  <span className="text-sm font-medium text-slate-700">{item._id}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(item.totalCost)}</p>
                  <p className="text-xs text-slate-500">{item.count} issues</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-500">No cost data available</p>
            )}
          </div>
        </motion.div>

        {/* Top Upvoted Issues */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Upvoted Issues</h3>
          <div className="space-y-2">
            {engagement.topUpvotedIssues.length > 0 ? engagement.topUpvotedIssues.map((issue: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">{issue.title}</p>
                  <p className="text-xs text-slate-500">{issue.issueType}</p>
                </div>
                <div className="ml-2 text-right">
                  <p className="font-semibold text-slate-900">👍 {issue.upvotes}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-slate-500">No upvoted issues yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Reported Locations */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Reported Locations</h3>
        <div className="space-y-2">
          {engagement.topReportedZones.length > 0 ? engagement.topReportedZones.map((zone: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <p className="text-sm font-medium text-slate-700 line-clamp-1">
                  {zone._id.address || "Unknown Location"}
                </p>
              </div>
              <p className="font-semibold text-slate-900">{zone.count}</p>
            </div>
          )) : (
            <p className="text-center text-sm text-slate-500">No location data available</p>
          )}
        </div>
      </motion.div>

      {/* Recent Resolved Issues */}
      {engagement.recentResolvedIssues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Recently Resolved Issues</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Upvotes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Resolved Date</th>
                </tr>
              </thead>
              <tbody>
                {engagement.recentResolvedIssues.map((issue: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700 line-clamp-1">{issue.title}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                        {issue.issueType?.slice(0, 15)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(issue.costAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">👍 {issue.upvotes}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DepartmentAnalytics;
