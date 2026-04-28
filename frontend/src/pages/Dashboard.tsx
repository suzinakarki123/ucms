import { useEffect, useState } from "react";
import type {
  User,
  Course,
  Announcement,
  Material,
  Circular,
  BlockchainLog,
} from "../types";

import {
  getCourses,
  createCourse,
  enrollCourse,
  deleteCourse,
  updateCourse,
} from "../api/courseApi";

import {
  getAnnouncementsByCourse,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "../api/announcementApi";

import {
  getMaterialsByCourse,
  addMaterial,
  deleteMaterial,
  updateMaterial,
} from "../api/materialApi";

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

const Dashboard = ({ user, onLogout }: Props) => {
  const token = localStorage.getItem("token") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");

  const [circularTitle, setCircularTitle] = useState("");
  const [circularContent, setCircularContent] = useState("");

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    await Promise.all([
      loadCourses(),
      loadCirculars(),
      user.role === "ADMIN" ? loadAdminData() : Promise.resolve(),
      user.role === "ADMIN" ? loadBlockchainData() : Promise.resolve(),
    ]);
  };

  const loadCourses = async () => {
    const data = await getCourses(token);
    setCourses(Array.isArray(data) ? data : []);
  };

  const loadCirculars = async () => {
    const data = await getCirculars(token);
    setCirculars(Array.isArray(data) ? data : []);
  };

  const loadAdminData = async () => {
    const [userData, enrollmentData] = await Promise.all([
      getAllUsers(token),
      getAllEnrollments(token),
    ]);

    setUsers(Array.isArray(userData) ? userData : []);
    setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
  };

  const loadBlockchainData = async () => {
    const data = await getBlockchainLogs(token);
    setBlockchainLogs(Array.isArray(data) ? data : []);
  };

  const loadCourseDetails = async (courseId: number) => {
    setSelectedCourseId(courseId);

    const [announcementData, materialData] = await Promise.all([
      getAnnouncementsByCourse(token, courseId),
      getMaterialsByCourse(token, courseId),
    ]);

    setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
    setMaterials(Array.isArray(materialData) ? materialData : []);
  };

  const handleCreateCourse = async () => {
    if (!courseTitle || !courseCode || !courseDescription) return;

    await createCourse(token, {
      title: courseTitle,
      code: courseCode,
      description: courseDescription,
    });

    setCourseTitle("");
    setCourseCode("");
    setCourseDescription("");
    await loadCourses();
  };

  const handleEditCourse = async (course: Course) => {
    const title = prompt("Enter new course title:", course.title);
    if (title === null) return;

    const code = prompt("Enter new course code:", course.code);
    if (code === null) return;

    const description = prompt("Enter new course description:", course.description);
    if (description === null) return;

    await updateCourse(token, course.id, { title, code, description });
    await loadCourses();

    if (selectedCourseId === course.id) {
      await loadCourseDetails(course.id);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    await deleteCourse(token, courseId);

    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
      setAnnouncements([]);
      setMaterials([]);
    }

    await loadCourses();
  };

  const handleEnroll = async (courseId: number) => {
    await enrollCourse(token, courseId);
    alert("Enrolled successfully");
  };

  const handleCreateAnnouncement = async () => {
    if (!selectedCourseId || !announcementTitle || !announcementContent) return;

    await createAnnouncement(token, {
      title: announcementTitle,
      content: announcementContent,
      courseId: selectedCourseId,
    });

    setAnnouncementTitle("");
    setAnnouncementContent("");
    await loadCourseDetails(selectedCourseId);
  };

  const handleEditAnnouncement = async (announcement: Announcement) => {
    const title = prompt("Enter new announcement title:", announcement.title);
    if (title === null) return;

    const content = prompt("Enter new announcement content:", announcement.content);
    if (content === null) return;

    await updateAnnouncement(token, announcement.id, { title, content });

    if (selectedCourseId) {
      await loadCourseDetails(selectedCourseId);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    await deleteAnnouncement(token, announcementId);

    if (selectedCourseId) {
      await loadCourseDetails(selectedCourseId);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedCourseId || !materialTitle || !materialUrl) return;

    await addMaterial(token, {
      title: materialTitle,
      url: materialUrl,
      courseId: selectedCourseId,
    });

    setMaterialTitle("");
    setMaterialUrl("");
    await loadCourseDetails(selectedCourseId);
  };

  const handleEditMaterial = async (material: Material) => {
    const title = prompt("Enter new material title:", material.title);
    if (title === null) return;

    const url = prompt("Enter new material URL:", material.url);
    if (url === null) return;

    await updateMaterial(token, material.id, { title, url });

    if (selectedCourseId) {
      await loadCourseDetails(selectedCourseId);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    await deleteMaterial(token, materialId);

    if (selectedCourseId) {
      await loadCourseDetails(selectedCourseId);
    }
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

    if (user.role === "ADMIN") {
      await loadBlockchainData();
    }
  };

  const handleEditCircular = async (circular: Circular) => {
    const title = prompt("Enter new circular title:", circular.title);
    if (title === null) return;

    const content = prompt("Enter new circular content:", circular.content);
    if (content === null) return;

    await updateCircular(token, circular.id, { title, content });
    await loadCirculars();
  };

  const handleDeleteCircular = async (circularId: number) => {
    await deleteCircular(token, circularId);
    await loadCirculars();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">UCMS Dashboard</h1>
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

            {user.role === "ADMIN" && (
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
            )}

            <div className="scroll-section">
              {circulars.length === 0 ? (
                <p className="empty-text">No circulars available.</p>
              ) : (
                circulars.map((circular) => (
                  <div className="item-card" key={circular.id}>
                    <h3 className="item-title">{circular.title}</h3>
                    <p className="item-text">{circular.content}</p>

                    {user.role === "ADMIN" && (
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
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {user.role === "LECTURER" && (
            <section className="section-card">
              <h2 className="section-title">Create Course</h2>

              <div className="form-group">
                <input
                  placeholder="Course title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  placeholder="Course code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <input
                  placeholder="Course description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </div>

              <button onClick={handleCreateCourse}>Create Course</button>
            </section>
          )}

          <section className="section-card">
            <h2 className="section-title">Courses</h2>

            <div className="scroll-section">
              {courses.length === 0 ? (
                <p className="empty-text">No courses available.</p>
              ) : (
                courses.map((course) => (
                  <div className="item-card" key={course.id}>
                    <h3 className="item-title">{course.title}</h3>
                    <p className="item-text">{course.description}</p>
                    <p className="item-meta">
                      <strong>Code:</strong> {course.code}
                    </p>

                    <div className="action-row">
                      <button onClick={() => loadCourseDetails(course.id)}>
                        View Details
                      </button>

                      {user.role === "LECTURER" && (
                        <>
                          <button onClick={() => handleEditCourse(course)}>
                            Edit
                          </button>
                          <button
                            className="danger-button"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {user.role === "STUDENT" && (
                        <button onClick={() => handleEnroll(course.id)}>
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {selectedCourseId && (
            <section className="section-card">
              <h2 className="section-title">Course Details</h2>

              <div className="details-grid">
                <div>
                  <h3 className="subsection-title">Announcements</h3>

                  <div className="scroll-section small-scroll">
                    {announcements.length === 0 ? (
                      <p className="empty-text">No announcements found.</p>
                    ) : (
                      announcements.map((announcement) => (
                        <div className="item-card" key={announcement.id}>
                          <h4 className="item-title">{announcement.title}</h4>
                          <p className="item-text">{announcement.content}</p>

                          {user.role === "LECTURER" && (
                            <div className="action-row">
                              <button
                                onClick={() =>
                                  handleEditAnnouncement(announcement)
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="danger-button"
                                onClick={() =>
                                  handleDeleteAnnouncement(announcement.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {user.role === "LECTURER" && (
                    <div className="form-panel">
                      <h4>Create Announcement</h4>

                      <div className="form-group">
                        <input
                          placeholder="Announcement title"
                          value={announcementTitle}
                          onChange={(e) =>
                            setAnnouncementTitle(e.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <input
                          placeholder="Announcement content"
                          value={announcementContent}
                          onChange={(e) =>
                            setAnnouncementContent(e.target.value)
                          }
                        />
                      </div>

                      <button onClick={handleCreateAnnouncement}>
                        Post Announcement
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="subsection-title">Materials</h3>

                  <div className="scroll-section small-scroll">
                    {materials.length === 0 ? (
                      <p className="empty-text">No materials found.</p>
                    ) : (
                      materials.map((material) => (
                        <div className="item-card" key={material.id}>
                          <h4 className="item-title">{material.title}</h4>
                          <p className="item-text">
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {material.url}
                            </a>
                          </p>

                          {user.role === "LECTURER" && (
                            <div className="action-row">
                              <button
                                onClick={() => handleEditMaterial(material)}
                              >
                                Edit
                              </button>
                              <button
                                className="danger-button"
                                onClick={() =>
                                  handleDeleteMaterial(material.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {user.role === "LECTURER" && (
                    <div className="form-panel">
                      <h4>Add Material</h4>

                      <div className="form-group">
                        <input
                          placeholder="Material title"
                          value={materialTitle}
                          onChange={(e) => setMaterialTitle(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <input
                          placeholder="Material URL"
                          value={materialUrl}
                          onChange={(e) => setMaterialUrl(e.target.value)}
                        />
                      </div>

                      <button onClick={handleAddMaterial}>Add Material</button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {user.role === "ADMIN" && (
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
              <h2 className="section-title">Blockchain Audit Logs</h2>

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
        )}
      </main>
    </div>
  );
};

export default Dashboard;