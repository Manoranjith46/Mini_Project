/**
 * Analytics utilities for data processing and formatting
 */

export interface AnalyticsData {
  success: boolean;
  timeRange: string;
  analytics: {
    summary: {
      totalIssues: number;
      resolvedIssues: number;
      inProgressIssues: number;
      pendingIssues: number;
      rejectedIssues: number;
      resolutionRate: number;
    };
    costs: {
      totalSpent: number;
      avgCostPerIssue: number;
      costByType: Array<{ _id: string; totalCost: number; count: number; avgCost: number }>;
      costByStatus: Array<{ _id: string; totalCost: number; count: number }>;
      costByDepartment: Array<{ _id: string; totalCost: number; count: number }>;
    };
    performance: {
      avgResolutionTimeDays: number;
      managerPerformance: Array<{
        _id: string;
        managerName: string;
        handledCount: number;
        totalCostHandled: number;
      }>;
      topIssueTypes: Array<{ _id: string; count: number }>;
    };
    trends: {
      resolutionTrends: Array<{
        _id: { year: number; month: number; day: number };
        resolved: number;
        cost: number;
        pending: number;
        inProgress: number;
      }>;
    };
    engagement: {
      topUpvotedIssues: Array<{
        _id: string;
        title: string;
        upvotes: number;
        issueType: string;
        status: string;
      }>;
      topReportedZones: Array<{ _id: { address: string }; count: number }>;
      recentResolvedIssues: Array<{
        _id: string;
        title: string;
        issueType: string;
        costAmount: number;
        resolvedAt: string;
        upvotes: number;
      }>;
    };
  };
}

// Format currency values
export const formatCurrency = (value: number, currency = "₹"): string => {
  return `${currency} ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Format large numbers with commas
export const formatNumber = (value: number): string => {
  return value.toLocaleString("en-IN");
};

// Format date for display
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get percentage with proper formatting
export const getPercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Color palette for charts
export const chartColors = {
  resolved: "#10b981",
  inProgress: "#0891b2",
  pending: "#f59e0b",
  rejected: "#ef4444",
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",
};

// Status colors for badges
export const statusColorMap: Record<string, string> = {
  Resolved: "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

// Issue type colors
export const issueTypeColorMap: Record<string, string> = {
  "Road Infrastructure": "#f59e0b",
  "Waste Management": "#8b5cf6",
  "Environmental Issues": "#10b981",
  "Utilities & Infrastructure": "#3b82f6",
  "Public Safety": "#ef4444",
  Other: "#6b7280",
};

// Get issue type icon name (for lucide-react)
export const getIssueTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    "Road Infrastructure": "MapPin",
    "Waste Management": "Trash2",
    "Environmental Issues": "Leaf",
    "Utilities & Infrastructure": "Zap",
    "Public Safety": "AlertTriangle",
    Other: "HelpCircle",
  };
  return iconMap[type] || "HelpCircle";
};

// Convert resolution trends data for line chart
export const formatResolutionTrends = (trends: any[]) => {
  return trends.map((trend) => ({
    date: `${trend._id.day}/${trend._id.month}`,
    resolved: trend.resolved,
    cost: trend.cost,
    pending: trend.pending,
    inProgress: trend.inProgress,
  }));
};

// Group issues by type for pie chart
export const formatIssueTypeData = (data: Array<{ _id: string; count: number }>) => {
  return data.map((item) => ({
    name: item._id || "Unknown",
    value: item.count,
    fill: issueTypeColorMap[item._id] || "#9ca3af",
  }));
};

// Format cost by type for bar chart
export const formatCostByType = (data: any[]) => {
  return data.map((item) => ({
    name: item._id || "Unknown",
    cost: item.totalCost,
    count: item.count,
    avgCost: item.avgCost,
    fill: issueTypeColorMap[item._id] || "#9ca3af",
  }));
};

// Format manager performance for bar chart
export const formatManagerPerformance = (data: any[]) => {
  return data.map((item) => ({
    name: item.managerName || "Unknown",
    handled: item.handledCount,
    cost: item.totalCostHandled,
  }));
};

// Calculate KPI cards data
export const calculateKPIs = (analytics: AnalyticsData["analytics"]) => {
  const { summary, costs, performance } = analytics;

  return {
    totalReported: {
      label: "Total Issues Reported",
      value: summary.totalIssues,
      change: "+12%",
      icon: "BarChart3",
    },
    resolved: {
      label: "Issues Resolved",
      value: summary.resolvedIssues,
      percentage: summary.resolutionRate,
      icon: "CheckCircle2",
    },
    pending: {
      label: "Pending Issues",
      value: summary.pendingIssues,
      icon: "Clock",
    },
    totalSpent: {
      label: "Total Amount Spent",
      value: formatCurrency(costs.totalSpent),
      icon: "TrendingUp",
    },
    avgCost: {
      label: "Average Cost/Issue",
      value: formatCurrency(costs.avgCostPerIssue),
      icon: "DollarSign",
    },
    resolutionRate: {
      label: "Resolution Rate",
      value: `${summary.resolutionRate}%`,
      icon: "TrendingUp",
    },
    avgResolutionTime: {
      label: "Avg Resolution Time",
      value: `${performance.avgResolutionTimeDays} days`,
      icon: "Calendar",
    },
  };
};

// Get summary statistics for the header
export const getSummaryStats = (analytics: AnalyticsData["analytics"]) => {
  const { summary, costs } = analytics;

  return [
    {
      label: "Total Issues",
      value: summary.totalIssues,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: summary.resolvedIssues,
      percentage: summary.resolutionRate,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "In Progress",
      value: summary.inProgressIssues,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      label: "Pending",
      value: summary.pendingIssues,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Total Spent",
      value: formatCurrency(costs.totalSpent),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];
};
