
import {getAllCollectionsFirebase, getImagesFromCollection,addDataToFirestore,getAllImagesFirebase,deleteImageFromFirestore} from "../models/firebase/firebase-utils.js";
import { imageStore } from "../models/cloudinary.js";
import { db } from "../models/db.js";

export const galleriesController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const collections = await getAllCollectionsFirebase();
      const museums = await db.museumStore.getAllMuseums();
      const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId();
      const users = await db.userStore.getAllUsers();
      const collectionObjs = await Promise.all(
                                                collections.map(async (col) => {
                                                  const snapshot = await col.get();
                                                  const images = [];
                                                  snapshot.forEach(doc => {
                                                    images.push({ id: doc.id, ...doc.data() });
                                                  });
                                                  return {
                                                    id: col.id,
                                                    images: images // images for this collection
                                                  };
                                                })
                                              );

      let allImages = [];
      for (const collection of collections) {
        const snapshot = await collection.get();
        snapshot.forEach(doc => {
          allImages.push({
            userCollection: collection.id, // collection name
            id: doc.id,
            ...doc.data()
          });
        });
      }

      

      return h.view("galleries-view", {
        title: "Museum Gallery",
        collections: collectionObjs,
        images: collectionObjs.images,
        museums,
        exhibitions,
        users,
        user,
        isAdmin
      });
    },
  },

  

};


