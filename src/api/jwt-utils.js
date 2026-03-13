/* JWT (JSON Web Token) is a compact, URL-safe token format 
 It was used at:
- In src/api/jwt-utils.js: for creating, decoding, and validating JWT tokens.
- In src/server.js: to set up JWT authentication with hapi-auth-jwt2.
- In src/api/user-api.js: to authenticate users and return a JWT token.
- In src/models/joi-schemas.js: to define the schema for JWT responses.
*/


import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../models/db.js";

const result = dotenv.config();

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, process.env.cookie_password, options);
}

export function decodeToken(token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, process.env.cookie_password);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
