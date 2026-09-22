import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
let databaseStatus = "not_configured";
const server = createServer(
  createApp(
    { clientOrigins: ["http://127.0.0.1:5173"] },
    async () => databaseStatus,
  ),
);
let baseUrl;
before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
test("health is honest when no database is configured", async () => {
  const response = await fetch(baseUrl + "/api/health");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "repair-shop-manager-api",
    database: "not_configured",
  });
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("database outage makes health return 503", async () => {
  databaseStatus = "unavailable";
  try {
    const response = await fetch(baseUrl + "/api/health");
    assert.equal(response.status, 503);
    assert.equal((await response.json()).database, "unavailable");
  } finally {
    databaseStatus = "not_configured";
  }
});
test("only configured frontend origins receive CORS permission", async () => {
  const allowed = await fetch(baseUrl + "/api/health", {
    headers: { Origin: "http://127.0.0.1:5173" },
  });
  assert.equal(
    allowed.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:5173",
  );
  const denied = await fetch(baseUrl + "/api/health", {
    headers: { Origin: "https://example.org" },
  });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});
test("unknown routes return a JSON 404", async () => {
  const response = await fetch(baseUrl + "/api/does-not-exist");
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: { message: "API endpoint not found." },
  });
});
test("invalid JSON returns 400 without echoing the submitted body", async () => {
  const response = await fetch(baseUrl + "/api/example", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"secret":"do-not-echo"',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { message: "Request body must contain valid JSON." },
  });
});
test("oversized request bodies return 413", async () => {
  const response = await fetch(baseUrl + "/api/example", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: "a".repeat(11e4) }),
  });
  assert.equal(response.status, 413);
});
