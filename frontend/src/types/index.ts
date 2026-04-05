export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "LECTURER" | "STUDENT";
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Course {
  id: number;
  title: string;
  code: string;
  description: string;
  lecturerId: number;
  createdAt: string;
}