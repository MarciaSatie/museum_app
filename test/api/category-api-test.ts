import { assert } from "chai";
import { Server } from "@hapi/hapi";
import { init } from "../../src/server";
import { museumService } from "./museum-service";
import { testCategories } from "../fixtures";
import { Category } from "../../src/api/category-api"; 
import "mocha";

// Use the Category interface from your API file if exported, 
// or define a local one for the test

suite("Category API tests", () => {
  let server: Server; // Type the server instance

  suiteSetup(async function (this: any) {
    this.timeout(10000);
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
    // Ensure these credentials match your test seed data
    await museumService.authenticate({ email: "homer@simpson.com", password: "secret" });
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  setup(async () => {
    const categories: Category[] = await museumService.getAllCategories();
    for (const category of categories) {
      await museumService.deleteCategory(category._id!);
    }
  });

  test("get all categories", async () => {
    const categories = await museumService.getAllCategories();
    assert.isArray(categories);
  });

  test("create a category", async () => {
    const category: Category = await museumService.createCategory(testCategories[0]);
    assert.isNotNull(category._id);
    assert.equal(category.name, testCategories[0].name);
    assert.equal(category.description, testCategories[0].description);
  });

  test("get a category by id", async () => {
    const created: Category = await museumService.createCategory(testCategories[0]);
    const retrieved: Category = await museumService.getCategory(created._id!);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.name, testCategories[0].name);
  });

  test("delete a category", async () => {
    const created: Category = await museumService.createCategory(testCategories[0]);
    await museumService.deleteCategory(created._id!);
    try {
      await museumService.getCategory(created._id!);
      assert.fail("Category should be deleted");
    } catch (err: any) {
      // In TS, caught errors are 'unknown'. Use 'any' or check status property.
      assert.equal(err.response.status, 404);
    }
  });

  test("create multiple categories", async () => {
    for (const cat of testCategories) {
      await museumService.createCategory(cat);
    }
    const allCategories = await museumService.getAllCategories();
    assert.equal(allCategories.length, testCategories.length);
  });
});
