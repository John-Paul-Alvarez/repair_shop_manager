import { Router } from "express";
function createHealthRouter(checkDatabase) {
  const router = Router();
  router.get("/health", async (_request, response) => {
    const database = await checkDatabase();
    response.set("Cache-Control", "no-store");
    response.status(database === "unavailable" ? 503 : 200).json({
      status: database === "unavailable" ? "degraded" : "ok",
      service: "repair-shop-manager-api",
      database,
    });
  });
  return router;
}
export { createHealthRouter };
