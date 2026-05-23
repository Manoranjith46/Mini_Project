import { useLocation, Link, useNavigate } from "react-router-dom";
import styles from "./sidebar.module.css";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";

export default function DepartmentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/signin");
  };

  const currentView = location.pathname;

  return (
    <aside id="sidebar" className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          DM
        </div>
        <span className={styles.sidebarTitle}>
          Dept Manager
        </span>
      </div>

      <nav className={styles.sidebarNav}>
        <Link
          className={`${styles.navLink} ${currentView === '/department' ? styles.navLinkActive : ''}`}
          to="/department"
        >
          <LayoutDashboard className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Dashboard
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/department/reports' ? styles.navLinkActive : ''}`}
          to="/department/reports"
        >
          <FileText className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Zone Reports
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/department/workers' ? styles.navLinkActive : ''}`}
          to="/department/workers"
        >
          <Users className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Workers
          </span>
        </Link>
        <Link
          className={`${styles.navLink} ${currentView === '/department/funds' ? styles.navLinkActive : ''}`}
          to="/department/funds"
        >
          <DollarSign className={styles.sidebarIcon} size={24} />
          <span className={styles.navLinkText}>
            Funds History
          </span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <Link
          className={`${styles.navLink} ${currentView === '/department/profile' ? styles.navLinkActive : ''}`} 
          to="/department/profile"
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
