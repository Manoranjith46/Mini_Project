import { useState } from "react";
import Navbar from "./citizen_components/Navbar";
import Hero from "./citizen_components/Hero";
import CommunityIssues from "./citizen_components/CommunityIssues";
import MyReports from "./citizen_components/MyReports";
import ReportIssue from "./ReportIssue";
import styles from "./citizen_components/page.module.css";
import "./citizen_components/index.css";
import { useAuth } from "../../context/AuthContext";

const CitizenHome = () => {
  const [currentView, setCurrentView] = useState("home");
  const { user, logout } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <Hero onNavigate={setCurrentView} />;
      case "report":
        return <ReportIssue onBack={() => setCurrentView("home")} />;
      case "myReports":
        return <MyReports />;
      case "community":
        return <CommunityIssues />;
      default:
        return <Hero onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={styles.publicLayout} data-theme="citizen">
      <Navbar
        user={user}
        onLogout={logout}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      <main className={styles.publicMain}>
        <div className={styles.content}>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default CitizenHome;
