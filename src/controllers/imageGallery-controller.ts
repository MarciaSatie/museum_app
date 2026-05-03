import { Request, ResponseToolkit } from "@hapi/hapi";
import { imageStore } from "../models/cloudinary"; // Removed .js
import { db } from "../models/db"; // Removed .js

export const imageGalleryController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";
      
      const allImages = await imageStore.getAllImages();
      const images = allImages
        .filter((image: any) => image.context?.custom?.userId === user._id)
        .map((image: any) => ({
          id: image.public_id,
          image: image.public_id.split("/").pop(),
          url: image.secure_url || image.url,
          museumTitle: image.context?.custom?.museumTitle || "Unknown museum",
          exhibitionTitle: image.context?.custom?.exhibitionTitle || "Unknown exhibition",
          date: image.created_at ? new Date(image.created_at).toLocaleDateString("de-DE") : "",
          userName: image.context?.custom?.userName || user.firstName,
          size: image.bytes ? `${Math.round(image.bytes / 1024)} KB` : "",
        }));

      const museums = await db.museumStore!.getUserMuseums(user._id);
      const exhibitions = await db.exhibitionStore!.getExhibitionsByMuseumId("");

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
    handler: async function (request: Request, h: ResponseToolkit) {
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
    handler: function (request: Request, h: ResponseToolkit) {
      console.log("ClickMe!!");
      return h.redirect("/imageGallery");
    },
  },
  
  uploadImage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const payload = request.payload as any;
      const imageFile = payload.image;
      const { museumId } = payload;
      
      const museums = await db.museumStore!.getAllMuseums();
      const museumObj = museums.find((museum: any) => museum._id === museumId);
      
      const { exhibitionId } = payload;
      const exhibitions = await db.exhibitionStore!.getAllExhibitions();
      const exhibitionObj = exhibitions.find((exhibition: any) => exhibition._id === exhibitionId);

      if (!imageFile || !museumObj || !exhibitionObj) {
        return h.view("imageGallery-view", { error: "Missing required upload data." });
      }

      console.log("File is safe to upload!");
      
      await imageStore.uploadImageCloudinary(imageFile.path, {
        tags: [user._id, museumId, exhibitionId].filter(Boolean),
        context: {
          userId: user._id,
          userName: user.firstName,
          museumTitle: museumObj.title || "",
          exhibitionTitle: exhibitionObj.title || "",
        },
      });

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
