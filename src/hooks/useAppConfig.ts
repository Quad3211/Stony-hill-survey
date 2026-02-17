import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface AppConfig {
  dormBlocks: string[];
  impactAreas: string[];
  operationalAreas: string[];
}

const DEFAULT_CONFIG: AppConfig = {
  dormBlocks: ["Block A", "Block B", "Block C", "Block D"],
  impactAreas: [
    "Teaching and instruction",
    "Student support",
    "Facilities and environment",
    "Safety and discipline",
    "Communication and announcements",
    "Student activities and events",
    "Administrative services",
    "Peer relationships",
    "Other",
  ],
  operationalAreas: [
    "Bathrooms and hygiene",
    "Classroom comfort",
    "Cafeteria services",
    "Security procedures",
    "Timetabling",
    "Maintenance",
    "Access to resources",
    "Other",
  ],
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const configRef = doc(db, "system_config", "main");

    const unsubscribe = onSnapshot(
      configRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...docSnap.data() } as AppConfig);
        } else {
          // Initialize if it doesn't exist
          setDoc(configRef, DEFAULT_CONFIG).catch((err) =>
            console.error("Failed to init config:", err),
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error("Config fetch error:", err);
        setError("Failed to load configuration");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      const configRef = doc(db, "system_config", "main");
      // Only merge the fields that have changed, do not spread the entire local config
      await setDoc(configRef, newConfig, { merge: true });
    } catch (err: any) {
      console.error("Error updating config:", err);
      throw new Error(err.message || "Failed to update configuration");
    }
  };

  return { config, updateConfig, loading, error };
};
