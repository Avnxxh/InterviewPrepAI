import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBw-racNDyIJxCWgadBxBm4MMNIEa_vLnw",
  authDomain: "interviewer-fc4f6.firebaseapp.com",
  projectId: "interviewer-fc4f6",
  storageBucket: "interviewer-fc4f6.firebasestorage.app",
  messagingSenderId: "402722869691",
  appId: "1:402722869691:web:d96aa4c6b140367b4df49e",
  measurementId: "G-SYZTS2ZVNC"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app)