import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createHealthRouter } from "./routes/health.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { createAccountRouter } from "./auth/router.js";
function createApp(config, checkDatabase, store) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.clientOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createHealthRouter(checkDatabase));
  const accounts = createAccountRouter(
    store,
    config.nodeEnv === "production",
    config.clientOrigins,
  );
  app.use("/api", (request, response, next) => {
    if (/^\/(auth|shops|work-orders|invitations|technicians)(\/|$)/.test(request.path))
      accounts(request, response, next);
    else next();
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
export { createApp };
