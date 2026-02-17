import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";
import "./App.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const StudentVoiceSurvey = lazy(
  () => import("./pages/student/StudentVoiceSurvey"),
);
const DormLifeSurvey = lazy(() => import("./pages/student/DormLifeSurvey"));
const BugReport = lazy(() => import("./pages/BugReport"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminSettings = lazy(() =>
  import("./pages/admin/Settings").then((module) => ({
    default: module.AdminSettings,
  })),
);
const AdminTrash = lazy(() => import("./pages/admin/Trash"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Toaster position="top-right" />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Student Routes */}
              <Route path="/student/voice" element={<StudentVoiceSurvey />} />
              <Route path="/student/dorm-life" element={<DormLifeSurvey />} />
              <Route path="/report-bug" element={<BugReport />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AuthGuard>
                    <AdminSettings />
                  </AuthGuard>
                }
              />
              <Route
                path="/admin/trash"
                element={
                  <AuthGuard>
                    <AdminTrash />
                  </AuthGuard>
                }
              />
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
