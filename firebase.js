// Import specific Firebase functions to keep size low
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    onSnapshot, 
    updateDoc, 
    deleteDoc, 
    getDocs,
    query,
    where,
    serverTimestamp,
    increment 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// --------------------------------------------------------------
// 🔴 REPLACE WITH YOUR FIREBASE CONFIGURATION
// --------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCt0A_kIOnuxs1Dhw2AZ6Ph387lIncF01w",
  authDomain: "vector-siege.firebaseapp.com",
  projectId: "vector-siege",
  storageBucket: "vector-siege.firebasestorage.app",
  messagingSenderId: "888310618756",
  appId: "1:888310618756:web:a30f84d90b3ff52ff900d1",
  measurementId: "G-2XEFX8EMQK"
};
// --------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { 
    db, auth, signInAnonymously, 
    collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, 
    getDocs, query, where, serverTimestamp, increment 

};
