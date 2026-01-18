import React from "react";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { FaLayerGroup, FaTags, FaArrowRight } from "react-icons/fa";

export default function AllCourseCard({ course, onSelect }) {
  return (
    <div
      key={course._id}
      className="group glass-card rounded-[3rem] border-white/10 overflow-hidden hover-lift hover-red-glow transition-all duration-700 flex flex-col h-full w-full robust-inset"
    >
      {/* Upper part: Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-900/50">
        {course.course_img ? (
          <img
            src={course.course_img}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdOutlinePhotoSizeSelectActual size={64} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-6 left-6 bg-red-600/90 backdrop-blur-md px-5 py-2 rounded-full flex items-center gap-2 shadow-2xl border border-red-400/30 group-hover:scale-110 transition-transform">
          <FaTags className="text-white text-xs" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Premium</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col space-y-5">
        <div className="space-y-3">
          <h3 className="font-black text-2xl text-white group-hover:text-red-500 transition-colors line-clamp-2 text-shadow-red">{course.name}</h3>
          <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
             <span className="bg-red-600/20 text-red-400 px-3 py-1 rounded-lg border border-red-500/20">{course.courseId}</span>
             <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
             <span className="text-red-500">Intensive</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
            {(course.trainers || []).slice(0, 2).map((t, i) => (
                <span key={i} className="text-[10px] font-black text-red-500 bg-red-600/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                   {t.name}
                </span>
            ))}
        </div>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Investment</span>
            <span className="text-2xl font-black text-white text-shadow-red">₹{course.price}</span>
          </div>
          <button
            onClick={() => onSelect(course)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-black hover:bg-red-700 hover-scale shadow-xl shadow-red-600/20 transition-all border border-red-400/30"
          >
            Details <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
