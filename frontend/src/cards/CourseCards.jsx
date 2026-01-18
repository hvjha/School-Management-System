
import React from "react";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";

export default function CourseCard({ course, onSelect }) {
  return (
    <div
      key={course._id}
      className="group glass-card rounded-[3rem] w-[320px] h-[400px] flex flex-col overflow-hidden hover-lift hover-red-glow transition-all duration-700 robust-inset border-white/10"
    >
      {/* Upper half: image or avatar */}
      <div className="w-full h-1/2 relative overflow-hidden bg-slate-900/50">
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
        <div className="absolute top-6 left-6 bg-red-600/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-400/30 group-hover:scale-110 transition-transform">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Curriculum</span>
        </div>
      </div>

      {/* Lower half: course info */}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-black text-xl text-white group-hover:text-red-500 transition-colors line-clamp-1 text-shadow-red">{course.name}</h3>
          
          <div className="flex items-center gap-3">
            <span className="bg-red-600/20 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-lg border border-red-500/20 uppercase tracking-widest">
              {course.courseId}
            </span>
            <span className="text-white font-black text-lg">₹{course.price}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 mt-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Mentor</p>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            {course.trainer?.name}
          </p>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={() => onSelect(course)}
            className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 border border-red-400/30"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
