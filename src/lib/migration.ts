import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const migrateLegacySubmissions = async () => {
  let updatedCount = 0;
  try {
    const batch = writeBatch(db);
    const submissionsRef = collection(db, "submissions");

    // 1. Migrate "Residential" -> "Dorm Life"
    const residentialQuery = query(
      submissionsRef,
      where("type", "==", "Residential"),
    );
    const residentialSnapshot = await getDocs(residentialQuery);

    residentialSnapshot.forEach((document) => {
      const data = document.data();
      const newRef = doc(db, "submissions", document.id);
      batch.update(newRef, {
        type: "Dorm Life",
        // Map legacy fields if necessary
        dormBlock: data.dormBlock || "Other", // Default if missing
        satisfactionRating: data.cleanliness || "3", // Map cleanliness to satisfaction as approximation
        complaints: data.review || "", // Map review to complaints
      });
      updatedCount++;
    });

    // 2. Migrate "Non-Residential" -> "Student Voice"
    const nonResidentialQuery = query(
      submissionsRef,
      where("type", "==", "Non-Residential"),
    );
    const nonResidentialSnapshot = await getDocs(nonResidentialQuery);

    nonResidentialSnapshot.forEach((document) => {
      const data = document.data();
      const newRef = doc(db, "submissions", document.id);
      batch.update(newRef, {
        type: "Student Voice",
        openFeedback: data.review || "", // Map review to openFeedback
        generalExperienceRating: data.teachingQuality || "3", // Map teaching quality to general experience
      });
      updatedCount++;
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`Migrated ${updatedCount} submissions successfully.`);
      return { success: true, count: updatedCount };
    } else {
      console.log("No legacy submissions found to migrate.");
      return { success: true, count: 0 };
    }
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
};
