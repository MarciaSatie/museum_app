import mongoose from "mongoose";

// creating a new schema
const schema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: { type: String, required: true },
  location: { type: String, required: true },
  description:{ type:String, required: false},
  createdAt: Date,// auto generated timestamp    
  updatedAt: Date 
}, { timestamps: true });

export const Category = mongoose.model("Category", schema);