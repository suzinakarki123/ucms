import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

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