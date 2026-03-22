import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected profile route accessed successfully",
  });
});

router.get(
  "/admin-only",
  authenticateToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      message: "Welcome Admin. You can access this route.",
    });
  }
);

router.get(
  "/lecturer-only",
  authenticateToken,
  authorizeRoles("LECTURER"),
  (req, res) => {
    res.json({
      message: "Welcome Lecturer. You can access this route.",
    });
  }
);

router.get(
  "/student-only",
  authenticateToken,
  authorizeRoles("STUDENT"),
  (req, res) => {
    res.json({
      message: "Welcome Student. You can access this route.",
    });
  }
);

export default router;