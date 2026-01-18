// import React, { useEffect, useState } from "react";
// import api from "../../api/api";
// import { toast } from "react-toastify";
// import { FaBook, FaCalendarAlt } from "react-icons/fa";

// export default function TrainerReservationHistory() {
//   const [reservations, setReservations] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchMyReservations = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get("/api/library/book/reservation/trainer");
//       setReservations(data.reservations || []); 
//     } catch (err) {
//       toast.error("Failed to load your reservations");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMyReservations();
//   }, []);

//   const handleCancel = async (id) => {
//     if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
//     try {
//       await api.delete(`/api/library/book/reservation/cancel/${id}`);
//       toast.success("Reservation cancelled");
//       fetchMyReservations();
//     } catch (err) {
//       toast.error("Failed to cancel reservation");
//     }
//   };

//   // Removing the fetchFixed redundant test function
  
//   return (
//     <div className="bg-white p-6 rounded shadow min-h-[50vh]">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//         <FaCalendarAlt className="text-blue-600" /> My Book Reservations
//       </h2>

//       {loading ? (
//         <div className="flex justify-center py-10">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {reservations.length === 0 ? (
//             <p className="text-center py-20 text-gray-500 italic bg-gray-50 rounded border border-dashed">
//               You haven't reserved any books yet.
//             </p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left border-collapse">
//                 <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//                   <tr>
//                     <th className="p-4 rounded-tl-lg">Book Details</th>
//                     <th className="p-4">Reserved On</th>
//                     <th className="p-4">Expiry Date</th>
//                     <th className="p-4 text-center">Status</th>
//                     <th className="p-4 text-right rounded-tr-lg">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {reservations.map((res) => (
//                     <tr key={res._id} className="hover:bg-gray-50 transition-colors">
//                       <td className="p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
//                             {res.book?.coverImage ? (
//                                 <img src={res.book.coverImage} className="w-full h-full object-cover" />
//                             ) : (
//                                 <FaBook className="text-gray-400" />
//                             )}
//                           </div>
//                           <div>
//                             <p className="font-bold text-gray-800 uppercase text-[10px] tracking-tight">{res.book?.category}</p>
//                             <p className="font-semibold text-sm">{res.book?.title}</p>
//                             <p className="text-xs text-gray-500">{res.book?.isbn}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="p-4 text-gray-600">
//                         {new Date(res.reservationDate || res.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="p-4 text-red-500 font-medium">
//                         {new Date(res.expiryDate).toLocaleDateString()}
//                       </td>
//                       <td className="p-4 text-center">
//                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
//                           res.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
//                           res.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
//                           'bg-red-100 text-red-700'
//                         }`}>
//                           {res.status}
//                         </span>
//                       </td>
//                       <td className="p-4 text-right">
//                         {res.status === 'pending' && (
//                           <button 
//                             onClick={() => handleCancel(res._id)}
//                             className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
//                           >
//                             Cancel
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
      
//       <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
//         <h4 className="font-bold text-blue-800 mb-2 text-sm uppercase tracking-wide">💡 Reservation Rules:</h4>
//         <ul className="text-xs text-blue-700 list-disc ml-5 space-y-1">
//           <li>You can reserve a maximum of <strong>3 books</strong> at any given time.</li>
//           <li>Each reserved book must belong to a <strong>different category</strong>.</li>
//           <li>Reservations are valid for <strong>3 days</strong>, after which they expire automatically.</li>
//         </ul>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaBook } from "react-icons/fa";

export default function TrainerReservationHistory() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/library/book/reservation/trainer");
      setReservations(data.reservations || []);
    } catch (err) {
      toast.error("Failed to load your reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await api.delete(`/api/library/book/reservation/cancel/${id}`);
      toast.success("Reservation cancelled");
      fetchMyReservations();
    } catch {
      toast.error("Failed to cancel reservation");
    }
  };

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      
      {/* TITLE */}
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">
        Reservation Archives
      </h2>

      {/* EMPTY */}
      {!loading && reservations.length === 0 && (
        <p className="text-center py-20 text-slate-400 italic bg-white/5 rounded-2xl border border-white/10">
          No active reservations found
        </p>
      )}

      {/* TABLE */}
      {reservations.length > 0 && (
        <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-white/5">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#0f172a] text-slate-500">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">
                    Asset
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">
                    Reserved On
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">
                    Expiry
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {reservations.map((res) => (
                  <tr
                    key={res._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* BOOK */}
                    <td className="p-4 text-center">
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-10 h-14 bg-white/10 rounded flex items-center justify-center overflow-hidden">
                          {res.book?.coverImage ? (
                            <img
                              src={res.book.coverImage}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FaBook className="text-slate-500" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-slate-500 uppercase">
                            {res.book?.category}
                          </p>
                          <p className="text-xs font-bold text-white uppercase italic">
                            {res.book?.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {res.book?.isbn}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* RESERVED */}
                    <td className="p-4 text-center text-[10px] font-mono text-slate-500">
                      {new Date(
                        res.reservationDate || res.createdAt
                      ).toLocaleDateString()}
                    </td>

                    {/* EXPIRY */}
                    <td className="p-4 text-center text-[10px] font-mono text-red-500">
                      {new Date(res.expiryDate).toLocaleDateString()}
                    </td>

                    {/* STATUS */}
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                          res.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            : res.status === "fulfilled"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center">
                      {res.status === "pending" && (
                        <button
                          onClick={() => handleCancel(res._id)}
                          className="px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-md
                                     bg-red-500/10 text-red-500 border border-red-500/20
                                     hover:bg-red-500 hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LOADER */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}
        </div>
      )}

      {/* RULES */}
      <div className="mt-8 bg-white/5 border border-white/10 p-5 rounded-2xl">
        <h4 className="font-black text-red-400 mb-3 text-xs uppercase tracking-widest">
          Reservation Protocol
        </h4>
        <ul className="text-[11px] text-slate-400 list-disc ml-5 space-y-1">
          <li>Maximum <strong>3 active reservations</strong></li>
          <li>Each book must be from a <strong>unique category</strong></li>
          <li>Reservations auto-expire after <strong>3 days</strong></li>
        </ul>
      </div>
    </div>
  );
}

