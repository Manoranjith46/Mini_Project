import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CalendarIcon,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useLoader } from "../../context/LoaderContext";
import AdminLoader from "./components/loader/loader";

interface DepartmentManager {
  _id: string;
  fullName: string;
  phonenumber: string;
  email?: string;
  designation: string;
  employeeId: string;
  place: string;
  createdAt: string;
}

const AdminManagers = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState<DepartmentManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<DepartmentManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(15);
  const { hideLoader } = useLoader();

  const fetchManagers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/managers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.departments) {
        const sortedManagers = [...data.departments].sort(
          (firstManager, secondManager) =>
            firstManager.fullName.localeCompare(secondManager.fullName)
        );

        setManagers(sortedManagers);
        setFilteredManagers(sortedManagers);
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    let filtered = [...managers].sort((firstManager, secondManager) =>
      firstManager.fullName.localeCompare(secondManager.fullName)
    );

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((manager) =>
        manager.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manager.phonenumber.includes(searchQuery) ||
        manager.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by zone
    if (selectedZone) {
      filtered = filtered.filter((manager) => manager.place === selectedZone);
    }

    setFilteredManagers(filtered);
  }, [searchQuery, selectedZone, managers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedZone, pageLimit]);

  const totalPages = Math.max(1, Math.ceil(filteredManagers.length / pageLimit));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageLimit;
  const endIndex = Math.min(startIndex + pageLimit, filteredManagers.length);
  const paginatedManagers = filteredManagers.slice(startIndex, endIndex);
  const totalZones = new Set(managers.map((manager) => manager.place).filter(Boolean)).size;

  const handleLimitChange = (value: string) => {
    const nextLimit = Number(value);

    if (!Number.isNaN(nextLimit) && nextLimit > 0) {
      setPageLimit(nextLimit);
    }
  };

  if (loading) {
    return <AdminLoader message="Loading managers..." />;
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Department Managers</h1>
        <p className="text-slate-500 mt-1">
          Manage and monitor all department heads ({managers.length} managers)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-700 to-green-600 rounded-lg p-4 border border-green-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Managers</p>
              <p className="text-2xl font-bold text-white mt-2">{managers.length}</p>
            </div>
            <Users className="w-10 h-10 text-green-100" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Zones</p>
              <p className="text-2xl font-bold text-green-700 mt-2">{totalZones}</p>
            </div>
            <MapPin className="w-10 h-10 text-green-600" />
          </div>
        </motion.div>

        <div className="hidden xl:block" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
        >
          <Button
            type="button"
            onClick={() => navigate("/admin/managers/add")}
            className="h-full min-h-20 w-full justify-center gap-3 bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700"
          >
            <UserPlus className="w-5 h-5" />
            Add Managers
          </Button>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-6 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by name, phone, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Zone Filter Dropdown */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Zones</option>
            {Array.from(
              new Set(managers.map((m) => m.place))
            ).map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(searchQuery || selectedZone) && (
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedZone("");
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Managers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredManagers.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No managers found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-600 border-b border-green-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedManagers.map((manager) => (
                  <motion.tr
                    key={manager._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-700 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {manager.fullName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900">{manager.fullName}</p>
                          <p className="text-xs text-slate-500">{manager.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-700 text-white">
                        {manager.place}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-mono text-sm">
                        {manager.employeeId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600 text-sm">
                        <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" />
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredManagers.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-600">
              Showing {startIndex + 1}-{endIndex} of {filteredManagers.length}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
                  className="h-9 bg-white text-green-700 border border-green-200 hover:bg-green-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="min-w-24 text-center text-sm font-medium text-slate-700">
                  Page {safeCurrentPage} of {totalPages}
                </span>

                <Button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-9 bg-white text-green-700 border border-green-200 hover:bg-green-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagers;
