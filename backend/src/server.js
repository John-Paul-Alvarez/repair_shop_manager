import "dotenv/config";
import { createServer } from "node:http";
import { createApp } from "./app.js";
import { readEnvironment } from "./config/env.js";
import { createDatabase } from "./config/database.js";
import { createStore } from "./auth/store.js";
async function startServer() {
  let config;
  try {
    config = readEnvironment();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Invalid environment settings.",
    );
    process.exitCode = 1;
    return;
  }
  let database;
  try {
    database = createDatabase(config);
  } catch {
    console.error("Invalid MongoDB connection settings. Check backend/.env.");
    process.exitCode = 1;
    return;
  }
  try {
    await database.connect();
    const store = config.mongoUri ? createStore(database.getDb()) : undefined;
    await store?.initialize();
    const server = createServer(createApp(config, database.status, store));
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(config.port, config.host, () => {
        server.off("error", reject);
        resolve();
      });
    });
    console.info("API running at http://" + config.host + ":" + config.port);
    console.info(
      config.mongoUri
        ? "MongoDB connected."
        : "MongoDB not configured. Set MONGODB_URI in backend/.env when ready.",
    );
    let shuttingDown = false;
    const shutdown = () => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.info("Stopping API...");
      const deadline = setTimeout(() => process.exit(1), 1e4);
      deadline.unref();
      server.close(async () => {
        try {
          await database.close();
        } catch {
          console.error("Database shutdown did not complete cleanly.");
          process.exitCode = 1;
        } finally {
          clearTimeout(deadline);
        }
      });
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch {
    console.error(
      "API startup failed. Check your port and MongoDB connection settings.",
    );
    await database.close().catch(() => undefined);
    process.exitCode = 1;
  }
}
void startServer();
