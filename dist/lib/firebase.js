"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
// lib/firebase.ts
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var auth_1 = require("firebase/auth");
var firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};
var app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
exports.auth = (0, auth_1.getAuth)(app);
