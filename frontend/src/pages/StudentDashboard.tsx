import { useEffect, useState } from "react";
import type { User, Course, Announcement, Material, Circular } from "../types";

import { getCourses, enrollCourse } from "../api/courseApi";
import { getAnnouncementsByCourse } from "../api/announcementApi";
import { getMaterialsByCourse } from "../api/materialApi";
import { getCirculars } from "../api/circularApi";

import "../styles/dashboard.css";

interface Props {
  user: User;
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: Props) => {
  const token = localStorage.getItem("token") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    loadStudentDashboard();
  }, []);

  const loadStudentDashboard = async () => {
    await Promise.all([loadCourses(), loadCirculars()]);
  };

  const loadCourses = async () => {
    const data = await getCourses(token);
    setCourses(Array.isArray(data) ? data : []);
  };

  const loadCirculars = async () => {
    const data = await getCirculars(token);
    setCirculars(Array.isArray(data) ? data : []);
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

  const handleEnroll = async (courseId: number) => {
    await enrollCourse(token, courseId);
    alert("Enrolled successfully");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome <strong>{user.name}</strong> · {user.role}
          </p>
        </div>

        <button className="danger-button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="student-layout">
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

        <section className="section-card">
          <h2 className="section-title">Available Courses</h2>

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
                      View Course
                    </button>

                    <button onClick={() => handleEnroll(course.id)}>
                      Enroll
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {selectedCourseId && (
          <section className="section-card">
            <h2 className="section-title">Course Information</h2>

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
                      </div>
                    ))
                  )}
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;