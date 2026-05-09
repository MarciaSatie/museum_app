import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { imageStore } from "../models/cloudinary";
import { db } from "../models/db"; 
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
  comments?: any[];
}

export const galleriesController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";
      
      const museums = await db.museumStore!.getAllMuseums();
      const exhibitions = await db.exhibitionStore!.getAllExhibitions();
      const allUsers = await db.userStore!.getAllUsers();
      const mongoImages = await db.imageStore!.getAllImages();
      
      const userMap = new Map<string, UserType>(allUsers.map((u: UserType) => [u._id!, u]));
      const museumMap = new Map<string, MuseumType>(museums.map((m: MuseumType) => [m._id!, m]));

      // 1. Properly map the images
      const images: EnrichedImage[] = mongoImages.map((image: any) => {
        const userData = image.userId ? userMap.get(image.userId) ?? null : null;
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
          user: userData,
          museum: image.museum ? museumMap.get(image.museum) ?? null : null,
          exhibition: null,
          likes: image.likeCount || 0,
          isLiked: image.likedBy?.includes(user._id) || false,
        };
      });

      // 2. Build User Gallery Map (Same as your code)
      const userGalleryMap = new Map<string, UserGallery>();
      for (const image of images) {
        const userId = image.user?._id || "unknown-user";
        const existingGallery = userGalleryMap.get(userId);
        if (existingGallery) {
          existingGallery.images.push(image);
        } else {
          userGalleryMap.set(userId, {
            userId,
            userName: image.user ? `${image.user.firstName} ${image.user.lastName}` : image.userName,
            userEmail: image.user?.email || "",
            images: [image],
            comments: [],
          });
        }
      }

      // 3. FETCH COMMENTS HERE (Outside the map)
      // Since this is the general galleries page, we get all social posts
      const comments = await db.socialStore!.getAllComments();

      // Format comment dates for display (concise, locale-aware)
      comments.forEach((c: any) => {
        try {
          const date = c.createdAt ? new Date(c.createdAt) : new Date();
          c.displayDate = date.toLocaleString("en-IE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (e) {
          c.displayDate = String(c.createdAt || "");
        }
      });

      // Attach comments to the matching user gallery (by galleryOwnerId)
      for (const g of Array.from(userGalleryMap.values())) {
        const userComments = comments.filter((c: any) => String(c.galleryOwnerId) === String(g.userId));
        g.comments = userComments;
      }

      // 4. FINALLY RENDER
      return h.view("galleries-view", {
        title: "Museum Gallery",
        images,
        userGalleries: Array.from(userGalleryMap.values()),
        museums,
        exhibitions,
        user,
        isAdmin,
        allUsers,
        allComments: comments // Now Handlebars can see the comments!
      });
    },
  },

  leaveComment: {
    handler: async function (request: Request, h: ResponseToolkit) {
    const user = request.auth.credentials as any;
    const { userText, galleryOwnerId } = request.payload as any;

    console.log("📝 Form text received:", userText);
    console.log("👤 Posted by user:", user?._id);
    console.log("🎯 Target gallery owner id:", galleryOwnerId);

    // Validate input
    if (!userText || userText.trim().length === 0) {
        console.log("❌ Empty text submitted, ignoring");
        return h.redirect("/galleries");
    }

    try {
        // 1. Prepare the data object
        const commentPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        comment: userText,
        like: 0,
        dislike: 0
        };
        // Associate the comment with the target gallery owner (from the form)
        const ownerIdToUse = galleryOwnerId || (user && user._id);
        if (ownerIdToUse) {
          (commentPayload as any).galleryOwnerId = ownerIdToUse;
        }
        // 2. Saving at sociala db (social-mongo-store)
        await db.socialStore.addComment(commentPayload);
        
        console.log("✅ Comment saved to MongoDB!");
        return h.redirect("/galleries");
    } catch (error: any) {
        console.error("❌ Error saving comment:", error.message);
        return h.redirect("/galleries");
    }
    
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
