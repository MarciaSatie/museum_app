import { initializeApp, applicationDefault, getApp, getApps } from "firebase-admin/app";
import { db } from "./firebase-init.js";



let app;
if (!getApps().length) {
  app = initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  app = getApp();
}

export async function getAllImagesFirebase() {
  try {
    const snapshot = await db.collection('image-db').get();
    const images = [];
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() });
    });
    return images;
  } catch (err) {
    console.log(`Get all Images from Firebase FAIL: ${err}`);
    return [];
  }
}

export async function addDataToFirestore(imageInfo) {
  try {
    let date = new Date().toLocaleDateString("de-DE");
    const docRef = await db.collection('image-db').add({
      image: imageInfo.name.slice(0,-4),
      musuem:imageInfo.museum,
      museumTitle: imageInfo.museumTitle,
      url: imageInfo.path,
      userId: imageInfo.userId,
      date: date
    });
    console.log(`Document written with ID:  ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error(`Error adding document:  ${error}`);
  }
}
  


// Delete a document from Firestore by ID
export async function deleteImageFromFirestore(docId) {
  try {
    await db.collection('image-db').doc(docId).delete();
    console.log(`Document ${docId} deleted.`);
  } catch (error) {
    console.error('Error deleting document:', error);
  }
}