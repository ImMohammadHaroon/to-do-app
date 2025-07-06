// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPHNdovWlM5c0vMpFnhiLQ7hPbk55GFvY",
  authDomain: "to-do-a34ec.firebaseapp.com",
  projectId: "to-do-a34ec",
  storageBucket: "to-do-a34ec.firebasestorage.app",
  messagingSenderId: "506034956597",
  appId: "1:506034956597:web:7b36fff36d26e558fac47c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
