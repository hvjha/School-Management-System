import React, { useEffect, useState } from "react";
import api from "../api/api";
import AllCourseCard from "../cards/AllCourseCard";
import TrainerCard from "../cards/TrainerCard";
import HeroSection from "../components/HeroSection";
import { FaArrowRight, FaUsers, FaBookReader, FaStar, FaGraduationCap } from "react-icons/fa";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/course/courses");
        setCourses(res.data.courses || []);
      } catch (e) {
        console.error("Failed fetching courses:", e);
      }
    })();

    (async () => {
      try {
        const res = await api.get("/api/admin/users");
        const users = res.data.users || [];
        setTrainers(users.filter((u) => u.role === "trainer"));
      } catch (e) {
        console.error("Failed fetching trainers:", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      <main className="container mx-auto px-6 py-20 space-y-24">
        
        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <FaGraduationCap />, title: "Quality Education", text: "Learn from industry-standard curriculum and expert mentors." },
            { icon: <FaUsers />, title: "Expert Trainers", text: "Our trainers bring years of real-world experience to your screen." },
            { icon: <FaBookReader />, title: "Advanced Library", text: "Reserve and access learning materials with our seamless system." }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-[3rem] glass-card border border-white/10 shadow-lg hover-lift hover-red-glow transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center text-2xl mb-8 border border-red-500/20 transition-all feature-icon-red">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-4 italic">
                {feature.title.split(' ')[0]}<span className="text-red-500">{feature.title.split(' ')[1] || ''}</span>
              </h3>
              <p className="text-slate-400 leading-relaxed font-medium">{feature.text}</p>
            </div>
          ))}
        </section>

        {/* Courses Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white text-shadow-sm">Explore Our <span className="text-blue-500">Courses</span></h2>
              <p className="text-slate-400 max-w-2xl text-lg font-medium">Unlock new opportunities with our professionally curated courses. From development to design, we have it all.</p>
            </div>
            <button className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all group">
              View All Curriculums <FaArrowRight />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.slice(0, 6).map((c) => (
              <AllCourseCard key={c._id} course={c} />
            ))}
          </div>
        </section>

        {/* Trainers Section */}
        <section className="space-y-12 bg-white/5 border border-white/10 -mx-6 px-6 py-20 rounded-[3rem] backdrop-blur-sm">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white">Our World-Class Trainers</h2>
            <p className="text-slate-400">Learn directly from professionals working in top tech companies across the globe.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {trainers.map((t) => (
              <TrainerCard key={t._id} trainer={t} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          <div className="space-y-8 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight text-shadow-sm">Ready to Start Your <br /><span className="text-blue-500 text-glow">Learning Adventure?</span></h2>
            <p className="text-blue-100/80 text-lg max-w-xl mx-auto font-medium">Join 5000+ students already learning and growing with our elite community.</p>
            <div className="flex justify-center gap-6">
              <button className="px-12 py-5 bg-red-600 text-white rounded-[2rem] font-black hover-scale shadow-2xl shadow-red-600/40 transition-all border border-red-400/30">Get Started Now</button>
              <button className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-[2rem] font-black hover:bg-white/10 transition-all backdrop-blur-md">Learn More</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
