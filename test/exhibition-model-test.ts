import "mocha";
import { assert } from "chai";
import { db } from "../src/models/db";
import { testUsers, testMuseums, testExhibitions } from "./fixtures";
import { User } from "../src/api/jwt-utils";
import { Museum } from "../src/api/museum-api";
import { Exhibition } from "../src/api/exhibition-api";

suite("Exhibition Model tests", () => {
  let loggedInUser: User;
  let testMuseum: Museum;

  setup(async () => {
    await db.init();
    await db.userStore.deleteAll();
    await db.museumStore.deleteAllMuseums();
    await db.exhibitionStore.deleteAllExhibitions();
    
    // Create a test user and museum
    loggedInUser = await db.userStore.addUser(testUsers[0]);
    const museumData: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude, // Added to match Museum interface
      longitude: testMuseums[0].longitude,
    };
    testMuseum = await db.museumStore.addMuseum(museumData);
  });

  suiteTeardown(async () => {
    if (testMuseum?._id) {
      await db.museumStore.deleteMuseumById(testMuseum._id);
    }

    if (loggedInUser?._id) {
      await db.userStore.deleteUserById(loggedInUser._id);
    }
  });

  test("add an exhibition", async () => {
    const newExhibition: Exhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    // Use ! for non-null assertion on testMuseum._id
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id!, newExhibition);
    
    assert.isNotNull(exhibition._id);
    assert.equal(exhibition.title, testExhibitions[0].title);
    assert.equal(exhibition.artist, testExhibitions[0].artist);
    assert.equal(exhibition.duration, testExhibitions[0].duration);
  });

  test("get exhibitions by museum ID", async () => {
    const exhibition1: Exhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition2: Exhibition = {
      title: testExhibitions[1].title,
      artist: testExhibitions[1].artist,
      duration: testExhibitions[1].duration,
    };
    await db.exhibitionStore.addExhibition(testMuseum._id!, exhibition1);
    await db.exhibitionStore.addExhibition(testMuseum._id!, exhibition2);
    
    const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(testMuseum._id!);
    assert.equal(exhibitions.length, 2);
  });

  test("delete exhibition by ID", async () => {
    const newExhibition: Exhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id!, newExhibition);
    
    await db.exhibitionStore.deleteExhibition(exhibition._id!);
    
    const exhibitions = await db.exhibitionStore.getExhibitionsByMuseumId(testMuseum._id!);
    assert.equal(exhibitions.length, 0);
  });

  test("update exhibition", async () => {
    const newExhibition: Exhibition = {
      title: testExhibitions[0].title,
      artist: testExhibitions[0].artist,
      duration: testExhibitions[0].duration,
    };
    const exhibition = await db.exhibitionStore.addExhibition(testMuseum._id!, newExhibition);
    
    exhibition.title = "Updated Title";
    exhibition.artist = "Updated Artist";
    
    await db.exhibitionStore.updateExhibition(exhibition);
    
    const updatedExhibition = await db.exhibitionStore.getExhibitionById(exhibition._id!);
    assert.equal(updatedExhibition!.title, "Updated Title");
    assert.equal(updatedExhibition!.artist, "Updated Artist");
  });
});
