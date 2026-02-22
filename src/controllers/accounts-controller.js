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
      await db.userStore.addUser(user);
      return h.redirect("/");
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
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload;
      const user = await db.userStore.getUserByEmail(email);
      if (!user || user.password !== password) {
        return h.redirect("/");
      }
      request.cookieAuth.set({ id: user._id });
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
    const user = await db.userStore.getUserById(session.id);
    if (!user) {
      return { isValid: false };
    }
    return { isValid: true, credentials: user };
  },
};
