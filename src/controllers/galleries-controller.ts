import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { imageStore } from "../models/cloudinary"; // Removed .js
import { db } from "../models/db"; // Removed .js
import type { UserType } from "../models/mongo/user";
import type { MuseumType } from "../models/mongo/museum";
import type { ExhibitionType } from "../models/mongo/exhibition";

dotenv.config();

interface EnrichedImage {
  id: string;
  image: string | undefined;
  url: string;
  museumTitle: string;
  exhibitionTitle: string;
  date: string;
  userName: string;
  userEmail: string;
  size: string;
  user: UserType | null;
  museum: MuseumType | null;
  exhibition: ExhibitionType | null;
}

interface UserGallery {
  userId: string;
  userName: string;
  userEmail: string;
  images: EnrichedImage[];
}

export const galleriesController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";
      
      // Fetch all museums, exhibitions, and users from MongoDB
      const museums = await db.museumStore!.getAllMuseums();
      const exhibitions = await db.exhibitionStore!.getAllExhibitions();
      const allUsers = await db.userStore!.getAllUsers();
      
      // Fetch all images from MongoDB
      const mongoImages = await db.imageStore!.getAllImages();
      
      // Create lookup maps for full data access
      const userMap = new Map<string, UserType>(allUsers.map((u: UserType) => [u._id!, u]));
      const museumMap = new Map<string, MuseumType>(museums.map((m: MuseumType) => [m._id!, m]));
      const exhibitionMap = new Map<string, ExhibitionType>(exhibitions.map((e: ExhibitionType) => [e._id!, e]));
      
      // Map MongoDB images (data is already denormalized, but we add full objects)
      const images: EnrichedImage[] = mongoImages.map((image: any) => {
        // Look up full objects from maps
        const userData = image.userId ? userMap.get(image.userId) ?? null : null;
        const museumData = image.museum ? museumMap.get(image.museum) ?? null : null;
        
        return {
          id: image.publicId,
          image: image.image,
          url: image.url,
          museumTitle: image.museumTitle || "Unknown museum",
          exhibitionTitle: image.exhibitionTitle || "Unknown exhibition",
          date: image.date || "",
          userName: image.userName || "Unknown",
          userEmail: userData?.email || "",
          size: image.size ? `${Math.round(image.size / 1024)} KB` : "",
          // Include full MongoDB objects for the view if needed
          user: userData,
          museum: museumData,
          exhibition: null, // Exhibition not stored as full object
          //Social
          likes: image.likeCount || 0,
          isLiked: image.likedBy?.includes(user._id) || false,
        };
      });

      const userGalleryMap = new Map<string, UserGallery>();

      for (const image of images) {
        const userId = image.user?._id || "unknown-user";
        const userName = image.user
          ? `${image.user.firstName} ${image.user.lastName}`.trim()
          : image.userName || "Unknown user";
        const userEmail = image.user?.email || "";

        const existingGallery = userGalleryMap.get(userId);
        if (existingGallery) {
          existingGallery.images.push(image);
        } else {
          userGalleryMap.set(userId, {
            userId,
            userName,
            userEmail,
            images: [image],
          });
        }
      }

      const userGalleries = Array.from(userGalleryMap.values()).sort((left, right) =>
        left.userName.localeCompare(right.userName)
      );

      return h.view("galleries-view", {
        title: "Museum Gallery",
        images,
        userGalleries,
        museums,
        exhibitions,
        user,
        isAdmin,
        allUsers
      });
    },
  },

  sendPostcard: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    
      const payload = request.payload as any;
      const recipientEmail = payload.recipientEmail;
      const imageId = request.params.id;
    
      try {
        // Get the image from MongoDB (has denormalized data)
        const foundImage = await db.imageStore!.getImageByPublicId(imageId);
        
        if (!foundImage) {
          console.error("Image not found in MongoDB");
          return h.redirect("/galleries");
        }

        // Get user data for email
        let userData = null;
        if (foundImage.userId) {
          userData = await db.userStore!.getUserById(foundImage.userId);
        }
        
        // Build email content with denormalized data from the image document
        const senderName = userData ? `${userData.firstName} ${userData.lastName}` : foundImage.userName || "A museum visitor";
        const museumTitle = foundImage.museumTitle || "Museum";
        const exhibitionTitle = foundImage.exhibitionTitle || "Exhibition";
        
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: recipientEmail,
          subject: `A Postcard from ${museumTitle}`,
          html: `
            <h1>Someone sent you a postcard!</h1>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Museum:</strong> ${museumTitle}</p>
            <p><strong>Exhibition:</strong> ${exhibitionTitle}</p>
            <img src="${foundImage.url}" alt="Postcard" style="max-width: 500px; margin: 20px 0;">
            <p>Visit us at the museum!</p>
          `,
        });
      } catch (error) {
        console.error("Email error:", error);
      }
    
      return h.redirect("/galleries");
    }
  },

  likeImage: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const imageId = request.params.id; // from /galleries/like/{id}

      // Check if already liked to toggle (Optional but better UX)
      const alreadyLiked = await db.imageStore.isLikedByUser(imageId, user._id);
      
      if (alreadyLiked) {
        await db.imageStore.unlikeImage(imageId, user._id);
      } else {
        await db.imageStore.likeImage(imageId, user._id);
      }

      return h.redirect("/galleries");
    }
  },
};
