import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { imageStore } from "../models/cloudinary"; // Removed .js
import { db } from "../models/db"; // Removed .js

dotenv.config();

export const galleriesController = {
  index: {
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const isAdmin = user && user.role === "admin";
      
      // Map Cloudinary resources to your view format
      const rawImages = await imageStore.getAllImages();
      const images = rawImages.map((image: any) => ({
        id: image.public_id,
        image: image.public_id.split("/").pop(),
        url: image.secure_url || image.url,
        museumTitle: image.context?.custom?.museumTitle || "Unknown museum",
        exhibitionTitle: image.context?.custom?.exhibitionTitle || "Unknown exhibition",
        date: image.created_at ? new Date(image.created_at).toLocaleDateString("de-DE") : "",
        userName: image.context?.custom?.userName || "Unknown",
        size: image.bytes ? `${Math.round(image.bytes / 1024)} KB` : "",
      }));

      const museums = await db.museumStore!.getAllMuseums();
      const exhibitions = await db.exhibitionStore!.getExhibitionsByMuseumId("");

      return h.view("galleries-view", {
        title: "Museum Gallery",
        images,
        museums,
        exhibitions,
        user,
        isAdmin
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
    
      const images = await imageStore.getAllImages();
      const foundImage = images.find((image: any) => image.public_id === imageId);
      const imageUrl = foundImage?.secure_url || foundImage?.url || "";
    
      try {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: recipientEmail,
          subject: "A Postcard from the Museum Gallery",
          html: `<h1>Someone sent you a postcard!</h1><img src="${imageUrl}" alt="Postcard">`,
        });
      } catch (error) {
        console.error("Email error:", error);
      }
    
      return h.redirect("/galleries");
    }
  },
};
