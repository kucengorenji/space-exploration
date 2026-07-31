/* ===================================================================
   FIREBASE SDK INITIALIZATION MODULE (ESM CDN BUNDLE)
   Services: Auth (SSO), Firestore, Realtime DB, Analytics
   =================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// User's provided Firebase Web App Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxVfV_QjT4AUzbBVr-kLdY7WtsmzPZoq8",
  authDomain: "space-exploration-6b4f1.firebaseapp.com",
  projectId: "space-exploration-6b4f1",
  storageBucket: "space-exploration-6b4f1.firebasestorage.app",
  messagingSenderId: "580431907852",
  appId: "1:580431907852:web:17f1413f673b7601a07229",
  measurementId: "G-LR5VLWJXCD"
};

// Initialize Firebase App instance
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Safe Analytics initialization for browser environments
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
