import { useState } from "react";
import { loginUser } from "../api/authApi";
import type { User } from "../types";
import "../styles/login.css";

interface LoginPageProps {
  onLogin: (token: string, user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(email, password);
      onLogin(data.token, data.user);
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">UCMS</h1>
        <p className="login-subtitle">University Course Management System</p>

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="login-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" style={{ width: "100%" }}>
            Login
          </button>
        </form>

          {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;