import { useEffect, useState } from "react";
import type { User, Circular, BlockchainLog } from "../types";
import {
  getCirculars,
  createCircular,
  deleteCircular,
  updateCircular,
} from "../api/circularApi";
import { getAllUsers, getAllEnrollments } from "../api/adminApi";
import { getBlockchainLogs } from "../api/blockchainApi";
import "../styles/dashboard.css";

interface Props {
  user: User;
  onLogout: () => void;
}

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AdminEnrollment = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  course: {
    id: number;
    title: string;
    code: string;
  };
};

const AdminDashboard = ({ user, onLogout }: Props) => {
  const token = localStorage.getItem("token") || "";

  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([]);

  const [circularTitle, setCircularTitle] = useState("");
  const [circularContent, setCircularContent] = useState("");

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const loadAdminDashboard = async () => {
    await Promise.all([
      loadCirculars(),
      loadUsers(),
      loadEnrollments(),
      loadBlockchainLogs(),
    ]);
  };

  const loadCirculars = async () => {
    const data = await getCirculars(token);
    setCirculars(Array.isArray(data) ? data : []);
  };

  const loadUsers = async () => {
    const data = await getAllUsers(token);
    setUsers(Array.isArray(data) ? data : []);
  };

  const loadEnrollments = async () => {
    const data = await getAllEnrollments(token);
    setEnrollments(Array.isArray(data) ? data : []);
  };

  const loadBlockchainLogs = async () => {
    const data = await getBlockchainLogs(token);
    setBlockchainLogs(Array.isArray(data) ? data : []);
  };

  const handleCreateCircular = async () => {
    if (!circularTitle || !circularContent) return;

    await createCircular(token, {
      title: circularTitle,
      content: circularContent,
    });

    setCircularTitle("");
    setCircularContent("");
    await loadCirculars();
    await loadBlockchainLogs();
  };

  const handleEditCircular = async (circular: Circular) => {
    const title = prompt("Enter new circular title:", circular.title);
    if (title === null) return;

    const content = prompt("Enter new circular content:", circular.content);
    if (content === null) return;

    await updateCircular(token, circular.id, { title, content });
    await loadCirculars();
  };

  const handleDeleteCircular = async (id: number) => {
    await deleteCircular(token, id);
    await loadCirculars();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome <strong>{user.name}</strong> · {user.role}
          </p>
        </div>

        <button className="danger-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-layout">
        <div className="dashboard-left">
          <section className="section-card">
            <h2 className="section-title">University Circulars</h2>

            <div className="form-panel">
              <h3>Create Circular</h3>

              <div className="form-group">
                <input
                  placeholder="Circular title"
                  value={circularTitle}
                  onChange={(e) => setCircularTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  placeholder="Circular content"
                  value={circularContent}
                  onChange={(e) => setCircularContent(e.target.value)}
                />
              </div>

              <button onClick={handleCreateCircular}>Post Circular</button>
            </div>

            <div className="scroll-section">
              {circulars.length === 0 ? (
                <p className="empty-text">No circulars available.</p>
              ) : (
                circulars.map((circular) => (
                  <div className="item-card" key={circular.id}>
                    <h3 className="item-title">{circular.title}</h3>
                    <p className="item-text">{circular.content}</p>

                    <div className="action-row">
                      <button onClick={() => handleEditCircular(circular)}>
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => handleDeleteCircular(circular.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="dashboard-right">
          <section className="section-card">
            <h2 className="section-title">Admin Overview</h2>

            <div className="admin-stat-grid">
              <div className="stat-card">
                <span>Users</span>
                <strong>{users.length}</strong>
              </div>

              <div className="stat-card">
                <span>Enrollments</span>
                <strong>{enrollments.length}</strong>
              </div>

              <div className="stat-card">
                <span>Audit Logs</span>
                <strong>{blockchainLogs.length}</strong>
              </div>
            </div>
          </section>

          <section className="section-card">
            <h2 className="section-title">All Users</h2>

            <div className="scroll-section right-scroll">
              {users.length === 0 ? (
                <p className="empty-text">No users found.</p>
              ) : (
                users.map((u) => (
                  <div className="item-card compact-card" key={u.id}>
                    <h4>{u.name}</h4>
                    <p>{u.email}</p>
                    <span className="role-badge">{u.role}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section-card">
            <h2 className="section-title">Enrollments</h2>

            <div className="scroll-section right-scroll">
              {enrollments.length === 0 ? (
                <p className="empty-text">No enrollments found.</p>
              ) : (
                enrollments.map((enrollment, index) => (
                  <div className="item-card compact-card" key={index}>
                    <h4>{enrollment.user.name}</h4>
                    <p>{enrollment.user.email}</p>
                    <p>
                      {enrollment.course.title} ({enrollment.course.code})
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="section-card">
            <h2 className="section-title">
              Blockchain Audit Logs (Algorand)
            </h2>
            <p className="item-meta">
              Immutable audit records for key academic actions.
            </p>

            <div className="scroll-section blockchain-scroll">
              {blockchainLogs.length === 0 ? (
                <p className="empty-text">No blockchain logs found.</p>
              ) : (
                blockchainLogs.map((log) => (
                  <div className="item-card compact-card" key={log.id}>
                    <h4>{log.action}</h4>
                    <p>
                      <strong>Entity:</strong> {log.entityType} #{log.entityId}
                    </p>
                    <p>
                      <strong>User:</strong> {log.userId ?? "N/A"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          log.status === "CONFIRMED"
                            ? "status-confirmed"
                            : log.status === "FAILED"
                            ? "status-failed"
                            : "status-pending"
                        }
                      >
                        {log.status}
                      </span>
                    </p>

                    {log.blockchainTxId && (
                      <p className="tx-text">
                        <strong>Tx:</strong> {log.blockchainTxId}
                      </p>
                    )}

                    <p className="item-meta">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default AdminDashboard;