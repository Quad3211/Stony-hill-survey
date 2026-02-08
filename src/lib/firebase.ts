import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB-BQ49KjjsD1CGzhZZVpav9o3Qb45kbC0",
  authDomain: "stony-hill-survey.firebaseapp.com",
  databaseURL: "https://stony-hill-survey-default-rtdb.firebaseio.com",
  projectId: "stony-hill-survey",
  storageBucket: "stony-hill-survey.firebasestorage.app",
  messagingSenderId: "762435973234",
  appId: "1:762435973234:web:beab8db25cf028d3cb52eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
