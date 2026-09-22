import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { readEnvironment } from "../../src/config/env.js";
import { createStore } from "../../src/auth/store.js";
import { createApp } from "../../src/app.js";

test("Sprint 2 invitations against Atlas", async (t) => {
  const config = readEnvironment();
  assert.ok(
    config.mongoUri,
    "Set MONGODB_URI locally before running integration tests.",
  );
  const client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  const prefix = "test_sprint2_" + randomUUID().replaceAll("-", "") + "_";
  const names = ["users", "shops", "sessions", "workOrders", "invitations", "technicians"].map(
    (name) => prefix + name,
  );
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
    const password = "test-only invited repair tools phrase";
    const send = (path, body, cookie) =>
      fetch(base + "/api" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: config.clientOrigins[0],
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    const cookieOf = (response) =>
      response.headers.get("set-cookie").split(";")[0];
    const register = async (email) => {
      const response = await send("/auth/register", {
        name: "Test User",
        email,
        password,
      });
      assert.equal(response.status, 201);
      return { ...(await response.json()), cookie: cookieOf(response) };
    };
    const invite = async (email, cookie) => {
      const response = await send("/invitations", { email }, cookie);
      assert.equal(response.status, 201);
      const data = await response.json();
      return { ...data, token: data.path.split("/").pop() };
    };
    const manager = await register("manager@example.test");
    manager.shop = (
      await (
        await send("/shops", { name: "Northside Test" }, manager.cookie)
      ).json()
    ).shop;
    const other = await register("other@example.test");
    other.shop = (
      await (
        await send("/shops", { name: "Southside Test" }, other.cookie)
      ).json()
    ).shop;
    let invitation, staff;
    await t.test(
      "manager may skip invitations and enter the empty queue",
      async () => {
        assert.deepEqual(
          await (await send("/work-orders", undefined, manager.cookie)).json(),
          {
            orders: [],
            counts: { All: 0, Pending: 0, "In Progress": 0, Completed: 0 },
          },
        );
        assert.equal(
          await db.collection(prefix + "invitations").countDocuments({}),
          0,
        );
      },
    );
    await t.test(
      "only authenticated managers can create invitations for their own shop",
      async () => {
        assert.equal(
          (await send("/invitations", { email: "staff@example.test" })).status,
          401,
        );
        assert.equal(
          (
            await send(
              "/invitations",
              {
                email: "staff@example.test",
                shopId: other.shop.id,
                role: "manager",
              },
              manager.cookie,
            )
          ).status,
          403,
        );
        assert.equal(
          (await send("/invitations", { email: "bad" }, manager.cookie)).status,
          400,
        );
        invitation = await invite(" STAFF@Example.test ", manager.cookie);
        assert.equal(invitation.email, "staff@example.test");
        assert.equal(invitation.role, "front-desk");
        assert.equal(invitation.delivery, "manual-link");
        assert.equal(invitation.shopName, "Northside Test");
        const saved = await db
          .collection(prefix + "invitations")
          .findOne({ email: "staff@example.test" });
        assert.equal(saved.shopId, manager.shop.id);
        assert.equal(
          saved.tokenHash,
          createHash("sha256").update(invitation.token).digest("hex"),
        );
        assert.equal(JSON.stringify(saved).includes(invitation.token), false);
        assert.ok(saved.expiresAt > new Date());
      },
    );
    await t.test(
      "preview exposes only intended recipient, shop, role, and expiry",
      async () => {
        const response = await send("/invitations/" + invitation.token);
        assert.equal(response.status, 200);
        assert.deepEqual(Object.keys(await response.json()).sort(), [
          "email",
          "expiresAt",
          "role",
          "shopName",
        ]);
        assert.equal(response.headers.get("cache-control"), "no-store");
      },
    );
    await t.test(
      "wrong signed-in identity and forged role/email are rejected",
      async () => {
        assert.equal(
          (
            await send(
              "/invitations/" + invitation.token + "/accept",
              {},
              other.cookie,
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await send("/invitations/" + invitation.token + "/accept", {
              name: "Attack",
              password,
              email: "attack@example.test",
              role: "manager",
            })
          ).status,
          403,
        );
        assert.equal(
          (await send("/invitations/" + invitation.token)).status,
          200,
        );
      },
    );
    await t.test(
      "new employee joins with the invitation email and front-desk role",
      async () => {
        const response = await send(
          "/invitations/" + invitation.token + "/accept",
          { name: "Test Front Desk", password },
        );
        assert.equal(response.status, 200);
        staff = { ...(await response.json()), cookie: cookieOf(response) };
        assert.equal(staff.user.email, "staff@example.test");
        assert.equal(staff.shop.id, manager.shop.id);
        assert.equal(staff.shop.role, "front-desk");
        assert.equal(
          (await store.findEmail(staff.user.email)).passwordHash.startsWith(
            "scrypt-v1$",
          ),
          true,
        );
        assert.equal(
          (
            await send(
              "/invitations",
              { email: "forbidden@example.test" },
              staff.cookie,
            )
          ).status,
          403,
        );
        assert.equal(
          (await send("/shops/" + other.shop.id, undefined, staff.cookie))
            .status,
          404,
        );
      },
    );
    await t.test(
      "used invitations cannot create another account or membership",
      async () => {
        const before = await db.collection(prefix + "users").countDocuments({});
        assert.equal(
          (await send("/invitations/" + invitation.token)).status,
          410,
        );
        assert.equal(
          (
            await send(
              "/invitations/" + invitation.token + "/accept",
              {},
              staff.cookie,
            )
          ).status,
          410,
        );
        assert.equal(
          await db.collection(prefix + "users").countDocuments({}),
          before,
        );
        assert.equal(
          (await store.findShop(manager.user.id)).members.filter(
            (member) => member.userId === staff.user.id,
          ).length,
          1,
        );
      },
    );
    await t.test(
      "manager and front desk see the same real saved queue, not another shop",
      async () => {
        await db.collection(prefix + "workOrders").insertMany([
          {
            _id: "north-order",
            shopId: manager.shop.id,
            number: "WO-1",
            customerName: "Example Customer",
            device: "Laptop",
            problem: "Will not start",
            technicianName: "Alex",
            status: "Pending",
          },
          { _id: "south-order", shopId: other.shop.id, number: "WO-2" },
        ]);
        const managerQueue = await (
          await send("/work-orders", undefined, manager.cookie)
        ).json();
        const staffQueue = await (
          await send("/work-orders", undefined, staff.cookie)
        ).json();
        assert.deepEqual(staffQueue, managerQueue);
        assert.equal(staffQueue.orders.length, 1);
        assert.equal(staffQueue.orders[0].customerName, "Example Customer");
        assert.equal(
          (
            await send(
              "/work-orders?shopId=" + other.shop.id,
              undefined,
              staff.cookie,
            )
          ).status,
          403,
        );
      },
    );
    await t.test(
      "an existing account signs in to accept without creating another account",
      async () => {
        const existing = await register("existing@example.test");
        const link = await invite(existing.user.email, manager.cookie);
        assert.equal(
          (
            await send("/invitations/" + link.token + "/accept", {
              name: "Duplicate",
              password,
            })
          ).status,
          409,
        );
        const accepted = await send(
          "/invitations/" + link.token + "/accept",
          {},
          existing.cookie,
        );
        assert.equal(accepted.status, 200);
        assert.equal((await accepted.json()).user.id, existing.user.id);
        assert.equal(
          await db
            .collection(prefix + "users")
            .countDocuments({ email: existing.user.email }),
          1,
        );
      },
    );
    await t.test(
      "expired, replaced, and malformed links have a recovery response",
      async () => {
        const first = await invite("replace@example.test", manager.cookie);
        const replacement = await invite(
          "replace@example.test",
          manager.cookie,
        );
        assert.equal((await send("/invitations/" + first.token)).status, 410);
        assert.equal(
          (await send("/invitations/" + replacement.token)).status,
          200,
        );
        await db
          .collection(prefix + "invitations")
          .updateOne(
            { email: "replace@example.test" },
            { $set: { expiresAt: new Date(0) } },
          );
        assert.equal(
          (await send("/invitations/" + replacement.token)).status,
          410,
        );
        assert.equal((await send("/invitations/not-a-token")).status, 410);
      },
    );
    await t.test(
      "concurrent acceptance consumes once and never duplicates membership",
      async () => {
        const existing = await register("race@example.test");
        const link = await invite(existing.user.email, manager.cookie);
        const responses = await Promise.all(
          [1, 2].map(() =>
            send("/invitations/" + link.token + "/accept", {}, existing.cookie),
          ),
        );
        assert.equal(
          responses.filter((response) => response.status === 200).length,
          1,
        );
        assert.equal(
          responses.filter((response) => [409, 410].includes(response.status))
            .length,
          1,
        );
        assert.equal(
          (await store.findShop(manager.user.id)).members.filter(
            (member) => member.userId === existing.user.id,
          ).length,
          1,
        );
      },
    );
    await t.test(
      "joining another shop fails without consuming the invitation or moving membership",
      async () => {
        const existing = await register("already-owned@example.test");
        const link = await invite(existing.user.email, manager.cookie);
        const owned = (
          await (
            await send("/shops", { name: "Third Shop" }, existing.cookie)
          ).json()
        ).shop;
        assert.equal(
          (
            await send(
              "/invitations/" + link.token + "/accept",
              {},
              existing.cookie,
            )
          ).status,
          409,
        );
        assert.equal((await store.findShop(existing.user.id))._id, owned.id);
        assert.equal((await send("/invitations/" + link.token)).status, 200);
        assert.equal(
          (
            await send(
              "/invitations",
              { email: existing.user.email },
              manager.cookie,
            )
          ).status,
          409,
        );
      },
    );
  } finally {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    for (const name of names) {
      assert.match(name, /^test_sprint2_[a-f0-9]{32}_/);
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
