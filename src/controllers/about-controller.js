export const aboutController = {
  index: {
    handler: function (request, h) {
      const user = request.auth.credentials;
      const isAdmin = user && user.role === "admin";
      const viewData = {
        title: "About MyAppMusems",
        user,
        isAdmin,
      };
      return h.view("about-view", viewData);
    },
  },
};
