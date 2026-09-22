import { createHash, randomBytes } from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { isDuplicate } from "./store.js";
import { hashPassword, verifyPassword, dummyHash } from "./password.js";
const sessionDuration = 1000 * 60 * 60 * 8;
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
const fail = (response, status, message, fields) =>
  response
    .status(status)
    .json({ error: { message, ...(fields ? { fields } : {}) } });
function publicState(user, shop) {
  return {
    user: { id: user._id, name: user.name, email: user.email },
    shop: shop
      ? {
          id: shop._id,
          name: shop.name,
          role: shop.members.find((member) => member.userId === user._id).role,
        }
      : null,
  };
}
function createAccountRouter(store, production, origins) {
  const router = Router();
  const cookieName = production ? "__Host-rsm_session" : "rsm_session";
  const cookieOptions = {
    httpOnly: true,
    secure: production,
    sameSite: "lax",
    path: "/",
  };
  const cookieToken = (request) => {
    const token = request.headers.cookie
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
  };
  async function authenticate(request) {
    const token = cookieToken(request);
    if (!token || !store) return null;
    const session = await store.findSession(tokenHash(token));
    return session ? store.findUser(session.userId) : null;
  }
  async function startSession(request, response, userId) {
    const previous = cookieToken(request);
    if (previous) await store.deleteSession(tokenHash(previous));
    const token = randomBytes(32).toString("hex");
    await store.addSession({
      _id: tokenHash(token),
      userId,
      expiresAt: new Date(Date.now() + sessionDuration),
    });
    response.cookie(cookieName, token, {
      ...cookieOptions,
      maxAge: sessionDuration,
    });
  }
  router.use((request, response, next) => {
    response.set("Cache-Control", "no-store");
    if (!store) {
      fail(
        response,
        503,
        "Account services are unavailable. Please try again later.",
      );
      return;
    }
    // CORS alone cannot prevent a cross-site write. Validate Origin as well.
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      if (
        !request.headers.origin ||
        !origins.includes(request.headers.origin)
      ) {
        fail(response, 403, "This request did not come from the application.");
        return;
      }
      if (!request.is("application/json")) {
        fail(response, 415, "Send an application/json request.");
        return;
      }
    }
    next();
  });
  const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        message:
          "Too many attempts. Please wait 15 minutes before trying again.",
      },
    },
  });
  router.post("/auth/register", authLimit, async (request, response) => {
    const body = request.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fields = {};
    if (!name || name.length > 100)
      fields.name = "Enter your name (up to 100 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      fields.email = "Enter a valid email address.";
    if (password.length < 15 || password.length > 128)
      fields.password =
        "Use 15–128 characters. A few unrelated words work well.";
    if (
      Object.keys(body).some(
        (key) => !["name", "email", "password"].includes(key),
      )
    ) {
      fail(response, 400, "Only name, email, and password are accepted.");
      return;
    }
    if (Object.keys(fields).length) {
      fail(response, 400, "Check the highlighted fields.", fields);
      return;
    }
    try {
      const user = await store.addUser({
        name,
        email,
        passwordHash: await hashPassword(password),
      });
      await startSession(request, response, user._id);
      response.status(201).json(publicState(user, null));
    } catch (error) {
      if (isDuplicate(error)) {
        fail(
          response,
          409,
          "Unable to create this account. If you registered before, sign in to continue your setup.",
        );
        return;
      }
      throw error;
    }
  });
  router.post("/auth/sign-in", authLimit, async (request, response) => {
    const email =
      typeof request.body?.email === "string"
        ? request.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof request.body?.password === "string" ? request.body.password : "";
    if (!email || email.length > 254 || !password || password.length > 128) {
      fail(response, 401, "Email or password is incorrect. Please try again.");
      return;
    }
    const user = await store.findEmail(email);
    const valid = await verifyPassword(
      password,
      user?.passwordHash ?? dummyHash,
    );
    if (!user || !valid) {
      fail(response, 401, "Email or password is incorrect. Please try again.");
      return;
    }
    await startSession(request, response, user._id);
    response.json(publicState(user, await store.findShop(user._id)));
  });
  router.post("/auth/sign-out", async (request, response) => {
    const token = cookieToken(request);
    if (token) await store.deleteSession(tokenHash(token));
    response.clearCookie(cookieName, cookieOptions).status(204).end();
  });
  router.get("/invitations/:token", async (request, response) => {
    if (!/^[a-f0-9]{64}$/.test(request.params.token)) {
      fail(
        response,
        410,
        "This invitation is unavailable. Ask your manager for a new link.",
      );
      return;
    }
    const invitation = await store.inspectInvitation(
      tokenHash(request.params.token),
    );
    if (!invitation) {
      fail(
        response,
        410,
        "This invitation is expired, replaced, or already used. Ask your manager for a new link, or sign in if you already joined.",
      );
      return;
    }
    response.json(invitation);
  });
  router.post(
    "/invitations/:token/accept",
    authLimit,
    async (request, response) => {
      if (!/^[a-f0-9]{64}$/.test(request.params.token)) {
        fail(response, 410, "This invitation is unavailable.");
        return;
      }
      const user = await authenticate(request);
      const body = request.body ?? {};
      if (
        Object.keys(body).some((key) => !["name", "password"].includes(key))
      ) {
        fail(
          response,
          403,
          "The invitation determines your email, shop, and access.",
        );
        return;
      }
      let newUser;
      if (!user) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const fields = {};
        if (!name || name.length > 100)
          fields.name = "Enter your name (up to 100 characters).";
        if (password.length < 15 || password.length > 128)
          fields.password = "Use 15–128 characters.";
        if (Object.keys(fields).length) {
          fail(response, 400, "Check the highlighted fields.", fields);
          return;
        }
        newUser = { name, passwordHash: await hashPassword(password) };
      }
      try {
        const accepted = await store.acceptInvitation(
          tokenHash(request.params.token),
          { userId: user?._id, newUser },
        );
        await startSession(request, response, accepted.user._id);
        response.json(publicState(accepted.user, accepted.shop));
      } catch (error) {
        if (isDuplicate(error)) {
          fail(
            response,
            409,
            "This account or invitation has already been updated. Sign in to continue.",
          );
          return;
        }
        if ([400, 403, 409, 410].includes(error.status)) {
          fail(response, error.status, error.message);
          return;
        }
        throw error;
      }
    },
  );
  router.use(async (request, response, next) => {
    const user = await authenticate(request);
    if (!user) {
      fail(response, 401, "Please sign in to continue.");
      return;
    }
    response.locals.user = user;
    next();
  });
  router.get("/auth/me", async (_request, response) => {
    const user = response.locals.user;
    response.json(publicState(user, await store.findShop(user._id)));
  });
  const inviteLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many invitations. Please try again in 15 minutes.",
      },
    },
  });
  router.post("/invitations", inviteLimit, async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    if (
      !shop ||
      shop.members.find((member) => member.userId === user._id)?.role !==
        "manager"
    ) {
      fail(response, 403, "Only your shop manager can invite staff.");
      return;
    }
    const body = request.body ?? {};
    if (Object.keys(body).some((key) => key !== "email")) {
      fail(
        response,
        403,
        "Invitations can only grant front-desk access to your own shop.",
      );
      return;
    }
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      fail(response, 400, "Enter a valid employee email.", {
        email: "Enter a valid email address.",
      });
      return;
    }
    const existing = await store.findEmail(email);
    if (existing && (await store.findShop(existing._id))) {
      fail(
        response,
        409,
        "This account already belongs to a shop. Check the email address with your employee.",
      );
      return;
    }
    const token = randomBytes(32).toString("hex");
    try {
      const invitation = await store.createInvitation(
        shop._id,
        email,
        tokenHash(token),
        user._id,
      );
      response
        .status(201)
        .json({
          path: "/invite/" + token,
          email,
          shopName: shop.name,
          role: "front-desk",
          expiresAt: invitation.expiresAt,
          delivery: "manual-link",
        });
    } catch (error) {
      if (isDuplicate(error)) {
        fail(
          response,
          409,
          "An invitation was just updated. Please try again.",
        );
        return;
      }
      throw error;
    }
  });
  router.post("/shops", async (request, response) => {
    const user = response.locals.user;
    const body = request.body ?? {};
    if (Object.keys(body).some((key) => key !== "name")) {
      fail(
        response,
        403,
        "Shop membership and permissions are assigned by the server.",
      );
      return;
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      fail(response, 400, "Enter a shop name.", {
        name: "Use a shop name of 1–100 characters.",
      });
      return;
    }
    let shop = await store.findShop(user._id);
    if (!shop) {
      try {
        shop = await store.createShop(user._id, name);
      } catch (error) {
        if (!isDuplicate(error)) throw error;
        shop = await store.findShop(user._id);
      }
    }
    if (!shop) throw new Error("Shop setup could not be completed.");
    response.json(publicState(user, shop));
  });
  router.get("/shops/:shopId", async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    if (!shop || shop._id !== request.params.shopId) {
      fail(response, 404, "Shop not found.");
      return;
    }
    response.json(publicState(user, shop).shop);
  });
  router.get("/work-orders", async (request, response) => {
    const shop = await store.findShop(response.locals.user._id);
    if (!shop) {
      fail(response, 409, "Name your shop before opening work orders.");
      return;
    }
    if (
      request.query.shopId !== undefined &&
      request.query.shopId !== shop._id
    ) {
      fail(response, 403, "You cannot access another shop.");
      return;
    }
    const query = typeof request.query.q === "string" ? request.query.q.trim().slice(0, 100) : "";
    const status = typeof request.query.status === "string" ? request.query.status : "";
    if (status && !["Pending", "In Progress", "Completed"].includes(status)) {
      fail(response, 400, "Choose a valid status filter.");
      return;
    }
    response.json({ orders: await store.listOrders(shop._id, query, status), counts: await store.countOrders(shop._id) });
  });
  router.get("/technicians", async (_request, response) => {
    const shop = await store.findShop(response.locals.user._id);
    if (!shop) {
      fail(response, 409, "Name your shop before managing technicians.");
      return;
    }
    response.json({ technicians: await store.listTechnicians(shop._id) });
  });
  router.post("/technicians", async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    const role = shop?.members.find((member) => member.userId === user._id)?.role;
    if (!shop || role !== "manager") {
      fail(response, 403, "Only your shop manager can add technicians.");
      return;
    }
    const body = request.body ?? {};
    if (Object.keys(body).some((key) => key !== "name")) {
      fail(response, 400, "Only a technician name is accepted.");
      return;
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      fail(response, 400, "Enter a technician name.", {
        name: "Use a technician name of 1–100 characters.",
      });
      return;
    }
    try {
      response.status(201).json({ technician: await store.addTechnician(shop._id, name) });
    } catch (error) {
      if (isDuplicate(error)) {
        fail(response, 409, "That technician is already in this shop's list.", {
          name: "Use a different technician name.",
        });
        return;
      }
      throw error;
    }
  });
  router.post("/work-orders", async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    if (!shop) {
      fail(response, 409, "Name your shop before creating a work order.");
      return;
    }
    const body = request.body ?? {};
    const allowed = [
      "customerName",
      "customerPhone",
      "customerEmail",
      "device",
      "problem",
      "technicianId",
      "requestId",
    ];
    if (Object.keys(body).some((key) => !allowed.includes(key))) {
      fail(response, 400, "Check the work order fields and try again.");
      return;
    }
    const clean = (value) => (typeof value === "string" ? value.trim() : "");
    const customerName = clean(body.customerName);
    const customerPhone = clean(body.customerPhone);
    const customerEmail = clean(body.customerEmail).toLowerCase();
    const device = clean(body.device);
    const problem = clean(body.problem);
    const technicianId = clean(body.technicianId);
    const requestId = clean(body.requestId);
    const fields = {};
    if (!customerName || customerName.length > 100)
      fields.customerName = "Enter the customer's name (up to 100 characters).";
    if (!customerPhone || customerPhone.length > 30)
      fields.customerPhone = "Enter a phone number (up to 30 characters).";
    if (
      customerEmail &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 254)
    )
      fields.customerEmail = "Enter a valid email address, or leave this blank.";
    if (!device || device.length > 150)
      fields.device = "Enter the device and model (up to 150 characters).";
    if (!problem || problem.length > 2000)
      fields.problem = "Describe the reported problem (up to 2,000 characters).";
    if (!/^[a-f0-9-]{36}$/i.test(requestId))
      fields.requestId = "Please try creating the work order again.";
    if (Object.keys(fields).length) {
      fail(response, 400, "Check the highlighted fields.", fields);
      return;
    }
    const existing = await store.findOrderByRequestId(shop._id, requestId);
    if (existing) {
      response.json({ order: existing, created: false });
      return;
    }
    let technician = null;
    if (technicianId) {
      technician = await store.findTechnician(shop._id, technicianId);
      if (!technician) {
        fail(response, 400, "Choose a technician from this shop's list.", {
          technicianId: "That technician is not available for this shop.",
        });
        return;
      }
    }
    try {
      const order = await store.createOrder(shop._id, {
        requestId,
        customerName,
        customerPhone,
        ...(customerEmail ? { customerEmail } : {}),
        device,
        problem,
        technicianId: technician?._id ?? null,
        technicianName: technician?.name ?? null,
      });
      response.status(201).json({ order, created: true });
    } catch (error) {
      if (isDuplicate(error)) {
        const duplicate = await store.findOrderByRequestId(shop._id, requestId);
        if (duplicate) {
          response.json({ order: duplicate, created: false });
          return;
        }
      }
      throw error;
    }
  });
  router.get("/work-orders/:orderId", async (request, response) => {
    const shop = await store.findShop(response.locals.user._id);
    if (!shop) {
      fail(response, 404, "Work order not found.");
      return;
    }
    const order = await store.findOrder(shop._id, request.params.orderId);
    if (!order) {
      fail(response, 404, "Work order not found.");
      return;
    }
    response.json({ order });
  });
  router.post("/work-orders/:orderId/assignment", async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    const role = shop?.members.find((member) => member.userId === user._id)?.role;
    if (!shop || role !== "manager") return fail(response, 403, "Only your shop manager can change assignments.");
    const body = request.body ?? {};
    if (Object.keys(body).some((key) => !["technicianId", "version"].includes(key))) return fail(response, 400, "Check the assignment fields.");
    const technicianId = typeof body.technicianId === "string" ? body.technicianId.trim() : "";
    const version = Number(body.version);
    if (!Number.isInteger(version) || version < 1) return fail(response, 400, "Reload this work order and try again.");
    const technician = technicianId ? await store.findTechnician(shop._id, technicianId) : null;
    if (technicianId && !technician) return fail(response, 400, "Choose a technician from this shop.", { technicianId: "That technician is not available." });
    const order = await store.updateAssignment(shop._id, request.params.orderId, version, technician);
    if (!order) return fail(response, 409, "This repair changed while you were viewing it. Reload before saving.");
    response.json({ order });
  });
  router.post("/work-orders/:orderId/status", async (request, response) => {
    const user = response.locals.user;
    const shop = await store.findShop(user._id);
    const role = shop?.members.find((member) => member.userId === user._id)?.role;
    if (!shop || role !== "manager") return fail(response, 403, "Only your shop manager can update repair status.");
    const body = request.body ?? {};
    if (Object.keys(body).some((key) => !["status", "version"].includes(key))) return fail(response, 400, "Check the status fields.");
    const status = typeof body.status === "string" ? body.status : "";
    const version = Number(body.version);
    if (!["Pending", "In Progress", "Completed"].includes(status) || !Number.isInteger(version) || version < 1) return fail(response, 400, "Choose a valid status and reload if needed.");
    const order = await store.updateStatus(shop._id, request.params.orderId, version, status);
    if (!order) return fail(response, 409, "This repair changed while you were viewing it. Reload before saving.");
    response.json({ order });
  });
  return router;
}
export { createAccountRouter };
