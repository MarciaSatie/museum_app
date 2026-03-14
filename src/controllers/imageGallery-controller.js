
import { addDataToFirestore,getAllImagesFirebase,deleteImageFromFirestore} from "../models/firebase/firebase-utils.js";
import { imageStore } from "../models/cloudinary.js";
import { db } from "../models/db.js";

export const imageGalleryController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const images = await getAllImagesFirebase();
      console.log("DEBUG IMAGES:", images);
      const museums = await db.museumStore.getAllMuseums();

      const viewData = {
        title: "imageGallery MyAppMusems",
        user,
        isAdmin,
      };
      return h.view("imageGallery-view", {
        title: "Museum Gallery",
        images: images, // pass the array of images to Handlebars
        museums: museums,
        user,
        isAdmin
      });
    },
  },

  deleteImage: {
    handler: async function (request, h) {
      const imageId = request.params.id;
      console.log(`Delete Image ID: ${imageId}`);
      try {
        await deleteImageFromFirestore(imageId);
        await imageStore.deleteImage(imageId);
        return h.redirect("/imageGallery");
      } catch (error) {
        return h.view("imageGallery-view", { error: "Failed to delete image." });
      }
    },
  },

  clickMe: {
    handler: function (request, h) {
      console.log("ClickMe!!");
      return h.redirect("/imageGallery");
    },
  },
  
  uploadImage: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const imageFile = request.payload.image;
      const museumId = request.payload.museumId;
      const museums = await db.museumStore.getAllMuseums();
      const museumObj = museums.find(m => m._id === museumId||"unknow");

      let imageInfo = {};
      if (!imageFile) {
        return h.view("imageGallery-view", { error: "No file uploaded." });
      }
      console.log("File is safe to upload!");
      imageInfo.museum= museumId;
      imageInfo.museumTitle = museumObj.title;
      imageInfo.path = await imageStore.uploadImageCloudinary(imageFile.path);
      imageInfo.name = imageFile.filename;
      imageInfo.userId = user._id;
      console.log("Saving to Firestore:", imageInfo);
      await addDataToFirestore(imageInfo);
      return h.redirect("/imageGallery");
    },
    payload: {
      multipart: true,
      output: "file",
      maxBytes: 209715200,
      parse: true,
    },

  },

};


