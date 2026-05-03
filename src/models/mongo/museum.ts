import mongoose, { Schema, model, InferSchemaType } from "mongoose";
import { MuseumInterface} from "../types"
const museumSchema = new mongoose.Schema<MuseumInterface>(
  {
    _id: { type: String,},
    userid: { type: String, required: true, index: true,},
    title: { type: String, required: true,},
    description: { type: String, default: "",},
    categoryId: {type: String, default: null, index: true,},
    latitude: { type: Number, default: null,},
    longitude: { type: Number, default: null,},
    museumVisitCount: { type: Number, default: 0,},
  },
  { timestamps: true }
);
// This automatically creates the Museum type
export type MuseumType = InferSchemaType<typeof museumSchema>;
export const MuseumModel = mongoose.model("Museum", museumSchema);