import { v4 } from "uuid";
import { ImageModel, type ImageType } from "./image";

const normalizeImage = (image: any): ImageType | null => {
  if (image && image._id) {
    return { ...image, _id: String(image._id) };
  }
  return image;
};

export const imageMongoStore = {
  async getAllImages(): Promise<ImageType[]> {
    const images = await ImageModel.find().lean();
    return images.map((img) => normalizeImage(img) as ImageType);
  },

  async getImagesByUserId(userId: string): Promise<ImageType[]> {
    const images = await ImageModel.find({ userId }).lean();
    return images.map((img) => normalizeImage(img) as ImageType);
  },

  async getImagesByMuseumId(museumId: string): Promise<ImageType[]> {
    const images = await ImageModel.find({ museum: museumId }).lean();
    return images.map((img) => normalizeImage(img) as ImageType);
  },

  async getImagesByExhibitionId(exhibitionId: string): Promise<ImageType[]> {
    const images = await ImageModel.find({ exhibitionId }).lean();
    return images.map((img) => normalizeImage(img) as ImageType);
  },

  async getImageByPublicId(publicId: string): Promise<ImageType | null> {
    try {
      const image = await ImageModel.findOne({ publicId }).lean();
      return normalizeImage(image);
    } catch (error) {
      return null;
    }
  },

  async addImage(image: ImageType): Promise<ImageType | null> {
    try {
      const data = { 
        ...image, 
        _id: image._id || v4(),
        uploadDate: image.uploadDate || new Date()
      };
      console.log("Adding image to MongoDB with data:", JSON.stringify(data));
      
      const newImage = new ImageModel(data);
      const savedImage = await newImage.save();
      
      console.log("Image saved successfully:", savedImage._id);
      return normalizeImage(savedImage.toObject());
    } catch (error: any) {
      console.error("❌ Error adding image to MongoDB:", error.message);
      console.error("Error details:", error);
      throw error; // Re-throw to let the controller handle it
    }
  },

  async deleteImageByPublicId(publicId: string): Promise<void> {
    try {
      await ImageModel.deleteOne({ publicId });
    } catch (error) {
      console.log("Error deleting image");
    }
  },

  async deleteImagesByUserId(userId: string): Promise<void> {
    try {
      await ImageModel.deleteMany({ userId });
    } catch (error) {
      console.log("Error deleting user images");
    }
  },

  async deleteImagesByMuseumId(museumId: string): Promise<void> {
    try {
      await ImageModel.deleteMany({ museumId });
    } catch (error) {
      console.log("Error deleting museum images");
    }
  },

  async deleteAllImages(): Promise<void> {
    await ImageModel.deleteMany({});
  },
};
