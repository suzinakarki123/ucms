import express from "express";
import {
  createCircular,
  getAllCirculars,
  deleteCircular
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

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deleteCircular
);

export default router;