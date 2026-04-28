import prisma from "./prisma";
import { sendAuditLogToAlgorand } from "./algorandService";

type BlockchainLogInput = {
  action: string;
  entityType: string;
  entityId: number;
  userId?: number;
};

export const createBlockchainLog = async ({
  action,
  entityType,
  entityId,
  userId,
}: BlockchainLogInput) => {
  const localLog = await prisma.blockchainLog.create({
    data: {
      action,
      entityType,
      entityId,
      userId,
      status: "PENDING",
    },
  });

  try {
    const txId = await sendAuditLogToAlgorand({
      action,
      entityType,
      entityId,
      userId,
    });

    const confirmedLog = await prisma.blockchainLog.update({
      where: { id: localLog.id },
      data: {
        blockchainTxId: txId,
        status: "CONFIRMED",
      },
    });

    return confirmedLog;
  } catch (error) {
    console.error("ALGorand logging failed:", error);

    const failedLog = await prisma.blockchainLog.update({
      where: { id: localLog.id },
      data: {
        status: "FAILED",
      },
    });

    return failedLog;
  }
};