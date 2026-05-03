import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

cloudinary.config(credentials);

export const imageStore = {
  // Returns an array of resources from Cloudinary
  getAllImages: async function(): Promise<any[]> {
    const result = await cloudinary.api.resources();
    return result.resources;
  },

  // Uploads a file and returns the URL string
  uploadImageCloudinary: async function(imagePath: string, options = {}): Promise<string | undefined> {
    try {
      const response = await cloudinary.uploader.upload(imagePath, options);
      return response.url;
    } catch (err) {
      console.log(`UPLOAD ERROR: ${err}`);
      return undefined;
    }
  },

  // Deletes an image by its public ID
  deleteImage: async function(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {});
    } catch (err) {
      console.log(`DELETE ERROR: ${err}`);
    }
  }
};
