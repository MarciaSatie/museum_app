import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const imageSchema = new Schema(
  {
    _id: { type: String },
    publicId: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: "" }, // Image filename/identifier
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true }, // Denormalized from user
    museum: { type: String, required: true, index: true }, // Museum ID
    museumTitle: { type: String, required: true }, // Denormalized from museum
    exhibitionTitle: { type: String, required: true }, // Denormalized from exhibition
    url: { type: String, required: true },
    date: { type: String, default: "" }, // Formatted date string
    size: { type: Number, default: 0 },
    uploadDate: { type: Date, default: () => new Date() },
    likeCount: { type: Number, default: 0 }, // Total number of likes
    likedBy: { type: [String], default: [] }, // Array of user IDs who liked
  },
  { timestamps: true }
);

// MAGIC LINE: This creates the TypeScript interface automatically from the Schema above
export type ImageType = InferSchemaType<typeof imageSchema>;

export const ImageModel = model("Image", imageSchema);
