import * as cloudinary from "cloudinary";
import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};
cloudinary.config(credentials);

export const imageStore = {

  getAllImages: async function() {
    const result = await cloudinary.v2.api.resources();
    return result.resources;
  },

  uploadImageCloudinary: async function(imagePath) {
    try{
      const response = await cloudinary.v2.uploader.upload(imagePath);
      return response.url;
    }catch(err){console.log(`UPLOAD ERROR: ${err}`)}
  },

  deleteImage: async function(img) {
    await cloudinary.v2.uploader.destroy(img, {});
  }
};
