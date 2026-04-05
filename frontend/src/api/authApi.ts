import axios from "axios";
import type { LoginResponse } from "../types";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
};