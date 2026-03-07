import { assert } from "chai";
import axios from "axios";
import { init } from "../../src/server.js";

// Groups related tests together
suite("Simple connectivity test", () => {
  let server;

    // Runs ONCE before ALL tests in the suite
  suiteSetup(async () => {
    server = await init({ port: 0 });
  });

  // Runs ONCE after ALL tests in the suite
  suiteTeardown(async () => {
    await server.stop();
  });

  test("can connect to server", async () => {
    const response = await axios.get(`${server.info.uri}/api/museums`);
    assert.equal(response.status, 200);
  });
});

/* HTTP Status Code Cheat Sheet
HTTP Status Code Cheat Sheet
✅ 2xx Success
Status codes indicating the request was successful.

Code	Name	Meaning
200	OK	Request succeeded (GET, PUT)
201	Created	Resource created successfully (POST)
204	No Content	Success but no response body (DELETE)
🔀 3xx Redirection
The client must take additional action to complete the request.

Code	Name	Meaning
301	Moved Permanently	Resource moved to new URL
302	Found	Temporary redirect
304	Not Modified	Cached version is still valid
❌ 4xx Client Error
The request contains bad syntax or cannot be fulfilled.

Code	Name	Meaning
400	Bad Request	Invalid syntax/validation failed
401	Unauthorized	Authentication required
403	Forbidden	Server understood but refuses
404	Not Found	Resource doesn't exist
409	Conflict	Request conflicts with server state
422	Unprocessable Entity	Validation error (semantic)
💥 5xx Server Error
The server failed to fulfill a valid request.

Code	Name	Meaning
500	Internal Server Error	Generic server error
503	Service Unavailable	Server can't handle request (DB down)
*/