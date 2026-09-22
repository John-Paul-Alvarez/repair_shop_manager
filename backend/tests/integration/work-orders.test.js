import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";
import { readEnvironment } from "../../src/config/env.js";
import { createStore } from "../../src/auth/store.js";
import { createApp } from "../../src/app.js";

test("Sprint 3 work orders against Atlas", async (t) => {
  const config = readEnvironment();
  assert.ok(config.mongoUri, "Set MONGODB_URI locally before running integration tests.");
  const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  const prefix = "test_sprint3_" + randomUUID().replaceAll("-", "") + "_";
  const collections = ["users", "shops", "sessions", "workOrders", "invitations", "technicians"].map((name) => prefix + name);
  let server;
  try {
    await client.connect();
    const db = client.db(config.mongoDbName);
    const store = createStore(db, prefix);
    await store.initialize();
    server = createServer(createApp({ ...config, nodeEnv: "development" }, async () => "connected", store));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    const password = "test-only repair intake phrase";
    const send = (path, body, cookie) => fetch(base + "/api" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { Origin: config.clientOrigins[0], ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const cookieOf = (response) => response.headers.get("set-cookie").split(";")[0];
    const registerShop = async (email, name) => {
      const registered = await send("/auth/register", { name, email, password });
      assert.equal(registered.status, 201);
      const cookie = cookieOf(registered);
      const savedShop = await send("/shops", { name: name + " Repairs" }, cookie);
      assert.equal(savedShop.status, 200);
      return { ...(await registered.json()), shop: (await savedShop.json()).shop, cookie };
    };
    const manager = await registerShop("manager@example.test", "Northside");
    const other = await registerShop("other@example.test", "Southside");
    const invitation = await (await send("/invitations", { email: "staff@example.test" }, manager.cookie)).json();
    const invitationToken = invitation.path.split("/").pop();
    const accepted = await send("/invitations/" + invitationToken + "/accept", { name: "Front Desk", password });
    assert.equal(accepted.status, 200);
    const staff = { ...(await accepted.json()), cookie: cookieOf(accepted) };
    let technician;
    let savedOrder;
    const validOrder = (requestId = randomUUID()) => ({
      customerName: "Maya Chen",
      customerPhone: "555 0188",
      customerEmail: "maya@example.test",
      device: "iPhone 14 Pro",
      problem: "Screen stays black after a drop.",
      technicianId: technician?._id ?? "",
      requestId,
    });
    await t.test("only managers add technicians in their own shop", async () => {
      assert.equal((await send("/technicians", { name: "Alex" }, staff.cookie)).status, 403);
      const response = await send("/technicians", { name: "Alex" }, manager.cookie);
      assert.equal(response.status, 201);
      technician = (await response.json()).technician;
      const otherList = await (await send("/technicians", undefined, other.cookie)).json();
      assert.equal(otherList.technicians.length, 0);
    });
    await t.test("front desk saves a pending order with a same-shop technician", async () => {
      const response = await send("/work-orders", validOrder(), staff.cookie);
      assert.equal(response.status, 201);
      savedOrder = (await response.json()).order;
      assert.match(savedOrder.number, /^WO-\d+$/);
      assert.equal(savedOrder.status, "Pending");
      assert.equal(savedOrder.technicianName, "Alex");
      assert.equal(savedOrder.shopId, manager.shop.id);
      const queue = await (await send("/work-orders", undefined, manager.cookie)).json();
      assert.equal(queue.orders.length, 1);
      assert.equal(queue.orders[0]._id, savedOrder._id);
    });
    await t.test("intake can remain unassigned when the shop has no chosen technician", async () => {
      const response = await send("/work-orders", { ...validOrder(), technicianId: "" }, staff.cookie);
      assert.equal(response.status, 201);
      const order = (await response.json()).order;
      assert.equal(order.technicianId, null);
      assert.equal(order.technicianName, null);
    });
    await t.test("server validation keeps incomplete orders out", async () => {
      const response = await send("/work-orders", { ...validOrder(), customerName: "", customerPhone: "", device: "", problem: "" }, staff.cookie);
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.ok(body.error.fields.customerName);
      assert.ok(body.error.fields.customerPhone);
      assert.ok(body.error.fields.device);
      assert.ok(body.error.fields.problem);
      assert.equal((await (await send("/work-orders", undefined, manager.cookie)).json()).orders.length, 2);
    });
    await t.test("a retry with the same request id returns the original record", async () => {
      const requestId = randomUUID();
      const first = await send("/work-orders", validOrder(requestId), staff.cookie);
      assert.equal(first.status, 201);
      const created = (await first.json()).order;
      const retry = await send("/work-orders", validOrder(requestId), staff.cookie);
      assert.equal(retry.status, 200);
      assert.equal((await retry.json()).order._id, created._id);
    });
    await t.test("search, manager assignment, and explicit status saves stay shop-scoped", async () => {
      const found = await (await send("/work-orders?q=maya", undefined, staff.cookie)).json();
      assert.equal(found.orders.length, 3);
      assert.equal(found.counts.All, 3);
      assert.equal((await send("/work-orders/" + savedOrder._id + "/assignment", { technicianId: "", version: savedOrder.version }, staff.cookie)).status, 403);
      const assigned = await send("/work-orders/" + savedOrder._id + "/assignment", { technicianId: "", version: savedOrder.version }, manager.cookie);
      assert.equal(assigned.status, 200);
      const afterAssignment = (await assigned.json()).order;
      assert.equal(afterAssignment.technicianName, null);
      const status = await send("/work-orders/" + savedOrder._id + "/status", { status: "In Progress", version: afterAssignment.version }, manager.cookie);
      assert.equal(status.status, 200);
      const afterStatus = (await status.json()).order;
      assert.equal(afterStatus.status, "In Progress");
      assert.equal((await send("/work-orders/" + savedOrder._id + "/status", { status: "Completed", version: afterAssignment.version }, manager.cookie)).status, 409);
    });
    await t.test("foreign shop data and unauthenticated access are rejected", async () => {
      const otherTech = (await (await send("/technicians", { name: "Sam" }, other.cookie)).json()).technician;
      assert.equal((await send("/work-orders", { ...validOrder(), technicianId: otherTech._id }, staff.cookie)).status, 400);
      assert.equal((await send("/work-orders/" + savedOrder._id, undefined, other.cookie)).status, 404);
      assert.equal((await send("/work-orders", validOrder())).status, 401);
    });
  } finally {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    for (const name of collections) {
      assert.match(name, /^test_sprint3_[a-f0-9]{32}_/);
      await client.db(config.mongoDbName).collection(name).drop().catch((error) => {
        if (error.code !== 26) throw error;
      });
    }
    await client.close();
  }
});
