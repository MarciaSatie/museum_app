import mongoose from "mongoose";

const museumSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    userid: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    categoryId: {
      type: String,
      default: null,
      index: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    museumVisitCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Museum = mongoose.model("Museum", museumSchema);