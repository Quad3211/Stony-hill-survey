import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";
import {
  LogOut,
  Download,
  FileText,
  Home,
  User,
  CheckCircle,
  Bell,
  Filter,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import clsx from "clsx";

interface Submission {
  id: string;
  type: "Residential" | "Non-Residential" | "Bug Report";
  review?: string; // Optional because Bug Report uses description
  description?: string; // For Bug Report
  title?: string; // For Bug Report
  priority?: "Low" | "Medium" | "High"; // For Bug Report
  read?: boolean;
  timestamp: Timestamp;
  deleted?: boolean;
  [key: string]: any;
}

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "All" | "Residential" | "Non-Residential" | "Bug Report" | "Unread"
  >("All");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((doc: any) => !doc.deleted) as Submission[];
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, { read: true });
    } catch (error: any) {
      console.error("Error marking as read:", error);
      alert(`Error marking as read: ${error.message}`);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to move this to trash?")) return;
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, { deleted: true });
    } catch (error: any) {
      console.error("Error moving to trash:", error);
      alert(`Error moving to trash: ${error.message}`);
    }
  };

  const handleExport = () => {
    if (submissions.length === 0) return;

    const headers = [
      "ID",
      "Type",
      "Date",
      "Title/Review",
      "Description/Details",
      "Priority/Conditions",
      "Status",
    ];

    const csvRows = [headers.join(",")];

    submissions.forEach((sub) => {
      const date = sub.timestamp?.toDate().toLocaleDateString() || "";
      let titleReview = sub.title || sub.review || "";
      let descDetails = sub.description || "";
      let priorityCond = sub.priority || "";

      // Format details based on type for CSV
      if (sub.type === "Residential") {
        priorityCond = `Dorm: ${sub.dormCondition}, Clean: ${sub.cleanliness}, Food: ${sub.foodQuality}`;
      } else if (sub.type === "Non-Residential") {
        priorityCond = `Classroom: ${sub.classroomEnvironment}, Teaching: ${sub.teachingQuality}, Facilities: ${sub.facilities}`;
      }

      const row = [
        sub.id,
        sub.type,
        `"${date}"`,
        `"${titleReview.replace(/"/g, '""')}"`,
        `"${descDetails.replace(/"/g, '""')}"`,
        `"${priorityCond.replace(/"/g, '""')}"`,
        sub.read ? "Read" : "Unread",
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-submissions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Analytics
  const totalSubmissions = submissions.length;
  const residentialCount = submissions.filter(
    (s) => s.type === "Residential",
  ).length;
  const nonResidentialCount = submissions.filter(
    (s) => s.type === "Non-Residential",
  ).length;
  const bugReportCount = submissions.filter(
    (s) => s.type === "Bug Report",
  ).length;
  const unreadCount = submissions.filter((s) => !s.read).length;

  // Filtered Data
  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !s.read;
    return s.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/trash")}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Trash
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 px-4 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSubmissions}
              </p>
            </div>
            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Res</p>
              <p className="text-2xl font-bold text-gray-900">
                {residentialCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Home className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Non-Res
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {nonResidentialCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Bugs
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bugReportCount}
              </p>
            </div>
            <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">New</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          {(
            [
              "All",
              "Unread",
              "Residential",
              "Non-Residential",
              "Bug Report",
            ] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                No submissions found matching this filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={clsx(
                    "bg-white rounded-xl shadow-sm border transition-all duration-200",
                    submission.read
                      ? "border-gray-200"
                      : "border-indigo-200 ring-1 ring-indigo-50 shadow-md",
                    submission.type === "Bug Report" &&
                      !submission.read &&
                      "border-red-200 ring-red-50",
                  )}
                >
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      {!submission.read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          New
                        </span>
                      )}
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          submission.type === "Residential"
                            ? "bg-green-100 text-green-800"
                            : submission.type === "Non-Residential"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800",
                        )}
                      >
                        {submission.type}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        {submission.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!submission.read && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleMarkAsRead(submission.id)}
                          className="self-start sm:self-auto text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSoftDelete(submission.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Bug Report Specific View */}
                    {submission.type === "Bug Report" ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {submission.title}
                            </h3>
                            <span
                              className={clsx(
                                "inline-flex items-center mt-1 px-2.5 py-0.5 rounded text-xs font-medium",
                                submission.priority === "High"
                                  ? "bg-red-100 text-red-800"
                                  : submission.priority === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800",
                              )}
                            >
                              Priority: {submission.priority}
                            </span>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <p className="text-gray-800">
                            {submission.description}
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Survey View (Residential / Non-Residential)
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          {submission.type === "Residential" && (
                            <>
                              <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                  Dorm Condition
                                </span>
                                <p className="text-gray-900 font-medium">
                                  {submission.dormCondition}
                                </p>
                              </div>
                              <div className="flex gap-8">
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Cleanliness
                                  </span>
                                  <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {submission.cleanliness}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-1">
                                      / 5
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Food
                                  </span>
                                  <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {submission.foodQuality}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-1">
                                      / 5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {submission.type === "Non-Residential" && (
                            <>
                              <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                  Classroom Env
                                </span>
                                <p className="text-gray-900 font-medium">
                                  {submission.classroomEnvironment}
                                </p>
                              </div>
                              <div className="flex gap-8">
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Teaching
                                  </span>
                                  <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {submission.teachingQuality}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-1">
                                      / 5
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Facilities
                                  </span>
                                  <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      {submission.facilities}
                                    </span>
                                    <span className="text-gray-400 text-sm ml-1">
                                      / 5
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                            Detailed Review
                          </span>
                          <p className="text-gray-700 leading-relaxed">
                            {submission.review}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
