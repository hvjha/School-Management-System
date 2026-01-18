
import React, { useState, useEffect } from "react";
import api from "../api/api";
import Users from "../components/User";
import Students from "../components/Student";
import Trainers from "../components/Trainer";
import CreateUser from "../components/CreateUser";
import { toast } from "react-toastify";
import CreateCourse from "../components/CreateCourse";
import EnrollStudent from "../components/EnrollStudent";
import ManageCourses from "../components/Managecourse";
import { RxHamburgerMenu } from "react-icons/rx";
import UploadCourseContent from "../components/UploadCourseContent";
import ManageUploadedContent from "../components/ManageUploadedContent";
import AdminAttendance from "../components/AdminAttendance";
import AdminLibrary from "../components/library/AdminLibrary";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const tabs = [
    { id: "home", label: "All Users" },
    { id: "students", label: "Students" },
    { id: "trainers", label: "Trainers" },
    { id: "attendance", label: "Attendance" },
    { id: "createUser", label: "Create User" },
    { id: "createCourse", label: "Create Course" },
    { id: "enroll", label: "Enroll Student" },
    { id: "manageCourses", label: "Manage Courses" },
    { id: "uploadContent", label: "Upload Course" },
    { id: "manageContent", label: "Manage Uploads" },
    {id: "library",label:"Library"}
  ];

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data.users || data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await api.get("/api/course/courses");
      setCourses(data.courses || data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load courses");
    }
  };

  useEffect(() => {
    loadUsers();
    loadCourses();
  }, []);

  const students = users.filter((u) => u.role === "student");
  const trainers = users.filter((u) => u.role === "trainer");

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed mt-18 left-0 w-full glass-nav shadow-lg z-20 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-black text-white italic tracking-tighter">ADMIN<span className="text-red-500">PRO</span></h2>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded hover:bg-gray-200"
        >
          <RxHamburgerMenu size={26} />
        </button>
      </div>

      {/* Sidebar (Mobile + Desktop) */}
      <aside
        className={`fixed md:static mt-18 left-0 h-full w-72 glass-sidebar shadow-2xl p-6 z-30 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Close Button (Mobile) */}
        <div className="md:hidden flex justify-end">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xl mb-4"
          >
            ✖
          </button>
        </div>

        <h2 className="text-xl font-black text-white mb-10 italic hidden md:block tracking-tighter border-l-4 border-red-600 pl-4">
          ADMIN<span className="text-red-500">PRO</span>
        </h2>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`text-left px-5 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[9px] ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false); // Close on mobile
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:mt-18 md:mt-0 p-4 md:p-6 overflow-y-auto justify-center">
        {activeTab === "home" && <Users />}
        {activeTab === "students" && <Students />}
        {activeTab === "trainers" && <Trainers />}
        {activeTab === "createUser" && <CreateUser onUserCreated={loadUsers} />}
        {activeTab === "createCourse" && (
          <CreateCourse trainers={trainers} onCourseCreated={loadCourses} />
        )}
        {activeTab === "enroll" && (
          <EnrollStudent
            students={students}
            trainers={trainers}
            courses={courses}
            onEnroll={() => {
              loadCourses();
              loadUsers();
            }}
          />
        )}
        {activeTab === "manageCourses" && <ManageCourses />}
        {activeTab === "uploadContent" && <UploadCourseContent />}
        {activeTab === "manageContent" && <ManageUploadedContent />}
        {activeTab === "attendance" && <AdminAttendance students={students} />}
        {activeTab === "library" && <AdminLibrary/>}
      </main>
    </div>
  );
}
