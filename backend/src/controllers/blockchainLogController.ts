import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getBlockchainLogs = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const logs = await prisma.blockchainLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error("GET BLOCKCHAIN LOGS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch blockchain logs" });
  }
};