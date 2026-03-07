import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import Inert from "@hapi/inert";
import HapiSwagger from "hapi-swagger";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { userJsonStore } from "./models/json/user-json-store.js";
import { apiRoutes } from "./api-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Helper: Migrate existing JSON users to MongoDB on first run
async function migrateUsersToMongo() {
  try {
    const usersInMongo = await db.userStore.getAllUsers();

    // If users already exist in MongoDB, skip migration
    if (usersInMongo && usersInMongo.length > 0) {
      console.log(`✅ MongoDB already has ${usersInMongo.length} users - skipping migration`);
      return;
    }

    // Get users from JSON (not used anymore)
    const usersInJSON = await userJsonStore.getAllUsers();

    if (usersInJSON && usersInJSON.length > 0) {
      console.log(`⏳ Migrating ${usersInJSON.length} users from JSON to MongoDB...`);

      await Promise.all(
        usersInJSON.map(async (user) => {
          try {
            await db.userStore.addUser(user);
          } catch (error) {
            // Skip if user already exists (unique email constraint)
            console.log(`⚠️ Skipped user ${user.email}: ${error.message}`);
          }
        })
      );

      console.log("✅ Successfully migrated users to MongoDB!");
    }
  } catch (error) {
    console.log(`⚠️ Migration note: ${error.message}`);
  }
}

async function init(options = {}) {
  const port = options.port ?? process.env.PORT ?? 3000;
  const server = Hapi.server({
    port,
  });

  // Swagger configuration
  const swaggerOptions = {
    info: {
      title: "Museum API Documentation",
      version: "0.4.0",
      description: "API for managing museums, categories, and exhibitions",
    },
    grouping: "tags",
    securityDefinitions: {
      jwt: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  await server.register(Cookie);
  server.validator(Joi);

  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: false,
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.default("session");

  // Log errors to console for debugging
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response && response.isBoom) {
      console.error("Route error:", response);
    }
    return h.continue;
  });

  // initialize DB - Choose storage mode:
  // db.init("memory");  // All data in RAM (fastest, lost on restart)
  // db.init("mongo");   // Users + Categories in MongoDB, Museums/Exhibitions in JSON
  db.init();            // Default: Users + Categories in MongoDB, Museums/Exhibitions in JSON
  
  // Migrate existing JSON users to MongoDB on first run
  await migrateUsersToMongo();

  server.route(webRoutes);
  server.route(apiRoutes);
  await server.start();
  console.log("Server running on %s", server.info.uri);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

export { init };

// Only start if this file is run directly (not imported)
// In ES modules, we check if this is the main module
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  init();
}
