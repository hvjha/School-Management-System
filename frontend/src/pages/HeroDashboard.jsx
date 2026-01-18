import React, { useEffect, useState, useRef } from "react";
import api from "../api/api";
import AllCourseCard from "../cards/AllCourseCard";
import TrainerCard from "../cards/TrainerCard";
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaBell, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

export default function HeroDashboard() {
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState(null);

  const coursesContainerRef = useRef(null);
  const trainersContainerRef = useRef(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/api/course/courses");
      const fetchedCourses = res.data.courses || [];
      setCourses(fetchedCourses);

      const now = new Date();
      const recentThreshold = 20 * 60 * 1000;
      const newlyAdded = fetchedCourses
        .map((c) => ({ ...c, createdAtDiff: now - new Date(c.createdAt) }))
        .filter((c) => c.createdAtDiff >= 0 && c.createdAtDiff <= recentThreshold)
        .sort((a, b) => a.createdAtDiff - b.createdAtDiff)[0];

      if (newlyAdded) setNewCourse(newlyAdded);
    } catch (e) {
      console.error("Failed to fetch courses", e);
    }
  };

  useEffect(() => {
    fetchCourses();
    const interval = setInterval(fetchCourses, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stats and trainers (Public)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/admin/public/stats");
        setTrainers(res.data.trainers || []);
        setStudents({ length: res.data.studentCount || 0 }); // Mock length for stat card
      } catch (e) {
        console.error("Failed to fetch public stats", e);
      }
    })();
  }, []);

  const useAutoScroll = (ref) => {
    useEffect(() => {
      const container = ref.current;
      if (!container) return;
      let scrollAmount = 0;
      const scrollStep = 300;
      const interval = setInterval(() => {
        if (scrollAmount + container.clientWidth >= container.scrollWidth) {
          scrollAmount = 0;
        } else {
          scrollAmount += scrollStep;
        }
        container.scrollTo({ left: scrollAmount, behavior: "smooth" });
      }, 13000);
      return () => clearInterval(interval);
    }, [ref]);
  };

  useAutoScroll(coursesContainerRef);
  useAutoScroll(trainersContainerRef);

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-28 pb-20">
      {/* Background Accents - adjusted for dark theme */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl -mr-64 -mt-64 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl -ml-64 -mb-64 z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-20">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight italic text-shadow-sm">
            EDU<span className="text-blue-500 text-glow">DASH</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto">
            Insights and real-time statistics from our thriving educational ecosystem.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Active Students", value: students.length, icon: <FaUsers />, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Expert Trainers", value: trainers.length, icon: <FaChalkboardTeacher />, color: "text-indigo-400", bg: "bg-indigo-500/10" },
            { label: "Live Courses", value: courses.length, icon: <FaBookOpen />, color: "text-cyan-400", bg: "bg-cyan-500/10" }
          ].map((stat, i) => (
            <div key={i} className="glass-card-light p-8 rounded-[2rem] border border-white/10 flex items-center justify-between hover-lift transition-all duration-300 group">
              <div className="space-y-1">
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</p>
                <p className={`text-5xl font-black ${stat.color} text-shadow-sm`}>{stat.value}</p>
              </div>
              <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Notification Area */}
        {newCourse && (
          <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center animate-pulse">
                <FaBell />
              </div>
              <div>
                <h4 className="text-lg font-bold">New Course Just Arrived!</h4>
                <p className="text-slate-400 text-sm">Explore <span className="text-white font-bold">{newCourse.name}</span> by {newCourse.trainers?.[0]?.name || "Expert Trainer"}</p>
              </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setSelectedCourse(newCourse)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                View Details
              </button>
              <button 
                onClick={() => setNewCourse(null)}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Sections */}
        <div className="space-y-24">
          
          {/* Trainers Showcase */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-black text-white">Elite Faculty</h2>
              <div className="h-1 flex-1 mx-8 bg-white/5 rounded-full hidden md:block"></div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Mentorship</span>
            </div>
            <div className="overflow-x-auto no-scrollbar" ref={trainersContainerRef}>
              <div className="flex gap-8 w-max px-2 py-4">
                {trainers.map((t) => (
                  <div key={t._id} className="w-[300px] flex h-full">
                    <TrainerCard trainer={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Courses */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Curated Learning</span>
              <div className="h-1 flex-1 mx-8 bg-slate-100 rounded-full hidden md:block"></div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Featured Curriculums</h2>
            </div>
            <div className="overflow-x-auto no-scrollbar pb-8" ref={coursesContainerRef}>
              <div className="flex gap-8 w-max px-2">
                {courses.map((c) => (
                  <div key={c._id} className="w-[350px] flex h-full">
                    <AllCourseCard course={c} onSelect={setSelectedCourse} />
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Details Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 space-y-6">
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>

                <div className="pb-6 border-b border-slate-100">
                  <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Course Insight</span>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedCourse.name}</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-slate-500 text-sm font-bold">Standard ID</span>
                    <span className="text-slate-900 font-mono font-bold uppercase">{selectedCourse.courseId}</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Primary Mentors</p>
                    {selectedCourse.trainers?.map((t) => (
                      <div key={t.trainerId} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">{t.name[0]}</div>
                           <span className="text-sm font-bold text-slate-700">{t.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">ID: {t.trainerId}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaUsers className="text-blue-500" />
                      <span className="text-sm font-bold">{selectedCourse.students?.length || 0} Enrolled Students</span>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                      Join Course <FaExternalLinkAlt size={10} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
