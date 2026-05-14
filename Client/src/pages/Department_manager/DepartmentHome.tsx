import { useState } from "react";
import ManagerSidebar from "./dept_components/ManagerSidebar";
import ManagerDashboard from "./dept_components/ManagerDashboard";
import { useAuth } from "../../context/AuthContext";

const DepartmentHome = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, logout } = useAuth();

  const viewModeMap: Record<string, string> = {
    dashboard: "dashboard",
    assignTasks: "assign",
    fieldOfficers: "officers",
    workload: "workload",
    reports: "dashboard",
    chat: "dashboard",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ManagerSidebar
        currentView={currentView}
        onNavigate={(view: string) => setCurrentView(view)}
        user={{
          name: user?.fullName || "Manager",
          department: user?.department || "water-supply",
          designation: user?.designation || "Department Manager",
        }}
        onLogout={logout}
      />
      <main style={{ flex: 1, marginLeft: "280px", background: "#fefce8", minHeight: "100vh" }}>
        <ManagerDashboard
          user={user}
          viewMode={viewModeMap[currentView] || "dashboard"}
        />
      </main>
    </div>
  );
};

export default DepartmentHome;
