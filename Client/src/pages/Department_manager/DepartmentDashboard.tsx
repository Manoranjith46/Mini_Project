import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";
import { BarChart3, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const { hideLoader } = useLoader();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0,
  });

  const fetchDepartmentStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setStats({
          totalAssigned: data.issues.length,
          inProgress: data.issues.filter((i: any) => i.status === "In Progress").length,
          resolved: data.issues.filter((i: any) => i.status === "Resolved").length,
          pending: data.issues.filter((i: any) => i.status === "Pending").length,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartmentStats();
  }, [hideLoader]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Zone Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of issues in {user?.place || user?.department}
          </p>
        </div>
        <Button
          onClick={fetchDepartmentStats}
          disabled={refreshing}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAssigned}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DepartmentDashboard;
