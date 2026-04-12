import axios from "axios";

const API_URL = "http://localhost:5000/api/announcements";

export const getAnnouncementsByCourse = async (
  token: string,
  courseId: number
) => {
  const res = await axios.get(`${API_URL}/course/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createAnnouncement = async (
  token: string,
  data: {
    title: string;
    content: string;
    courseId: number;
  }
) => {
  const res = await axios.post(`${API_URL}/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};