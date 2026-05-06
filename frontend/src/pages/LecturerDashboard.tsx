import { useEffect, useState } from "react";
import type { User, Course, Announcement, Material, Circular } from "../types";

import {
  getCourses,
  createCourse,
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

import { getCirculars } from "../api/circularApi";
import "../styles/dashboard.css";

interface Props {
  user: User;
  onLogout: () => void;
}

const LecturerDashboard = ({ user, onLogout }: Props) => {
  const token = localStorage.getItem("token") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [courseTitle, setCourseTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDescription, setCourseDescription] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([loadCourses(), loadCirculars()]);
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

  const handleCreateCourse = async () => {
    if (!courseTitle || !courseCode || !courseDescription) return;

    try {
      await createCourse(token, {
        title: courseTitle,
        code: courseCode,
        description: courseDescription,
      });

      setCourseTitle("");
      setCourseCode("");
      setCourseDescription("");
      await loadCourses();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleEditCourse = async (course: Course) => {
    const title = prompt("Enter new course title:", course.title);
    if (title === null) return;

    const code = prompt("Enter new course code:", course.code);
    if (code === null) return;

    const description = prompt("Enter new course description:", course.description);
    if (description === null) return;

    try {
      await updateCourse(token, course.id, { title, code, description });
      await loadCourses();

      if (selectedCourseId === course.id) {
        await loadCourseDetails(course.id);
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await deleteCourse(token, courseId);

      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
        setAnnouncements([]);
        setMaterials([]);
      }

      await loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!selectedCourseId || !announcementTitle || !announcementContent) return;

    try {
      await createAnnouncement(token, {
        title: announcementTitle,
        content: announcementContent,
        courseId: selectedCourseId,
      });

      setAnnouncementTitle("");
      setAnnouncementContent("");
      await loadCourseDetails(selectedCourseId);
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleEditAnnouncement = async (announcement: Announcement) => {
    const title = prompt("Enter new announcement title:", announcement.title);
    if (title === null) return;

    const content = prompt("Enter new announcement content:", announcement.content);
    if (content === null) return;

    try {
      await updateAnnouncement(token, announcement.id, { title, content });

      if (selectedCourseId) {
        await loadCourseDetails(selectedCourseId);
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      await deleteAnnouncement(token, announcementId);

      if (selectedCourseId) {
        await loadCourseDetails(selectedCourseId);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedCourseId || !materialTitle || !materialUrl) return;

    try {
      await addMaterial(token, {
        title: materialTitle,
        url: materialUrl,
        courseId: selectedCourseId,
      });

      setMaterialTitle("");
      setMaterialUrl("");
      await loadCourseDetails(selectedCourseId);
    } catch (error) {
      console.error("Error adding material:", error);
    }
  };

  const handleEditMaterial = async (material: Material) => {
    const title = prompt("Enter new material title:", material.title);
    if (title === null) return;

    const url = prompt("Enter new material URL:", material.url);
    if (url === null) return;

    try {
      await updateMaterial(token, material.id, { title, url });

      if (selectedCourseId) {
        await loadCourseDetails(selectedCourseId);
      }
    } catch (error) {
      console.error("Error updating material:", error);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await deleteMaterial(token, materialId);

      if (selectedCourseId) {
        await loadCourseDetails(selectedCourseId);
      }
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Lecturer Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome <strong>{user.name}</strong> · {user.role}
          </p>
        </div>

        <button className="danger-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="single-dashboard-layout">
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

        <section className="section-card">
          <h2 className="section-title">My Course Management</h2>

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
                      Manage Details
                    </button>
                    <button onClick={() => handleEditCourse(course)}>
                      Edit Course
                    </button>
                    <button
                      className="danger-button"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete Course
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {selectedCourseId && (
          <section className="section-card">
            <h2 className="section-title">Selected Course Details</h2>

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

                        <div className="action-row">
                          <button
                            onClick={() => handleEditAnnouncement(announcement)}
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
                      </div>
                    ))
                  )}
                </div>

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
                      </div>
                    ))
                  )}
                </div>

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
              </div>
            </div>
          </section>
        )}

        <section className="section-card">
          <h2 className="section-title">University Circulars</h2>

          <div className="scroll-section small-scroll">
            {circulars.length === 0 ? (
              <p className="empty-text">No circulars available.</p>
            ) : (
              circulars.map((circular) => (
                <div className="item-card" key={circular.id}>
                  <h3 className="item-title">{circular.title}</h3>
                  <p className="item-text">{circular.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LecturerDashboard;