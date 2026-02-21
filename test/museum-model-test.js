import { assert } from "chai";
import { db } from "../src/models/db.js";
import { testUsers, testMuseums } from "./fixtures.js";

suite("Museum Model tests", () => {
  let loggedInUser;

  setup(async () => {
    db.init();
    await db.userStore.deleteAll();
    await db.museumStore.deleteAllMuseums();
    
    // Create a test user first
    loggedInUser = await db.userStore.addUser(testUsers[0]);
  });

  test("add a museum", async () => {
    const newMuseum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum = await db.museumStore.addMuseum(newMuseum);
    assert.isNotNull(museum._id);
    assert.equal(museum.title, testMuseums[0].title);
    assert.equal(museum.description, testMuseums[0].description);
    assert.equal(museum.latitude, testMuseums[0].latitude);
    assert.equal(museum.longitude, testMuseums[0].longitude);
  });

  test("get museum by ID", async () => {
    const newMuseum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum = await db.museumStore.addMuseum(newMuseum);
    const retrievedMuseum = await db.museumStore.getMuseumById(museum._id);
    
    assert.equal(retrievedMuseum._id, museum._id);
    assert.equal(retrievedMuseum.title, museum.title);
  });

  test("get user museums", async () => {
    const museum1 = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
    };
    const museum2 = {
      userid: loggedInUser._id,
      title: testMuseums[1].title,
      description: testMuseums[1].description,
    };
    await db.museumStore.addMuseum(museum1);
    await db.museumStore.addMuseum(museum2);
    
    const userMuseums = await db.museumStore.getUserMuseums(loggedInUser._id);
    assert.equal(userMuseums.length, 2);
  });

  test("delete museum by ID", async () => {
    const newMuseum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
    };
    const museum = await db.museumStore.addMuseum(newMuseum);
    await db.museumStore.deleteMuseumById(museum._id);
    
    const retrievedMuseum = await db.museumStore.getMuseumById(museum._id);
    assert.isUndefined(retrievedMuseum);
  });

  test("delete all museums", async () => {
    const museum1 = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
    };
    const museum2 = {
      userid: loggedInUser._id,
      title: testMuseums[1].title,
    };
    await db.museumStore.addMuseum(museum1);
    await db.museumStore.addMuseum(museum2);
    
    await db.museumStore.deleteAllMuseums();
    const allMuseums = await db.museumStore.getAllMuseums();
    assert.equal(allMuseums.length, 0);
  });
});
