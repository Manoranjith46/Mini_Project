import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLoader from "./components/loader/loader";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Edit,
  MessageSquare,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface Report {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: Location;
  reportedBy: string;
  reportedAt: string;
  image: string;
  status: string;
  reporterCount?: number;
  createdAt: string;
  citizenDetails?: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

const AdminViewReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/issue/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }

        const data = await response.json();
        setReport(data.issue || data);
        setNewStatus(data.issue?.status || data.status || "");
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!newStatus || !report) {
      toast.error("Please select a status");
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/issue/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "In Progress":
        return <Clock className="w-5 h-5 text-emerald-700" />;
      case "Pending":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case "Rejected":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "In Progress":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return <AdminLoader message="Loading report details..." fullScreen />;
  }

  if (!report) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
        <p className="text-gray-600 mb-6">The report you're looking for doesn't exist.</p>
        <Button
          onClick={() => navigate(-1)}
          className="gap-2 bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </Button>
          <div className="flex items-center gap-3">
            {getStatusIcon(report.status)}
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                report.status
              )}`}
            >
              {report.status}
            </span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Report Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {report.title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-800">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">{report.type}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">
                    {report.reporterCount || 1} Report{(report.reporterCount || 1) > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </motion.div>

            {/* Location and Date Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Location & Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-emerald-700 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900 font-medium">{report.location.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Reported</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(report.reportedAt).toLocaleDateString()} at{" "}
                        {new Date(report.reportedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Report Image */}
            {report.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <img
                  src={report.image}
                  alt="Report"
                  className="w-full h-96 object-cover"
                />
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reporter Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-gray-900 font-medium">
                      {report.citizenDetails?.fullName || report.reportedBy}
                    </p>
                  </div>
                </div>

                {report.citizenDetails?.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${report.citizenDetails.email}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {report.citizenDetails.email}
                      </a>
                    </div>
                  </div>
                )}

                {report.citizenDetails?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${report.citizenDetails.phone}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {report.citizenDetails.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Status Update */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h3>
              <div className="space-y-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white"
                    >
                      {newStatus || "Select new status"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setNewStatus("Pending")}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewStatus("In Progress")}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewStatus("Resolved")}>
                      Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNewStatus("Rejected")}>
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus || !newStatus}
                  className="w-full bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {updatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <Button
                variant="outline"
                className="w-full gap-2 justify-center"
              >
                <MessageSquare className="w-4 h-4" />
                Add Comment
              </Button>
            </motion.div>

            {/* Report Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-xl p-6 text-xs text-gray-600 space-y-2"
            >
              <p>
                <strong>Report ID:</strong> {report._id}
              </p>
              <p>
                <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminViewReport;
