import { assert } from "chai";
import { init } from "../../src/server.js";
import { museumService } from "./museum-service.js";
import { testExhibitions, testMuseums } from "../fixtures.js";

suite("Exhibition API tests", () => {
  let server;
  let museum;

  suiteSetup(async () => {
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  setup(async () => {
    // Clean exhibitions
    const exhibitions = await museumService.getAllExhibitions();
    for (const exhibition of exhibitions) {
      // eslint-disable-next-line no-await-in-loop
      await museumService.deleteExhibition(exhibition._id);
    }
    // Clean museums
    const museums = await museumService.getAllMuseums();
    for (const m of museums) {

      await museumService.deleteMuseum(m._id);
    }
    // Create a museum for exhibition tests
    museum = await museumService.createMuseum(testMuseums[0]);
  });

  test("get all exhibitions", async () => {
    const exhibitions = await museumService.getAllExhibitions();
    assert.isArray(exhibitions);
  });

  test("create an exhibition", async () => {
    const exhibition = await museumService.createExhibition(museum._id, testExhibitions[0]);
    assert.isNotNull(exhibition._id);
    assert.equal(exhibition.title, testExhibitions[0].title);
    assert.equal(exhibition.artist, testExhibitions[0].artist);
  });

  test("get an exhibition by id", async () => {
    const created = await museumService.createExhibition(museum._id, testExhibitions[0]);
    const retrieved = await museumService.getExhibition(created._id);
    assert.equal(retrieved._id, created._id);
    assert.equal(retrieved.title, testExhibitions[0].title);
  });

  test("delete an exhibition", async () => {
    const created = await museumService.createExhibition(museum._id, testExhibitions[0]);
    await museumService.deleteExhibition(created._id);
    try {
      await museumService.getExhibition(created._id);
      assert.fail("Exhibition should be deleted");
    } catch (err) {
      assert.equal(err.response.status, 404);
    }
  });

  test("create multiple exhibitions", async () => {
    for (const exhibit of testExhibitions) {

      await museumService.createExhibition(museum._id, exhibit);
    }
    const allExhibitions = await museumService.getAllExhibitions();
    assert.equal(allExhibitions.length, testExhibitions.length);
  });
});
  