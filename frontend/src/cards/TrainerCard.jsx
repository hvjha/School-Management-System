import React, { useContext } from "react";
import { FaEnvelope, FaBriefcase, FaUserGraduate, FaPhone, FaLock } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

export default function TrainerCard({ trainer }) {
  const { user } = useContext(AuthContext);
  // Show contact info if user is logged in
  const canViewContact = !!user;

  return (
    <div
      key={trainer.trainerId}
      className="group glass-card rounded-[3rem] p-8 flex flex-col items-center text-center hover-lift hover-red-glow transition-all duration-500 h-[500px] w-80 border-white/10 robust-inset shrink-0"
    >
      {/* Avatar Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-600/20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700 blur-xl opacity-50"></div>
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-red-600 shadow-2xl">
          {trainer.profile_pic ? (
            <img
              src={trainer.profile_pic}
              alt={trainer.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-4xl">
              {trainer.name?.[0]}
            </div>
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-600 rounded-full border-4 border-[#0f172a] flex items-center justify-center text-white shadow-xl">
           <FaUserGraduate size={18} />
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-6 flex-1 w-full">
        <div>
          <h3 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors text-shadow-red truncate">{trainer.name}</h3>
          <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Intelligence Sector: Expert</p>
        </div>

        <div className="pt-6 grid grid-cols-2 gap-4 border-t border-white/5 text-[10px] uppercase font-black text-slate-500 tracking-widest">
          <div className="space-y-1.5">
            <span className="flex items-center justify-center gap-2 text-red-500"><FaBriefcase /> Focus</span>
            <span className="text-white truncate block">{trainer.company || "Mentorship"}</span>
          </div>
          <div className="space-y-1.5">
            <span className="flex items-center justify-center gap-2 text-red-500"><FaUserGraduate /> Mastery</span>
            <span className="text-white block">{trainer.experience || 0} Years</span>
          </div>
        </div>

        <div className="space-y-3">
          {canViewContact ? (
            <>
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl text-white text-[11px] font-black transition-all group-hover:bg-red-600/10 border border-white/5">
                <FaEnvelope className="text-red-500" /> {trainer.email}
              </div>
              <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl text-white text-[11px] font-black transition-all group-hover:bg-red-600/10 border border-white/5">
                <FaPhone className="text-red-500" /> +91 {trainer.phone || "HIDDEN"}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
              <FaLock className="text-red-600/40 mb-2 scale-125" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">
                Contact Data Encrypted<br/>
                <span className="text-[8px] text-red-400 font-bold">(Login Required)</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
