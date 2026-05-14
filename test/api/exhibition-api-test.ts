import { assert } from "chai";
import { Server } from "@hapi/hapi";
import { init } from "../../src/server";
import { museumService } from "./museum-service";
import { testExhibitions, testMuseums } from "../fixtures";
import { Museum } from "../../src/api/museum-api"; // Import interfaces if exported
import { Exhibition } from "../../src/api/exhibition-api";
import { Category } from "../../src/api/category-api"; 
import "mocha";


suite("Exhibition API tests", () => {
  let server: Server;
  let museum: Museum;

  suiteSetup(async function (this: any) {
    this.timeout(10000);
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
    await museumService.authenticate({ email: "peter@griffin.com", password: "secret" });
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  suiteTeardown(async () => {
    const exhibitions = await museumService.getAllExhibitions();
    for (const exhibition of exhibitions) {
      await museumService.deleteExhibition(exhibition._id!);
    }

    const museums = await museumService.getAllMuseums();
    for (const m of museums) {
      await museumService.deleteMuseum(m._id!);
    }
  });

  setup(async () => {
    // Clean exhibitions
    const exhibitions = await museumService.getAllExhibitions();
    for (const exhibition of exhibitions) {
      await museumService.deleteExhibition(exhibition._id!);
    }
    // Clean museums
    const museums = await museumService.getAllMuseums();
    for (const m of museums) {
      await museumService.deleteMuseum(m._id!);
    }
    // Create a museum for exhibition tests
    museum = await museumService.createMuseum(testMuseums[0]);
  });

  test("get all exhibitions", async () => {
    const exhibitions = await museumService.getAllExhibitions();
    assert.isArray(exhibitions);
  });

  test("create an exhibition", async () => {
    const exhibition: Exhibition = await museumService.createExhibition(museum._id!, testExhibitions[0]);
    assert.isNotNull(exhibition._id);
    assert.equal(exhibition.title, testExhibitions[0].title);
    assert.equal(exhibition.artist, testExhibitions[0].artist);
  });

  test("get an exhibition by id", async () => {
    const created: Exhibition = await museumService.createExhibition(museum._id!, testExhibitions[0]);
    const retrieved: Exhibition = await museumService.getExhibition(created._id!);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.title, testExhibitions[0].title);
  });

  test("delete an exhibition", async () => {
    const created: Exhibition = await museumService.createExhibition(museum._id!, testExhibitions[0]);
    await museumService.deleteExhibition(created._id!);
    try {
      await museumService.getExhibition(created._id!);
      assert.fail("Exhibition should be deleted");
    } catch (err: any) {
      assert.equal(err.response.status, 404);
    }
  });

  test("create multiple exhibitions", async () => {
    for (const exhibit of testExhibitions) {
      await museumService.createExhibition(museum._id!, exhibit);
    }
    const allExhibitions = await museumService.getAllExhibitions();
    assert.equal(allExhibitions.length, testExhibitions.length);
  });
});
