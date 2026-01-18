
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { RxAvatar } from "react-icons/rx";
import UserProfileCard from "../cards/UserProfileCard";
import { toast } from "react-toastify";

import TrainerLibrary from "../components/library/TrainerLibrary";
import TrainerReservationHistory from "../components/library/TrainerReservationHistory";

export default function TrainerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendanceModalData, setAttendanceModalData] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/api/course/trainer/my");
      setCourses(res.data.courses || []);
    } catch (e) {
      console.error("Failed to load courses", e);
      toast.error("Failed to load courses");
    }
  };

  const SidebarItem = ({ icon, label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 p-4 w-full text-left rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${
        activeTab === tab 
          ? "bg-red-600 text-white shadow-lg shadow-red-500/20" 
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon} {label}
    </button>
  );

  const markAttendance = async () => {
    try {
      if (!attendanceModalData) return;

      const { student, course } = attendanceModalData;

      const payload = {
        studentId: student._id,
        courseId: course._id,
        date: attendanceDate,
        status: "present",
      };

      const res = await api.post("/api/attendance/mark", payload);
      toast.success(res.data.message || "Attendance marked successfully!");
      setAttendanceModalData(null);
      setAttendanceDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error("Mark attendance error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  const viewStudentAttendance = async (student) => {
    try {
      const res = await api.get("/api/admin/user-details");
      const studentData = res.data.users.students.find(
        (st) => st.studentId === student.studentId
      );
      setSelectedStudent(studentData);
    } catch (err) {
      console.error("Failed to load student details", err);
      toast.error("Failed to load student details");
    }
  };

  // View attendance for specific course (from course card)
  const viewCourseAttendance = (student, course) => {
    navigate(
      `/student-attendance?studentId=${student.studentId}&courseId=${course._id}`
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 glass-sidebar flex flex-col p-6 mt-18 overflow-y-auto no-scrollbar shadow-2xl">
        <h2 className="text-xl font-black text-white mb-10 italic tracking-tighter border-l-4 border-red-600 pl-4">TRAINER<span className="text-red-500">PRO</span></h2>
        <div className="space-y-2">
          <SidebarItem label="Tactical Grid" tab="dashboard" />
          <SidebarItem label="Deployed Units" tab="courses" />
          <SidebarItem label="Cadet Manifest" tab="students" />
        </div>
        <div className="border-t border-white/5 my-6 pt-6 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">Library Management</p>
          <SidebarItem label="Library" tab="library" />
          <SidebarItem label="My Reservations" tab="reservations" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 mt-18">
        {/* Library Tabs */}
        {activeTab === "library" && <TrainerLibrary />}
        {activeTab === "reservations" && <TrainerReservationHistory />}

        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h2 className="text-4xl font-black text-white text-center text-shadow-red uppercase italic tracking-tight">Executive Intelligence</h2>
            <div className="flex flex-wrap gap-10 mb-12 justify-center">
              <div className="glass-card-light p-8 rounded-[2.5rem] w-72 text-center border-b-4 border-red-600 robust-inset transition-transform hover:scale-105 duration-500">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Active Briefs</h3>
                <p className="text-5xl font-black text-white">{courses.length}</p>
              </div>
              <div className="glass-card-light p-8 rounded-[2.5rem] w-72 text-center border-b-4 border-red-900 robust-inset transition-transform hover:scale-105 duration-500">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Total Personnel</h3>
                <p className="text-5xl font-black text-white">
                  {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                </p>
              </div>
            </div>
            <div className="glass-card-light rounded-[3rem] p-10 max-w-3xl mx-auto flex justify-center border border-white/10 robust-inset">
              <UserProfileCard user={user} courses={courses} />
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <h2 className="text-3xl font-black text-white text-center text-shadow-red uppercase italic tracking-tight mb-8">Deployed Tactical Units</h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {courses.map((course) => (
                <div
                  key={course.id || course._id}
                  className="glass-card p-6 rounded-[2.5rem] w-[350px] border border-white/10 robust-inset group hover:border-red-600/30 transition-all duration-500"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{course.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{course.courseId}</span>
                        <span className="bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                          {course.students?.length || 0} PERSONS
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-l-2 border-red-600 pl-2">Assigned Personnel</h4>
                    <ul className="overflow-y-auto max-h-[200px] no-scrollbar space-y-3">
                      {course.students?.map((s) => (
                        <li key={s._id} className="p-4 bg-white/5 border border-white/5 rounded-2xl group/item hover:bg-red-600/5 transition-all">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-white leading-tight uppercase italic">{s.name}</span>
                              <span className="text-[9px] font-mono text-slate-500 tracking-tighter">{s.studentId}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  setAttendanceModalData({ student: s, course })
                                }
                                className="flex-1 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
                              >
                                Mark Present
                              </button>
                              <button
                                onClick={() => viewCourseAttendance(s, course)}
                                className="flex-1 py-2 bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                              >
                                View Data
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="animate-in fade-in slide-in-from-right-10 duration-700">
            <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic">Global Cadet Registry</h2>
            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 robust-inset shadow-24">
              <div className="overflow-x-auto no-scrollbar max-h-[60vh]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#0f172a] z-10">
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Cadet</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Identification</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 uppercase">Deployed Sectors</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center uppercase">Comms & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                  {courses
                    .flatMap(
                      (c) =>
                        c.students?.map((s) => ({
                          ...s,
                          courseName: c.name,
                          course: c,
                        })) || []
                    )
                    .filter(
                      (s, i, arr) =>
                        arr.findIndex((st) => st._id === s._id) === i
                    )
                    .map((s) => {
                      const studentCourses = courses.filter((c) =>
                        c.students?.some((st) => st._id === s._id)
                      );
                      return (
                        <tr key={s._id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <div className="text-white font-black text-sm uppercase italic group-hover:text-red-500 transition-colors">{s.name}</div>
                          </td>
                          <td className="p-6 font-mono text-[10px] text-slate-500 tracking-tighter uppercase">{s.studentId}</td>
                          <td className="p-6">
                            <div className="flex flex-wrap gap-2">
                              {studentCourses.map(c => (
                                <span key={c._id} className="bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/20">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex gap-3 justify-center items-center">
                              <span className="text-[11px] font-medium text-slate-400 font-mono hidden lg:block">{s.email}</span>
                              <button
                                onClick={() => viewStudentAttendance(s)}
                                className="px-4 py-2 bg-white/5 text-white rounded-xl text-[9px] font-black uppercase border border-white/5 hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20"
                              >
                                Analyze Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {attendanceModalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-card w-96 rounded shadow-lg p-6 relative">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
                onClick={() => setAttendanceModalData(null)}
              >
                ✕
              </button>

              <h3 className="font-bold text-xl text-center mb-4">
                Mark Attendance
              </h3>

              <div className="bg-white/5 p-4 rounded mb-4">
                <p className="text-sm text-slate-300">Student:</p>
                <p className="font-semibold">
                  {attendanceModalData.student.name}
                </p>
                <p className="text-xs text-slate-400">
                  ({attendanceModalData.student.studentId})
                </p>

                <p className="text-sm text-slate-300 mt-3">Course:</p>
                <p className="font-semibold">
                  {attendanceModalData.course.name}
                </p>
                <p className="text-xs text-slate-400">
                  ({attendanceModalData.course.courseId})
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Date:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={markAttendance}
                  className="bg-green-600 text-white px-4 py-2 rounded mt-2 hover:bg-green-700 font-medium"
                >
                  Mark Present
                </button>
                <button
                  onClick={() => setAttendanceModalData(null)}
                  className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="glass-card w-[500px] max-h-[600px] rounded shadow-lg p-6 relative flex flex-col">
              <button
                className="absolute top-3 right-3 text-slate-400 hover:text-white text-xl"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center">
                  {selectedStudent.profile_pic ? (
                    <img
                      src={selectedStudent.profile_pic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <RxAvatar size={96} />
                  )}
                </div>
              </div>

              <h3 className="font-bold text-xl text-center">
                {selectedStudent.name}
              </h3>
              <p className="text-sm text-slate-300 text-center">
                {selectedStudent.email}
              </p>
              <p className="text-sm text-slate-300 text-center">
                ID: {selectedStudent.studentId}
              </p>
              <p className="text-sm text-slate-300 text-center mb-4">
                Phone: +91 {selectedStudent.phone || "N/A"}
              </p>

              <p className="text-sm text-slate-200 font-medium mb-2">
                Enrolled Courses:
              </p>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar mb-4">
                {selectedStudent.enrolledCourses?.map((course) => (
                  <div
                    key={course.courseId}
                    className="border border-white/10 p-3 rounded bg-white/5 text-sm"
                  >
                    <p>
                      <strong>Course:</strong> {course.name}
                    </p>
                    <p>
                      <strong>Course ID:</strong> {course.courseId}
                    </p>
                    <p>
                      <strong>Trainer:</strong> {course.trainer?.name}
                    </p>
                  </div>
                ))}
              </div>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                onClick={() => {
                  navigate(
                    `/student-attendance?studentId=${selectedStudent.studentId}`
                  );
                }}
              >
                View Attendance Records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
