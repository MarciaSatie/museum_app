
import { addDataToFirestore} from "../models/firebase/firebase-utils.js";
import { imageStore } from "../models/cloudinary.js";

export const aboutController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const images = await imageStore.getAllImages();
      console.log("DEBUG IMAGES:", images);

      const viewData = {
        title: "About MyAppMusems",
        user,
        isAdmin,
      };
      return h.view("about-view", {
        title: "Museum Gallery",
        images: images // pass the array of images to Handlebars
      });
    },
  },

  deleteImage: {
    handler: async function (request, h) {
      const imageId = request.params.id;
      console.log(`Delete Image ID: ${imageId}`);
      try {
        await imageStore.deleteImage(imageId);
        return h.redirect("/about");
      } catch (error) {
        return h.view("about-view", { error: "Failed to delete image." });
      }
    },
  },

  clickMe: {
    handler: function (request, h) {
      console.log("ClickMe!!");
      return h.redirect("/about");
    },
  },
  
  uploadImage: {
    handler: async function (request, h) {
      const imageFile = request.payload.image;
  
      if (!imageFile) {
        return h.view("about-view", { error: "No file uploaded." });
      }
      console.log("File is safe to upload!");
      await imageStore.uploadImageCloudinary(imageFile.path);
      return h.redirect("/about");
    },
    payload: {
      multipart: true,
      output: "file",
      maxBytes: 209715200,
      parse: true,
    },

  },

};

