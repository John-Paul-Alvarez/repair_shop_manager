import assert from "node:assert/strict";
import { test } from "node:test";
import { readEnvironment } from "../src/config/env.js";
import { createDatabase } from "../src/config/database.js";
test("local defaults do not require database credentials", async () => {
  const config = readEnvironment({});
  assert.equal(config.port, 4e3);
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.mongoUri, "");
  const database = createDatabase(config);
  await database.connect();
  assert.equal(await database.status(), "not_configured");
  assert.throws(() => database.getDb(), /not configured/);
  await database.close();
});
test("invalid ports are rejected early", () => {
  for (const port of ["0", "65536", "4000.5", "four", ""]) {
    assert.throws(() => readEnvironment({ PORT: port }), /PORT/);
  }
});
test("CORS settings require exact origins", () => {
  assert.throws(
    () => readEnvironment({ CLIENT_ORIGINS: "*" }),
    /CLIENT_ORIGINS/,
  );
  assert.throws(
    () => readEnvironment({ CLIENT_ORIGINS: "http://localhost:5173/path" }),
    /CLIENT_ORIGINS/,
  );
});
test("database configuration errors never include a supplied URI", () => {
  assert.throws(
    () => readEnvironment({ MONGODB_URI: "secret-value" }),
    (error) =>
      error instanceof Error &&
      /MONGODB_URI/.test(error.message) &&
      !error.message.includes("secret-value"),
  );
  assert.throws(
    () => readEnvironment({ MONGODB_DB_NAME: "invalid/name" }),
    /MONGODB_DB_NAME/,
  );
  assert.throws(
    () => readEnvironment({ NODE_ENV: "production" }),
    /MONGODB_URI is required/,
  );
});
