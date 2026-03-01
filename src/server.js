import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { userJsonStore } from "./models/json/user-json-store.js";

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

    // Get users from JSON
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

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  await server.register(Vision);
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

  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});



init();
