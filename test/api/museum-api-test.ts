import "mocha";
import { assert } from "chai";
import { Server } from "@hapi/hapi";
import { init } from "../../src/server";
import { museumService } from "./museum-service";
import { testMuseums } from "../fixtures";
import { Museum } from "../../src/api/museum-api"; // Use the interface we created earlier

suite("Museum API tests", () => {
  let server: Server;

  suiteSetup(async function (this: any) {
    this.timeout(10000);
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
    await museumService.authenticate({ email: "homer@simpson.com", password: "secret" });
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  test("get all museums", async () => {
    const museums: Museum[] = await museumService.getAllMuseums();
    assert.isArray(museums);
  });

  test("create a museum", async () => {
    const museum: Museum = await museumService.createMuseum(testMuseums[0]);
    assert.isNotNull(museum._id);
    assert.equal(museum.title, testMuseums[0].title);
  });

  test("get a museum by id", async () => {
    const created: Museum = await museumService.createMuseum(testMuseums[0]);
    const retrieved: Museum = await museumService.getMuseum(created._id!);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.title, testMuseums[0].title);
  });

  test("update a museum", async () => {
    const created: Museum = await museumService.createMuseum(testMuseums[0]);
    const updateData: Museum = {
      title: "Updated Title",
      description: created.description,
      latitude: created.latitude,
      longitude: created.longitude,
    };
    const result: Museum = await museumService.updateMuseum(created._id!, updateData);
    assert.equal(result.title, "Updated Title");
  });

  test("delete a museum", async () => {
    const created: Museum = await museumService.createMuseum(testMuseums[0]);
    await museumService.deleteMuseum(created._id!);
    try {
      await museumService.getMuseum(created._id!);
      assert.fail("Museum should be deleted");
    } catch (err: any) {
      assert.equal(err.response.status, 404);
    }
  });
});
