import { Router, Request, Response } from "express";
import { getIntegrationStatus } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    integrations: getIntegrationStatus(),
  });
});
