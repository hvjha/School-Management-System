import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function LibraryHistory() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);

      // ✅ CORRECT API
      const { data } = await api.get(
        "/api/library/history/library"
      );

      setHistory(data.report || []);
      setSummary(data.summary || null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load library history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Operation Logs & Archives</h2>

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <SummaryCard label="Total Missions" value={summary.totalIssues} />
          <SummaryCard label="Active Deployments" value={summary.totalIssued} />
          <SummaryCard label="Completed Returns" value={summary.totalReturned} />
          <SummaryCard
            label="Fine Revenue"
            value={`₹${summary.totalFineCollected}`}
          />
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-white/5">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-500">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Asset</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Personnel</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Deployment</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Deadline</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Return</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Penalty</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {history.map((h) => (
                <tr key={h._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center font-black text-white text-xs uppercase italic">{h.book?.title}</td>
                  <td className="p-4 text-center text-xs font-bold text-slate-400 uppercase">{h.student?.name}</td>
                  <td className="p-4 text-center text-[10px] font-mono text-slate-500">{new Date(h.issueDate).toLocaleDateString()}</td>
                  <td className="p-4 text-center text-[10px] font-mono text-slate-500">{new Date(h.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 text-center text-[10px] font-mono text-slate-500">
                    {h.returnDate
                      ? new Date(h.returnDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        h.status === "returned"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="p-4 text-center font-black text-red-500 text-xs">₹{h.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
           <div className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
           </div>
        )}
      </div>
    </div>
  );
}

/* 🔹 Summary Card */
const SummaryCard = ({ label, value }) => (
  <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10 shadow-lg hover:border-red-500/30 transition-all group">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-red-400">{label}</p>
    <p className="text-3xl font-black text-white text-shadow-red">{value}</p>
  </div>
);
