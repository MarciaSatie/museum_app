import { default as Joi } from "joi";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas"; 
import { db } from "../models/db";
import bcrypt from "bcrypt";
const saltRounds = 10;
import validator from "validator";

// Add this interface to "teach" TypeScript about CookieAuth
interface CookieRequest extends Request {
  cookieAuth: {
    set(session: object): void;
    set(key: string, value: string | object): void;
    clear(key?: string): void;
    ttl(milliseconds: number): void;
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
      return h.view("main", { title: "Welcome to Museum App" });
    },
  },
  showSignup: {
    auth: false,
    handler: function (request: Request, h: ResponseToolkit) {
      return h.view("signup-view", { title: "Sign up for Museum App" });
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
    auth: {
      mode: "try", // Allows unauthenticated visitors in, but populates request.auth if a cookie exists
      strategy: "session"
    },
    handler: function (request: Request, h: ResponseToolkit) {
      // 🕵️‍♂️ Your friend's fix translated to Hapi:
      // If the user already has a valid session cookie, bypass login entirely!
      if (request.auth.isAuthenticated) {
        console.log("🔄 Logged-in user attempted to view /login; auto-redirecting to dashboard");
        return h.redirect("/dashboard");
      }
      
      // Otherwise, show the normal login view with the GitHub & Auth0 buttons
      return h.view("login-view", { title: "Login to Museum App" });
    },
  },

  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request: CookieRequest, h: ResponseToolkit, error: any) {
        console.log("❌ Login validation failed:", error.details);
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request: CookieRequest, h: ResponseToolkit) {
      const { email, password } = request.payload as any;
      const cleanEmail = validator.normalizeEmail(validator.trim(email || '')) || '';
      const user = await db.userStore!.getUserByEmail(cleanEmail);
      const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    
      if (!user || !isMatch) {
        console.log("Login failed: Invalid email or password");
        return h.redirect("/");
      }
    
      console.log("Login success - setting cookie for user:", user.email);
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
      failAction: function (request: Request, h: ResponseToolkit, error: any) {
        const user = request.auth.credentials as any; 
        const isAdmin = user && user.role === "admin";
        return h
          .view("profile-view", { title: "Profile update error", user, isAdmin, errors: error.details })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.auth.credentials as any;
      const payload = request.payload as any;
      
      user.firstName = payload.firstName;
      user.lastName = payload.lastName;
      user.email = payload.email;
      
      await db.userStore!.updateUser(user);
      return h.redirect("/dashboard");
    },
  },

  async validate(request: Request, session: any) {
    console.log("🔐 Validating session:", session);
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

  // ============================================
  // ✨ Option 2: GITHUB LOGIN HANDLER ✨
  // ============================================

  githubLogin: {
    auth: "github",
    handler: async function (request: CookieRequest, h: ResponseToolkit) {
      if (!request.auth.isAuthenticated) {
        console.error("❌ GitHub auth failed:", request.auth.error?.message);
        return h.view("login-view", { 
          title: "Log in error", 
          errors: [{ message: `GitHub login failed: ${request.auth.error?.message}` }] 
        }).takeover().code(401);
      }

      const githubProfile = request.auth.credentials.profile as any;
      const username = githubProfile.username || "GitHubUser";
      const email = githubProfile.email || `${username}@github.placeholder`;
      
      // ✨ FIX: Safely read the native Bell displayName string string template fields
      const fullName = githubProfile.displayName || username;
      const nameParts = fullName.trim().split(" ");
      
      // Explicitly pull exact index string fragments to satisfy Mongoose requirements
      const firstName = nameParts[0] || username;
      const lastName = nameParts.slice(1).join(" ") || "OAuthUser";

      try {
        let user = await db.userStore!.getUserByEmail(email);

        if (!user) {
          console.log(`✨ Registering new OAuth user via GitHub: ${email}`);
          
          const newUser: any = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: "oauth-managed-account-placeholder-string", 
            role: "admin" // Automatically grants Admin authorization status
          };

          const salt = await bcrypt.genSalt(saltRounds);
          newUser.password = await bcrypt.hash(newUser.password, salt);

          user = await db.userStore!.addUser(newUser);
          console.log("✅ GitHub Cloud integration user successfully written to MongoDB Atlas!");
        }

        console.log("✅ GitHub login success - setting session cookie for user ID:", user._id);
        request.cookieAuth.set({ id: user._id }); 
        
        return h.redirect("/dashboard");
      } catch (error: any) {
        console.error("================ GITHUB DATABASE FAILURE LOG ================");
        console.error("Error Message:", error.message);
        console.error("=============================================================");
        return h.view("login-view", { 
          title: "Log in error", 
          errors: [{ message: `Database storage error: ${error.message}` }] 
        }).takeover().code(500);
      }
    },
  },

  // ============================================
  // ✨ Option 3: COMPLETE AUTH0 MANAGED LOGIN HANDLER ✨
  // ============================================
  auth0Login: {
    auth: "auth0",
    handler: async function (request: CookieRequest, h: ResponseToolkit) {
      if (!request.auth.isAuthenticated) {
        console.error("❌ Auth0 authentication failed:", request.auth.error?.message);
        return h.view("login-view", { 
          title: "Log in error", 
          errors: [{ message: `Auth0 sign-in failed: ${request.auth.error?.message}` }] 
        }).takeover().code(401);
      }

      const auth0Profile = request.auth.credentials.profile as any;
      const email = auth0Profile.email || `${auth0Profile.username}@auth0.placeholder`;
      
      const nameParts = auth0Profile.displayName ? auth0Profile.displayName.split(" ") : [auth0Profile.username, ""];
      const firstName = nameParts[0] || auth0Profile.username;
      const lastName = nameParts.slice(1).join(" ") || "Auth0User";

      try {
        let user = await db.userStore!.getUserByEmail(email);

        if (!user) {
          console.log(`✨ Registering new Managed Cloud User via Auth0: ${email}`);
          
          const newUser: any = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: "auth0-managed-cloud-account-placeholder-string", 
          };

          newUser.role = "admin"; 
          console.log("🛡️ Auth0 user promoted to admin role for route authorization:", email);

          const salt = await bcrypt.genSalt(saltRounds);
          newUser.password = await bcrypt.hash(newUser.password, salt);

          user = await db.userStore!.addUser(newUser);
          console.log("✅ Managed Auth0 User saved to MongoDB with ID:", user._id);
        }

        console.log("✅ Auth0 login success - setting session cookie for user ID:", user._id);
        request.cookieAuth.set({ id: user._id }); 
        
        return h.redirect("/dashboard");
      } catch (error: any) {
        console.error("================ DATABASE FAILURE LOG ================");
        console.error("Error Message:", error.message);
        console.error("======================================================");
        return h.view("login-view", { 
          title: "Log in error", 
          errors: [{ message: `Database storage error: ${error.message}` }] 
        }).takeover().code(500);
      }
    },
  },
}; // This closes out the main accountsController 



