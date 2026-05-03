
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { imageStore } from "../models/cloudinary.js";
import { db } from "../models/db.js";

dotenv.config();

export const galleriesController = {
  index: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const images = (await imageStore.getAllImages()).map((image) => ({
        id: image.public_id,
        image: image.public_id.split("/").pop(),
        url: image.secure_url || image.url,
        museumTitle: image.context?.custom?.museumTitle || "Unknown museum",
        exhibitionTitle: image.context?.custom?.exhibitionTitle || "Unknown exhibition",
        date: image.created_at ? new Date(image.created_at).toLocaleDateString("de-DE") : "",
        userName: image.context?.custom?.userName || "Unknown",
        size: image.bytes ? `${Math.round(image.bytes / 1024)} KB` : "",
      }));
      const museums = await db.museumStore.getAllMuseums();
      const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId();

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
    
      const images = await imageStore.getAllImages();
      const foundImage = images.find((image) => image.public_id === imageId);
      const imageUrl = foundImage?.secure_url || foundImage?.url || "";
    
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


