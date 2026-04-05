import type { User } from "../types";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      {user.role === "ADMIN" && <h2>Admin Dashboard</h2>}
      {user.role === "LECTURER" && <h2>Lecturer Dashboard</h2>}
      {user.role === "STUDENT" && <h2>Student Dashboard</h2>}

      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;