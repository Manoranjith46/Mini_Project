import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";

const AdminLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/admin" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Managers", href: "/admin/managers" },
    { name: "Notice Board", href: "/admin/notice-board" },
    { name: "Analytics", href: "/admin/analytics" },
    { name: "Profile", href: "/admin/profile" },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden">


      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative pl-[70px]">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-slate-800">
              {navigation.find(n => n.href === location.pathname)?.name || "Dashboard"}
            </h2>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-[var(--bg-page)] p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
