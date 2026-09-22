import "dotenv/config";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { readEnvironment } from "../../src/config/env.js";
import { createStore } from "../../src/auth/store.js";
import { createApp } from "../../src/app.js";

// Explicit opt-in command. Only this run's uniquely named collections are
// written or removed; the real application collections are never touched.
test("Sprint 1 against Atlas", async (t) => {
  const config = readEnvironment();
  assert.ok(
    config.mongoUri,
    "Set MONGODB_URI locally before running integration tests.",
  );
  const client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  const prefix = "test_sprint1_" + randomUUID().replaceAll("-", "") + "_";
  const collectionNames = [
    "users",
    "shops",
    "sessions",
    "workOrders",
    "invitations",
    "technicians",
  ].map((name) => prefix + name);
  let server;
  try {
    await client.connect();
    const db = client.db(config.mongoDbName);
    const store = createStore(db, prefix);
    await store.initialize();
    server = createServer(
      createApp(
        { ...config, nodeEnv: "development" },
        async () => "connected",
        store,
      ),
    );
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const origin = config.clientOrigins[0];
    const password = "test-only repair tools sunny bench";
    const request = (
      path,
      { body, cookie, method, origin: from = origin } = {},
    ) =>
      fetch(base + "/api" + path, {
        method: method ?? (body === undefined ? "GET" : "POST"),
        headers: {
          Origin: from,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    const cookieOf = (response) =>
      response.headers.get("set-cookie").split(";")[0];
    let alice, bob, aliceCookie, bobCookie, shopA, shopB;

    await t.test(
      "registration validates fields and ignores no permission injection",
      async () => {
        const invalid = await request("/auth/register", {
          body: { name: "", email: "bad", password: "short" },
        });
        assert.equal(invalid.status, 400);
        assert.deepEqual(
          Object.keys((await invalid.json()).error.fields).sort(),
          ["email", "name", "password"],
        );
        assert.equal(
          (
            await request("/auth/register", {
              body: {
                name: "A",
                email: "a@example.test",
                password,
                role: "manager",
                shopId: "other",
              },
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "registers once with a hashed password and opaque server session",
      async () => {
        const response = await request("/auth/register", {
          body: {
            name: "Alice Example",
            email: " Alice@Example.test ",
            password,
          },
        });
        assert.equal(response.status, 201);
        alice = await response.json();
        aliceCookie = cookieOf(response);
        assert.equal(alice.user.email, "alice@example.test");
        assert.equal(alice.shop, null);
        assert.deepEqual(Object.keys(alice.user).sort(), [
          "email",
          "id",
          "name",
        ]);
        const saved = await store.findEmail("alice@example.test");
        assert.notEqual(saved.passwordHash, password);
        assert.ok(saved.passwordHash.startsWith("scrypt-v1$"));
        const token = aliceCookie.split("=")[1];
        const session = await store.findSession(
          createHash("sha256").update(token).digest("hex"),
        );
        assert.equal(session.userId, alice.user.id);
        assert.notEqual(session._id, token);
        const cookie = response.headers.get("set-cookie");
        assert.match(cookie, /HttpOnly/i);
        assert.match(cookie, /SameSite=Lax/i);
        assert.match(cookie, /Path=\//i);
        assert.equal(response.headers.get("cache-control"), "no-store");
      },
    );
    await t.test(
      "duplicate registration recovers through sign-in without duplicate users",
      async () => {
        const duplicate = await request("/auth/register", {
          body: { name: "Alice", email: "ALICE@example.test", password },
        });
        assert.equal(duplicate.status, 409);
        assert.match((await duplicate.json()).error.message, /sign in/);
        assert.equal(
          await db.collection(prefix + "users").countDocuments({}),
          1,
        );
      },
    );
    await t.test(
      "unfinished setup survives sign-out and sign-in; logout revokes old cookie",
      async () => {
        assert.equal(
          (await request("/auth/sign-out", { cookie: aliceCookie, body: {} }))
            .status,
          204,
        );
        assert.equal(
          (await request("/auth/me", { cookie: aliceCookie })).status,
          401,
        );
        const response = await request("/auth/sign-in", {
          body: { email: "alice@example.test", password },
        });
        aliceCookie = cookieOf(response);
        assert.equal((await response.json()).shop, null);
        assert.equal(
          (await request("/work-orders", { cookie: aliceCookie })).status,
          409,
        );
      },
    );
    await t.test(
      "shop name is required; concurrent retries produce one shop and membership",
      async () => {
        assert.equal(
          (
            await request("/shops", {
              cookie: aliceCookie,
              body: { name: " " },
            })
          ).status,
          400,
        );
        const responses = await Promise.all(
          [1, 2, 3].map(() =>
            request("/shops", {
              cookie: aliceCookie,
              body: { name: "Northside Test Repair" },
            }),
          ),
        );
        assert.ok(responses.every((response) => response.status === 200));
        const states = await Promise.all(
          responses.map((response) => response.json()),
        );
        shopA = states[0].shop;
        assert.ok(states.every((state) => state.shop.id === shopA.id));
        assert.equal(
          await db.collection(prefix + "shops").countDocuments({}),
          1,
        );
        assert.deepEqual((await store.findShop(alice.user.id)).members, [
          { userId: alice.user.id, role: "manager" },
        ]);
        const retry = await request("/shops", {
          cookie: aliceCookie,
          body: { name: "Must not overwrite saved name" },
        });
        assert.equal((await retry.json()).shop.name, "Northside Test Repair");
      },
    );
    await t.test(
      "new shops have an empty real queue and persisted setup",
      async () => {
        assert.deepEqual(
          await (await request("/work-orders", { cookie: aliceCookie })).json(),
          { orders: [] },
        );
        assert.equal(
          (await (await request("/auth/me", { cookie: aliceCookie })).json())
            .shop.id,
          shopA.id,
        );
        const restoredStore = createStore(db, prefix);
        assert.equal(
          (await restoredStore.findShop(alice.user.id))._id,
          shopA.id,
        );
      },
    );
    await t.test("second manager receives a different shop", async () => {
      const response = await request("/auth/register", {
        body: { name: "Bob Example", email: "bob@example.test", password },
      });
      bob = await response.json();
      bobCookie = cookieOf(response);
      shopB = (
        await (
          await request("/shops", {
            cookie: bobCookie,
            body: { name: "Southside Test Repair" },
          })
        ).json()
      ).shop;
      assert.notEqual(shopB.id, shopA.id);
    });
    await t.test(
      "cross-shop reads and forged writes are rejected",
      async () => {
        assert.equal(
          (await request("/shops/" + shopB.id, { cookie: aliceCookie })).status,
          404,
        );
        assert.equal(
          (await request("/shops/" + shopA.id, { cookie: bobCookie })).status,
          404,
        );
        assert.equal(
          (
            await request("/work-orders?shopId=" + shopB.id, {
              cookie: aliceCookie,
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request("/shops", {
              cookie: aliceCookie,
              body: { name: "Attack", shopId: shopB.id, role: "manager" },
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request("/shops/" + shopB.id, {
              cookie: aliceCookie,
              method: "PATCH",
              body: { name: "Attack" },
            })
          ).status,
          404,
        );
        assert.equal(
          (await store.findShop(bob.user.id)).name,
          "Southside Test Repair",
        );
        assert.equal(
          (await request("/shops/" + shopA.id, { cookie: aliceCookie })).status,
          200,
        );
      },
    );
    await t.test(
      "work-order numbers and memberships are constrained within shop boundaries",
      async () => {
        const orders = db.collection(prefix + "workOrders");
        await orders.insertMany([
          { _id: "order-a", shopId: shopA.id, number: "WO-1" },
          { _id: "order-b", shopId: shopB.id, number: "WO-1" },
        ]);
        await assert.rejects(
          orders.insertOne({
            _id: "order-duplicate",
            shopId: shopA.id,
            number: "WO-1",
          }),
          { code: 11000 },
        );
        const queue = await (
          await request("/work-orders", { cookie: aliceCookie })
        ).json();
        assert.deepEqual(queue.orders, [{ _id: "order-a", number: "WO-1" }]);
        await assert.rejects(
          db.collection(prefix + "shops").insertOne({
            _id: "duplicate-membership",
            ownerId: "another-owner",
            name: "Bad shop",
            members: [{ userId: alice.user.id, role: "manager" }],
          }),
          { code: 11000 },
        );
      },
    );
    await t.test(
      "unauthenticated and forged-session requests cannot read or write",
      async () => {
        assert.equal(
          (await request("/shops", { body: { name: "Unauthorized" } })).status,
          401,
        );
        assert.equal((await request("/work-orders")).status, 401);
        assert.equal((await request("/shops/" + shopA.id)).status, 401);
        assert.equal(
          (
            await request("/auth/me", {
              cookie: "rsm_session=" + "a".repeat(64),
            })
          ).status,
          401,
        );
      },
    );
    await t.test(
      "browser mutation requests reject missing or foreign origins",
      async () => {
        assert.equal(
          (
            await request("/auth/sign-out", {
              cookie: aliceCookie,
              body: {},
              origin: "https://untrusted.example",
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request("/shops", {
              cookie: aliceCookie,
              body: { name: "Attack" },
              origin: "",
            })
          ).status,
          403,
        );
        assert.equal(
          (await request("/auth/me", { cookie: aliceCookie })).status,
          200,
        );
      },
    );
    await t.test(
      "wrong credentials and unknown accounts use the same error",
      async () => {
        const wrong = await request("/auth/sign-in", {
          body: {
            email: "alice@example.test",
            password: "wrong password string",
          },
        });
        const missing = await request("/auth/sign-in", {
          body: {
            email: "missing@example.test",
            password: "wrong password string",
          },
        });
        assert.equal(wrong.status, 401);
        assert.equal(missing.status, 401);
        assert.deepEqual(await wrong.json(), await missing.json());
      },
    );
    await t.test(
      "front-desk membership is derived from saved shop data",
      async () => {
        const staff = await store.addUser({
          name: "Test Front Desk",
          email: "staff@example.test",
          passwordHash: (await store.findEmail("alice@example.test"))
            .passwordHash,
        });
        await db
          .collection(prefix + "shops")
          .updateOne(
            { _id: shopA.id },
            { $push: { members: { userId: staff._id, role: "front-desk" } } },
          );
        const response = await request("/auth/sign-in", {
          body: {
            email: staff.email,
            password,
            role: "manager",
            shopId: shopB.id,
          },
        });
        const account = await response.json();
        assert.equal(account.shop.id, shopA.id);
        assert.equal(account.shop.role, "front-desk");
      },
    );
    await t.test(
      "sessions expire even before MongoDB TTL cleanup",
      async () => {
        const hash = createHash("sha256")
          .update(bobCookie.split("=")[1])
          .digest("hex");
        await db
          .collection(prefix + "sessions")
          .updateOne({ _id: hash }, { $set: { expiresAt: new Date(0) } });
        assert.equal(
          (await request("/auth/me", { cookie: bobCookie })).status,
          401,
        );
      },
    );
    await t.test(
      "production cookies are Secure and use the host-only prefix",
      async () => {
        const production = createServer(
          createApp(
            { ...config, nodeEnv: "production" },
            async () => "connected",
            store,
          ),
        );
        await new Promise((resolve) =>
          production.listen(0, "127.0.0.1", resolve),
        );
        try {
          const response = await fetch(
            "http://127.0.0.1:" +
              production.address().port +
              "/api/auth/sign-in",
            {
              method: "POST",
              headers: { Origin: origin, "Content-Type": "application/json" },
              body: JSON.stringify({ email: "alice@example.test", password }),
            },
          );
          assert.equal(response.status, 200);
          assert.match(
            response.headers.get("set-cookie"),
            /^__Host-rsm_session=/,
          );
          assert.match(response.headers.get("set-cookie"), /; Secure/);
          assert.equal(
            response.headers.get("set-cookie").includes("Domain="),
            false,
          );
        } finally {
          production.closeAllConnections();
          await new Promise((resolve) => production.close(resolve));
        }
      },
    );
    await t.test("authentication attempts are rate limited", async () => {
      let last;
      for (let attempt = 0; attempt < 21; attempt++)
        last = await request("/auth/sign-in", { body: {} });
      assert.equal(last.status, 429);
      assert.ok(last.headers.get("retry-after"));
    });
  } finally {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    for (const name of collectionNames) {
      assert.ok(
        name.startsWith(prefix) && /^test_sprint1_[a-f0-9]{32}_/.test(name),
      );
      await client
        .db(config.mongoDbName)
        .collection(name)
        .drop()
        .catch((error) => {
          if (error.code !== 26) throw error;
        });
    }
    await client.close();
  }
});
