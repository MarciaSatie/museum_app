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


export async function getImagesFromCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const images = [];
    snapshot.forEach(doc => {
      images.push({ id: doc.id, ...doc.data() });
    });
    return images;
  } catch (err) {
    console.log(`Get Images from collection ${collectionName} FAIL: ${err}`);
    return [];
  }
}

export async function getAllImagesFromCollectionsBesides(collectionName) {
  try {
    const collections = await db.listCollections();
    let allImages = [];
    for (const collection of collections) {
      if (collection.id !== collectionName) {
        const snapshot = await collection.get();
        snapshot.forEach(doc => {
          allImages.push({ collection: collection.id, id: doc.id, ...doc.data() });
        });
      }
    }
    return allImages;
  } catch (err) {
    console.log(`Get all Images from all collections except ${collectionName} FAIL: ${err}`);
    return [];
  }
}

export async function getAllImagesFirebase() {
  try {
    const collections = await db.listCollections();
    let allImages = [];
    for (const collection of collections) {
      const snapshot = await collection.get();
      snapshot.forEach(doc => {
        allImages.push({ collection: collection.id, id: doc.id, ...doc.data() });
      });
    }
    return allImages;
  } catch (err) {
    console.log(`Get all Images from all collections FAIL: ${err}`);
    return [];
  }
}

export async function addDataToFirestore(imageInfo) {
  try {
    let date = new Date().toLocaleDateString("de-DE");
    const docRef = await db.collection(imageInfo.userId,).add({
      image: imageInfo.name.slice(0,-4),
      musuem:imageInfo.museum,
      museumTitle: imageInfo.museumTitle,
      exhibitionTitle: imageInfo.exhibition,
      url: imageInfo.path,
      userId: imageInfo.userId,
      userName: imageInfo.userName,
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