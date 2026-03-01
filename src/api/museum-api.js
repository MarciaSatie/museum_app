import Boom from "@hapi/boom";
import { db } from "../models/db.js";


export const museumApi = {
    find: {
        auth: false, // no authentication required. Anyone can access this endpoint without logging in
        handler: async function(request, h) {
            try {
                const museums = await db.museumStore.getAllMuseums();
                return museums;
            } catch (err) {
                console.log("Error details:", err);  // ADD THIS LINE
                return Boom.serverUnavailable("Database Error");
              }
        },
    },
};