import mongoose, { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, },
    firstName: { type: String, required: true, },
    lastName: { type: String, required: true, },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
    password: { type: String, required: true, },
    role: { type: String, enum: ["user", "admin"], default: "user", },
  },
  { timestamps: true }
);

// MAGIC LINE: This creates the TypeScript interface automatically from the Schema above
export type UserType = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model("User", userSchema);
