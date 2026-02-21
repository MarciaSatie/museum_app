import { assert } from "chai";
import { db } from "../src/models/db.js";
import { testUsers, testMuseums, testExhibitions } from "./fixtures.js";

suite("Exhibition Model tests", () => {
  let loggedInUser;
  let testMuseum;

  setup(async () => {
    db.init();
    await db.userStore.deleteAll();
    await db.museumStore.deleteAllMuseums();
    await db.exhibitionStore.deleteAll();
    
    // Create a test user and museum
    loggedInUser = await db.userStore.addUser(testUsers[0]);
    const museumData = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
    };
    testMuseum = await db.museumStore.addMuseum(museumData);
  });

  test("add an exhibition", async () => {
    const newExhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id, newExhibition);
    
    assert.isNotNull(exhibition._id);
    assert.equal(exhibition.title, testExhibitions[0].title);
    assert.equal(exhibition.artist, testExhibitions[0].artist);
    assert.equal(exhibition.duration, testExhibitions[0].duration);
  });

  test("get exhibitions by museum ID", async () => {
    const exhibition1 = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition2 = {
      title: testExhibitions[1].title,
      artist: testExhibitions[1].artist,
      duration: testExhibitions[1].duration,
    };
    await db.exhibitionStore.addExhibition(testMuseum._id, exhibition1);
    await db.exhibitionStore.addExhibition(testMuseum._id, exhibition2);
    
    const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(testMuseum._id);
    assert.equal(exhibitions.length, 2);
  });

  test("delete exhibition by ID", async () => {
    const newExhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id, newExhibition);
    
    await db.exhibitionStore.deleteExhibition(exhibition._id);
    
    const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(testMuseum._id);
    assert.equal(exhibitions.length, 0);
  });

  test("delete all exhibitions", async () => {
    const exhibition1 = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
    };
    const exhibition2 = {
      title: testExhibitions[1].title,
      artist: testExhibitions[1].artist,
    };
    await db.exhibitionStore.addExhibition(testMuseum._id, exhibition1);
    await db.exhibitionStore.addExhibition(testMuseum._id, exhibition2);
    
    await db.exhibitionStore.deleteAll();
    const allExhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(testMuseum._id);
    assert.equal(allExhibitions.length, 0);
  });

  test("update exhibition", async () => {
    const newExhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id, newExhibition);
    
    exhibition.title = "Updated Title";
    exhibition.artist = "Updated Artist";
    
    await db.exhibitionStore.updateExhibition(exhibition);
    
    const updatedExhibition = await db.exhibitionStore.getExhibitionById(exhibition._id);
    assert.equal(updatedExhibition.title, "Updated Title");
    assert.equal(updatedExhibition.artist, "Updated Artist");
  });
});
