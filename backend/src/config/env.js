function readEnvironment(source = process.env) {
  const nodeEnv = source.NODE_ENV ?? "development";
  if (!["development", "test", "production"].includes(nodeEnv)) {
    throw new Error("NODE_ENV must be development, test, or production.");
  }
  const rawPort = source.PORT ?? "4000";
  const port = Number(rawPort);
  if (
    !/^\d+$/.test(rawPort) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  const clientOrigins = (
    source.CLIENT_ORIGINS ?? "http://127.0.0.1:5173,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (
    clientOrigins.length === 0 ||
    clientOrigins.some((origin) => {
      try {
        const url = new URL(origin);
        return (
          !["http:", "https:"].includes(url.protocol) || url.origin !== origin
        );
      } catch {
        return true;
      }
    })
  ) {
    throw new Error(
      "CLIENT_ORIGINS must contain exact HTTP or HTTPS origins separated by commas.",
    );
  }
  const mongoUri = source.MONGODB_URI?.trim() ?? "";
  if (mongoUri && !/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
    throw new Error(
      "MONGODB_URI must start with mongodb:// or mongodb+srv://.",
    );
  }
  if (nodeEnv === "production" && !mongoUri) {
    throw new Error("MONGODB_URI is required in production.");
  }
  const mongoDbName = source.MONGODB_DB_NAME?.trim() || "repair_shop_manager";
  if (
    /[\/\\. "$*<>:|?\x00]/.test(mongoDbName) ||
    Buffer.byteLength(mongoDbName) > 63
  ) {
    throw new Error("MONGODB_DB_NAME must be a valid MongoDB database name.");
  }
  return {
    nodeEnv,
    host: source.HOST?.trim() || "127.0.0.1",
    port,
    clientOrigins,
    mongoUri,
    mongoDbName,
  };
}
export { readEnvironment };
