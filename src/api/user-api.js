import Boom from "@hapi/boom";
import { createToken } from "./jwt-utils.js";
import { db } from "../models/db.js";
import { JwtAuth, UserCredentialsSpec } from "../models/joi-schemas.js";

export const userApi = {

  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }
        if (user.password !== request.payload.password) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        console.log("➡️➡️➡️ JWT token:", token);
        
        return h.response({ success: true, token: token }).code(201);

      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api", "users"],
    description: "Authenticate user and return JWT token",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { payload: UserCredentialsSpec, failAction: "error" },
    response: { schema: JwtAuth, failAction: "error" }
  },
}