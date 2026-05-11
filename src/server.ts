import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import Inert from "@hapi/inert";
import HapiSwagger from "hapi-swagger";
import path from "path";
import Joi from "joi";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import * as jwt from "hapi-auth-jwt2";
import { webRoutes } from "./web-routes";
import { db } from "./models/db";
import { accountsController } from "./controllers/accounts-controller";
import { apiRoutes } from "./api-routes";
import { validate } from "./api/jwt-utils";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrapDevelopmentUsers() {
  const shouldBootstrap = process.env.NODE_ENV !== "production" && process.env.BOOTSTRAP_DEV_USERS !== "false";

  if (!shouldBootstrap) return;

  const defaultUsers = [
    {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: process.env.DEV_HOMER_PASSWORD || "secret",
      role: "admin",
    },
    {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: process.env.DEV_MARGE_PASSWORD || "secret",
      role: "admin",
    },
  ];

  for (const user of defaultUsers) {
    // Use '!' because we know db.init() has been called by now
    const existing = await db.userStore!.getUserByEmail(user.email);
    const passwordMatches = existing ? await bcrypt.compare(user.password, existing.password || "") : false;

    if (!existing) {
      await db.userStore!.addUser(user as any);
      console.log(`Created development user: ${user.email}`);
    } else if (existing.role !== "admin" || !passwordMatches) {
      await db.userStore!.updateUser({ ...existing, password: user.password, role: "admin" });
      console.log(`Refreshed development user: ${user.email}`);
    }
  }
}

// Add ': any' to options so TypeScript doesn't complain about empty objects
async function init(options: any = {}) {
  const port = options.port ?? process.env.PORT ?? 3000;
  const server = Hapi.server({
    port,
  });

  // Register plugins
  // Register plugins
  await server.register([
    jwt,
    Cookie,
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: {
        info: {
          title: "Museum API Documentation",
          version: "0.4.0",
          description: "API for managing museums, categories, and exhibitions",
        },
        documentationPath: "/documentation",
        auth: false,
        grouping: "tags",
        securityDefinitions: {
          jwt: { type: "apiKey", name: "Authorization", in: "header" },
        },
        security: [{ jwt: [] }],
      },
    },
  ] as any); // <--- Add 'as any' here


  server.validator(Joi);

  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("json", (context) => JSON.stringify(context));
  Handlebars.registerHelper("lookup", (obj, field) => obj && obj[field]);

  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });
  
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name || "session",
      password: process.env.cookie_password || "secret-password-must-be-32-chars-long",
      isSecure: false,
    },
    redirectTo: "/",
    validate: (accountsController as any).validate,
  });
  server.auth.default("session");

  server.auth.strategy("jwt", "jwt", {
    key: process.env.JWT_SECRET || "secret",
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] }
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request as any;
    if (response && response.isBoom) {
      console.error("Route error:", response);
    }
    return h.continue;
  });

  // Initialize DB first
  await db.init("mongo");

  // Then bootstrap users
  await bootstrapDevelopmentUsers();

  server.route(webRoutes as any);
  server.route(apiRoutes as any);
  
  await server.start();
  console.log("Server running on %s", server.info.uri);
  return server;
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

export { init };

// Check if file is run directly
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1] === currentFilePath || process.argv[1].endsWith("server.ts"))) {
  init();
}
