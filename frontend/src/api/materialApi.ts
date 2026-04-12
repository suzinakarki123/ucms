import axios from "axios";

const API_URL = "http://localhost:5000/api/materials";

export const getMaterialsByCourse = async (
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

export const addMaterial = async (
  token: string,
  data: {
    title: string;
    url: string;
    courseId: number;
  }
) => {
  const res = await axios.post(`${API_URL}/add`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const deleteMaterial = async (token: string, materialId: number) => {
  const res = await axios.delete(`${API_URL}/${materialId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};