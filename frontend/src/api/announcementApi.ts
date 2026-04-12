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

export const deleteAnnouncement = async (
  token: string,
  announcementId: number
) => {
  const res = await axios.delete(`${API_URL}/${announcementId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateAnnouncement = async (
  token: string,
  announcementId: number,
  data: {
    title?: string;
    content?: string;
  }
) => {
  const res = await axios.put(`${API_URL}/${announcementId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

