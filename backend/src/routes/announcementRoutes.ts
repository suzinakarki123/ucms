import express from "express";
import {
  createAnnouncement,
  getAnnouncementsByCourse,
  deleteAnnouncement
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

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  deleteAnnouncement
);

export default router;