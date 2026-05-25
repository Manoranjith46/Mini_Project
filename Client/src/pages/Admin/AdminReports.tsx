import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLoader } from "../../context/LoaderContext";
import AdminLoader from "./components/loader/loader";
import { Skeleton } from "../components/ui/skeleton";
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface CitizenReport {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  reportedBy: string;
  reportedAt: string;
  image: string;
  status: string;
  reporterCount?: number;
  createdAt: string;
}

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(15);
  const { hideLoader } = useLoader();

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/all-issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data.issues)) {
        setReports(data.issues);
        setFilteredReports(data.issues);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchReports();
  }, [hideLoader]);

  useEffect(() => {
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilters.length > 0) {
      filtered = filtered.filter((report) => statusFilters.includes(report.status));
    }

    // Type filter
    if (typeFilters.length > 0) {
      filtered = filtered.filter((report) => typeFilters.includes(report.type));
    }

    setFilteredReports(filtered);
  }, [searchQuery, statusFilters, typeFilters, reports]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilters, typeFilters, pageLimit]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageLimit));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageLimit;
  const endIndex = Math.min(startIndex + pageLimit, filteredReports.length);
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const handleLimitChange = (value: string) => {
    const nextLimit = Number(value);

    if (!Number.isNaN(nextLimit) && nextLimit > 0) {
      setPageLimit(nextLimit);
    }
  };

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

  const getIssueTypes = () => {
    const types = [...new Set(reports.map((r) => r.type))];
    return types.filter(Boolean);
  };

  const handleExport = () => {
    const csv = [
      ["Title", "Type", "Status", "Location", "Reported At", "Reporter Count"],
      ...filteredReports.map((r) => [
        r.title,
        r.type,
        r.status,
        r.location.address,
        new Date(r.reportedAt).toLocaleDateString(),
        r.reporterCount || 1,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civic_reports_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-6 bg-gradient-to-br from-emerald-50 to-green-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 animate-pulse" />
            <Skeleton className="h-4 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse" />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 space-y-2">
              <Skeleton className="h-4 w-28 animate-pulse" />
              <Skeleton className="h-8 w-16 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28 animate-pulse" />
            <Skeleton className="h-10 w-full animate-pulse" />
          </div>
          <Skeleton className="h-10 w-24 animate-pulse" />
          <Skeleton className="h-10 w-24 animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 space-y-4">
          <div className="flex justify-between border-b pb-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex justify-between items-center py-4 border-b">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 animate-pulse" />
                  <Skeleton className="h-3 w-56 animate-pulse" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-32 animate-pulse" />
                <Skeleton className="h-6 w-16 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-24 animate-pulse" />
                <Skeleton className="h-8 w-8 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              Citizen Reports
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all reported civic issues
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {reports.filter((r) => r.status === "Pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold text-emerald-700 mt-2">
              {reports.filter((r) => r.status === "In Progress").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {reports.filter((r) => r.status === "Resolved").length}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, location, or description..."
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
                    Status
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
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.includes("Rejected")}
                    onCheckedChange={(checked) =>
                      setStatusFilters((prev) =>
                        checked
                          ? [...prev, "Rejected"]
                          : prev.filter((s) => s !== "Rejected")
                      )
                    }
                  >
                    Rejected
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Type
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                  {getIssueTypes().map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={(checked) =>
                        setTypeFilters((prev) =>
                          checked
                            ? [...prev, type]
                            : prev.filter((t) => t !== type)
                        )
                      }
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Clear Filters */}
            {(searchQuery || statusFilters.length > 0 || typeFilters.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilters([]);
                  setTypeFilters([]);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {filteredReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Title
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
                      Reports
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReports.map((report) => (
                    <motion.tr
                      key={report._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {report.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {report.description.substring(0, 50)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-[150px]">
                          {report.location.address}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                          {report.reporterCount || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(report.reportedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          title="View Details"
                          onClick={() => navigate(`/admin/reports/${report._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No reports found matching your filters</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Pagination Info */}
          {filteredReports.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                Showing <strong>{startIndex + 1}-{endIndex}</strong> of{" "}
                <strong>{filteredReports.length}</strong> reports
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Limit
                  <Input
                    type="number"
                    min={1}
                    value={pageLimit}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="h-9 w-24 bg-white"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                    className="h-9 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="min-w-24 text-center text-sm font-medium text-gray-700">
                    Page {safeCurrentPage} of {totalPages}
                  </span>

                  <Button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="h-9 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminReports;
