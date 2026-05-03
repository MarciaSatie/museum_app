import { imageStore } from "../models/cloudinary.js";
import { db } from "../models/db.js";

export const imageGalleryController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const allImages = await imageStore.getAllImages();
      const images = allImages
        .filter((image) => image.context?.custom?.userId === user._id)
        .map((image) => ({
          id: image.public_id,
          image: image.public_id.split("/").pop(),
          url: image.secure_url || image.url,
          museumTitle: image.context?.custom?.museumTitle || "Unknown museum",
          exhibitionTitle: image.context?.custom?.exhibitionTitle || "Unknown exhibition",
          date: image.created_at ? new Date(image.created_at).toLocaleDateString("de-DE") : "",
          userName: image.context?.custom?.userName || user.firstName,
          size: image.bytes ? `${Math.round(image.bytes / 1024)} KB` : "",
        }));
      const museums = await db.museumStore.getUserMuseums(user._id);
      const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId();
      console.log("DEBUG IMAGES:", images);
      return h.view("imageGallery-view", {
        title: "Museum Gallery",
        images,
        museums: museums,
        exhibitions,
        user,
        isAdmin,
      });
    },
  },

  deleteImage: {
    handler: async function (request, h) {
      const imageId = request.params.id;
      console.log(`Delete Image ID: ${imageId}`);
      try {
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
      const {museumId} = request.payload;
      const museums = await db.museumStore.getAllMuseums();
      const museumObj = museums.find((museum) => museum._id === museumId);
      const {exhibitionId} = request.payload;
      const exhibitions = await db.exhibitionStore.getAllExhibitions();
      const exhibitionObj = exhibitions.find((exhibition) => exhibition._id === exhibitionId);

      const imageInfo = {};
      if (!imageFile) {
        return h.view("imageGallery-view", { error: "No file uploaded." });
      }
      console.log("File is safe to upload!");
      imageInfo.museum= museumId;
      imageInfo.museumTitle = museumObj.title;
      imageInfo.exhibition = exhibitionObj.title;
      imageInfo.path = await imageStore.uploadImageCloudinary(imageFile.path, {
        tags: [user._id, museumId, exhibitionId].filter(Boolean),
        context: {
          userId: user._id,
          userName: user.firstName,
          museumTitle: museumObj?.title || "",
          exhibitionTitle: exhibitionObj?.title || "",
        },
      });
      imageInfo.name = imageFile.filename;
      imageInfo.userId = user._id;
      imageInfo.userName = user.firstName;
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


