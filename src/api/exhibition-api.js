import Boom from "@hapi/boom";
import Joi from "joi";
import { db } from "../models/db.js";

export const exhibitionApi = {
  find: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const exhibitions = await db.exhibitionStore.getAllExhibitions();
        return exhibitions;
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
        const exhibition = await db.exhibitionStore.getExhibitionById(request.params.id);
        if (!exhibition) return Boom.notFound("Exhibition not found");
        return exhibition;
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findByMuseum: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(request.params.museumId);
        return exhibitions;
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
        const exhibition = await db.exhibitionStore.addExhibition(request.params.museumId, request.payload);
        return h.response(exhibition).code(201);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        title: Joi.string().required(),
        artist: Joi.string().required(),
        duration: Joi.number().required(),
      }),
    },
  },

  update: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        const exhibition = await db.exhibitionStore.updateExhibition({ ...request.payload, _id: request.params.id });
        if (!exhibition) return Boom.notFound("Exhibition not found");
        return h.response(exhibition).code(200);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        title: Joi.string().required(),
        artist: Joi.string().required(),
        duration: Joi.number().required(),
      }),
    },
  },

  delete: {
    auth: {
      strategy: "jwt",
    },

    handler: async function(request, h) {
      try {
        await db.exhibitionStore.deleteExhibition(request.params.id);
        return h.response().code(204);
      } catch (err) {
        console.log("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
