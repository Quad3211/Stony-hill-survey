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
} from "lucide-react";
import clsx from "clsx";

interface Submission {
  id: string;
  type: "Residential" | "Non-Residential";
  review: string;
  read?: boolean;
  timestamp: Timestamp;
  [key: string]: any;
}

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "All" | "Residential" | "Non-Residential" | "Unread"
  >("All");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Submission[];
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
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleExport = () => {
    if (submissions.length === 0) return;

    const headers = [
      "ID",
      "Type",
      "Date",
      "Review",
      "Dorm Condition",
      "Cleanliness",
      "Food Quality",
      "Classroom Env",
      "Teaching Quality",
      "Facilities",
    ];

    const csvRows = [headers.join(",")];

    submissions.forEach((sub) => {
      const date = sub.timestamp?.toDate().toLocaleDateString() || "";
      const row = [
        sub.id,
        sub.type,
        `"${date}"`,
        `"${sub.review.replace(/"/g, '""')}"`, // Escape quotes
        `"${sub.dormCondition || ""}"`,
        sub.cleanliness || "",
        sub.foodQuality || "",
        `"${sub.classroomEnvironment || ""}"`,
        sub.teachingQuality || "",
        sub.facilities || "",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Submissions
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalSubmissions}
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Residential</p>
              <p className="text-3xl font-bold text-gray-900">
                {residentialCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Home className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Non-Residential
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {nonResidentialCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">New / Unread</p>
              <p className="text-3xl font-bold text-gray-900">{unreadCount}</p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-0 mb-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-2 text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          {(["All", "Unread", "Residential", "Non-Residential"] as const).map(
            (f) => (
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
            ),
          )}
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
                            : "bg-blue-100 text-blue-800",
                        )}
                      >
                        {submission.type}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        {submission.timestamp?.toDate().toLocaleString()}
                      </span>
                    </div>
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
                  </div>

                  <div className="p-6">
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
