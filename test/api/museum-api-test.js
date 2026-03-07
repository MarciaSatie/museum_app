import { assert } from "chai";
import { init } from "../../src/server.js";
import { museumService } from "./museum-service.js";
import { testMuseums } from "../fixtures.js";

suite("Museum API tests", () => {
  let server;

  suiteSetup(async () => {
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  setup(async () => {
    const museums = await museumService.getAllMuseums();
    for (const museum of museums) {
      await museumService.deleteMuseum(museum._id);
    }
  });

  test("get all museums", async () => {
    const museums = await museumService.getAllMuseums();
    assert.isArray(museums);
  });

  test("create a museum", async () => {
    const museum = await museumService.createMuseum(testMuseums[0]);
    assert.isNotNull(museum._id);
    assert.equal(museum.title, testMuseums[0].title);
  });

  test("get a museum by id", async () => {
    const created = await museumService.createMuseum(testMuseums[0]);
    const retrieved = await museumService.getMuseum(created._id);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.title, testMuseums[0].title);
  });

  test("update a museum", async () => {
    const created = await museumService.createMuseum(testMuseums[0]);
    const updateData = {
      title: "Updated Title",
      description: created.description,
      latitude: created.latitude,
      longitude: created.longitude,
    };
    const result = await museumService.updateMuseum(created._id, updateData);
    assert.equal(result.title, "Updated Title");
  });

  test("delete a museum", async () => {
    const created = await museumService.createMuseum(testMuseums[0]);
    await museumService.deleteMuseum(created._id);
    try {
      await museumService.getMuseum(created._id);
      assert.fail("Museum should be deleted");
    } catch (err) {
      assert.equal(err.response.status, 404);
    }
  });
});
