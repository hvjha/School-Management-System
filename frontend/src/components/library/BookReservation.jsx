import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaBook } from "react-icons/fa";

export default function BookReservations() {
  const [reservations, setReservations] = useState([]);

  const loadReservations = async () => {
    try {
      const { data } = await api.get("/api/library/book/reservation/all");
      setReservations(data.reservations || []);
    } catch (err) {
      toast.error("Failed to load reservations");
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Advanced Reservations</h2>

      <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-white/5">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f172a] text-slate-500">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Asset Details</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Requester</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Reserved On</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Expires</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Directives</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {r.book?.coverImage ? (
                        <img
                          src={r.book.coverImage}
                          className="w-8 h-12 object-cover rounded shadow-sm border border-white/10 group-hover:border-red-500/50 transition-colors"
                        />
                      ) : (
                        <div className="w-8 h-12 flex items-center justify-center bg-slate-800 rounded border border-white/10">
                             <FaBook className="text-slate-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-white text-xs uppercase italic leading-none group-hover:text-red-500 transition-colors">{r.book?.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{r.book?.isbn}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="py-1">
                      <p className="font-bold text-slate-300 text-xs uppercase tracking-tight">{r.student?.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{r.student?.email}</p>
                    </div>
                  </td>

                  <td className="p-4 text-center text-[10px] font-mono text-slate-400">
                    {new Date(r.reservationDate).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center text-[10px] font-mono text-slate-400">
                    {new Date(r.expiryDate).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        r.status === "fulfilled"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : r.status === "cancelled"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    {r.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={async () => {
                            const dueDate = prompt("Enter Due Date (YYYY-MM-DD):", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                            if (!dueDate) return;
                            
                            try {
                              await api.post(`/api/library/book/reservation/fulfill/${r._id}`, { dueDate });
                              toast.success("Book issued successfully");
                              loadReservations();
                            } catch (err) {
                              toast.error(err.response?.data?.message || "Failed to issue");
                            }
                          }}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Cancel this reservation?")) return;
                            try {
                              await api.delete(`/api/library/book/reservation/cancel/${r._id}`);
                              toast.success("Reservation cancelled");
                              loadReservations();
                            } catch (err) {
                              toast.error("Failed to cancel");
                            }
                          }}
                          className="bg-red-600/10 text-red-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors border border-red-500/20"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
