import { useEffect, useState } from "react";
import type {
  User,
  Course,
  Announcement,
  Material,
  Circular,
} from "../types";
import { getCourses, createCourse, enrollCourse } from "../api/courseApi";
import { getAllUsers, getAllEnrollments } from "../api/adminApi";
import {
  getAnnouncementsByCourse,
  createAnnouncement,
} from "../api/announcementApi";
import {
  getMaterialsByCourse,
  addMaterial,
} from "../api/materialApi";
import { getCirculars, createCircular } from "../api/circularApi";


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

  const [circulars, setCirculars] = useState<Circular[]>([]);
const [circularTitle, setCircularTitle] = useState("");
const [circularContent, setCircularContent] = useState("");

  const [users, setUsers] = useState<
    { id: number; name: string; email: string; role: string }[]
  >([]);

  const [enrollments, setEnrollments] = useState<
    {
      user: { id: number; name: string; email: string; role: string };
      course: { id: number; title: string; code: string };
    }[]
  >([]);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    loadCourses();
    loadCirculars();

    if (user.role === "ADMIN") {
      loadAdminData();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const data = await getCourses(token);
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const loadAdminData = async () => {
    try {
      const userData = await getAllUsers(token);
      const enrollmentData = await getAllEnrollments(token);

      console.log("Users from API:", userData);
      console.log("Enrollments from API:", enrollmentData);

      setUsers(userData);
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
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

  const loadCirculars = async () => {
  try {
    const data = await getCirculars(token);
    setCirculars(data);
  } catch (error) {
    console.error("Error loading circulars:", error);
  }
};

const handleCreateCircular = async () => {
  try {
    await createCircular(token, {
      title: circularTitle,
      content: circularContent,
    });

    setCircularTitle("");
    setCircularContent("");
    loadCirculars();
  } catch (error) {
    console.error("Error creating circular:", error);
  }
};

  const handleCreateCourse = async () => {
    try {
      await createCourse(token, { title, code, description });
      setTitle("");
      setCode("");
      setDescription("");
      loadCourses();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollCourse(token, courseId);
      alert("Enrolled successfully");
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!selectedCourseId) return;

    try {
      await createAnnouncement(token, {
        title: announcementTitle,
        content: announcementContent,
        courseId: selectedCourseId,
      });

      setAnnouncementTitle("");
      setAnnouncementContent("");
      loadCourseDetails(selectedCourseId);
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedCourseId) return;

    try {
      await addMaterial(token, {
        title: materialTitle,
        url: materialUrl,
        courseId: selectedCourseId,
      });

      setMaterialTitle("");
      setMaterialUrl("");
      loadCourseDetails(selectedCourseId);
    } catch (error) {
      console.error("Error adding material:", error);
    }
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

      <div
  style={{
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
  }}
>
  <h2>University Circulars</h2>

  {circulars.length === 0 ? (
    <p>No circulars available.</p>
  ) : (
    circulars.map((circular) => (
      <div
        key={circular.id}
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px",
        }}
      >
        <strong>{circular.title}</strong>
        <p>{circular.content}</p>
      </div>
    ))
  )}

  {user.role === "ADMIN" && (
    <div style={{ marginTop: "20px" }}>
      <h3>Create Circular</h3>
      <input
        placeholder="Circular Title"
        value={circularTitle}
        onChange={(e) => setCircularTitle(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <input
        placeholder="Circular Content"
        value={circularContent}
        onChange={(e) => setCircularContent(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button onClick={handleCreateCircular}>Post Circular</button>
    </div>
  )}
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

      {user.role === "ADMIN" && (
        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h2>All Users</h2>
            <p>Total users loaded: {users.length}</p>

            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{u.name}</strong>
                  <p>{u.email}</p>
                  <p>Role: {u.role}</p>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h2>All Enrollments</h2>
            <p>Total enrollments loaded: {enrollments.length}</p>

            {enrollments.length === 0 ? (
              <p>No enrollments found.</p>
            ) : (
              enrollments.map((enrollment, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{enrollment.user.name}</strong>
                  <p>{enrollment.user.email}</p>
                  <p>
                    Enrolled in: {enrollment.course.title} (
                    {enrollment.course.code})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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