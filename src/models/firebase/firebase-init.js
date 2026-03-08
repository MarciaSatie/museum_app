import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Read your service account JSON file and prepare file paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This makes the code work in both environments - locally (JSON file) and on Render (env vars) without changes.
let serviceAccount;
if (process.env.FIREBASE_PROJECT_ID) {
  // Production: Use environment variables from Render
  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  // Local: Use JSON file
  try{
  serviceAccount = JSON.parse(
      readFileSync(path.join(__dirname, "../../../fullstack01-4860e-firebase-adminsdk-fbsvc-cde202aafa.json"))
  );
  }catch(err){
    console.log("Firebase Json ERROR:"+ err)
  }
}

// Initialize the Firebase Admin SDK with credentials and get database reference.
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
});

console.log("🔥🔥🔥 Initializing Firebase! 🔥🔥🔥🔥🔥🔥🔥🔥🔥")
  
export const db = admin.database();