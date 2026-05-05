'use client';

import { useState } from 'react';
import './index.css';
import styles from './page.module.css';

// Auth Component
import Auth from '../Auth/Auth';

// Public/Citizen Components
import Navbar from './Navbar';
import Hero from './Hero';
import ReportForm from './ReportForm';
import MyReports from './MyReports';
import CommunityIssues from './CommunityIssues';

// Admin Components
import AdminSidebar from '../Admin/AdminSidebar';
import AdminDashboard from '../Admin/AdminDashboard';
import IssueTable from '../Admin/IssueTable';
import MapView from '../Admin/MapView';
import AnalyticsView from '../Admin/AnalyticsView';

// Department Manager Components
import ManagerSidebar from '../Department_Manager/ManagerSidebar';
import ManagerDashboard from '../Department_Manager/ManagerDashboard';

// Field Officer Components
import FieldOfficerSidebar from '../Flield_Officer/FieldOfficerSidebar';
import FieldOfficerDashboard from '../Flield_Officer/FieldOfficerDashboard';

// Chat Component
import ChatSystem from '../Components/ChatSystem';

export default function CivicApp() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [publicView, setPublicView] = useState('home');
  const [adminView, setAdminView] = useState('dashboard');
  const [managerView, setManagerView] = useState('dashboard');
  const [fieldOfficerView, setFieldOfficerView] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.darkMode !== undefined) {
      setDarkMode(userData.darkMode);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPublicView('home');
    setAdminView('dashboard');
    setManagerView('dashboard');
    setFieldOfficerView('dashboard');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderPublicContent = () => {
    switch (publicView) {
      case 'report':
        return <ReportForm />;
      case 'myReports':
        return <MyReports />;
      case 'community':
        return <CommunityIssues />;
      default:
        return <Hero onNavigate={setPublicView} />;
    }
  };

  const renderAdminContent = () => {
    switch (adminView) {
      case 'manageIssues':
        return <IssueTable />;
      case 'mapView':
        return <MapView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'users':
        return <AdminDashboard user={user} viewMode="users" />;
      case 'budget':
        return <AdminDashboard user={user} viewMode="budget" />;
      case 'chat':
        return <ChatSystem user={user} />;
      default:
        return <AdminDashboard user={user} />;
    }
  };

  const renderManagerContent = () => {
    switch (managerView) {
      case 'assignTasks':
        return <ManagerDashboard user={user} viewMode="assign" />;
      case 'fieldOfficers':
        return <ManagerDashboard user={user} viewMode="officers" />;
      case 'workload':
        return <ManagerDashboard user={user} viewMode="workload" />;
      case 'chat':
        return <ChatSystem user={user} />;
      default:
        return <ManagerDashboard user={user} />;
    }
  };

  const renderFieldOfficerContent = () => {
    switch (fieldOfficerView) {
      case 'tasks':
        return <FieldOfficerDashboard user={user} viewMode="tasks" />;
      case 'map':
        return <FieldOfficerDashboard user={user} viewMode="map" />;
      case 'chat':
        return <ChatSystem user={user} />;
      default:
        return <FieldOfficerDashboard user={user} />;
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`${styles.app} ${darkMode ? styles.darkMode : ''}`}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onToggleDarkMode={toggleDarkMode}
        onNavigate={setPublicView}
      />
      <main className={styles.main}>
        {user.role === 'admin' && (
          <>
            <AdminSidebar onNavigate={setAdminView} />
            <div className={styles.content}>{renderAdminContent()}</div>
          </>
        )}
        {user.role === 'manager' && (
          <>
            <ManagerSidebar onNavigate={setManagerView} />
            <div className={styles.content}>{renderManagerContent()}</div>
          </>
        )}
        {user.role === 'fieldOfficer' && (
          <>
            <FieldOfficerSidebar onNavigate={setFieldOfficerView} />
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
