import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const createAnnouncement = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, courseId } = req.body;

    if (!title || !content || !courseId) {
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
      res.status(403).json({ error: "You can only post announcements for your own course" });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        courseId: Number(courseId),
        authorId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

export const getAnnouncementsByCourse = async (
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

    const announcements = await prisma.announcement.findMany({
      where: { courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};