import jwt from "jsonwebtoken";
import { db } from "../models/db";

// 1. Define interfaces for better IDE autocomplete and safety
export interface UserPayload {
  id: string;
  email: string;
}

export interface User {
  _id: string;
  email: string;
  password?: string
}

export function createToken(user: User): string {
  const payload: UserPayload = {
    id: user._id,
    email: user.email,
  };
  
  const options: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: "1h",
  };

  // Use a fallback or type assertion for the secret
  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
}

// 2. Use a partial type because decoding might fail
export function decodeToken(token: string): Partial<UserPayload> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (e: any) {
    console.log(e.message);
    return {};
  }
}

// 3. Type the validation function for your auth strategy
export async function validate(decoded: UserPayload, request: any) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
