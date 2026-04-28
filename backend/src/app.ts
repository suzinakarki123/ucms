import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import circularRoutes from "./routes/circularRoutes";
import testRoutes from "./routes/testRoutes";
import adminRoutes from "./routes/adminRoutes";
import courseRoutes from "./routes/courseRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import materialRoutes from "./routes/materialRoutes";
import blockchainLogRoutes from "./routes/blockchainLogRoutes";

console.log("authRoutes =", authRoutes);
console.log("testRoutes =", testRoutes);
console.log("courseRoutes =", courseRoutes);
console.log("announcementRoutes =", announcementRoutes);
console.log("materialRoutes =", materialRoutes);

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "UCMS API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/test", testRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/circulars", circularRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/blockchain-logs", blockchainLogRoutes);

export default app;