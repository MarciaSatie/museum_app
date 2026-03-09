
import { uploadImageToFirebase,getAllGalleryImages, deleteOldestIfLimitReached} from "../models/firebase/firebase-utils.js";

export const aboutController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const images = await getAllGalleryImages();
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

  clickMe: {
    handler: function (request, h) {
      console.log("ClickMe!!");
      return h.redirect("/about");
    },
  },
  
  uploadImage: {
    handler: async function (request, h) {
      const imageFile = request.payload.image;
  
      if (imageFile.size > 512000) { 
        return h.view("about-view", { error: "File too large! Must be under 500KB." });
      }
      deleteOldestIfLimitReached(); // if we already have 5 images, this will delete teh oldest before upload the new one.
      // This is where the Firebase upload code will go next!
      console.log("File is safe to upload!");
      await uploadImageToFirebase(imageFile.path, imageFile.filename);
      return h.redirect("/about");
    }
  },

};

