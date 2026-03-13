import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

let serviceAccount;

// 1. Check if the local JSON file exists first
try {
  const jsonPath = "./service-account.json"; 
  serviceAccount = JSON.parse(readFileSync(jsonPath, "utf8"));
  console.log("🔑 Using local Service Account JSON");
} catch (err) {
  // 2. If no JSON file, look for Production Environment Variables (for Render/AWS)
  console.log("☁️ No local JSON found, switching to Environment Variables...");
  if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
  } else {
    console.error("❌ ERROR: No Firebase credentials found (JSON or ENV)!");
  }
}

// 3. Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Yellow console message with emoji
console.log("\x1b[33m✨ FIREBASE WAS INITIALIZED ✨\x1b[0m");

export const db = admin.firestore();
