import { assert } from "chai";
import { db } from "../src/models/db.js";
import { maggie, testUsers } from "./fixtures.js";

// User Model tests
// These tests verify the user store implementation (JSON or Mongo).
// They exercise create/read/update/delete behaviors and validate
// the store correctly handles normal and edge cases.
suite("User Model tests", () => {
  // Setup: initialize the store and populate test users before each suite run
  setup(async () => {
    db.init();
    await db.userStore.deleteAll();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await db.userStore.addUser(testUsers[i]);
    }
  });

  // Test: creating a new user should return the same user object (JSON store)
  test("create a user", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.equal(newUser.firstName, maggie.firstName);
    assert.equal(newUser.lastName, maggie.lastName);
    assert.equal(newUser.email, maggie.email);
    assert.equal(newUser.password, maggie.password);
    assert.exists(newUser._id);
  });

  // Test: deleteAll should remove all users from the store
  test("delete all userApi", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 3);
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  // Test: retrieving by id and by email should return the correct user
  test("get a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    const returnedUser1 = await db.userStore.getUserById(user._id);
    assert.deepEqual(user, returnedUser1);
    const returnedUser2 = await db.userStore.getUserByEmail(user.email);
    assert.deepEqual(user, returnedUser2);
  });

  // Test: deleting a specific user should remove only that user
  test("delete One User - success", async () => {
    await db.userStore.deleteUserById(testUsers[0]._id);
    const returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length - 1);
    const deletedUser = await db.userStore.getUserById(testUsers[0]._id);
    assert.isNull(deletedUser);
  });

  // Test: lookups for non-existent id/email should return null
  test("get a user - failures", async () => {
    const noUserWithId = await db.userStore.getUserById("123");
    assert.isNull(noUserWithId);
    const noUserWithEmail = await db.userStore.getUserByEmail("no@one.com");
    assert.isNull(noUserWithEmail);
  });

  // Test: invalid or missing parameters should be handled gracefully
  test("get a user - bad params", async () => {
    let nullUser = await db.userStore.getUserByEmail("");
    assert.isNull(nullUser);
    nullUser = await db.userStore.getUserById("");
    assert.isNull(nullUser);
    nullUser = await db.userStore.getUserById();
    assert.isNull(nullUser);
  });

  // Test: attempting to delete with a bad id should not change the user count
  test("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    const allUsers = await db.userStore.getAllUsers();
    assert.equal(testUsers.length, allUsers.length);
  });
});

