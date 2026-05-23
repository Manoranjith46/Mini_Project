import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLoader } from "../../context/LoaderContext";

const DepartmentFunds = () => {
  const { user } = useAuth();
  const { hideLoader } = useLoader();
  const [issuesWithCost, setIssuesWithCost] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  const fetchFundsData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/department/issues`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        // Filter issues with cost Amount > 0
        const fundedIssues = data.issues.filter((issue: any) => issue.costAmount && issue.costAmount > 0);
        setIssuesWithCost(fundedIssues);
        
        // Calculate total
        const total = fundedIssues.reduce((sum: number, issue: any) => sum + (issue.costAmount || 0), 0);
        setTotalSpent(total);
      }
    } catch (error) {
      console.error("Error fetching funds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundsData();
  }, [hideLoader]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
          Funds History
        </h1>
        <p className="text-gray-600 mt-2">
          Track money spent on issues in {user?.place || user?.department}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center border border-orange-100">
        <h2 className="text-xl font-semibold text-gray-700">Total Expenditure</h2>
        <p className="text-5xl font-bold text-orange-600 mt-4">${totalSpent.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-gray-500">Loading funds history...</p>
        ) : issuesWithCost.length === 0 ? (
          <p className="p-6 text-center text-gray-500">No funds have been spent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Issue Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cost ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issuesWithCost.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {issue.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {issue.location.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-orange-600">
                      ${issue.costAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DepartmentFunds;
