import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Bell from "@hapi/bell";
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
      password:"secret",
      role: "admin",
    },
    {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secret",
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

async function init(options: any = {}) {
  const port = options.port ?? process.env.PORT ?? 3000;
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost",
  });
  const resolvePublicUrl = (request: any) => {
    const forwardedProto = request.headers["x-forwarded-proto"];
    const forwardedHost = request.headers["x-forwarded-host"];
    const host = forwardedHost || request.info.host;
    const protocol = forwardedProto || request.server.info.protocol || "http";
    const result =
      process.env.APP_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `${protocol}://${host}`;

    // Temporary debug logging to help diagnose redirect_uri issues on Render
    try {
      console.log("[auth-debug] resolvePublicUrl computed:", {
        forwardedProto,
        forwardedHost,
        host,
        protocol,
        result,
      });
    } catch (err) {
      // swallow logging errors
    }

    return result;
  };

  // Register plugins
  await server.register([
    jwt,
    Cookie,
    Bell,
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

  // ==========================================
  // ✨ AUTH STRATEGY ✨
  // ==========================================
  
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name || "session",
      password: process.env.cookie_password || "secret-password-must-be-32-chars-long",
      isSecure: false,      
      isSameSite: "Lax",    
    },
    redirectTo: "/",
    validate: (accountsController as any).validate,
  });
  server.auth.default("session");

  // ==========================================
  // ✨ AUTH0 AUTH STRATEGY ✨
  // ==========================================
  server.auth.strategy("auth0", "bell", {
    provider: "auth0",
    config: {
      domain: process.env.AUTH0_DOMAIN
    },
    providerParams: {
      scope: "openid profile email"
    },
    password: process.env.cookie_password || "secret-password-must-be-32-chars-long",
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    isSecure: false, 
    location: (request: any) => `${resolvePublicUrl(request)}/login-auth0`,
    forceHttps: process.env.NODE_ENV === "production"
  });


  // ==========================================
  // ✨ GITHUB AUTH STRATEGY ✨
  // ==========================================
  server.auth.strategy("github", "bell", {
    provider: "github",
    providerParams: {
      scope: "user:email" 
    },
    password: process.env.cookie_password || "secret-password-must-be-32-chars-long",
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    isSecure: false, 
    location: (request: any) => `${resolvePublicUrl(request)}/callback`,
    forceHttps: process.env.NODE_ENV === "production"
  });


  // ==========================================
  // ✨ JWT STRATEGY ✨
  // ==========================================
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

  // Temporary debug routes for OAuth troubleshooting (remove in production)
  server.route([
    {
      method: "GET",
      path: "/auth-debug",
      handler: (request: any, h: any) => {
        return h.response({
          publicUrl: resolvePublicUrl(request),
          headers: {
            host: request.info.host,
            forwardedProto: request.headers["x-forwarded-proto"],
            forwardedHost: request.headers["x-forwarded-host"],
          },
        });
      },
    },
    {
      method: ["GET", "POST"],
      path: "/debug/auth0-callback",
      options: {
        auth: { strategy: "auth0", mode: "try" },
        handler: (request: any, h: any) => {
          if (!request.auth || !request.auth.isAuthenticated) {
            return h.response({ error: request.auth?.error?.message, credentials: request.auth?.credentials }).code(401);
          }
          return h.response({ credentials: request.auth.credentials });
        },
      },
    },
    {
      method: ["GET", "POST"],
      path: "/debug/github-callback",
      options: {
        auth: { strategy: "github", mode: "try" },
        handler: (request: any, h: any) => {
          if (!request.auth || !request.auth.isAuthenticated) {
            return h.response({ error: request.auth?.error?.message, credentials: request.auth?.credentials }).code(401);
          }
          return h.response({ credentials: request.auth.credentials });
        },
      },
    },
  ] as any);
  
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
