// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBloxYssi5CutUy8J9azissCaT8LyQcZ8M",
  authDomain: "testshop-3a30d.firebaseapp.com",
  projectId: "testshop-3a30d",
  storageBucket: "testshop-3a30d.firebasestorage.app",
  messagingSenderId: "845646249753",
  appId: "1:845646249753:web:de6aa0e7a0ba193647cf88",
  measurementId: "G-76W8YYZF50"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
