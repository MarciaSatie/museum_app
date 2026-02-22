import { aboutController } from "./controllers/about-controller.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { museumController } from "./controllers/museum-controller.js";
import { adminController } from "./controllers/admin-controller.js";
import { categoryController } from "./controllers/category-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },
  { method: "GET", path: "/profile", config: accountsController.showProfile },
  { method: "POST", path: "/profile", config: accountsController.updateProfile },
  { method: "GET", path: "/admin/users", config: adminController.listUsers },
  { method: "GET", path: "/admin/deleteuser/{id}", config: adminController.deleteUser },
  { method: "GET", path: "/admin/toggleadmin/{id}", config: adminController.toggleAdmin },

  { method: "GET", path: "/about", config: aboutController.index },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "POST", path: "/dashboard/addmuseum", config: dashboardController.addMuseum },
  { method: "GET", path: "/dashboard/deletemuseum/{id}", config: dashboardController.deleteMuseum },

  { method: "GET", path: "/museum/{id}", config: museumController.index },
  { method: "POST", path: "/museum/{id}/addexhibition", config: museumController.addExhibition },
  { method: "GET", path: "/museum/{id}/deleteexhibition/{exhibitionid}", config: museumController.deleteExhibition },

  { method: "GET", path: "/categories", config: categoryController.listCategories },
  { method: "GET", path: "/categories/add", config: categoryController.addCategoryPage },
  { method: "POST", path: "/categories/add", config: categoryController.addCategory },
  { method: "GET", path: "/categories/delete/{id}", config: categoryController.deleteCategory },
];
