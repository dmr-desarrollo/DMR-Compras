// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlIwwOMQ3tQl1ZZqz6SfHF4UAqxjIinOM",
  authDomain: "compras-dmr.firebaseapp.com",
  projectId: "compras-dmr",
  storageBucket: "compras-dmr.firebasestorage.app",
  messagingSenderId: "100853053682",
  appId: "1:100853053682:web:e4d6b7674dfe851de2f86b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
