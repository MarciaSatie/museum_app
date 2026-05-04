import Boom from "@hapi/boom";
import Joi from "joi";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { db } from "../models/db.js";

// 1. Define the Museum interface
export interface Museum {
  _id?: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  userid?: string; // Links museum to the creator
}

export const museumApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Museum[] | Boom.Boom> {
      try {
        const museums = await db.museumStore.getAllMuseums();
        return museums;
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Museum | Boom.Boom> {
      try {
        const museum = await db.museumStore.getMuseumById(request.params.id);
        if (!museum) return Boom.notFound("Museum not found");
        return museum;
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  create: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        // request.auth.credentials comes from your jwt-utils validate function
        const ownerId = (request.auth.credentials as any)?._id;
        const museumPayload = request.payload as Museum;
        
        const museum = await db.museumStore.addMuseum({
          ...museumPayload,
          userid: ownerId,
        });
        return h.response(museum).code(201);
      } catch (err) {
        console.error("Error details:", err);
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
      failAction: (request: Request, h: ResponseToolkit, err: Error) => {
        throw err;
      },
    },
  },

  update: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        const museumPayload = request.payload as Museum;
        const museum = await db.museumStore.updateMuseumById(request.params.id, museumPayload);
        if (!museum) return Boom.notFound("Museum not found");
        return h.response(museum).code(200);
      } catch (err) {
        console.error("Error details:", err);
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
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        const museum = await db.museumStore.deleteMuseumById(request.params.id);
        // Note: Your original code used .code(201) here, usually delete is 204 or 200
        return h.response(museum).code(201);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
