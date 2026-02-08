import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import StudentSelect from "./pages/student/StudentSelect";
import ResidentialSurvey from "./pages/student/ResidentialSurvey";
import NonResidentialSurvey from "./pages/student/NonResidentialSurvey";
import BugReport from "./pages/BugReport";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Student Routes */}
            <Route path="/student/select" element={<StudentSelect />} />
            <Route
              path="/student/residential"
              element={<ResidentialSurvey />}
            />
            <Route
              path="/student/non-residential"
              element={<NonResidentialSurvey />}
            />
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
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
