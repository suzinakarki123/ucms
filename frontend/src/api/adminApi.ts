import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

export const getAllUsers = async (token: string) => {
  const res = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const getAllEnrollments = async (token: string) => {
  const res = await axios.get(`${API_URL}/enrollments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};