import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import { Eye, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Worker {
  _id: string;
  fullName: string;
  phonenumber: string;
  email?: string;
  employeeId: string;
  zone: string;
  specialization: string[];
  isActive: boolean;
}

const DepartmentWorkers = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phonenumber: "",
    email: "",
    employeeId: "",
    specialization: "General",
  });

  const fetchZoneWorkers = async () => {
    if (!user?.place) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/workers/zone/${user.place}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setWorkers(data.data);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZoneWorkers();
  }, [hideLoader, user?.place]);

  const handleAddWorker = async () => {
    if (!user?.id || !user?.place) return;

    try {
      setSaving(true);
      showLoader();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/workers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phonenumber: form.phonenumber.trim(),
          email: form.email.trim() || undefined,
          employeeId: form.employeeId.trim().toUpperCase(),
          departmentId: user.id,
          zone: user.place,
          specialization: form.specialization
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Failed to add worker");
        return;
      }

      toast.success("Worker added successfully");
      setIsAddOpen(false);
      setForm({
        fullName: "",
        phonenumber: "",
        email: "",
        employeeId: "",
        specialization: "General",
      });
      fetchZoneWorkers();
    } catch (error) {
      console.error("Error adding worker:", error);
      toast.error("Error adding worker");
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Zone Workers
          </h1>
          <p className="text-gray-600 mt-2">
            Workers assigned to {user?.place || user?.department}
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="self-start md:self-auto bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Worker
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="flex justify-between border-b pb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-4 border-b last:border-0">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16 rounded animate-none" />
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No workers found in this zone.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Specializations</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {worker.phonenumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {worker.specialization.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        worker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {worker.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/department/workers/${worker._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Worker</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>
                <XCircle className="w-6 h-6 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Worker name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input
                  value={form.phonenumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, phonenumber: e.target.value }))}
                  placeholder="10 digit phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="worker@civic.gov"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <Input
                  value={form.employeeId}
                  onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="WRK008"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <Input
                  value={form.specialization}
                  onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Road Infrastructure, General"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple specializations with commas.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddWorker}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {saving ? "Adding..." : "Add Worker"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DepartmentWorkers;
