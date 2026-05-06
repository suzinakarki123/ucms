import type { User } from "../types";
import AdminDashboard from "./AdminDashboard";
import LecturerDashboard from "./LecturerDashboard";
import StudentDashboard from "./StudentDashboard";

interface Props {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: Props) => {
  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }

  if (user.role === "LECTURER") {
    return <LecturerDashboard user={user} onLogout={onLogout} />;
  }

  return <StudentDashboard user={user} onLogout={onLogout} />;
};

export default Dashboard;