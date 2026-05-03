import mongoose from "mongoose";

const exhibitionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    museumid: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Exhibition = mongoose.model("Exhibition", exhibitionSchema);