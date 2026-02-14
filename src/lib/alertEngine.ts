import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { sendNewSubmissionEmail } from "./email";

// --- TYPES ---
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type SurveyCategory = "Student Voice" | "Dorm Life" | "Bug Report";

interface AlertConfig {
  cooldownMinutes: number;
}

const CONFIG: AlertConfig = {
  cooldownMinutes: 30,
};

const EMERGENCY_KEYWORDS = [
  "weapon",
  "knife",
  "gun",
  "fight",
  "bully",
  "suicide",
  "bomb",
  "kill",
  "danger",
  "rape",
  "assault",
  "fire",
  "flood",
  "leak",
  "emergency",
];

// --- HELPER: Classify Severity ---
export const classifySeverity = (
  data: any,
  category: SurveyCategory,
  fullText: string,
): SeverityLevel => {
  const lowerText = fullText.toLowerCase();

  // 1. CRITICAL Check (Legacy "Emergency Override")
  // Conditions: Emergency keywords, specific safety threats
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some((kw) =>
    lowerText.includes(kw),
  );

  if (hasEmergencyKeyword) return "CRITICAL";

  if (category === "Student Voice") {
    if (Number(data.safetyRating) <= 2) return "CRITICAL";
  }

  // 2. HIGH Check
  // Conditions: Very low ratings, specific high-priority topics (harassment usually caught in critical, but maybe milder forms)
  // Or generic "Urgent" flag if we had one.
  const rating =
    Number(data.generalExperienceRating) ||
    Number(data.satisfactionRating) ||
    5; // default to 5 if missing

  if (rating <= 2) return "HIGH";

  // Check for flagged content from profanity filter (if available in data.flaggedWords)
  // We re-assess here just to be sure or trust the passed data.
  // Let's rely on the text content analysis we just did.

  // 3. MEDIUM Check
  // Conditions: Rating 3
  if (rating === 3) return "MEDIUM";

  // 4. LOW Check
  // Conditions: Rating 4-5, positive sentiment
  return "LOW";
};

// --- HELPER: Check & Update Cooldown ---
// Returns TRUE if we can send email, FALSE if throttled.
const checkAndSetCooldown = async (category: string): Promise<boolean> => {
  const docRef = doc(db, "system_metrics", "email_cooldowns");

  try {
    const docSnap = await getDoc(docRef);
    const now = Timestamp.now();
    let data = docSnap.exists() ? docSnap.data() : {};

    const lastSent = data[category] as Timestamp | undefined;

    if (lastSent) {
      const diffMinutes = (now.toMillis() - lastSent.toMillis()) / 1000 / 60;
      if (diffMinutes < CONFIG.cooldownMinutes) {
        console.log(
          `[AlertEngine] Throttled: ${category} (Wait ${Math.round(CONFIG.cooldownMinutes - diffMinutes)}m)`,
        );
        return false;
      }
    }

    // Update timestamp
    await setDoc(docRef, { ...data, [category]: now }, { merge: true });
    return true;
  } catch (error) {
    console.error(
      "[AlertEngine] Cooldown check failed, defaulting to allow:",
      error,
    );
    return true; // Fail open to ensure criticals aren't blocked by DB errors
  }
};

// --- MAIN: Process Submission ---
export const processSubmission = async (
  data: any,
  category: SurveyCategory,
) => {
  console.log(`[AlertEngine] Processing ${category} submission...`);

  // 1. Full text aggregation for analysis
  const textFields = Object.values(data)
    .filter((val) => typeof val === "string")
    .join(" ");

  // 2. Severity Classification
  const severity = classifySeverity(data, category, textFields);
  console.log(`[AlertEngine] Classified as: ${severity}`);

  // 3. Profanity/Content Filtering (Sanitization)
  // We re-run or assume data is raw. Let's sanitize specific known fields if we want,
  // but usually the UI handles blocking.
  // We will trust the UI has already blocked "Hard" ignores, but we might check "Soft" here.
  // For now, we assume the data passed is ready to save.

  // 4. Save to Firestore (ALWAYS)
  await addDoc(collection(db, "submissions"), {
    ...data,
    type: category,
    severity, // New field
    read: false,
    timestamp: serverTimestamp(),
  });
  console.log("[AlertEngine] Saved to Firestore.");

  // 5. Email Dispatch Logic
  let shouldSendEmail = false;
  let emailPrefix = "";

  if (severity === "CRITICAL") {
    // EMERGENCY OVERRIDE: Bypass cooldown
    shouldSendEmail = true;
    emailPrefix = "🚨 CRITICAL ALERT";
  } else if (severity === "HIGH") {
    // Check cooldown
    const canSend = await checkAndSetCooldown(category);
    if (canSend) {
      shouldSendEmail = true;
      emailPrefix = "⚠️ HIGH PRIORITY";
    } else {
      console.log("[AlertEngine] High priority email skipped due to cooldown.");
    }
  } else {
    console.log("[AlertEngine] Low/Medium priority. No email sent.");
  }

  // 6. Send Email
  if (shouldSendEmail) {
    // Format message
    const formattedMessage =
      `${emailPrefix}: New ${category} Submission\n\n` +
      `Severity: ${severity}\n` +
      `Time: ${new Date().toLocaleString()}\n` +
      `--------------------------------\n` +
      `Summary: ${textFields.substring(0, 500)}...\n\n` +
      `(Log in to dashboard for full details)`;

    await sendNewSubmissionEmail({
      name: data.isAnonymous ? "Anonymous" : "Signed Student",
      time: new Date().toLocaleString(),
      message: formattedMessage,
      link: "https://stony-hill-survey.vercel.app/",
    });
    console.log("[AlertEngine] Email dispatch sent.");
  }
};
