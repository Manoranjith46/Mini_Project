import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Player from "lottie-react";
import starloader from "../../assets/animations/starloder.json";
import { useLoader } from "../../context/LoaderContext";
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  RefreshCw,
  MapPin,
  Phone,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useAuth } from "../../context/AuthContext";

interface DepartmentIssue {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  status: string;
  reportedBy: string;
  reportedAt: string;
  image: string;
}

interface ManagerStats {
  totalAssigned: number;
  inProgress: number;
  resolved: number;
  pending: number;
  issues?: DepartmentIssue[];
}

const DepartmentHome = () => {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [issues, setIssues] = useState<DepartmentIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<DepartmentIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const { hideLoader } = useLoader();
  const { user } = useAuth();

  const fetchDepartmentStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.issues) {
        setIssues(data.issues);
        setFilteredIssues(data.issues);

        // Calculate stats
        const stats: ManagerStats = {
          totalAssigned: data.issues.length,
          inProgress: data.issues.filter(
            (i: DepartmentIssue) => i.status === "In Progress"
          ).length,
          resolved: data.issues.filter(
            (i: DepartmentIssue) => i.status === "Resolved"
          ).length,
          pending: data.issues.filter(
            (i: DepartmentIssue) => i.status === "Pending"
          ).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error("Error fetching department issues:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDepartmentStats();
  }, [hideLoader]);

  useEffect(() => {
    let filtered = issues;

    if (searchQuery) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.location.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilters.length > 0) {
      filtered = filtered.filter((issue) => statusFilters.includes(issue.status));
    }

    setFilteredIssues(filtered);
  }, [searchQuery, statusFilters, issues]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
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
        return "bg-blue-100 text-blue-800";
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
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <Player
          autoplay
          loop
          animationData={starloader}
          style={{ height: "200px", width: "200px" }}
        />
        <p className="text-muted-foreground mt-4">Loading dashboard...</p>
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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8"
    >
      <div className="container mx-auto px-4 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Department Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome, {user?.fullName} • {user?.department}
            </p>
          </div>
          <Button
            onClick={fetchDepartmentStats}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Assigned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Assigned Issues
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalAssigned}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* In Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.inProgress}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Resolved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.resolved}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Issues
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("Pending")}
                    onCheckedChange={(checked) =>
                      setStatusFilters((prev) =>
                        checked
                          ? [...prev, "Pending"]
                          : prev.filter((s) => s !== "Pending")
                      )
                    }
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("In Progress")}
                    onCheckedChange={(checked) =>
                      setStatusFilters((prev) =>
                        checked
                          ? [...prev, "In Progress"]
                          : prev.filter((s) => s !== "In Progress")
                      )
                    }
                  >
                    In Progress
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("Resolved")}
                    onCheckedChange={(checked) =>
                      setStatusFilters((prev) =>
                        checked
                          ? [...prev, "Resolved"]
                          : prev.filter((s) => s !== "Resolved")
                      )
                    }
                  >
                    Resolved
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilters.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilters([]);
                }}
                className="self-end"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>

        {/* Issues Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {filteredIssues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Issue Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Reported Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIssues.map((issue) => (
                    <motion.tr
                      key={issue._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {issue.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                            {issue.description.substring(0, 40)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {issue.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 truncate max-w-[150px]">
                            {issue.location.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(issue.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              issue.status
                            )}`}
                          >
                            {issue.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(issue.reportedAt).toLocaleDateString()}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No issues assigned to your department
              </p>
            </div>
          )}

          {/* Pagination Info */}
          {filteredIssues.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <p className="text-sm text-gray-600">
                Showing <strong>{filteredIssues.length}</strong> of{" "}
                <strong>{issues.length}</strong> issues
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DepartmentHome;
