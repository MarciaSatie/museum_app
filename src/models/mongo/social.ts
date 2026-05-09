import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const socialSchema = new Schema(
  {
    // Use String here because users in this app use string _id (UUID or custom string)
    galleryOwnerId: { type: String, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    comment: { type: String, required: true },
    like: { type: Number, default: 0 },
    dislike: { type: Number, default: 0 },
    likedList: { type: [String], default: [] },
    dislikedList: { type: [String], default: [] },
  },
  { timestamps: true }
);
  

export type SocialType = InferSchemaType<typeof socialSchema>;
export const SocialModel = model("Social", socialSchema);
