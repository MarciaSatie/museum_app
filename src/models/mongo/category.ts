import mongoose, { Schema, model, InferSchemaType } from "mongoose";

// creating a new schema
const schema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed },
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: false },
  createdAt: Date, // auto generated timestamp
  updatedAt: Date,
}, { timestamps: true });

// MAGIC LINE: This creates the TypeScript interface automatically from the Schema above
export type CategoryType = InferSchemaType<typeof schema>;
export const CategoryModel = mongoose.model("Category", schema);