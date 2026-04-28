import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { createBlockchainLog } from "../utils/blockchainLogger";

export const addMaterial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, url, courseId } = req.body;

    if (!title || !url || !courseId) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (course.lecturerId !== req.user.id) {
      res.status(403).json({ error: "You can only add materials to your own course" });
      return;
    }

    const material = await prisma.material.create({
      data: {
        title,
        url,
        courseId: Number(courseId),
      },
    });
    await createBlockchainLog({
  action: "MATERIAL_ADDED",
  entityType: "Material",
  entityId: material.id,
  userId: req.user.id,
});

    res.status(201).json({
      message: "Material added successfully",
      material,
    });
  } catch (error) {
    console.error("ADD MATERIAL ERROR:", error);
    res.status(500).json({ error: "Failed to add material" });
  }
};

export const getMaterialsByCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const courseId = Number(req.params.courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const materials = await prisma.material.findMany({
      where: { courseId },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(materials);
  } catch (error) {
    console.error("GET MATERIALS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};

export const deleteMaterial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const materialId = Number(req.params.id);

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      res.status(404).json({ error: "Material not found" });
      return;
    }

    if (material.course.lecturerId !== req.user.id) {
      res.status(403).json({ error: "You can only delete materials from your own course" });
      return;
    }

    await prisma.material.delete({
      where: { id: materialId },
    });

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("DELETE MATERIAL ERROR:", error);
    res.status(500).json({ error: "Failed to delete material" });
  }
};

export const updateMaterial = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const materialId = Number(req.params.id);
    const { title, url } = req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { course: true },
    });

    if (!material) {
      res.status(404).json({ error: "Material not found" });
      return;
    }

    if (material.course.lecturerId !== req.user.id) {
      res.status(403).json({ error: "You can only edit materials from your own course" });
      return;
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: materialId },
      data: {
        title: title ?? material.title,
        url: url ?? material.url,
      },
    });

    res.status(200).json({
      message: "Material updated successfully",
      material: updatedMaterial,
    });
  } catch (error) {
    console.error("UPDATE MATERIAL ERROR:", error);
    res.status(500).json({ error: "Failed to update material" });
  }
};