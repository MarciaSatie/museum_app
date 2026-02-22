import { db } from "../models/db.js";

export const adminController = {
  listUsers: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      // Check if user is admin
      if (!loggedInUser || loggedInUser.role !== "admin") {
        return h.view("error", { message: "Access denied. Admin only." }).code(403);
      }

      // Get all users
      const users = await db.userStore.getAllUsers();
      const isAdmin = true;

      const viewData = {
        title: "Admin - User Management",
        users,
        user: loggedInUser,
        isAdmin,
      };
      return h.view("admin-users", viewData);
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      // Check if user is admin
      if (!loggedInUser || loggedInUser.role !== "admin") {
        return h.view("error", { message: "Access denied. Admin only." }).code(403);
      }

      // Delete the user
      await db.userStore.deleteUserById(request.params.id);

      // Redirect back to admin page
      return h.redirect("/admin/users");
    },
  },

  toggleAdmin: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      // Check if user is admin
      if (!loggedInUser || loggedInUser.role !== "admin") {
        return h.view("error", { message: "Access denied. Admin only." }).code(403);
      }

      // Get the user to toggle
      const user = await db.userStore.getUserById(request.params.id);

      if (user) {
        // Toggle admin role
        if (user.role === "admin") {
          user.role = null; 
        } else {
          user.role = "admin"; // Make admin
        }

        // Update in database
        await db.userStore.updateUser(user);
      }

      // Redirect back to admin page
      return h.redirect("/admin/users");
    },
  },
};
  