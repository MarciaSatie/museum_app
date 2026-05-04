import Boom from "@hapi/boom";
import Joi from "joi";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { db } from "../models/db";

// 1. Define the Exhibition interface
export interface Exhibition {
  _id?: string;
  title: string;
  artist: string;
  duration: number;
  museumId?: string;
}

export const exhibitionApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Exhibition[] | Boom.Boom> {
      try {
        const exhibitions = await db.exhibitionStore.getAllExhibitions();
        return exhibitions;
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Exhibition | Boom.Boom> {
      try {
        const exhibition = await db.exhibitionStore.getExhibitionById(request.params.id);
        if (!exhibition) return Boom.notFound("Exhibition not found");
        return exhibition;
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findByMuseum: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Exhibition[] | Boom.Boom> {
      try {
        const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(request.params.museumId);
        return exhibitions;
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
        const exhibitionPayload = request.payload as Exhibition;
        const exhibition = await db.exhibitionStore.addExhibition(request.params.museumId, exhibitionPayload);
        return h.response(exhibition).code(201);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        title: Joi.string().required(),
        artist: Joi.string().required(),
        duration: Joi.number().required(),
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
        const exhibitionPayload = request.payload as Exhibition;
        const exhibition = await db.exhibitionStore.updateExhibition({ 
          ...exhibitionPayload, 
          _id: request.params.id 
        });
        if (!exhibition) return Boom.notFound("Exhibition not found");
        return h.response(exhibition).code(200);
      } catch (err) {
        console.error("Error details:", err);
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
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        await db.exhibitionStore.deleteExhibition(request.params.id);
        return h.response().code(204);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
