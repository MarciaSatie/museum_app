import { assert } from "chai";
import { init } from "../../src/server.js";
import { museumService } from "./museum-service.js";
import { testCategories } from "../fixtures.js";

// Groups related tests together
suite("Category API tests", () => {
  let server;

  // Runs ONCE before ALL tests in the suite
  suiteSetup(async () => {
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
  });

  // Runs ONCE after ALL tests in the suite
  suiteTeardown(async () => {
    await server.stop();
  });

  // Runs BEFORE EACH individual test
  setup(async () => {
    const categories = await museumService.getAllCategories();
    for (const category of categories) {
      // eslint-disable-next-line no-await-in-loop
      await museumService.deleteCategory(category._id);
    }
  });

  test("get all categories", async () => {
    const categories = await museumService.getAllCategories();
    assert.isArray(categories);
  });

  test("create a category", async () => {
    const category = await museumService.createCategory(testCategories[0]);
    assert.isNotNull(category._id);
    assert.equal(category.name, testCategories[0].name);
    assert.equal(category.description, testCategories[0].description);
  });

  test("get a category by id", async () => {
    const created = await museumService.createCategory(testCategories[0]);
    const retrieved = await museumService.getCategory(created._id);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.name, testCategories[0].name);
  });

  test("delete a category", async () => {
    const created = await museumService.createCategory(testCategories[0]);
    await museumService.deleteCategory(created._id);
    try {
      await museumService.getCategory(created._id);
      assert.fail("Category should be deleted");
    } catch (err) {
      assert.equal(err.response.status, 404);
    }
  });

  test("create multiple categories", async () => {
    for (const cat of testCategories) {
      // eslint-disable-next-line no-await-in-loop
      await museumService.createCategory(cat);
    }
    const allCategories = await museumService.getAllCategories();
    assert.equal(allCategories.length, testCategories.length);
  });
});
