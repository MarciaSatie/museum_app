import { assert } from "chai";
import axios from "axios";
import { init } from "../../src/server.js";

suite("Simple connectivity test", () => {
  let server;

  suiteSetup(async () => {
    server = await init({ port: 0 });
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  test("can connect to server", async () => {
    const response = await axios.get(`${server.info.uri}/api/museums`);
    assert.equal(response.status, 200);
  });
});
