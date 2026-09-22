import { MongoClient, ServerApiVersion } from "mongodb";
function createDatabase(config) {
  const client = config.mongoUri
    ? new MongoClient(config.mongoUri, {
        serverSelectionTimeoutMS: 5e3,
        connectTimeoutMS: 5e3,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      })
    : null;
  return {
    async connect() {
      if (!client) return;
      await client.connect();
      await client
        .db(config.mongoDbName)
        .command({ ping: 1 }, { timeoutMS: 5e3 });
    },
    async status() {
      if (!client) return "not_configured";
      try {
        await client
          .db(config.mongoDbName)
          .command({ ping: 1 }, { timeoutMS: 5e3 });
        return "connected";
      } catch {
        return "unavailable";
      }
    },
    getDb() {
      if (!client) throw new Error("MongoDB is not configured.");
      return client.db(config.mongoDbName);
    },
    async close() {
      await client?.close();
    },
  };
}
export { createDatabase };
