import express from "express";
import {
  createCircular,
  getAllCirculars,
} from "../controllers/circularController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getAllCirculars);

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createCircular
);

export default router;