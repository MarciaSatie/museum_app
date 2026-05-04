import { Request, ResponseToolkit } from "@hapi/hapi";
import path from "path";
import { imageStore } from "../models/cloudinary"; // Removed .js
import { db } from "../models/db"; // Removed .js

export const imageGalleryController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";
      
      // Fetch from MongoDB (data is already denormalized)
      const mongoImages = await db.imageStore!.getImagesByUserId(user._id);
      
      // Fetch museums and exhibitions for dropdowns
      const museums = await db.museumStore!.getUserMuseums(user._id);
      const exhibitions = await db.exhibitionStore!.getExhibitionsByMuseumId("");
      
      // Map MongoDB images (titles and user names already included)
      const images = mongoImages.map((image: any) => ({
        id: image.publicId,
        image: image.image,
        url: image.url,
        museumTitle: image.museumTitle || "Unknown museum",
        exhibitionTitle: image.exhibitionTitle || "Unknown exhibition",
        date: image.date || "",
        userName: image.userName || user.firstName,
        size: image.size ? `${Math.round(image.size / 1024)} KB` : "",
      }));

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
        // Delete from Cloudinary
        await imageStore.deleteImage(imageId);
        // Delete from MongoDB
        await db.imageStore!.deleteImageByPublicId(imageId);
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
      
      try {
        const uploadResult = await imageStore.uploadImageCloudinary(imageFile.path, {
          tags: [user._id, museumId, exhibitionId].filter(Boolean),
          context: {
            userId: user._id,
            userName: user.firstName,
            museumTitle: museumObj.title || "",
            exhibitionTitle: exhibitionObj.title || "",
          },
        });

        console.log("Cloudinary upload result:", uploadResult);

        // Save image metadata to MongoDB with denormalized data (like Firebase)
        if (uploadResult && uploadResult.public_id) {
          console.log("Saving to MongoDB with publicId:", uploadResult.public_id);
          
          if (!db.imageStore) {
            console.error("❌ db.imageStore is not initialized!");
            return h.view("imageGallery-view", { error: "Database error: imageStore not initialized." });
          }
          
          // Format the date
          const today = new Date();
          const formattedDate = today.toLocaleDateString("de-DE");
          
          // Prefer the original uploaded filename (Hapi provides it), try multiple fallbacks,
          // and finally fall back to the Cloudinary public_id tail.
          console.log("Upload payload file object:", {
            path: imageFile?.path,
            filename_prop: imageFile?.filename,
            hapi: imageFile?.hapi,
          });

          const fallbackFromTemp = imageFile && imageFile.path ? path.basename(String(imageFile.path)) : undefined;
          const originalFileName =
            (imageFile && imageFile.hapi && imageFile.hapi.filename) ||
            (imageFile && imageFile.filename) ||
            uploadResult.original_filename ||
            fallbackFromTemp ||
            (uploadResult.public_id && uploadResult.public_id.split("/").pop()) ||
            "img";
          console.log("Resolved originalFileName:", originalFileName);

          const mongoResult = await db.imageStore.addImage({
            _id: undefined,
            publicId: uploadResult.public_id,
            image: originalFileName,
            userId: user._id,
            userName: user.firstName, // Denormalized
            museum: museumId, // Museum ID
            museumTitle: museumObj.title, // Denormalized
            exhibitionTitle: exhibitionObj.title, // Denormalized
            url: uploadResult.secure_url || uploadResult.url || "",
            date: formattedDate, // Formatted date
            size: uploadResult.bytes || 0,
            uploadDate: new Date(),
          });
          
          console.log("✅ Image metadata saved to MongoDB:", mongoResult);
        } else {
          console.error("❌ No uploadResult or missing public_id:", uploadResult);
          return h.view("imageGallery-view", { error: "Upload to Cloudinary failed." });
        }

        return h.redirect("/imageGallery");
      } catch (error: any) {
        console.error("Upload error:", error);
        return h.view("imageGallery-view", { error: `Upload failed: ${error.message}` });
      }
    },
    payload: {
      multipart: true,
      output: "file",
      maxBytes: 209715200,
      parse: true,
    },
  },
};
