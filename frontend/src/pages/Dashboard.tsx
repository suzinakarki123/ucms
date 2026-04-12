import { useEffect, useState } from "react";
import type { User, Course, Announcement, Material } from "../types";
import { getCourses, createCourse, enrollCourse } from "../api/courseApi";
import {
  getAnnouncementsByCourse,
  createAnnouncement,
} from "../api/announcementApi";
import {
  getMaterialsByCourse,
  addMaterial,
} from "../api/materialApi";

interface Props {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: Props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getCourses(token);
    setCourses(data);
  };

  const loadCourseDetails = async (courseId: number) => {
    try {
      setSelectedCourseId(courseId);

      const annData = await getAnnouncementsByCourse(token, courseId);
      const matData = await getMaterialsByCourse(token, courseId);

      setAnnouncements(Array.isArray(annData) ? annData : []);
      setMaterials(Array.isArray(matData) ? matData : []);
    } catch (error) {
      console.error("Error loading course details:", error);
      setAnnouncements([]);
      setMaterials([]);
    }
  };

  const handleCreateCourse = async () => {
    await createCourse(token, { title, code, description });
    setTitle("");
    setCode("");
    setDescription("");
    loadCourses();
  };

  const handleEnroll = async (courseId: number) => {
    await enrollCourse(token, courseId);
    alert("Enrolled successfully");
  };

  const handleCreateAnnouncement = async () => {
    if (!selectedCourseId) return;

    await createAnnouncement(token, {
      title: announcementTitle,
      content: announcementContent,
      courseId: selectedCourseId,
    });

    setAnnouncementTitle("");
    setAnnouncementContent("");
    loadCourseDetails(selectedCourseId);
  };

  const handleAddMaterial = async () => {
    if (!selectedCourseId) return;

    await addMaterial(token, {
      title: materialTitle,
      url: materialUrl,
      courseId: selectedCourseId,
    });

    setMaterialTitle("");
    setMaterialUrl("");
    loadCourseDetails(selectedCourseId);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1>UCMS Dashboard</h1>
          <p>
            Welcome <strong>{user.name}</strong> ({user.role})
          </p>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>

      {user.role === "LECTURER" && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <h2>Create Course</h2>
          <input
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <input
            placeholder="Course Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <input
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <button onClick={handleCreateCourse}>Create Course</button>
        </div>
      )}

      <div>
        <h2>Courses</h2>
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>
                <strong>Code:</strong> {course.code}
              </p>

              <button onClick={() => loadCourseDetails(course.id)}>
                View Details
              </button>

              {user.role === "STUDENT" && (
                <button
                  onClick={() => handleEnroll(course.id)}
                  style={{ marginLeft: "10px" }}
                >
                  Enroll
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {selectedCourseId && (
        <div style={{ marginTop: "40px" }}>
          <h2>Course Details</h2>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3>Announcements</h3>
            {announcements.length === 0 ? (
              <p>No announcements found for this course.</p>
            ) : (
              announcements.map((a) => (
                <div
                  key={a.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{a.title}</strong>
                  <p>{a.content}</p>
                </div>
              ))
            )}

            {user.role === "LECTURER" && (
              <div style={{ marginTop: "15px" }}>
                <h4>Create Announcement</h4>
                <input
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <input
                  placeholder="Announcement Content"
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <button onClick={handleCreateAnnouncement}>
                  Post Announcement
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Materials</h3>
            {materials.length === 0 ? (
              <p>No materials found for this course.</p>
            ) : (
              materials.map((m) => (
                <div
                  key={m.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{m.title}</strong>
                  <p>
                    <a href={m.url} target="_blank" rel="noreferrer">
                      {m.url}
                    </a>
                  </p>
                </div>
              ))
            )}

            {user.role === "LECTURER" && (
              <div style={{ marginTop: "15px" }}>
                <h4>Add Material</h4>
                <input
                  placeholder="Material Title"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <input
                  placeholder="Material URL"
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <button onClick={handleAddMaterial}>Add Material</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;