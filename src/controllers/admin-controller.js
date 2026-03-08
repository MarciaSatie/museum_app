import { db } from "../models/db.js";

export const adminController = {
  listUsers: {
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;
        const museums = await db.museumStore.getAllMuseums();
        
        // Check if user is admin
        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({
            statusCode: 403,
            error: "Forbidden",
            message: "Access denied. Admin only.",
          }).code(403);
        }
        
        // Get all users
        const users = await db.userStore.getAllUsers();
        const userViews = users.map((u) => ({ email: u.email, views: museums.filter((m) => m.userid === u._id).reduce((sum, m) => sum + (m.museumVisitCount ?? 0), 0) })).sort((a, b) => b.views - a.views).slice(0, 5);
        const userMuseums = users.map((u) => ({ email: u.email, count: museums.filter((m) => m.userid === u._id).length }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // computes total museums per user, sorts descending, keeps top 5.
        const viewData = {
          title: "Admin - User Management",
          users,
          user: loggedInUser,
          isAdmin: true,
          userViews,
          userMuseums,
        };
        return h.view("admin-users", viewData);
      } catch (error) {
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
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;

        // Check if user is admin
        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({
            statusCode: 403,
            error: "Forbidden",
            message: "Access denied. Admin only.",
          }).code(403);
        }

        // Delete the user
        await db.userStore.deleteUserById(request.params.id);

        // Redirect back to admin page
        return h.redirect("/admin/users");
      } catch (error) {
        console.error("❌ Admin deleteUser error:", error.message);
        return h.response({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to delete user",
        }).code(500);
      }
    },
  },

  toggleAdmin: {
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;

        // Check if user is admin
        if (!loggedInUser || loggedInUser.role !== "admin") {
          return h.response({
            statusCode: 403,
            error: "Forbidden",
            message: "Access denied. Admin only.",
          }).code(403);
        }

        // Get the user to toggle
        const user = await db.userStore.getUserById(request.params.id);

        if (user) {
          // Toggle admin role
          if (user.role === "admin") {
            user.role = "user";
          } else {
            user.role = "admin";
          }

          // Update in database
          await db.userStore.updateUser(user);
        }

        // Redirect back to admin page
        return h.redirect("/admin/users");
      } catch (error) {
        console.error("❌ Admin toggleAdmin error:", error.message);
        return h.response({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to toggle admin role",
        }).code(500);
      }
    },
  },
};
  