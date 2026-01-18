import React, { useState } from "react";
import AddBook from "./AddBook";
import ManageBooks from "./ManageBook";
import IssueBooks from "./IssueBooks";
import ReturnBooks from "./ReturnBook";
import LibraryHistory from "./LibraryHistory";
import BookReservations from "./BookReservation";

export default function AdminLibrary() {
  const [active, setActive] = useState("manage");

  const tabs = [
    { id: "manage", label: "Manage Books" },
    { id: "add", label: "Add Book" },
    { id: "issue", label: "Issue Books" },
    { id: "return", label: "Return Books" },
    { id: "history", label: "Library History" },
    { id: "reservations", label: "Reservations" },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <h2 className="text-4xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Command Center: Library</h2>

      <div className="flex gap-4 mb-10 flex-wrap justify-center glass-card p-4 rounded-3xl border border-white/10 robust-inset shadow-2xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
              active === t.id
                ? "bg-red-600 text-white shadow-lg shadow-red-500/20 scale-105"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <div className="mt-6">
        {active === "manage" && <ManageBooks/>}
        {active === "add" && <AddBook/> }
        {active === "issue" && <IssueBooks/>} 
        {active === "return" && <ReturnBooks/>}
        {active === "history" && <LibraryHistory/>}
        {active === "reservations" && <BookReservations/>}
      </div>
    </div>
  );
}
