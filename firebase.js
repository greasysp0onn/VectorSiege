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
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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