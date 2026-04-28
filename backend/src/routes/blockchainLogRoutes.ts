import express from "express";
import { getBlockchainLogs } from "../controllers/blockchainLogController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getBlockchainLogs
);

export default router;