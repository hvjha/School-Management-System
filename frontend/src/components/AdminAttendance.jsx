import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAttendance({ students }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Manage Sector Attendance</h2>

      <div className="overflow-x-auto no-scrollbar max-h-[60vh]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0f172a] z-10">
            <tr className="bg-white/5 border-b border-white/5">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Student Name</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Unit ID</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Comms</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((s) => (
              <tr key={s._id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  <span className="text-white font-black text-sm uppercase italic group-hover:text-red-500 transition-colors">{s.name}</span>
                </td>
                <td className="p-4 font-mono text-[10px] text-slate-500 uppercase tracking-tighter">{s.studentId}</td>
                <td className="p-4 text-[11px] font-medium text-slate-400 font-mono tracking-tight">{s.email}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() =>
                      navigate(`/student-attendance?studentId=${s.studentId}`)
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all border border-transparent"
                  >
                    View Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
