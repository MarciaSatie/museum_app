import { Request, ResponseToolkit } from "@hapi/hapi";
import { db } from "../models/db"; // Removed .js

export const adminController = {
  listUsers: {
    handler: async function (request: Request, h: ResponseToolkit) {
      try {
        const loggedInUser = request.auth.credentials as any;
        // Use ! to unlock the stores
        const museums = await db.museumStore!.getAllMuseums();
        
        // Check if user is admin
        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({
            statusCode: 403,
            error: "Forbidden",
            message: "Access denied. Admin only.",
          }).code(403);
        }
        
        // Get all users
        const users = await db.userStore!.getAllUsers();
        
        // Admin Statistics Logic
        const userViews = users.map((u: any) => ({ 
          email: u.email, 
          views: museums.filter((m: any) => m.userid === u._id)
                        .reduce((sum: number, m: any) => sum + (m.museumVisitCount ?? 0), 0) 
        })).sort((a: any, b: any) => b.views - a.views).slice(0, 5);

        const userMuseums = users.map((u: any) => ({ 
          email: u.email, 
          count: museums.filter((m: any) => m.userid === u._id).length 
        })).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

        const viewData = {
          title: "Admin - User Management",
          users,
          user: loggedInUser,
          isAdmin: true,
          userViews,
          userMuseums,
        };
        return h.view("admin-users", viewData);
      } catch (error: any) {
        console.error("❌ Admin listUsers error:", error.message);
        return h.response({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to load admin users page",
        }).code(500);
      }
    },
  },

  deleteUser: {
    handler: async function (request: Request, h: ResponseToolkit) {
      try {
        const loggedInUser = request.auth.credentials as any;

        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({ statusCode: 403, error: "Forbidden", message: "Admin only." }).code(403);
        }

        await db.userStore!.deleteUserById(request.params.id);
        return h.redirect("/admin/users");
      } catch (error: any) {
        console.error("❌ Admin deleteUser error:", error.message);
        return h.response({ statusCode: 500, error: "Error", message: "Failed to delete" }).code(500);
      }
    },
  },

  toggleAdmin: {
    handler: async function (request: Request, h: ResponseToolkit) {
      try {
        const loggedInUser = request.auth.credentials as any;

        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({ statusCode: 403, error: "Forbidden", message: "Admin only." }).code(403);
        }

        const user = await db.userStore!.getUserById(request.params.id);

        if (user) {
          user.role = user.role === "admin" ? "user" : "admin";
          await db.userStore!.updateUser(user);
        }

        return h.redirect("/admin/users");
      } catch (error: any) {
        console.error("❌ Admin toggleAdmin error:", error.message);
        return h.response({ statusCode: 500, error: "Error", message: "Failed to toggle" }).code(500);
      }
    },
  },
};
