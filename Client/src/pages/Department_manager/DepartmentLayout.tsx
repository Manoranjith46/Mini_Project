import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DepartmentSidebar from "./dept_components/sidebar/DepartmentSidebar";

const DepartmentLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden">
      <DepartmentSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative pl-[80px]">
        <div className="flex-1 overflow-auto bg-[var(--bg-page)] py-4 lg:py-6">
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

export default DepartmentLayout;
