import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import Joi from "joi";

export const museumApi = {
  find: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const museums = await db.museumStore.getAllMuseums();
        return museums;
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const museum = await db.museumStore.getMuseumById(request.params.id);
        if (!museum) return Boom.notFound("Museum not found");
        return museum;
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  create: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const museum = await db.museumStore.addMuseum(request.payload);
        return h.response(museum).code(201);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }),
    },
  },

  delete: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const museum = await db.museumStore.deleteMuseumById(request.params.id);
        return h.response(museum).code(201);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  update: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const museum = await db.museumStore.updateMuseumById(request.params.id, request.payload);
        if (!museum) return Boom.notFound("Museum not found");
        return h.response(museum).code(200);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      }),
    },
  },



};