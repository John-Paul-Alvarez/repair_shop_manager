import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { readEnvironment } from "../../src/config/env.js";
import { createStore } from "../../src/auth/store.js";
import { createApp } from "../../src/app.js";

test("Sprint 7 customer tracking against Atlas", async () => {
  const config = readEnvironment();
  assert.ok(config.mongoUri, "Set MONGODB_URI locally before running integration tests.");
  const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const prefix = "test_sprint7_" + randomUUID().replaceAll("-", "") + "_";
  const collections = ["users", "shops", "sessions", "workOrders", "invitations", "technicians", "repairNotes", "trackingLinks"].map((name) => prefix + name);
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
    const password = "test-only tracking phrase";
    const register = async (email, name) => {
      const response = await send("/auth/register", { name, email, password });
      const cookie = response.headers.get("set-cookie").split(";")[0];
      await send("/shops", { name: name + " Repairs" }, cookie);
      return cookie;
    };
    const managerCookie = await register("manager@example.test", "Northside");
    const otherCookie = await register("other@example.test", "Southside");
    const created = await send("/work-orders", {
      customerName: "Maya Chen", customerPhone: "555 0188", customerEmail: "maya@example.test",
      device: "iPhone 14 Pro", problem: "Screen stays black after a drop.", technicianId: "", requestId: randomUUID(),
    }, managerCookie);
    const order = (await created.json()).order;
    const issue = async () => {
      const response = await send("/work-orders/" + order._id + "/tracking-link", {}, managerCookie);
      assert.equal(response.status, 201);
      return (await response.json()).path.split("/").pop();
    };
    const first = await issue();
    const publicRepair = await send("/tracking/" + first);
    assert.equal(publicRepair.status, 200);
    const body = await publicRepair.json();
    assert.deepEqual(body.repair, {
      number: order.number,
      device: "iPhone 14 Pro",
      problem: "Screen stays black after a drop.",
      status: "Received",
      updatedAt: body.repair.updatedAt,
    });
    assert.equal("customerName" in body.repair, false);
    assert.equal("technicianName" in body.repair, false);
    assert.equal((await send("/work-orders/" + order._id + "/tracking-link", {}, otherCookie)).status, 404);
    const second = await issue();
    assert.equal((await send("/tracking/" + first)).status, 410);
    assert.equal((await send("/tracking/" + second)).status, 200);
    assert.equal((await send("/tracking/not-a-token")).status, 410);
  } finally {
    if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
    for (const name of collections) await client.db(config.mongoDbName).collection(name).drop().catch((error) => { if (error.code !== 26) throw error; });
    await client.close();
  }
});
