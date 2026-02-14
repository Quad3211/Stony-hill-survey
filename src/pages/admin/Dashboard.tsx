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
import { useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";
import {
  Download,
  FileText,
  Home,
  CheckCircle,
  Bell,
  Filter,
  Trash2,
  MessageSquare,
  Activity,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

interface Submission {
  id: string;
  type:
    | "Residential"
    | "Non-Residential"
    | "Bug Report"
    | "Student Voice"
    | "Dorm Life";
  review?: string;
  description?: string;
  title?: string;
  priority?: "Low" | "Medium" | "High";
  read?: boolean;
  timestamp: Timestamp;
  deleted?: boolean;
  meta?: {
    sentiment: "Positive" | "Neutral" | "Negative";
    urgency: "Critical" | "High" | "Normal";
    flagged: boolean;
  };
  dormBlock?: string;
  roomNumber?: string;
  satisfactionRating?: string;
  complaints?: string;
  suggestions?: string;
  [key: string]: any;
}

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    | "All"
    | "Residential"
    | "Non-Residential"
    | "Bug Report"
    | "Student Voice"
    | "Unread"
    | "Dorm Life"
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

  const handleMarkAsRead = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, { read: true });
      toast.success("Marked as read");
    } catch (error: any) {
      console.error("Error marking as read:", error);
      toast.error(`Error marking as read: ${error.message}`);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to move this to trash?")) return;
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, { deleted: true });
      toast.success("Moved to trash");
    } catch (error: any) {
      console.error("Error moving to trash:", error);
      toast.error(`Error moving to trash: ${error.message}`);
    }
  };

  // Analytics
  const totalSubmissions = submissions.length;
  const studentVoiceCount = submissions.filter(
    (s) => s.type === "Student Voice",
  ).length;
  const dormLifeCount = submissions.filter(
    (s) => s.type === "Dorm Life",
  ).length;
  const bugReportCount = submissions.filter(
    (s) => s.type === "Bug Report",
  ).length;
  const unreadCount = submissions.filter((s) => !s.read).length;
  const urgentCount = submissions.filter(
    (s) =>
      s.meta?.urgency === "Critical" ||
      s.meta?.urgency === "High" ||
      s.priority === "High",
  ).length;

  // Filtered Data
  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !s.read;
    return s.type === filter;
  });

  const handleExport = () => {
    if (submissions.length === 0) return;

    const headers = [
      "ID",
      "Type",
      "Date",
      "Title/Review/Feedback",
      "Description/Meta",
      "Status",
      "Sentiment",
      "Urgency",
    ];

    const csvRows = [headers.join(",")];

    submissions.forEach((sub) => {
      const date = sub.timestamp?.toDate().toLocaleDateString() || "";
      let titleReview =
        sub.title || sub.review || sub.openFeedback || sub.complaints || "";
      let descDetails = sub.description || "";

      if (sub.type === "Student Voice") {
        titleReview = sub.openFeedback || "No open feedback";
        descDetails = `Ratings: Gen=${sub.generalExperienceRating}, Safety=${sub.safetyRating}`;
      } else if (sub.type === "Dorm Life") {
        titleReview = sub.complaints || "No complaints";
        descDetails = `Block: ${sub.dormBlock}, Room: ${sub.roomNumber}, Rating: ${sub.satisfactionRating}, Suggestion: ${sub.suggestions}`;
      }

      const row = [
        sub.id,
        sub.type,
        `"${date}"`,
        `"${titleReview.replace(/"/g, '""')}"`,
        `"${descDetails.replace(/"/g, '""')}"`,
        sub.read ? "Read" : "Unread",
        sub.meta?.sentiment || "N/A",
        sub.meta?.urgency || "N/A",
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

  const runMigration = async () => {
    const { migrateLegacySubmissions } = await import("../../lib/migration");
    if (
      window.confirm(
        "This will convert all 'Residential' surveys to 'Dorm Life' and 'Non-Residential' to 'Student Voice'. Continue?",
      )
    ) {
      const result = await migrateLegacySubmissions();
      if (result.success) {
        toast.success(`Migration complete! Processed ${result.count} records.`);
      } else {
        toast.error("Migration failed. Check console for details.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant="outline"
            size="sm"
            onClick={runMigration}
            className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Migrate Legacy Data</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/trash")}
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Trash</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              Total
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {totalSubmissions}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              Voice
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {studentVoiceCount}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              Dorm
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {dormLifeCount}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              Urgent
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {urgentCount}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              Bugs
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {bugReportCount}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
              New
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {unreadCount}
            </p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              "All",
              "Unread",
              "Student Voice",
              "Dorm Life",
              "Bug Report",
            ] as const
          ).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors border",
                filter === f
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div>
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
                  "bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden",
                  submission.read
                    ? "border-gray-200"
                    : "border-indigo-200 ring-1 ring-indigo-50 shadow-md",
                  submission.meta?.flagged && "border-red-500 ring-red-200", // Visual cue for flagged items
                )}
              >
                {/* Card Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {!submission.read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}

                    {/* Metadata Badges */}
                    {submission.meta?.urgency &&
                      submission.meta.urgency !== "Normal" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {submission.meta.urgency}
                        </span>
                      )}
                    {submission.meta?.flagged && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                        ⚠️ FLAGGED
                      </span>
                    )}

                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        submission.type === "Student Voice"
                          ? "bg-purple-100 text-purple-800"
                          : submission.type === "Dorm Life"
                            ? "bg-blue-100 text-blue-800"
                            : submission.type === "Residential"
                              ? "bg-green-100 text-green-800"
                              : submission.type === "Non-Residential"
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-orange-100 text-orange-800",
                      )}
                    >
                      {submission.type}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {submission.timestamp?.toDate().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!submission.read && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleMarkAsRead(submission.id)}
                        className="text-xs h-8"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSoftDelete(submission.id)}
                      className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-6">
                  {/* Student Voice View */}
                  {submission.type === "Student Voice" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            General Exp
                          </span>
                          <span className="font-bold">
                            {submission.generalExperienceRating}/5
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            Safety
                          </span>
                          <span className="font-bold">
                            {submission.safetyRating}/5
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            Learning
                          </span>
                          <span className="font-bold">
                            {submission.learningSupportRating}/5
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            Communication
                          </span>
                          <span className="font-bold">
                            {submission.communicationRating}/5
                          </span>
                        </div>
                      </div>

                      {/* Sections with content */}
                      {submission.openFeedback && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            Open Feedback
                          </h4>
                          <p className="text-gray-700 text-sm mt-1">
                            {submission.openFeedback}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {submission.learningImprovements && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Learning Improvements
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {submission.learningImprovements}
                            </p>
                          </div>
                        )}
                        {submission.cultureImprovements && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Culture Improvements
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {submission.cultureImprovements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dorm Life View */}
                  {submission.type === "Dorm Life" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            Block
                          </span>
                          <span className="font-bold">
                            {submission.dormBlock}
                          </span>
                        </div>
                        {submission.roomNumber && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-xs text-gray-500 block">
                              Room
                            </span>
                            <span className="font-bold">
                              {submission.roomNumber}
                            </span>
                          </div>
                        )}
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="text-xs text-gray-500 block">
                            Satisfaction
                          </span>
                          <span className="font-bold">
                            {submission.satisfactionRating}/5
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submission.complaints && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <h4 className="text-sm font-bold text-red-900 mb-1">
                              Complaints/Issues
                            </h4>
                            <p className="text-red-800 text-sm">
                              {submission.complaints}
                            </p>
                          </div>
                        )}
                        {submission.suggestions && (
                          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <h4 className="text-sm font-bold text-indigo-900 mb-1">
                              Suggestions
                            </h4>
                            <p className="text-indigo-800 text-sm">
                              {submission.suggestions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bug Report Specific View */}
                  {submission.type === "Bug Report" && (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                          {submission.title}
                        </h3>
                        <span
                          className={clsx(
                            "inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium",
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
                      <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-100">
                        <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap break-words">
                          {submission.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Legacy Views */}
                  {(submission.type === "Residential" ||
                    submission.type === "Non-Residential") && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* ... Legacy details ... */}
                        {submission.type === "Residential" && (
                          <div className="text-sm text-gray-600">
                            Dorm: {submission.dormCondition} | Clean:{" "}
                            {submission.cleanliness}/5
                          </div>
                        )}
                        {submission.type === "Non-Residential" && (
                          <div className="text-sm text-gray-600">
                            Classroom: {submission.classroomEnvironment} |
                            Teaching: {submission.teachingQuality}/5
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                        <p className="text-sm text-gray-700">
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
    </div>
  );
};

export default Dashboard;
