import { createToken } from "./jwt-utils.js";
import Boom from "@hapi/boom"; //imports standardized HTTP error helpers.
import { db } from "../models/db.js";

export const userApi = {

  authenticate: {
    auth: {
      strategy: "jwt",
    },

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
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
}