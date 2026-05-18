import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { LoaderProvider } from "./context/LoaderContext";
import { LoaderOverlay } from "./LoaderOverlay";
import { Toaster } from "sonner";
import "./index.css";

// Pages
import Index from "./pages/Index";
import CitizenHome from "./pages/citizen/CitizenHome";
import CitizenProfile from "./pages/citizen/CitizenProfile";
import ReportIssue from "./pages/citizen/ReportIssue";
import AdminHome from "./pages/Admin/AdminHome";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminReports from "./pages/Admin/AdminReports";
import AdminViewReport from "./pages/Admin/AdminViewReport";
import AdminManagers from "./pages/Admin/AdminManagers";
import AdminAddManager from "./pages/Admin/AdminAddManager";
import AdminNoticeBoard from "./pages/Admin/AdminNoticeBoard";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import DepartmentHome from "./pages/Department_manager/DepartmentHome";
import ProtectedRoute from "./pages/components/ProtectedRoute";

const queryClient = new QueryClient();

const pageTransition = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
  transition: { duration: 0.32, ease: "easeInOut" as const },
};

function MotionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      style={{ height: "100%" }}
    >
      {children}
    </motion.div>
  );
}

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MotionWrapper><Index /></MotionWrapper>} />
        <Route path="/signin" element={<MotionWrapper><SignIn /></MotionWrapper>} />
        <Route path="/signup" element={<MotionWrapper><SignUp /></MotionWrapper>} />
        <Route
          path="/department"
          element={
            <ProtectedRoute requiredRole="department">
              <DepartmentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen"
          element={
            <ProtectedRoute requiredRole="citizen">
              <CitizenHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/create-issue"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MotionWrapper>
                <ReportIssue />
              </MotionWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/profile"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MotionWrapper>
                <CitizenProfile />
              </MotionWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <MotionWrapper>
                <AdminLayout />
              </MotionWrapper>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="reports/:id" element={<MotionWrapper><AdminViewReport /></MotionWrapper>} />
          <Route path="managers" element={<AdminManagers />} />
          <Route path="managers/add" element={<AdminAddManager />} />
          <Route path="notice-board" element={<AdminNoticeBoard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        <Route path="*" element={<MotionWrapper><NotFound /></MotionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LoaderProvider>
        <LoaderOverlay />
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LoaderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
