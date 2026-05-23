import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Phone, User } from "lucide-react";
import { Button } from "../components/ui/button";

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
    costAdded: number;
    changedAt: string;
  }>;
}

const DepartmentReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading report details...</p>;
  }

  if (!detail) {
    return <p className="p-6 text-center text-gray-500">Report not found.</p>;
  }

  const { issue, statusHistory } = detail;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/department/reports")}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
            <p className="text-gray-600 mt-2">{issue.description}</p>
          </div>
          <span className="self-start px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
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
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status History</h2>
        {statusHistory.length === 0 ? (
          <p className="text-gray-500">No status updates yet.</p>
        ) : (
          <div className="space-y-3">
            {statusHistory.map((item) => (
              <div key={item._id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                {item.status === "Resolved" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.status}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.changedAt).toLocaleString()}
                    {item.costAdded > 0 ? ` - Cost added: $${item.costAdded}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentReportDetails;
