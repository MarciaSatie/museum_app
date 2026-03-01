import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

const UserSettingsSpec = {
  firstName: UserSpec.firstName,
  lastName: UserSpec.lastName,
  email: UserSpec.email,
};

export const accountsController = {
  index: {
    auth: false,
    handler: function (request, h) {
      return h.view("main", { title: "Welcome to Playlist" });
    },
  },
  showSignup: {
    auth: false,
    handler: function (request, h) {
      return h.view("signup-view", { title: "Sign up for Playlist" });
    },
  },
  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("signup-view", { title: "Sign up error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.payload;
      console.log("📝 Signup attempt:", user.email);
      try {
        const newUser = await db.userStore.addUser(user);
        console.log("✅ User created:", newUser ? newUser.email : "null");
        return h.redirect("/");
      } catch (error) {
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
    handler: function (request, h) {
      return h.view("login-view", { title: "Login to Playlist" });
    },
  },
  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        console.log("❌ Login validation failed:", error.details);
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload;
      console.log("Login attempt:", email);
      const user = await db.userStore.getUserByEmail(email);
      console.log("User found:", user ? "Yes" : "No");
      if (user) {
        console.log("User _id type:", typeof user._id);
        console.log("User _id value:", user._id);
        console.log("Password match:", user.password === password);
      }
      if (!user || user.password !== password) {
        console.log("Login failed - redirecting to /");
        return h.redirect("/");
      }
      console.log("Login success - setting cookie with id:", user._id);
      request.cookieAuth.set({ id: user._id });
      console.log("🔄 Redirecting to /dashboard");
      return h.redirect("/dashboard");
    },
  },
  logout: {
    handler: function (request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  showProfile: {
    handler: async function (request, h) {
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
      failAction: function (request, h, error) {
        const user = request.auth.credentials;
        const isAdmin = user && user.role === "admin";
        return h
          .view("profile-view", { title: "Profile update error", user, isAdmin, errors: error.details })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.auth.credentials;
      user.firstName = request.payload.firstName;
      user.lastName = request.payload.lastName;
      user.email = request.payload.email;
      await db.userStore.updateUser(user);
      return h.redirect("/dashboard");
    },
  },

  async validate(request, session) {
    console.log("🔐 Validating session:", session);
    const user = await db.userStore.getUserById(session.id);
    console.log("🔐 User from session:", user ? `Found (${user.email})` : "Not found");
    if (!user) {
      console.log("❌ Validation failed - no user found");
      return { isValid: false };
    }
    console.log("✅ Validation success");
    return { isValid: true, credentials: user };
  },
};
