import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";
import { LogOut, ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import clsx from "clsx";

interface Submission {
  id: string;
  type: "Residential" | "Non-Residential" | "Bug Report";
  review?: string;
  description?: string;
  title?: string;
  priority?: "Low" | "Medium" | "High";
  read?: boolean;
  timestamp: Timestamp;
  deleted?: boolean;
  [key: string]: any;
}

const AdminTrash = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
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
        .filter((doc: any) => doc.deleted) as Submission[];
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleRestore = async (id: string) => {
    try {
      const submissionRef = doc(db, "submissions", id);
      await updateDoc(submissionRef, { deleted: false });
    } catch (error: any) {
      console.error("Error restoring submission:", error);
      alert(`Error restoring submission: ${error.message}`);
    }
  };

  const handlePermanentDelete = async (id: string, type: string) => {
    if (
      !window.confirm(
        `Are you sure you want to PERMANENTLY delete this ${type}? This action cannot be undone.`,
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "submissions", id));
    } catch (error: any) {
      console.error("Error permanently deleting submission:", error);
      alert(`Error deleting submission: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Trash</h1>
            </div>
            <div className="flex items-center gap-3">
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
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading trash...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Trash2 className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">Trash is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
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
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(submission.id)}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handlePermanentDelete(submission.id, submission.type)
                        }
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete Forever
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Simplified View for Trash */}
                    {submission.type === "Bug Report" ? (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {submission.title}
                        </h3>
                        <p className="text-gray-700 mt-2">
                          {submission.description}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2">
                          {submission.type === "Residential" ? (
                            <span className="text-sm text-gray-600">
                              Dorm: {submission.dormCondition}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">
                              Classroom: {submission.classroomEnvironment}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {submission.review}
                        </p>
                      </div>
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

export default AdminTrash;
