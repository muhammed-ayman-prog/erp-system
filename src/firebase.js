import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDu0yqIgogNxij1umCllgxJbF5AVEC3Ano",
  authDomain: "erp-system-8179a.firebaseapp.com",
  projectId: "erp-system-8179a",
  storageBucket: "erp-system-8179a.firebasestorage.app",
  messagingSenderId: "26100243267",
  appId: "1:26100243267:web:a91b57a3a7f2e1f8c8edf6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// 🔥 أهم سطر
const functions = getFunctions(app, "us-central1");

export { auth, db, functions };