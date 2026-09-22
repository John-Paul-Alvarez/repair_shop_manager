import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "../src/auth/password.js";

test("password hashes use unique salts and reject wrong passwords", async () => {
  const password = "repair tools on a sunny workbench";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(first.includes(password), false);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong password entirely", first), false);
  assert.equal(await verifyPassword(password, "invalid-hash"), false);
});
