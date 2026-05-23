'use client';

import { useState } from 'react';
import './index.css';
import styles from './page.module.css';

// Auth Component
// import Auth from '../Auth/Auth';

// Public/Citizen Components
import Navbar from './Navbar';
import Hero from './Hero';
// import ReportForm from './ReportForm'; // File not found
import MyReports from './MyReports';
import CommunityIssues from './CommunityIssues';

// Admin Components (temporarily commented - files not found)
// import AdminSidebar from '../Admin/AdminSidebar';
// import AdminDashboard from '../Admin/AdminDashboard';
// import IssueTable from '../Admin/IssueTable';
// import MapView from '../Admin/MapView';
// import AnalyticsView from '../Admin/AnalyticsView';

// Department Manager Components (temporarily commented - files not found)
// import ManagerSidebar from '../Department_Manager/ManagerSidebar';
// import ManagerDashboard from '../Department_Manager/ManagerDashboard';

// Field Officer Components (temporarily commented - files not found)
// import FieldOfficerSidebar from '../Flield_Officer/FieldOfficerSidebar';
// import FieldOfficerDashboard from '../Flield_Officer/FieldOfficerDashboard';

// Chat Component (temporarily commented - path unknown)
// import ChatSystem from '../Components/ChatSystem';

export default function CivicApp() {
  const [user, setUser] = useState<any>(null);
  const [publicView, setPublicView] = useState('home');

  const handleLogout = () => {
    setUser(null);
    setPublicView('home');
  };

  const renderPublicContent = () => {
    switch (publicView) {
      case 'report':
        return <div className="p-4 text-center text-gray-500">Report Form not available</div>;
      case 'myReports':
        return <MyReports />;
      case 'community':
        return <CommunityIssues />;
      default:
        return <Hero onNavigate={setPublicView} />;
    }
  };

  const renderAdminContent = () => {
    return <div className="p-4 text-center text-gray-500">Admin view not available</div>;
  };

  const renderManagerContent = () => {
    return <div className="p-4 text-center text-gray-500">Manager view not available</div>;
  };

  const renderFieldOfficerContent = () => {
    return <div className="p-4 text-center text-gray-500">Field Officer view not available</div>;
  };

  if (!user) {
    return <div className="p-4 text-center text-gray-500">Authentication view not available</div>;
  }

  return (
    <div className={styles.app}>
      <Navbar
        currentView={publicView}
        user={user}
        onLogout={handleLogout}
        onNavigate={setPublicView}
      />
      <main className={styles.main}>
        {user.role === 'admin' && (
          <>
            {/* <AdminSidebar onNavigate={setAdminView} /> */}
            <div className={styles.content}>{renderAdminContent()}</div>
          </>
        )}
        {user.role === 'manager' && (
          <>
            {/* <ManagerSidebar onNavigate={setManagerView} /> */}
            <div className={styles.content}>{renderManagerContent()}</div>
          </>
        )}
        {user.role === 'fieldOfficer' && (
          <>
            {/* <FieldOfficerSidebar onNavigate={setFieldOfficerView} /> */}
            <div className={styles.content}>{renderFieldOfficerContent()}</div>
          </>
        )}
        {user.role === 'citizen' && (
          <div className={styles.content}>{renderPublicContent()}</div>
        )}
      </main>
    </div>
  );
}
