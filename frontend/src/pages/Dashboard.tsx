import { useEffect, useState } from "react";
import type {
  User,
  Course,
  Announcement,
  Material,
  Circular,
  BlockchainLog
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

  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
  await Promise.all([
    loadCourses(),
    loadCirculars(),
    user.role === "ADMIN" ? loadAdminData() : Promise.resolve(),
    user.role === "ADMIN" ? loadBlockchainLogs() : Promise.resolve(),
  ]);
};

  const loadCourses = async () => {
    try {
      const data = await getCourses(token);
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    }
  };

  const loadCirculars = async () => {
    try {
      const data = await getCirculars(token);
      setCirculars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading circulars:", error);
      setCirculars([]);
    }
  };

  const loadAdminData = async () => {
    try {
      const [userData, enrollmentData] = await Promise.all([
        getAllUsers(token),
        getAllEnrollments(token),
      ]);

      setUsers(Array.isArray(userData) ? userData : []);
      setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setUsers([]);
      setEnrollments([]);
    }
  };

  const loadCourseDetails = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);

      const [announcementData, materialData] = await Promise.all([
        getAnnouncementsByCourse(token, courseId),
        getMaterialsByCourse(token, courseId),
      ]);

      setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
      setMaterials(Array.isArray(materialData) ? materialData : []);
    } catch (error) {
      console.error("Error loading course details:", error);
      setAnnouncements([]);
      setMaterials([]);
    }
  };

  const loadBlockchainLogs = async () => {
  try {
    const data = await getBlockchainLogs(token);
    setBlockchainLogs(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error loading blockchain logs:", error);
    setBlockchainLogs([]);
  }
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
    const newTitle = prompt("Enter new course title:", course.title);
    if (newTitle === null) return;

    const newCode = prompt("Enter new course code:", course.code);
    if (newCode === null) return;

    const newDescription = prompt(
      "Enter new course description:",
      course.description
    );
    if (newDescription === null) return;

    await updateCourse(token, course.id, {
      title: newTitle,
      code: newCode,
      description: newDescription,
    });

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
    const newTitle = prompt("Enter new announcement title:", announcement.title);
    if (newTitle === null) return;

    const newContent = prompt(
      "Enter new announcement content:",
      announcement.content
    );
    if (newContent === null) return;

    await updateAnnouncement(token, announcement.id, {
      title: newTitle,
      content: newContent,
    });

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
    const newTitle = prompt("Enter new material title:", material.title);
    if (newTitle === null) return;

    const newUrl = prompt("Enter new material URL:", material.url);
    if (newUrl === null) return;

    await updateMaterial(token, material.id, {
      title: newTitle,
      url: newUrl,
    });

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
  };

  const handleEditCircular = async (circular: Circular) => {
    const newTitle = prompt("Enter new circular title:", circular.title);
    if (newTitle === null) return;

    const newContent = prompt("Enter new circular content:", circular.content);
    if (newContent === null) return;

    await updateCircular(token, circular.id, {
      title: newTitle,
      content: newContent,
    });

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

      <section className="section-card">
        <h2 className="section-title">University Circulars</h2>
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

      {user.role === "ADMIN" && (
        <section className="section-card">
          <h2 className="section-title">Admin Overview</h2>

          <div className="admin-grid">
            <div>
              <h3 className="subsection-title">All Users</h3>
              <p className="item-meta">Total users: {users.length}</p>

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

            <div>
              <h3 className="subsection-title">All Enrollments</h3>
              <p className="item-meta">Total enrollments: {enrollments.length}</p>

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
          </div>
        </section>
      )}

      <div className="blockchain-panel">
  <h3 className="subsection-title">Blockchain Audit Logs</h3>
  <p className="item-meta">Total logs: {blockchainLogs.length}</p>
<div className="scroll-section">
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
          <strong>User ID:</strong> {log.userId ?? "N/A"}
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

        {log.blockchainTxId ? (
          <p className="tx-text">
            <strong>Tx ID:</strong> {log.blockchainTxId}
          </p>
        ) : (
          <p className="empty-text">No transaction ID</p>
        )}

        <p className="item-meta">
          {new Date(log.createdAt).toLocaleString()}
        </p>
      </div>
    ))
  )} </div>
</div>

      {selectedCourseId && (
        <section className="section-card">
          <h2 className="section-title">Course Details</h2>

          <div className="details-grid">
            <div>
              <h3 className="subsection-title">Announcements</h3>
              <div className="scroll-section">
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
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <input
                      placeholder="Announcement content"
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
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
            <div className="scroll-section">
              {materials.length === 0 ? (
                <p className="empty-text">No materials found.</p>
              ) : (
                materials.map((material) => (
                  <div className="item-card" key={material.id}>
                    <h4 className="item-title">{material.title}</h4>
                    <p className="item-text">
                      <a href={material.url} target="_blank" rel="noreferrer">
                        {material.url}
                      </a>
                    </p>

                    {user.role === "LECTURER" && (
                      <div className="action-row">
                        <button onClick={() => handleEditMaterial(material)}>
                          Edit
                        </button>
                        <button
                          className="danger-button"
                          onClick={() => handleDeleteMaterial(material.id)}
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
  );
};

export default Dashboard;