import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const exhibitionSchema = new Schema(
  {
    _id: { type: String },
    museumid: { type: String, required: true, index: true },
    title: { type: String, required: true },
    artist: { type: String, default: "" },
    duration: { type: String, default: "" }, // Define it once here
    description: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
  },
  { timestamps: true }
);

// MAGIC LINE: This creates the TypeScript interface automatically from the Schema above
export type ExhibitionType = InferSchemaType<typeof exhibitionSchema>;

export const ExhibitionModel = model("Exhibition", exhibitionSchema);
