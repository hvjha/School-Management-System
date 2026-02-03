import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import api from "../api/api";
import UserProfileCard from "../cards/UserProfileCard";
import TrainerCard from "../cards/TrainerCard";
import CourseCard from "../cards/CourseCards";
import { RxHamburgerMenu } from "react-icons/rx";
import StudentAttendance from "../components/StudentAttendance";
import StudentLibraryHistory from "../components/library/StudentLibraryHistory";

// Lazy load PDFViewer for better performance
const PDFViewer = lazy(() => import("../helper/PDFViewer"));

export default function LoggedInStudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseVideos, setCourseVideos] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [folder, setFolder] = useState(null);

  const trainersContainerRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/course/student/my");
        setCourses(res.data.courses || []);
        setUser(res.data.user || null);
        setUpdatedUser(res.data.user || {});
      } catch (e) {
        console.error("Failed loading data", e);
      }
    })();
  }, []);

  const trainers = Array.from(
    new Map(courses.map((c) => [c.trainer.trainerId, c.trainer])).values()
  );

  const handleUpdate = async () => {
    if (!user?._id) return;
    try {
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profile_pic: updatedUser.profile_pic,
      };
      const res = await api.post(`/api/admin/update-user/${user._id}`, payload);
      setUser(res.data.user);
      setEditMode(false);
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  const fetchCourseVideos = async (id) => {
    try {
      const res = await api.get(`/api/content/list/${id}`);
      setCourseVideos(res.data.content || []);
    } catch (e) {
      console.error("Video load failed");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "userdata", label: "User Data" },
    { id: "content", label: "Content" },
    { id: "attendance", label: "Attendance" },
    { id: "library", label: "Library" },
  ];

  return (
    <div className="flex mt-18 overflow-hidden h-screen">
      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed md:static left-0 z-40 glass-sidebar w-64 p-6 h-full shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={() => setSidebarOpen(false)} className="text-xl">
            ✖
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 hidden md:block">
          Student Panel
        </h2>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`text-left px-4 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => {
                setSelectedCourse(null);
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ================= Hamburger for Mobile ================= */}
      <button
        className="md:hidden fixed top-4 left-4 bg-white p-2 rounded shadow z-50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <RxHamburgerMenu size={22} />
      </button>

      {/* ================= Main Content ================= */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
        {/* ---------------- PROFILE ---------------- */}
        {activeTab === "profile" && (
          <div className="flex flex-col lg:justify-center mt-18">
            <h1 className="text-3xl font-bold mb-6 text-center">
              {user?.name}
            </h1>
            <div className="flex flex-col flex-wrap gap-6 mb-6 justify-center md:justify-start items-center">
              <div className="glass-card-light p-6 rounded-2xl w-64 text-center border-b-4 border-red-600 robust-inset">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  STUDENT ID
                </h3>
                <p className="text-2xl font-black mt-2 text-white">{user?.studentId || "N/A"}</p>
              </div>
              <div className="glass-card-light p-6 rounded-2xl w-64 text-center border-white/5 robust-inset">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Active Units
                </h3>
                <p className="text-3xl font-black mt-2 text-white">{courses.length}</p>
              </div>
              <div className="glass-card-light p-6 rounded-2xl w-64 text-center border-white/5 robust-inset">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mentors</h3>
                <p className="text-3xl font-black mt-2 text-white">{trainers.length}</p>
              </div>
              <UserProfileCard
                user={user}
                editMode={editMode}
                updatedUser={updatedUser}
                setUpdatedUser={setUpdatedUser}
                handleUpdate={handleUpdate}
                setEditMode={setEditMode}
              />
            </div>
          </div>
        )}

        {/* ---------------- USER DATA ---------------- */}
        {activeTab === "userdata" && (
          <div className="w-full flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Trainers</h2>
            <div
              className="mb-5 flex flex-col gap-4 lg:flex-row lg:overflow-x-auto lg:no-scrollbar overflow-auto no-scrollbar"
              ref={trainersContainerRef}
            >
              <div className="flex gap-4 w-max">
                {trainers.map((t) => (
                  <TrainerCard key={t.trainerId} trainer={t} />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-semibold mt-6">Courses</h2>
            <div className="lg:mb-10 mb-10 flex flex-col gap-4 lg:flex-row lg:overflow-x-auto lg:no-scrollbar overflow-auto no-scrollbar">
              <div className="flex gap-4 w-max">
                {courses.map((c) => (
                  <CourseCard key={c._id} course={c} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CONTENT ---------------- */}
        {activeTab === "content" && (
          <div className="flex flex-col gap-6 lg:mb-0 mb-7">
            <h1 className="text-3xl font-bold">Course Content</h1>

            {!selectedCourse ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="glass-card p-8 rounded-[2.5rem] cursor-pointer hover-lift hover-red-glow border border-white/10 transition-all robust-inset"
                    onClick={() => {
                      setSelectedCourse(course);
                      fetchCourseVideos(course.courseId);
                      setFolder(null);
                    }}
                  >
                    <h2 className="text-xl font-black text-white text-shadow-red">{course.name}</h2>
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">({course.courseId})</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
            {/* Content Display */}
            <div>
                <button
                  className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 hover:text-red-400 transition-colors"
                  onClick={() => {
                    setSelectedCourse(null);
                    setFolder(null);
                  }}
                >
                  ← Return to Tactical Grid
                </button>
                <h2 className="text-3xl font-black text-white text-shadow-red mb-8 uppercase italic border-l-4 border-red-600 pl-4">
                  {selectedCourse.name}
                </h2>

                <div className="flex flex-wrap gap-6 mb-10">
                  <div
                    className="glass-card p-8 w-48 text-center rounded-[2rem] cursor-pointer hover-lift hover-red-glow transition-all border border-white/10 robust-inset group"
                    onClick={() => setFolder("video")}
                  >
                    <span className="text-3xl block mb-4 group-hover:scale-125 transition-transform duration-500">🎥</span>
                    <p className="font-black text-white uppercase tracking-widest text-xs">Intelligence</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Video Streams</p>
                  </div>
                  <div
                    className="glass-card p-8 w-48 text-center rounded-[2rem] cursor-pointer hover-lift hover-red-glow transition-all border border-white/10 robust-inset group"
                    onClick={() => setFolder("document")}
                  >
                    <span className="text-3xl block mb-4 group-hover:scale-125 transition-transform duration-500">📄</span>
                    <p className="font-black text-white uppercase tracking-widest text-xs">Protocols</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Documents</p>
                  </div>
                </div>

                {folder === "video" && (
                  <div className="flex flex-col gap-8">
                    {courseVideos.filter((v) => v.file_type === "video")
                      .length === 0 ? (
                      <p className="text-slate-500 italic font-bold">No tactical briefs uploaded.</p>
                    ) : (
                      courseVideos
                        .filter((v) => v.file_type === "video")
                        .map((v) => (
                          <div
                            key={v._id}
                            className="glass-card p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-8 border border-white/10 robust-inset group hover:border-red-600/30 transition-all duration-700"
                          >
                            <Suspense fallback={
                              <div className="relative md:w-[22vw] min-w-[280px] h-48 overflow-hidden rounded-3xl border-2 border-white/5 flex items-center justify-center bg-slate-800">
                                <div className="text-center">
                                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
                                  <p className="text-slate-400 text-xs font-bold">Loading...</p>
                                </div>
                              </div>
                            }>
                              <div className="relative md:w-[22vw] min-w-[280px] h-48 overflow-hidden rounded-3xl border-2 border-white/5">
                                <video
                                  src={v.file_url}
                                  controls
                                  preload="metadata"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                              </div>
                            </Suspense>
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors tracking-tight">
                                  {v.title}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                  Deployed: {new Date(v.createdAt).toDateString()}
                                </p>
                              </div>
                              <p className="text-slate-400 font-medium text-sm leading-relaxed">{v.description}</p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {folder === "document" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {courseVideos
                      .filter((d) => d.file_type !== "video")
                      .length === 0 ? (
                        <p className="text-slate-500 italic font-bold">No protocol data uploaded.</p>
                    ) : (
                      courseVideos
                        .filter((d) => d.file_type !== "video")
                        .map((d) => (
                          <div
                            key={d._id}
                            className="glass-card p-8 rounded-[2.5rem] border border-white/10 robust-inset group hover:border-red-600/30 transition-all duration-700"
                          >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{d.title}</h3>
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                      {d.file_type.toUpperCase()} Protocol
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                                <Suspense fallback={
                                  <div className="flex items-center justify-center py-12 bg-slate-800">
                                    <div className="text-center">
                                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                                      <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Loading PDF...</p>
                                    </div>
                                  </div>
                                }>
                                  <PDFViewer url={d.file_url} />
                                </Suspense>
                            </div>
                            <p className="mt-6 text-slate-400 font-medium text-sm leading-relaxed">{d.description}</p>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
        {activeTab === "attendance" && <StudentAttendance courses={courses}/>}
        {activeTab === "library" && <StudentLibraryHistory studentId={user?._id} />}

    
      </main>
    </div>
  );
}
