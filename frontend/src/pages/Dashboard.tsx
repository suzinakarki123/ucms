import { useEffect, useState } from "react";
import type {
  User,
  Course,
  Announcement,
  Material,
  Circular,
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

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadCourses(),
        loadCirculars(),
        user.role === "ADMIN" ? loadAdminData() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error loading initial dashboard data:", error);
    }
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
    const newTitle = prompt("Enter new course title:", course.title);
    if (newTitle === null) return;

    const newCode = prompt("Enter new course code:", course.code);
    if (newCode === null) return;

    const newDescription = prompt(
      "Enter new course description:",
      course.description
    );
    if (newDescription === null) return;

    try {
      await updateCourse(token, course.id, {
        title: newTitle,
        code: newCode,
        description: newDescription,
      });

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

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollCourse(token, courseId);
      alert("Enrolled successfully");
    } catch (error) {
      console.error("Error enrolling in course:", error);
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
    const newTitle = prompt("Enter new announcement title:", announcement.title);
    if (newTitle === null) return;

    const newContent = prompt(
      "Enter new announcement content:",
      announcement.content
    );
    if (newContent === null) return;

    try {
      await updateAnnouncement(token, announcement.id, {
        title: newTitle,
        content: newContent,
      });

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
    const newTitle = prompt("Enter new material title:", material.title);
    if (newTitle === null) return;

    const newUrl = prompt("Enter new material URL:", material.url);
    if (newUrl === null) return;

    try {
      await updateMaterial(token, material.id, {
        title: newTitle,
        url: newUrl,
      });

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

  const handleCreateCircular = async () => {
    if (!circularTitle || !circularContent) return;

    try {
      await createCircular(token, {
        title: circularTitle,
        content: circularContent,
      });

      setCircularTitle("");
      setCircularContent("");
      await loadCirculars();
    } catch (error) {
      console.error("Error creating circular:", error);
    }
  };

  const handleEditCircular = async (circular: Circular) => {
    const newTitle = prompt("Enter new circular title:", circular.title);
    if (newTitle === null) return;

    const newContent = prompt("Enter new circular content:", circular.content);
    if (newContent === null) return;

    try {
      await updateCircular(token, circular.id, {
        title: newTitle,
        content: newContent,
      });

      await loadCirculars();
    } catch (error) {
      console.error("Error updating circular:", error);
    }
  };

  const handleDeleteCircular = async (circularId: number) => {
    try {
      await deleteCircular(token, circularId);
      await loadCirculars();
    } catch (error) {
      console.error("Error deleting circular:", error);
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

              {user.role === "ADMIN" && (
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => handleEditCircular(circular)}>
                    Edit Circular
                  </button>
                  <button
                    onClick={() => handleDeleteCircular(circular.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete Circular
                  </button>
                </div>
              )}
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
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <input
            placeholder="Course Code"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <input
            placeholder="Course Description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <button onClick={handleCreateCourse}>Create Course</button>
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
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

              {user.role === "LECTURER" && (
                <>
                  <button
                    onClick={() => handleEditCourse(course)}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit Course
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete Course
                  </button>
                </>
              )}

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
        <div style={{ marginBottom: "30px" }}>
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
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{announcement.title}</strong>
                  <p>{announcement.content}</p>

                  {user.role === "LECTURER" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        Edit Announcement
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteAnnouncement(announcement.id)
                        }
                        style={{ marginLeft: "10px" }}
                      >
                        Delete Announcement
                      </button>
                    </div>
                  )}
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
              materials.map((material) => (
                <div
                  key={material.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "6px",
                  }}
                >
                  <strong>{material.title}</strong>
                  <p>
                    <a href={material.url} target="_blank" rel="noreferrer">
                      {material.url}
                    </a>
                  </p>

                  {user.role === "LECTURER" && (
                    <div style={{ marginTop: "10px" }}>
                      <button onClick={() => handleEditMaterial(material)}>
                        Edit Material
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete Material
                      </button>
                    </div>
                  )}
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