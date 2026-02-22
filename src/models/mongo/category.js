import mongoose from "mongoose";

// creating a new schema
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description:{ type:String, request: false},
  createdAt: Date,// auto generated timestamp    
  updatedAt: Date 
}, { timestamps: true });

export const Category = mongoose.model("Category", schema);