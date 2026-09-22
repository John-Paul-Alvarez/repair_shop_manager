import { randomUUID } from "node:crypto";
function createStore(db, prefix = "") {
  const users = db.collection(prefix + "users");
  const shops = db.collection(prefix + "shops");
  const sessions = db.collection(prefix + "sessions");
  const orders = db.collection(prefix + "workOrders");
  const invitations = db.collection(prefix + "invitations");
  const technicians = db.collection(prefix + "technicians");
  const notes = db.collection(prefix + "repairNotes");
  return {
    async initialize() {
      await users.createIndex({ email: 1 }, { unique: true });
      await shops.createIndex({ ownerId: 1 }, { unique: true });
      await shops.createIndex({ "members.userId": 1 }, { unique: true });
      await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await sessions.createIndex({ userId: 1 });
      await orders.createIndex({ shopId: 1, number: 1 }, { unique: true });
      await orders.createIndex({ shopId: 1, requestId: 1 }, { unique: true, sparse: true });
      await technicians.createIndex({ shopId: 1, name: 1 }, { unique: true });
      await technicians.createIndex(
        { shopId: 1, userId: 1 },
        { unique: true, sparse: true },
      );
      await notes.createIndex({ shopId: 1, orderId: 1, createdAt: -1 });
      await invitations.createIndex({ shopId: 1, email: 1 }, { unique: true });
      await invitations.createIndex({ tokenHash: 1 }, { unique: true });
      await invitations.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 },
      );
    },
    findUser: (id) => users.findOne({ _id: id }),
    findEmail: (email) => users.findOne({ email }),
    async addUser(input) {
      const user = { ...input, _id: randomUUID(), createdAt: new Date() };
      await users.insertOne(user);
      return user;
    },
    findShop: (userId) => shops.findOne({ "members.userId": userId }),
    async createShop(userId, name) {
      // Shop + initial membership are saved atomically. Retrying setup returns
      // the same shop instead of creating another one.
      return shops.findOneAndUpdate(
        { ownerId: userId },
        {
          $setOnInsert: {
            _id: randomUUID(),
            name,
            ownerId: userId,
            members: [{ userId, role: "manager" }],
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    },
    addSession: (session) => sessions.insertOne(session),
    findSession: (id) =>
      sessions.findOne({ _id: id, expiresAt: { $gt: new Date() } }),
    deleteSession: (id) => sessions.deleteOne({ _id: id }),
    async createInvitation(shopId, email, tokenHash, createdBy, role = "front-desk") {
      const invitation = {
        shopId,
        email,
        tokenHash,
        createdBy,
        role,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
      };
      await invitations.updateOne(
        { shopId, email },
        { $set: invitation },
        { upsert: true },
      );
      return invitation;
    },
    async inspectInvitation(tokenHash) {
      const invitation = await invitations.findOne({
        tokenHash,
        acceptedAt: null,
        expiresAt: { $gt: new Date() },
      });
      if (!invitation) return null;
      const shop = await shops.findOne({ _id: invitation.shopId });
      return shop
        ? {
            email: invitation.email,
            shopName: shop.name,
            role: invitation.role,
            expiresAt: invitation.expiresAt,
          }
        : null;
    },
    async acceptInvitation(tokenHash, { userId, newUser }) {
      // Consume the invitation, create the account if needed, and grant the
      // membership together. A failed or racing request rolls everything back.
      return db.client.withSession((session) =>
        session.withTransaction(async () => {
          const reject = (status, message) => {
            const error = new Error(message);
            error.status = status;
            throw error;
          };
          const invitation = await invitations.findOne(
            { tokenHash, acceptedAt: null, expiresAt: { $gt: new Date() } },
            { session },
          );
          if (!invitation)
            reject(
              410,
              "This invitation is expired, replaced, or already used. Ask your manager for a new link, or sign in if you already joined.",
            );
          let user = userId
            ? await users.findOne({ _id: userId }, { session })
            : null;
          if (userId && (!user || user.email !== invitation.email))
            reject(
              403,
              "Sign in with the email address shown on this invitation.",
            );
          if (!user) {
            if (await users.findOne({ email: invitation.email }, { session }))
              reject(
                409,
                "An account already exists for this email. Sign in to accept the invitation.",
              );
            if (!newUser) reject(400, "Enter your name and password to join.");
            user = {
              _id: randomUUID(),
              email: invitation.email,
              name: newUser.name,
              passwordHash: newUser.passwordHash,
              createdAt: new Date(),
            };
            await users.insertOne(user, { session });
          }
          if (await shops.findOne({ "members.userId": user._id }, { session }))
            reject(
              409,
              "This account already belongs to a shop. Sign in to that workspace or contact the inviting manager.",
            );
          const result = await shops.updateOne(
            { _id: invitation.shopId, "members.userId": { $ne: user._id } },
            { $push: { members: { userId: user._id, role: invitation.role } } },
            { session },
          );
          if (result.modifiedCount !== 1)
            reject(410, "This shop invitation is no longer available.");
          if (invitation.role === "technician") {
            await technicians.insertOne(
              {
                _id: randomUUID(),
                shopId: invitation.shopId,
                userId: user._id,
                name: user.name,
                createdAt: new Date(),
              },
              { session },
            );
          }
          await invitations.updateOne(
            { _id: invitation._id },
            { $set: { acceptedAt: new Date(), acceptedBy: user._id } },
            { session },
          );
          return {
            user,
            shop: await shops.findOne({ _id: invitation.shopId }, { session }),
          };
        }),
      );
    },
    listTechnicians: (shopId) =>
      technicians
        .find({ shopId }, { projection: { _id: 1, name: 1 } })
        .sort({ name: 1, _id: 1 })
        .toArray(),
    async addTechnician(shopId, name) {
      const technician = {
        _id: randomUUID(),
        shopId,
        name,
        createdAt: new Date(),
      };
      await technicians.insertOne(technician);
      return technician;
    },
    findTechnician: (shopId, technicianId) =>
      technicians.findOne({ _id: technicianId, shopId }),
    findTechnicianForUser: (shopId, userId) =>
      technicians.findOne({ shopId, userId }),
    findOrder: (shopId, orderId) => orders.findOne({ _id: orderId, shopId }),
    findOrderByRequestId: (shopId, requestId) =>
      orders.findOne({ shopId, requestId }),
    async createOrder(shopId, order) {
      const sequence = await shops.findOneAndUpdate(
        { _id: shopId },
        { $inc: { orderSequence: 1 } },
        { returnDocument: "after", projection: { orderSequence: 1 } },
      );
      const saved = {
        ...order,
        _id: randomUUID(),
        shopId,
        number: "WO-" + String(1000 + sequence.orderSequence),
        status: "Pending",
        version: 1,
        createdAt: new Date(),
      };
      await orders.insertOne(saved);
      return saved;
    },
    listOrders: (shopId, query = "", status = "") =>
      orders
        .find(
          {
            shopId,
            ...(status ? { status } : {}),
            ...(query
              ? {
                  $or: [
                    { number: { $regex: escapeRegex(query), $options: "i" } },
                    { customerName: { $regex: escapeRegex(query), $options: "i" } },
                    { customerPhone: { $regex: phonePattern(query), $options: "i" } },
                  ],
                }
              : {}),
          },
          {
            projection: {
              _id: 1,
              number: 1,
              customerName: 1,
              device: 1,
              problem: 1,
              technicianName: 1,
              status: 1,
              version: 1,
            },
          },
        )
        .sort({ createdAt: -1, _id: -1 })
        .limit(1000)
        .toArray(),
    countOrders: async (shopId) => {
      const rows = await orders
        .aggregate([
          { $match: { shopId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray();
      const counts = { All: 0, Pending: 0, "In Progress": 0, Completed: 0 };
      for (const row of rows) {
        counts[row._id] = row.count;
        counts.All += row.count;
      }
      return counts;
    },
    listAssignedOrders: (shopId, technicianId, query = "", status = "") =>
      orders
        .find(
          {
            shopId,
            technicianId,
            ...(status ? { status } : {}),
            ...(query
              ? {
                  $or: [
                    { number: { $regex: escapeRegex(query), $options: "i" } },
                    { device: { $regex: escapeRegex(query), $options: "i" } },
                    { problem: { $regex: escapeRegex(query), $options: "i" } },
                  ],
                }
              : {}),
          },
          {
            projection: {
              _id: 1,
              number: 1,
              device: 1,
              problem: 1,
              status: 1,
              technicianId: 1,
              technicianName: 1,
              version: 1,
            },
          },
        )
        .sort({ createdAt: -1, _id: -1 })
        .limit(1000)
        .toArray(),
    countAssignedOrders: async (shopId, technicianId) => {
      const rows = await orders
        .aggregate([
          { $match: { shopId, technicianId } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray();
      const counts = { All: 0, Pending: 0, "In Progress": 0, Completed: 0 };
      for (const row of rows) {
        counts[row._id] = row.count;
        counts.All += row.count;
      }
      return counts;
    },
    findAssignedOrder: (shopId, technicianId, orderId) =>
      orders.findOne({ _id: orderId, shopId, technicianId }),
    startAssignedOrder: (shopId, technicianId, orderId, version) =>
      orders.findOneAndUpdate(
        { _id: orderId, shopId, technicianId, status: "Pending", version },
        {
          $set: { status: "In Progress", updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { returnDocument: "after" },
      ),
    completeAssignedOrder: (shopId, technicianId, orderId, version) =>
      orders.findOneAndUpdate(
        { _id: orderId, shopId, technicianId, status: "In Progress", version },
        {
          $set: { status: "Completed", updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { returnDocument: "after" },
      ),
    async addRepairNote(shopId, orderId, author, text) {
      const note = {
        _id: randomUUID(),
        shopId,
        orderId,
        authorId: author._id,
        authorName: author.name,
        text,
        createdAt: new Date(),
      };
      await notes.insertOne(note);
      return note;
    },
    listRepairNotes: (shopId, orderId) =>
      notes
        .find({ shopId, orderId })
        .sort({ createdAt: 1, _id: 1 })
        .toArray(),
    updateAssignment: (shopId, orderId, version, technician) =>
      orders.findOneAndUpdate(
        { _id: orderId, shopId, $or: [{ version }, { version: { $exists: false } }] },
        { $set: { technicianId: technician?._id ?? null, technicianName: technician?.name ?? null, updatedAt: new Date() }, $inc: { version: 1 } },
        { returnDocument: "after" },
      ),
    updateStatus: (shopId, orderId, version, status) =>
      orders.findOneAndUpdate(
        { _id: orderId, shopId, $or: [{ version }, { version: { $exists: false } }] },
        { $set: { status, updatedAt: new Date() }, $inc: { version: 1 } },
        { returnDocument: "after" },
      ),
  };
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function phonePattern(value) {
  const digits = value.replace(/\D/g, "");
  return digits ? digits.split("").map(escapeRegex).join("\\D*") : escapeRegex(value);
}
function isDuplicate(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}
export { createStore, isDuplicate };
