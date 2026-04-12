import axios from "axios";
import type { Course } from "../types";

const API_URL = "http://localhost:5000/api/courses";

export const getCourses = async (token: string): Promise<Course[]> => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createCourse = async (
  token: string,
  data: {
    title: string;
    code: string;
    description: string;
  }
) => {
  const res = await axios.post(`${API_URL}/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const enrollCourse = async (token: string, courseId: number) => {
  const res = await axios.post(
    `${API_URL}/enroll`,
    { courseId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteCourse = async (token: string, courseId: number) => {
  const res = await axios.delete(`${API_URL}/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};