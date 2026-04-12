import axios from "axios";
import type { Circular } from "../types";

const API_URL = "http://localhost:5000/api/circulars";

export const getCirculars = async (token: string): Promise<Circular[]> => {
  const res = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createCircular = async (
  token: string,
  data: { title: string; content: string }
) => {
  const res = await axios.post(`${API_URL}/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};