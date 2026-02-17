import { Timestamp } from "firebase/firestore";

interface Submission {
  id: string;
  type: string;
  timestamp: Timestamp;
  read?: boolean;
  dormBlock?: string;
  roomNumber?: string;
  satisfactionRating?: string;
  complaints?: string;
  suggestions?: string;
  generalExperienceRating?: string;
  safetyRating?: string;
  learningSupportRating?: string;
  communicationRating?: string;
  impactAreas?: string[];
  operationalImprovements?: string[];
  learningImprovements?: string;
  cultureImprovements?: string;
  oneOperationalChange?: string;
  communicationSuggestions?: string;
  openFeedback?: string;
  title?: string;
  description?: string;
  priority?: string;
  [key: string]: any;
}

export const downloadCSV = (submissions: Submission[]) => {
  if (!submissions.length) return;

  const headers = [
    "ID",
    "Type",
    "Date",
    "Status",
    // Ratings (Student Voice)
    "General Rating",
    "Safety Rating",
    "Learning Support",
    "Communication Rating",
    // Text Feedback (Student Voice)
    "Impact Areas",
    "Learning Improvements",
    "Culture Improvements",
    "Communication Suggestions",
    "Operational Change",
    "Open Feedback",
    // Dorm Life
    "Dorm Block",
    "Room Number",
    "Dorm Satisfaction",
    "Complaints",
    "Suggestions",
    // Bug Reports
    "Bug Title",
    "Bug Description",
    "Priority",
    // Meta
    "Sentiment",
    "Urgency",
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return "";
    const stringValue = String(str);
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = submissions.map((s) => {
    const date = s.timestamp?.toDate().toLocaleDateString() || "";

    return [
      s.id,
      s.type,
      date,
      s.read ? "Read" : "Unread",
      // Ratings
      s.generalExperienceRating || "",
      s.safetyRating || "",
      s.learningSupportRating || "",
      s.communicationRating || "",
      // Text Feedback
      escapeCsv(s.impactAreas?.join(", ")),
      escapeCsv(s.learningImprovements),
      escapeCsv(s.cultureImprovements),
      escapeCsv(s.communicationSuggestions),
      escapeCsv(s.oneOperationalChange),
      escapeCsv(s.openFeedback),
      // Dorm Life
      s.dormBlock || "",
      s.roomNumber || "",
      s.satisfactionRating || "",
      escapeCsv(s.complaints),
      escapeCsv(s.suggestions),
      // Bug Reports
      escapeCsv(s.title),
      escapeCsv(s.description),
      s.priority || "",
      // Meta
      s.meta?.sentiment || "",
      s.meta?.urgency || "",
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `survey_export_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
