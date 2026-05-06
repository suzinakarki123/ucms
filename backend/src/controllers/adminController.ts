import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getAllEnrollments = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("GET ALL ENROLLMENTS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

export const createUserByAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const allowedRoles = ["ADMIN", "LECTURER", "STUDENT"];

    if (!allowedRoles.includes(role)) {
      res.status(400).json({ error: "Invalid role selected" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("ADMIN CREATE USER ERROR:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};