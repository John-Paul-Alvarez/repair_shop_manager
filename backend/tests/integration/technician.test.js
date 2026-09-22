import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { readEnvironment } from "../../src/config/env.js";
import { createStore } from "../../src/auth/store.js";
import { createApp } from "../../src/app.js";

test("Sprint 6 technician work against Atlas", async (t) => {
  const config = readEnvironment();
  assert.ok(config.mongoUri, "Set MONGODB_URI locally before running integration tests.");
  const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const prefix = "test_sprint6_" + randomUUID().replaceAll("-", "") + "_";
  const collections = ["users", "shops", "sessions", "workOrders", "invitations", "technicians", "repairNotes"].map((name) => prefix + name);
  let server;
  try {
    await client.connect();
    const store = createStore(client.db(config.mongoDbName), prefix);
    await store.initialize();
    server = createServer(createApp({ ...config, nodeEnv: "development" }, async () => "connected", store));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const send = (path, body, cookie) => fetch(base + "/api" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { Origin: config.clientOrigins[0], ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const cookieOf = (response) => response.headers.get("set-cookie").split(";")[0];
    const password = "test-only technician phrase";
    const registerManager = async (email, name) => {
      const registered = await send("/auth/register", { name, email, password });
      assert.equal(registered.status, 201);
      const cookie = cookieOf(registered);
      const setup = await send("/shops", { name: name + " Repairs" }, cookie);
      return { ...(await setup.json()), cookie };
    };
    const manager = await registerManager("manager@example.test", "Northside");
    const other = await registerManager("other@example.test", "Southside");
    const invitation = await (await send("/invitations", { email: "alex@example.test", role: "technician" }, manager.cookie)).json();
    const token = invitation.path.split("/").pop();
    const accepted = await send("/invitations/" + token + "/accept", { name: "Alex Rivera", password });
    assert.equal(accepted.status, 200);
    const technicianCookie = cookieOf(accepted);
    let order;
    await t.test("technician sign-in identity has an assigned-only queue", async () => {
      const account = await (await send("/auth/me", undefined, technicianCookie)).json();
      assert.equal(account.shop.role, "technician");
      const emptyResponse = await send("/my-repairs", undefined, technicianCookie);
      assert.equal(emptyResponse.status, 200);
      const empty = await emptyResponse.json();
      assert.deepEqual(empty.counts, { All: 0, Pending: 0, "In Progress": 0, Completed: 0 });
      assert.deepEqual(empty.orders, []);
      assert.equal((await send("/work-orders", undefined, technicianCookie)).status, 403);
    });
    await t.test("assigned technician can start, note, and complete only their repair", async () => {
      const technicians = await (await send("/technicians", undefined, manager.cookie)).json();
      const alex = technicians.technicians.find((item) => item.name === "Alex Rivera");
      assert.ok(alex);
      const created = await send("/work-orders", {
        customerName: "Maya Chen", customerPhone: "555 0188", customerEmail: "maya@example.test",
        device: "iPhone 14 Pro", problem: "Screen stays black after a drop.", technicianId: alex._id, requestId: randomUUID(),
      }, manager.cookie);
      assert.equal(created.status, 201);
      order = (await created.json()).order;
      const foundResponse = await send("/my-repairs?q=iphone", undefined, technicianCookie);
      assert.equal(foundResponse.status, 200);
      const found = await foundResponse.json();
      assert.equal(found.orders.length, 1);
      assert.equal(found.orders[0]._id, order._id);
      assert.equal((await send("/work-orders/" + order._id, undefined, other.cookie)).status, 404);
      const started = await send("/work-orders/" + order._id + "/start", { version: order.version }, technicianCookie);
      assert.equal(started.status, 200);
      order = (await started.json()).order;
      assert.equal(order.status, "In Progress");
      const note = await send("/work-orders/" + order._id + "/notes", { text: "Re-seated the display connector." }, technicianCookie);
      assert.equal(note.status, 201);
      assert.equal((await note.json()).note.authorName, "Alex Rivera");
      const completed = await send("/work-orders/" + order._id + "/complete", { version: order.version }, technicianCookie);
      assert.equal(completed.status, 200);
      assert.equal((await completed.json()).order.status, "Completed");
    });
    await t.test("technicians cannot act after reassignment or use manager routes", async () => {
      const stale = await send("/work-orders/" + order._id + "/start", { version: order.version + 1 }, technicianCookie);
      assert.equal(stale.status, 409);
      assert.equal((await send("/work-orders/" + order._id + "/status", { status: "Pending", version: order.version + 1 }, technicianCookie)).status, 403);
      assert.equal((await send("/technicians", { name: "Nope" }, technicianCookie)).status, 403);
      assert.equal((await send("/work-orders", { customerName: "Nope" }, technicianCookie)).status, 403);
    });
  } finally {
    if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
    for (const name of collections) await client.db(config.mongoDbName).collection(name).drop().catch((error) => { if (error.code !== 26) throw error; });
    await client.close();
  }
});
