import React, { useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

export default function EnrollStudent({ students, trainers, courses, onEnroll }) {
  const [enroll, setEnroll] = useState({
    courseId: "",
    studentId: "",
    trainerId: ""
  });

  const doEnroll = async (e) => {
    e.preventDefault();
    if (!enroll.courseId || !enroll.studentId || !enroll.trainerId) {
      toast.error("Please select course, student, and trainer");
      return;
    }
    try {
      await api.post(`/api/course/enroll/${enroll.courseId}`, {
        studentId: enroll.studentId,
        trainerId: enroll.trainerId
      });
      toast.success("Student enrolled successfully");
      setEnroll({ courseId: "", studentId: "", trainerId: "" });
      if (onEnroll) onEnroll(); 
    } catch (err) {
      toast.error(err?.response?.data?.message || "Enrollment failed");
    }
  };

  return (

    
    <div className="flex justify-center items-center min-h-[80vh] p-4 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/10 robust-inset relative overflow-hidden">
        
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50"></div>
        
        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red border-b-2 border-red-600 pb-4 inline-block w-full">
          Enroll Student
        </h2>

        <form onSubmit={doEnroll} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Select Course</label>
            <div className="relative">
              <select
                className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10 appearance-none uppercase"
                value={enroll.courseId}
                onChange={(e) => setEnroll({ ...enroll, courseId: e.target.value })}
              >
                <option value="">-- Choose Course --</option>
                {courses?.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.courseId})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">▼</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Assign Student</label>
            <div className="relative">
              <select
                className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10 appearance-none uppercase"
                value={enroll.studentId}
                onChange={(e) => setEnroll({ ...enroll, studentId: e.target.value })}
              >
                <option value="">-- Select Student --</option>
                {students?.map(s => (
                  <option key={s._id} value={s.studentId}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">▼</div>
            </div>
          </div>

          <div className="space-y-2">

            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Appoint Trainer</label>
            <div className="relative">
              <select
                className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10 appearance-none uppercase"
                value={enroll.trainerId}
                onChange={(e) => setEnroll({ ...enroll, trainerId: e.target.value })}
              >
                <option value="">-- Select Trainer --</option>
                {trainers?.map(t => (
                  <option key={t._id} value={t.trainerId}>
                    {t.name} ({t.trainerId})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">▼</div>
            </div>
          </div>

          <button className="w-full mt-6 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all border-t border-red-400">
            Enroll Student
          </button>
        </form>
      </div>
    </div>
  );
}
