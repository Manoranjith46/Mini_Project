import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Edit,
  Search,
  Trash2,
  User,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";
import Player from "lottie-react";
import starloader from "../../assets/animations/starloder.json";
import { useLoader } from "../../context/LoaderContext";



interface Reporter {
  _id: string;
  fullName: string;
  phonenumber?: string;
}

interface Issues {
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
  reporters?: Reporter[];
}

const AdminHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issues[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { hideLoader } = useLoader();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/all-issues`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        const data = await response.json();
        if (Array.isArray(data.issues)) {
          setIssues(data.issues);
        } else {
          setIssues([]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchIssues();
  }, [hideLoader]);

  const handleStatusUpdate = async (issueId: string, status: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/issue/${issueId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIssues((prev) =>
          prev.map((i) => (i._id === issueId ? { ...i, status } : i))
        );
        setOpenDropdown(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating issue status:", error);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/issue/admin/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIssues((prev) => prev.filter((i) => i._id !== issueId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const sortedIssues = [...issues];

  const filteredIssues = sortedIssues.filter((issue) => {
    const searchMatch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch =
      statusFilters.length === 0 || statusFilters.includes(issue.status);
    return searchMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "badge-active";
      case "In Progress":
        return "badge-info";
      case "Rejected":
        return "badge-error";
      case "Pending":
        return "badge-pending";
      default:
        return "bg-[var(--bg-subtle)] text-[var(--text-muted)]";
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
      className="h-full"
    >
      <div className="h-full">
        <div className="container mx-auto py-4 space-y-8 pb-12">
          {/* Welcome Section with Profile Link */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] ">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and resolve community issues
              </p>
            </div>
            <Link to="/admin/profile">
              <Button
                variant="outline"
                className="flex items-center space-x-2 shadow-sm text-slate-500 "
              >
                <User className="h-4 w-4 text-purple-700" />
                <span>My Profile</span>
              </Button>
            </Link>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
            <div className="p-6 rounded-lg border shadow-lg bg-card  hover:scale-[1.02] transition-transform hover:shadow-xl transition-shadow duration-300  ">
              <div className="text-2xl font-bold text-foreground  ">
                {issues.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Issues</p>
            </div>
            <div className="p-6 rounded-lg border shadow-lg bg-card hover:scale-[1.02] transition-transform hover:shadow-xl transition-shadow duration-300 ">
              <div className="text-2xl font-bold text-[var(--success-text)]">
                {issues.filter((issue) => issue.status === "Resolved").length}
              </div>
              <p className="text-sm text-muted-foreground">Resolved Issues</p>
            </div>
            <div className="p-6 rounded-lg border shadow-lg bg-card hover:scale-[1.02] transition-transform hover:shadow-xl transition-shadow duration-300 ">
              <div className="text-2xl font-bold text-[var(--info-text)]">
                {
                  issues.filter((issue) => issue.status === "In Progress")
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">
                Issues In Progress
              </p>
            </div>
            <div className="p-6 rounded-lg border shadow-lg bg-card hover:scale-[1.02] transition-transform hover:shadow-xl transition-shadow duration-300 ">
              <div className="text-2xl font-bold text-[var(--warning-text)]">
                {issues.filter((issue) => issue.status === "Pending").length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 ">
            <div className="relative w-full md:w-80 shadow-sm rounded">
              <Search className="absolute  left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 shadow-sm text-slate-600"
                  >
                    Status <ChevronsUpDown className="h-4 w-4 text-gray-500 " />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Issues Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                {/* Image Section */}
                {issue.image && (
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={issue.image.startsWith("http") ? issue.image : `${import.meta.env.VITE_BACKEND_URL}${issue.image}`}
                      alt={issue.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {issue.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {issue.description}
                  </p>

                  {/* Issue Type */}
                  <div className="text-xs text-gray-500 mb-2">
                    <span className="font-semibold">Type:</span> {issue.type}
                  </div>

                  {/* Location */}
                  <div className="text-xs text-gray-500 mb-3">
                    <span className="font-semibold">Location:</span> {issue.location.address}
                  </div>

                  {/* Reported By - Show all reporters or count */}
                  <div className="text-xs text-gray-500 mb-4">
                    <span className="font-semibold">Reported by:</span>
                    {issue.reporterCount && issue.reporterCount > 1 ? (
                      <span className="ml-1">
                        👥 {issue.reporterCount} people reported this
                        {issue.reporters && issue.reporters.length > 0 && (
                          <div className="mt-1 ml-4 text-xs space-y-1">
                            {issue.reporters.map((reporter, idx) => (
                              <div key={reporter._id || idx} className="text-gray-600">
                                • {reporter.fullName}
                              </div>
                            ))}
                          </div>
                        )}
                      </span>
                    ) : (
                      <span className="ml-1">{issue.reportedBy}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <DropdownMenu 
                      open={openDropdown === issue._id}
                      onOpenChange={(isOpen) => 
                        setOpenDropdown(isOpen ? issue._id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[var(--info-text)]"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Update Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <button
                          onClick={() =>
                            handleStatusUpdate(issue._id, "Resolved")
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Resolved
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(issue._id, "In Progress")
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(issue._id, "Rejected")
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Rejected
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(issue._id, "Pending")
                          }
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          Pending
                        </button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[var(--error-text)]"
                      onClick={() => handleDeleteIssue(issue._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No issues found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminHome;
