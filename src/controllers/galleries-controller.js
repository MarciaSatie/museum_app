
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {getAllCollectionsFirebase, getImagesFromCollection,addDataToFirestore,getAllImagesFirebase,deleteImageFromFirestore} from "../models/firebase/firebase-utils.js";
import { imageStore } from "../models/cloudinary.js";
import { db } from "../models/db.js";

dotenv.config();

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

      const allImages = [];
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

  sendPostcard: {
    handler: async function (request, h) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    
      const { recipientEmail } = request.payload;
      const imageId = request.params.id;
    
      // Find the image by ID (assuming you have a function or array of images)
      const museums = await db.museumStore.getAllMuseums();
      let imageUrl = "";
      for (const museum of museums) {
        const found = museum.images?.find(img => img.id === imageId);
        if (found) {
          imageUrl = found.url;
          break;
        }
      }
    
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: recipientEmail,
        subject: "A Postcard from the Museum Gallery",
        html: `<h1>Someone sent you a postcard!</h1><img src="${imageUrl}" alt="Postcard">`,
      });
    
      return h.redirect("/galleries");
    }
  },

};


