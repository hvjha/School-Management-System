import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function StudentLibraryHistory({ studentId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/api/library/history/student/${studentId}`);
        setHistory(data.history || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load library history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Personal Library Archives</h2>

      {loading && <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div></div>}

      {!loading && history.length === 0 && (
        <div className="text-center py-20 opacity-30 border border-white/10 rounded-3xl bg-white/5">
          <p className="text-xl font-black text-white uppercase tracking-widest">No archival records found</p>
        </div>
      )}

      <div className="space-y-8">
        {history.map((batch) => (
          <div key={batch._id} className="glass-card-light border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.01] transition-transform duration-500">
            <div className="bg-white/5 p-5 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Date</span>
                <span className="ml-3 font-black text-white text-sm tracking-tight text-shadow-sm">
                  {new Date(batch.issueDate).toLocaleDateString()}
                </span>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                batch.batchCompleted 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {batch.batchCompleted ? "Mission Complete" : "Active / Partial"}
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0f172a]/50 text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest">Asset Data</th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest">Deadline</th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest">Returned</th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center">Status</th>
                    <th className="p-4 text-[9px] font-black uppercase tracking-widest text-right">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {batch.books.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-black text-white text-xs uppercase italic tracking-tight">{item.title}</td>
                      <td className="p-4 text-[10px] font-mono text-slate-400">{new Date(batch.dueDate).toLocaleDateString()}</td>
                      <td className="p-4 text-[10px] font-mono text-slate-400">
                        {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[9px] uppercase font-black tracking-widest ${
                          item.status === 'returned' 
                          ? 'text-green-500 bg-green-500/10' 
                          : 'text-blue-400 bg-blue-500/10'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-red-500 text-xs">
                        {item.fine > 0 ? `₹${item.fine}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-white/5 border-t border-white/10">
                  <tr>
                    <td colSpan="4" className="p-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Batch Penalty</td>
                    <td className="p-4 text-right font-black text-red-500 text-sm text-shadow-red">₹{batch.totalFine}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
