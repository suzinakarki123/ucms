import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, code, description } = req.body;

    if (!title || !code || !description) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      res.status(400).json({ error: "Course code already exists" });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        code,
        description,
        lecturerId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

export const getAllCourses = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        lecturer: {
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

    res.status(200).json(courses);
  } catch (error) {
    console.error("GET ALL COURSES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getMyCourses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const courses = await prisma.course.findMany({
      where: {
        lecturerId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error("GET MY COURSES ERROR:", error);
    res.status(500).json({ error: "Failed to fetch lecturer courses" });
  }
};

export const enrollInCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(400).json({ error: "courseId is required" });
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

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: Number(courseId),
        },
      },
    });

    if (existingEnrollment) {
      res.status(400).json({ error: "Student already enrolled in this course" });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: req.user.id,
        courseId: Number(courseId),
      },
    });

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("ENROLL COURSE ERROR:", error);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const courseId = Number(req.params.id);

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    if (course.lecturerId !== req.user.id) {
      res.status(403).json({ error: "You can only delete your own course" });
      return;
    }

    await prisma.enrollment.deleteMany({
      where: { courseId },
    });

    await prisma.announcement.deleteMany({
      where: { courseId },
    });

    await prisma.material.deleteMany({
      where: { courseId },
    });

    await prisma.course.delete({
      where: { id: courseId },
    });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};