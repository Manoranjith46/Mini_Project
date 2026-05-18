import { useLocation, Link, useNavigate } from "react-router-dom";
import styles from "./sidebar.module.css";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Megaphone, 
  BarChart,
  LogOut,
  User
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("auth_token");
    navigate("/signin");
  };

  const currentView = location.pathname;

  return (
    <aside id="sidebar" className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          AP
        </div>
        <span className={styles.sidebarTitle}>
          Admin Portal
        </span>
      </div>

      <nav className={styles.sidebarNav}>
        <Link
          className={`${styles.navLink} ${currentView === '/admin' ? styles.navLinkActive : ''}`}
          to="/admin"
        >
          <LayoutDashboard className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Dashboard
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/admin/reports' ? styles.navLinkActive : ''}`}
          to="/admin/reports"
        >
          <FileText className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Reports
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/admin/managers' ? styles.navLinkActive : ''}`}
          to="/admin/managers"
        >
          <Users className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Managers
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/admin/notice-board' ? styles.navLinkActive : ''}`}
          to="/admin/notice-board"
        >
          <Megaphone className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Notice Board
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/admin/analytics' ? styles.navLinkActive : ''}`}
          to="/admin/analytics"
        >
          <BarChart className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Analytics
          </span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <Link
          className={`${styles.navLink} ${currentView === '/admin/profile' ? styles.navLinkActive : ''}`} 
          to="/admin/profile"
        >
          <User className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Profile
          </span>
        </Link>
        <a 
          className={`${styles.navLink} ${styles.logoutLink}`} 
          href="#" 
          onClick={handleLogout}
          style={{ marginTop: '0.5rem' }}
        >
          <LogOut className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Logout
          </span>
        </a>
      </div>
    </aside>
  );
}
