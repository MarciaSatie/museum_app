import { initializeApp, applicationDefault, getApp, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
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


// export const uploadImageToFirebase = async (filePath, filename) => {
//   const uploadOptions = {
//     destination: `museum_app/${filename}`,
//     public: true,
//     metadata: { cacheControl: "public, max-age=31536000" },
//   };
//   const [file] = await bucket.upload(filePath, uploadOptions);
//   const path = file.publicUrl();

//   const docRef = await addDataToFirestore(filename, path);
//   return docRef;
// };

export async function addDataToFirestore(imageInfo) {
  try {
    const docRef = await db.collection('image-db').add({
      image: imageInfo.name,
      url: imageInfo.path,
    });
    console.log(`Document written with ID:  ${docRef.id}`);
    return docRef;
  } catch (error) {
    console.error(`Error adding document:  ${error}`);
  }
}
  


// export const getAllGalleryImages = async () => {
//   const [files] = await bucket.getFiles({ prefix: 'museum_app/' });
//   const images = await Promise.all(files.map(async (file) => {
//     const [url] = await file.getSignedUrl({
//       action: 'read',
//       expires: '03-09-2499', 
//     });

//     return {
//       name: file.name.split('/').pop(),
//       url: url,
//       size: (file.metadata.size / 1024).toFixed(2) + " KB"
//     };
//   }));

//   return images;
// };


export const deleteOldestIfLimitReached = async (limit = 6) => {
  // 1. Get all files
  const [files] = await bucket.getFiles();

  // 2. If we are at or over the limit
  if (files.length >= limit) {
    // Sort files by creation time (Oldest first)
    files.sort((a, b) => new Date(a.metadata.timeCreated) - new Date(b.metadata.timeCreated));

    // 3. Identify the oldest one
    const oldestFile = files[0];
    console.log(`🗑️ Limit reached. Deleting oldest image: ${oldestFile.name}`);

    // 4. Delete it from Firebase
    await oldestFile.delete();
  }
};