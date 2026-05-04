import Boom from "@hapi/boom";
import Joi from "joi";
import { Request, ResponseToolkit, ResponseObject } from "@hapi/hapi";
import { db } from "../models/db";

// Define the shape of a Category for your store
interface Category {
  _id?: string;
  name: string;
  description?: string;
  location: string;
}

export const categoryApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Category[] | Boom.Boom> {
      try {
        const categories = await db.categoryStore.getAllCategories();
        return categories;
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<Category | Boom.Boom> {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        if (!category) return Boom.notFound("No Category with this id");
        return category;
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
        const categoryPayload = request.payload as Category;
        const category = await db.categoryStore.addCategory(categoryPayload);
        return h.response(category).code(201);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        location: Joi.string().required(),
      }),
      failAction: (request: Request, h: ResponseToolkit, err: Error) => {
         throw err; // Proper error handling for Joi validation in TS
      },
    },
  },

  update: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        const categoryPayload = request.payload as Category;
        const category = await db.categoryStore.updateCategory({ 
          ...categoryPayload, 
          _id: request.params.id 
        });
        if (!category) return Boom.notFound("Category not found");
        return h.response(category).code(200);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    validate: {
      payload: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow("").optional(),
        location: Joi.string().required(),
      }),
    },
  },

  delete: {
    auth: { strategy: "jwt" },
    handler: async function (request: Request, h: ResponseToolkit): Promise<ResponseObject | Boom.Boom> {
      try {
        await db.categoryStore.deleteCategoryById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        console.error("Error details:", err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
