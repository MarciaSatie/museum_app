import "mocha";
import { assert } from "chai";
import { db } from "../src/models/db";
import { maggie, testUsers } from "./fixtures";
import { User } from "../src/api/jwt-utils";

suite("User Model tests", () => {
  let seededUsers: User[] = [];
  const createdUserIds: string[] = [];

  function createUniqueUser(user: User): User {
    const [emailName, emailDomain] = user.email.split("@");
    return {
      ...user,
      email: `${emailName}-${Date.now()}-${Math.random().toString(16).slice(2)}@${emailDomain}`,
    };
  }

  async function addTrackedUser(user: User): Promise<User> {
    const createdUser = await db.userStore.addUser(createUniqueUser(user));
    createdUserIds.push(createdUser._id!);
    return createdUser;
  }
  
  setup(async () => {
    await db.init();
    seededUsers = [];
    for (const user of testUsers) {
      seededUsers.push(await addTrackedUser(user));
    }
  });

  suiteTeardown(async () => {
    for (const userId of createdUserIds) {
      await db.userStore.deleteUserById(userId);
    }
  });

  test("create a user", async () => {
    const testUser = createUniqueUser(maggie);
    const newUser: User = await db.userStore.addUser(testUser);
    createdUserIds.push(newUser._id!);
    assert.equal(newUser.firstName, maggie.firstName);
    assert.equal(newUser.lastName, maggie.lastName);
    assert.equal(newUser.email, testUser.email);
    assert.exists(newUser.password); // Password should exist but is hashed, not plain text
    assert.exists(newUser._id);
  });

  test("delete all users", async () => {
    let returnedUsers: User[] = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 3);
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user - success", async () => {
    const testUser = createUniqueUser(maggie);
    const user: User = await db.userStore.addUser(testUser);
    createdUserIds.push(user._id!);
    const returnedUser1 = await db.userStore.getUserById(user._id!);
    assert.deepEqual(user, returnedUser1);
    const returnedUser2 = await db.userStore.getUserByEmail(user.email);
    assert.deepEqual(user, returnedUser2);
  });

  test("delete One User - success", async () => {
    await db.userStore.deleteUserById(seededUsers[0]._id!);
    const returnedUsers: User[] = await db.userStore.getAllUsers();
    assert.equal(returnedUsers.length, seededUsers.length - 1);
    const deletedUser = await db.userStore.getUserById(seededUsers[0]._id!);
    assert.isNull(deletedUser);
  });

  test("get a user - failures", async () => {
    const noUserWithId = await db.userStore.getUserById("123");
    assert.isNull(noUserWithId);
    const noUserWithEmail = await db.userStore.getUserByEmail("no@one.com");
    assert.isNull(noUserWithEmail);
  });

  test("get a user - bad params", async () => {
    let nullUser = await db.userStore.getUserByEmail("");
    assert.isNull(nullUser);
    nullUser = await db.userStore.getUserById("");
    assert.isNull(nullUser);
    // @ts-ignore: Testing runtime behavior for missing params
    nullUser = await db.userStore.getUserById();
    assert.isNull(nullUser);
  });

  test("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    const allUsers = await db.userStore.getAllUsers();
    assert.equal(seededUsers.length, allUsers.length);
  });
});
