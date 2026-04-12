import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCircular = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    const circular = await prisma.circular.create({
      data: {
        title,
        content,
      },
    });

    res.status(201).json({
      message: "Circular created successfully",
      circular,
    });
  } catch (error) {
    console.error("CREATE CIRCULAR ERROR:", error);
    res.status(500).json({ error: "Failed to create circular" });
  }
};

export const getAllCirculars = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const circulars = await prisma.circular.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(circulars);
  } catch (error) {
    console.error("GET CIRCULARS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch circulars" });
  }
};

export const deleteCircular = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const circularId = Number(req.params.id);

    const circular = await prisma.circular.findUnique({
      where: { id: circularId },
    });

    if (!circular) {
      res.status(404).json({ error: "Circular not found" });
      return;
    }

    await prisma.circular.delete({
      where: { id: circularId },
    });

    res.status(200).json({ message: "Circular deleted successfully" });
  } catch (error) {
    console.error("DELETE CIRCULAR ERROR:", error);
    res.status(500).json({ error: "Failed to delete circular" });
  }
};

export const updateCircular = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const circularId = Number(req.params.id);
    const { title, content } = req.body;

    const circular = await prisma.circular.findUnique({
      where: { id: circularId },
    });

    if (!circular) {
      res.status(404).json({ error: "Circular not found" });
      return;
    }

    const updatedCircular = await prisma.circular.update({
      where: { id: circularId },
      data: {
        title: title ?? circular.title,
        content: content ?? circular.content,
      },
    });

    res.status(200).json({
      message: "Circular updated successfully",
      circular: updatedCircular,
    });
  } catch (error) {
    console.error("UPDATE CIRCULAR ERROR:", error);
    res.status(500).json({ error: "Failed to update circular" });
  }
};