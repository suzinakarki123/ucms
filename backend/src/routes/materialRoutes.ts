import express from "express";
import {
  addMaterial,
  getMaterialsByCourse,
  deleteMaterial
} from "../controllers/materialController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.post(
  "/add",
  authenticateToken,
  authorizeRoles("LECTURER"),
  addMaterial
);

router.get(
  "/course/:courseId",
  authenticateToken,
  getMaterialsByCourse
);


router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("LECTURER"),
  deleteMaterial
);
export default router;