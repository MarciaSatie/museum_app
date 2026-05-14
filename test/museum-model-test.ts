import "mocha";
import { assert } from "chai";
import { db } from "../src/models/db";
import { testUsers, testMuseums } from "./fixtures";
import { User } from "../src/api/jwt-utils";
import { Museum } from "../src/api/museum-api";

suite("Museum Model tests", () => {
  let loggedInUser: User;
  const createdUserIds: string[] = [];
  const createdMuseumIds: string[] = [];

  async function addTrackedUser(user: User): Promise<User> {
    const createdUser = await db.userStore.addUser(user);
    createdUserIds.push(createdUser._id!);
    return createdUser;
  }

  async function addTrackedMuseum(museum: Museum): Promise<Museum> {
    const createdMuseum = await db.museumStore.addMuseum(museum);
    createdMuseumIds.push(createdMuseum._id!);
    return createdMuseum;
  }

  setup(async () => {
    await db.init();
    const baseEmail = testUsers[0].email;
    const uniqueEmail = `${baseEmail.split("@")[0]}-${Date.now()}@${baseEmail.split("@")[1]}`;
    const user = {
      ...testUsers[0],
      email: uniqueEmail,
    };

    loggedInUser = await addTrackedUser(user);
  });

  suiteTeardown(async () => {
    for (const userId of createdUserIds) {
      await db.userStore.deleteUserById(userId);
    }
  });

  test("add a museum", async () => {
    const newMuseum: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum = await addTrackedMuseum(newMuseum);
    assert.isNotNull(museum._id);
    assert.equal(museum.title, testMuseums[0].title);
    assert.equal(museum.description, testMuseums[0].description);
    assert.equal(museum.latitude, testMuseums[0].latitude);
    assert.equal(museum.longitude, testMuseums[0].longitude);
    assert.equal((museum as any).status, "public");
  });

  test("get museum by ID", async () => {
    const newMuseum: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum = await addTrackedMuseum(newMuseum);
    const retrievedMuseum = await db.museumStore.getMuseumById(museum._id!);
    
    assert.equal(retrievedMuseum._id, museum._id);
    assert.equal(retrievedMuseum.title, museum.title);
  });

  // now testing if museum is public
  test("get user museums", async () => {
    const museum1: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum2: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[1].title,
      description: testMuseums[1].description,
      latitude: testMuseums[1].latitude,
      longitude: testMuseums[1].longitude,
    };
    await addTrackedMuseum(museum1);
    await addTrackedMuseum(museum2);
    
    const userMuseums = await db.museumStore.getUserMuseums(loggedInUser._id!);
    assert.equal(userMuseums.length, 2);
    await db.userStore.deleteUserById(loggedInUser._id,);
  });

  test("delete museum by ID", async () => {
    const newMuseum: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum = await addTrackedMuseum(newMuseum);
    await db.museumStore.deleteMuseumById(museum._id!);
    
    const retrievedMuseum = await db.museumStore.getMuseumById(museum._id!);
    assert.isNull(retrievedMuseum);
  });

  // add a test Review Post
  test("add review at position 0", async () => {
    const newMuseum: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[3].title,
      description: testMuseums[3].description,
      latitude: testMuseums[3].latitude,
      longitude: testMuseums[3].longitude,
    };
    const reviewObject ={
      text:"Great place",
      authorName: "Homer Simpson",
      authorId:"464e9fb1-4938-4857-8c11-16a0b5f55d56",
    }
    const museum = await addTrackedMuseum(newMuseum);
    await db.museumStore.addReviewById(museum._id!, reviewObject);
    const updated = await db.museumStore.getMuseumById(museum._id!);
    assert.equal((updated as any).reviewList[0].text, "Great place");
    
  });

  suiteTeardown(async () => {
    for (const museumId of createdMuseumIds) {
      await db.museumStore.deleteMuseumById(museumId);
    }

    for (const userId of createdUserIds) {
      await db.userStore.deleteUserById(userId);
    }
  });

  test("delete all museums", async () => {
    const museum1: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[0].title,
      description: testMuseums[0].description,
      latitude: testMuseums[0].latitude,
      longitude: testMuseums[0].longitude,
    };
    const museum2: Museum = {
      userid: loggedInUser._id,
      title: testMuseums[1].title,
      description: testMuseums[1].description,
      latitude: testMuseums[1].latitude,
      longitude: testMuseums[1].longitude,
    };
    await db.museumStore.addMuseum(museum1);
    await db.museumStore.addMuseum(museum2);
    
    await db.museumStore.deleteAllMuseums();
    const allMuseums = await db.museumStore.getAllMuseums();
    assert.equal(allMuseums.length, 0);
  });
});
