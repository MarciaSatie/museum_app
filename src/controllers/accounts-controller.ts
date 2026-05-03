import { default as Joi } from "joi";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas"; 
import { db } from "../models/db";

// Add this interface to "teach" TypeScript about CookieAuth
interface CookieRequest extends Request {
  cookieAuth: {
    set: (data: any) => void;
    clear: () => void;
  };
}

const UserSettingsSpec = {
  firstName: UserSpec.extract("firstName"),
  lastName: UserSpec.extract("lastName"),
  email: UserSpec.extract("email"),
};

export const accountsController = {
  index: {
    auth: false,
     handler: function (request: Request, h: ResponseToolkit) {
      return h.view("main", { title: "Welcome to Playlist" });
    },
  },
  showSignup: {
    auth: false,
     handler: function (request: Request, h: ResponseToolkit) {
      return h.view("signup-view", { title: "Sign up for Playlist" });
    },
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request: Request, h: ResponseToolkit, error: any) {
        return h.view("signup-view", { 
          title: "Sign up error", 
          errors: error.details 
        }).takeover().code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit)  {
      const user = { ...request.payload as any };
      console.log("📝 Signup attempt:", user.email);
      try {
        const existingUsers = await db.userStore.getAllUsers();
        if (!existingUsers || existingUsers.length === 0) {
          user.role = "admin";
          console.log("🛡️ First registered user promoted to admin:", user.email);
        }
        const newUser = await db.userStore.addUser(user);
        console.log("✅ User created:", newUser ? newUser.email : "null");
        return h.redirect("/");
      } catch (error: any) {
        console.error("❌ Signup error:", error.message);
        return h.view("signup-view", { 
          title: "Sign up error", 
          errors: [{ message: error.message }] 
        }).takeover().code(400);
      }
    },
  },
  showLogin: {
    auth: false,
     handler: function (request: Request, h: ResponseToolkit) {
      return h.view("login-view", { title: "Login to Playlist" });
    },
  },
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      // 1. Add types to failAction
      failAction: function (request: CookieRequest, h: ResponseToolkit, error: any) {
        console.log("❌ Login validation failed:", error.details);
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request: CookieRequest, h: ResponseToolkit) {
      // 1. Get the data from the form
      const { email, password } = request.payload as any;
      
      // 2. Find the user in the DB
      const user = await db.userStore!.getUserByEmail(email);
      
      // 3. If no user or wrong password, stop here
      if (!user || user.password !== password) {
        console.log("Login failed");
        return h.redirect("/");
      }

      // 4. NOW that 'user' exists, set the cookie
      console.log("Login success - setting cookie with id:", user._id);
      request.cookieAuth.set({ id: user._id }); 
      
      return h.redirect("/dashboard");
    },
  },

  logout: {
     handler: function (request: Request, h: ResponseToolkit) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  showProfile: {
    handler: async function (request: Request, h: ResponseToolkit)  {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      return h.view("profile-view", {
        title: "My Profile Settings",
        user: user,
        isAdmin,
      });
    },
  },

  updateProfile: {
    validate: {
      payload: UserSettingsSpec,
      options: { abortEarly: false },
      // 1. Add types to failAction
      failAction: function (request: Request, h: ResponseToolkit, error: any) {
        const user = request.auth.credentials as any; // Cast to any to read role
        const isAdmin = user && user.role === "admin";
        return h
          .view("profile-view", { title: "Profile update error", user, isAdmin, errors: error.details })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      // 2. Cast both user and payload to any
      const user = request.auth.credentials as any;
      const payload = request.payload as any;
      
      user.firstName = payload.firstName;
      user.lastName = payload.lastName;
      user.email = payload.email;
      
      // 3. Add ! to the store
      await db.userStore!.updateUser(user);
      return h.redirect("/dashboard");
    },
  },

  // 4. Add types to the session validation
  async validate(request: Request, session: any) {
    console.log("🔐 Validating session:", session);
    // Use ! for the store and session.id is safe because of 'any'
    const user = await db.userStore!.getUserById(session.id);
    
    console.log("🔐 User from session:", user ? `Found (${user.email})` : "Not found");
    if (user) {
      console.log("👤 User role in session:", user.role);
      console.log("👤 Full user object:", JSON.stringify(user, null, 2));
    }
    if (!user) {
      console.log("❌ Validation failed - no user found");
      return { isValid: false };
    }
    console.log("✅ Validation success");
    return { isValid: true, credentials: user };
  },

};
