// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMWI5QfQF_4WcjS_4E5loaAAOzoGQnqag",
  authDomain: "climb-eb079.firebaseapp.com",
  projectId: "climb-eb079",
  storageBucket: "climb-eb079.firebasestorage.app",
  messagingSenderId: "246805733146",
  appId: "1:246805733146:web:f41c259bdcdf67d90216a3",
  measurementId: "G-LN9MSZC7NT"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;