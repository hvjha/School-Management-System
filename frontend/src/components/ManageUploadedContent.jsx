import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

export default function ManageUploadedContent() {
  const [grouped, setGrouped] = useState({});

  const loadAll = async () => {
    const res = await api.get("/api/content/all");

    const data = res.data.content; // flat list
    const grouping = {};

    data.forEach((item) => {
      const courseId = item.courseId;

      if (!grouping[courseId]) {
        grouping[courseId] = {
          videos: [],
          documents: []
        };
      }

      if (item.file_type === "video") {
        grouping[courseId].videos.push(item);
      } else {
        grouping[courseId].documents.push(item);
      }
    });

    setGrouped(grouping);
  };

  const deleteItem = async (id) => {
    await api.delete(`/api/content/delete/${id}`);
    toast.success("Deleted");
    loadAll(); // reload list
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="p-4 lg:mt-0 mt-20 pb-20">
      <h1 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red border-b-2 border-red-600 pb-4 inline-block w-full">
        Data Archives Control
      </h1>

      {Object.keys(grouped).length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 opacity-50">
             <p className="text-2xl font-black text-white uppercase tracking-widest italic">Archives Empty</p>
             <p className="text-sm font-bold text-slate-500 mt-2">No classified data currently stored.</p>
        </div>
      )}

      {Object.keys(grouped).map((courseId) => (
        <div key={courseId} className="mb-12 glass-card p-6 rounded-[2rem] border border-white/10 robust-inset relative overflow-hidden">
             
           <div className="flex items-center gap-4 mb-6 relative z-10">
               <div className="w-2 h-12 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{courseId}</h3>
           </div>
            
           <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl -tr-10 opacity-50 pointer-events-none"></div>

          {/* VIDEOS */}
          <div className="mb-8 relative z-10">
            <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4 border-b border-blue-500/20 pb-2 inline-block">Video Streams</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {grouped[courseId].videos.length === 0 && (
                <p className="text-xs font-bold text-slate-600 uppercase italic">No video feeds secured.</p>
                )}

                {grouped[courseId].videos.map((v) => (
                <div
                    key={v._id}
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group flex flex-col"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                             {/* Icon placeholder or use react-icons if imported */}
                             VIDEO
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{v.duration}s</span>
                    </div>
                    
                    <p className="font-bold text-white text-sm mb-1 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                        {v.title}
                    </p>

                    <button
                    className="mt-4 w-full py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    onClick={() => deleteItem(v._id)}
                    >
                    Delete
                    </button>
                </div>
                ))}
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="mb-2 relative z-10">
            <h4 className="text-sm font-black text-green-400 uppercase tracking-widest mb-4 border-b border-green-500/20 pb-2 inline-block">Classified Docs</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {grouped[courseId].documents.length === 0 && (
                 <p className="text-xs font-bold text-slate-600 uppercase italic">No documents secured.</p>
                )}

                {grouped[courseId].documents.map((d) => (
                <div
                    key={d._id}
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group flex flex-col"
                >
                     <div className="flex justify-between items-start mb-2">
                        <span className="p-2 bg-green-500/20 rounded-lg text-green-400 text-xs font-black uppercase">
                             DOC
                        </span>
                         <span className="text-[10px] font-mono text-slate-500 uppercase">{d.file_type}</span>
                    </div>

                    <p className="font-bold text-white text-sm mb-1 line-clamp-2 leading-tight group-hover:text-green-400 transition-colors">
                        {d.title}
                    </p>

                    <button
                    className="mt-4 w-full py-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    onClick={() => deleteItem(d._id)}
                    >
                    Delete
                    </button>
                </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
