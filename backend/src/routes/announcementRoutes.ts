import express from "express";
import {
  createAnnouncement,
  getAnnouncementsByCourse,
} from "../controllers/announcementController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("LECTURER"),
  createAnnouncement
);

router.get(
  "/course/:courseId",
  authenticateToken,
  getAnnouncementsByCourse
);

export default router;