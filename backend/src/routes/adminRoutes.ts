import express from "express";
import {
  getAllUsers,
  getAllEnrollments,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getAllUsers
);

router.get(
  "/enrollments",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getAllEnrollments
);

export default router;