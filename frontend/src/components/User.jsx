import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";

export default function Users() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/users");
      // Filter out superadmin
      const filteredUsers = (data.users || data).filter(u => u.role !== "superadmin");
      setUsers(filteredUsers);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
  <div className="flex flex-wrap gap-8 overflow-y-auto lg:h-[80vh] no-scrollbar lg:mt-0 h-[65vh] mt-35 justify-center p-4">
    {users
      .filter(u => u.role !== "superadmin") 
      .map(u => (
        <div
          key={u._id}
          className="glass-card-light rounded-[2.5rem] p-8 flex flex-col items-center text-center hover-lift hover-red-glow transition-all duration-500 w-[300px] border border-white/10 robust-inset group"
        >
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-red-600/10 rounded-full blur-xl scale-110 opacity-50 group-hover:bg-red-600/20 transition-all"></div>
             <div className="relative w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl group-hover:border-red-600/50 transition-colors">
                    { u?.profile_pic ? (
                      <img
                        src={u?.profile_pic}
                        alt="Profile"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-black text-2xl uppercase">
                        {u.name[0]}
                      </div>
                    )}
                  </div>
            </div>
            <h2 className="text-xl font-black text-white group-hover:text-red-500 transition-colors tracking-tight text-shadow-red truncate w-full px-2">{u.name}</h2>
            <div className="mt-4 space-y-2 w-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-600/10 py-1 rounded-lg border border-red-500/20">{u.role}</p>
                <div className="pt-2 flex flex-col gap-1">
                    <p className="text-[11px] font-medium text-slate-400 truncate tracking-tight">{u.email}</p>
                    <p className="text-[11px] font-medium text-slate-500 font-mono">{u.phone || "N/A"}</p>
                </div>
            </div>
        </div>
      ))}
  </div>
);
}
