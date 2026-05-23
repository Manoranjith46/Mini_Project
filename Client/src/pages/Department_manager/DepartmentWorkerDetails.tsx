import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Briefcase, CheckCircle, MapPin, Phone, User } from "lucide-react";
import { Button } from "../components/ui/button";

interface WorkerDetail {
  _id: string;
  fullName: string;
  phonenumber: string;
  email?: string;
  employeeId: string;
  zone: string;
  specialization: string[];
  isActive: boolean;
  assignedIssues: Array<{
    _id: string;
    title: string;
    issueType: string;
    status: string;
    createdAt: string;
    costAmount?: number;
    location?: {
      address?: string;
    };
  }>;
}

const DepartmentWorkerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setWorker(result.data);
        }
      } catch (error) {
        console.error("Error fetching worker details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading worker profile...</p>;
  }

  if (!worker) {
    return <p className="p-6 text-center text-gray-500">Worker not found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/department/workers")}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{worker.fullName}</h1>
            <p className="text-gray-600 mt-1">{worker.employeeId}</p>
          </div>
          <span className={`self-start px-3 py-1 rounded-full text-sm font-medium ${
            worker.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {worker.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <Phone className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{worker.phonenumber}</p>
              <p className="text-sm text-gray-500">{worker.email || "No email added"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{worker.zone}</p>
              <p className="text-sm text-gray-500">Assigned zone</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <Briefcase className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{worker.specialization.join(", ")}</p>
              <p className="text-sm text-gray-500">Specializations</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
            <User className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{worker.assignedIssues.length}</p>
              <p className="text-sm text-gray-500">Assigned reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Reports</h2>
        </div>
        {worker.assignedIssues.length === 0 ? (
          <p className="p-6 text-gray-500">No reports assigned yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {worker.assignedIssues.map((issue) => (
              <div key={issue._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{issue.title}</p>
                  <p className="text-sm text-gray-500">
                    {issue.issueType} - {issue.location?.address || "No location"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {issue.status}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/department/reports/${issue._id}`)}>
                    <CheckCircle className="w-4 h-4" />
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentWorkerDetails;
