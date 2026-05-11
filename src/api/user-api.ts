import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { createToken, User } from "./jwt-utils"; // Import User interface from your utility
import { db } from "../models/db";
import { JwtAuth, UserCredentialsSpec } from "../models/joi-schemas";

export const userApi = {
  authenticate: {
    auth: false,
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        const payload = request.payload as any; // Using any here because validation happens in Joi
        const user: User | null = await db.userStore.getUserByEmail(payload.email);

        if (!user) {
          return Boom.unauthorized("User not found");
        }
        const passwordMatches = await bcrypt.compare(payload.password, user.password || "");
        if (!passwordMatches) {
          return Boom.unauthorized("Invalid password");
        }

        const token = createToken(user);
        console.log("➡️➡️➡️ JWT token generated successfully");
        
        return h.response({ success: true, token: token }).code(201);

      } catch (err) {
        console.error("Auth Error:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api", "users"],
    description: "Authenticate user and return JWT token",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { 
      payload: UserCredentialsSpec, 
      failAction: (request: Request, h: ResponseToolkit, err: Error) => {
        throw err;
      } 
    },
    response: { 
      schema: JwtAuth, 
      failAction: "error" 
    }
  },
};
