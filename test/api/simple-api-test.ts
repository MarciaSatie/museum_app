import "mocha";
import { assert } from "chai";
import axios, { type AxiosResponse } from "axios";

import type { Server } from "@hapi/hapi";

import { init } from "../../src/server";
import { museumService } from "./museum-service";



suite("Simple connectivity test", () => {
  let server: Server;

  suiteSetup(async function (this: any) {
    this.timeout(10000);
    server = await init({ port: 0 });
    museumService.museumUrl = server.info.uri;
    // Authenticate before running tests
    await museumService.authenticate({ email: "homer@simpson.com", password: "secret" });
  });

  suiteTeardown(async () => {
    await server.stop();
  });

  test("can connect to server", async () => {
    // Explicitly typing the axios response
    const response: AxiosResponse = await axios.get(
      `${server.info.uri}/api/museums`, 
      museumService.getAuthHeaders()
    );
    assert.equal(response.status, 200);
  });
});
