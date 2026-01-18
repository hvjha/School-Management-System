import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";

export default function IssueBooks() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    loadUsers();
    loadBooks();
    loadReservations();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/api/admin/user-details");
      const students = data?.users?.students || [];
      const trainers = data?.users?.trainers || [];
      setUsers([...students, ...trainers]);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const loadReservations = async () => {
    try {
      const { data } = await api.get("/api/library/book/reservation/all");
      setReservations(data.reservations || []);
    } catch (err) {
      console.error(err);
    }
  }

  const loadBooks = async () => {
    try {
      const { data } = await api.get("/api/library/book/books");
      setBooks(data.books || []);
    } catch {
      toast.error("Failed to load books");
    }
  };

  /* ---------------- BOOK SELECTION ---------------- */
  const toggleBook = (bookId) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  /* ---------------- ISSUE BOOKS ---------------- */
  const handleIssueBooks = async () => {
    if (!selectedUser) return toast.error("Please select a student");
    if (!dueDate) return toast.error("Please select due date");
    if (selectedBooks.length === 0)
      return toast.error("Select at least one book");

    const targetUser = users.find(u => u._id === selectedUser);

    try {
      const { data } = await api.post("/api/library/book/issue", {
        student: selectedUser,
        books: selectedBooks,
        dueDate,
      });

      if (data.success) {
        toast.success(`${data.issuedCount} book(s) issued successfully`);
        setSelectedBooks([]);
        setDueDate("");
        setSelectedUser("");
        loadBooks(); // refresh availability
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Issue failed");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Deploy Tactical Resources</h2>

      {/* USER & DATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Select Personnel</label>
           <select
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="" className="bg-slate-900">Choose Student/Trainer</option>
              {users.filter(u => u.role === 'student').map((s) => (
                <option key={s._id} value={s._id} className="bg-slate-900">
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Expected Return</label>
            <div className="flex flex-row border border-white/10 rounded-2xl w-full justify-between items-center px-4 bg-white/5 h-[58px]">
              <input
                type="date"
                className="w-full bg-transparent border-none text-white font-bold focus:outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
        </div>
      </div>

      {/* BOOK LIST */}
      <div className="border border-white/10 rounded-[2rem] p-6 max-h-[400px] overflow-y-auto no-scrollbar bg-white/5 robust-inset">
        <h3 className="flex justify-between items-center mb-6">
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Resource Manifest</span>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg shadow-red-500/20">
            {selectedBooks.length} SELECTED
          </span>
        </h3>

        {books.length === 0 && (
          <div className="text-center py-10 opacity-30">
            <p className="text-xl font-black text-white uppercase tracking-widest">Armory Empty</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((b) => {
            const isReserved = reservations.some(r => r.book?._id === b._id && r.status === 'pending');
            const resCount = reservations.filter(r => r.book?._id === b._id && r.status === 'pending').length;
            const isSelected = selectedBooks.includes(b._id);

            return (
              <label
                key={b._id}
                className={`group flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "bg-red-600/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : b.availableCopies === 0 
                    ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-red-500/50 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={b.availableCopies === 0}
                  checked={isSelected}
                  onChange={() => toggleBook(b._id)}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-red-500 bg-red-600" : "border-slate-500"}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                
                <div className="flex-1">
                  <p className={`font-black text-sm uppercase italic leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>{b.title}</p>
                  <div className={`text-[9px] font-bold mt-1 flex flex-wrap gap-2 items-center ${isSelected ? 'text-red-200' : 'text-slate-500'}`}>
                    <span className="uppercase tracking-wider">STOCK: {b.availableCopies}</span>
                    {isReserved && (
                      <span className="bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-yellow-500/20">
                        Reserved ({resCount})
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleIssueBooks}
          disabled={selectedBooks.length === 0}
          className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${
            selectedBooks.length > 0 
            ? "bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-red-500/20" 
            : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
          }`}
        >
          {selectedBooks.length > 1 ? "Issue Resources" : "Issue Resource"}
        </button>
      </div>
    </div>
  );
}
