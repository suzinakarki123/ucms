import express from "express";
import {
  createCourse,
  getAllCourses,
  getMyCourses,
  enrollInCourse,
  deleteCourse,
  updateCourse
} from "../controllers/courseController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getAllCourses);

router.post(
  "/create",
  authenticateToken,
  authorizeRoles("LECTURER"),
  createCourse
);

router.get(
  "/my-courses",
  authenticateToken,
  authorizeRoles("LECTURER"),
  getMyCourses
);

router.post(
  "/enroll",
  authenticateToken,
  authorizeRoles("STUDENT"),
  enrollInCourse
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  deleteCourse
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  updateCourse
);

export default router;