import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaBook } from "react-icons/fa";

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editBook, setEditBook] = useState(null);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/library/book/books");
      setBooks(data.books);
    } catch (err) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const deleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await api.delete(`/api/library/book/delete/${bookId}`);
      toast.success("Book deleted");
      loadBooks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const updateBook = async () => {
    try {
      await api.post(`/api/library/book/update/${editBook._id}`, editBook);
      toast.success("Book updated");
      setEditBook(null);
      loadBooks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p>Loading books...</p>;

  return (
    <div className="glass-card p-8 rounded-[2.5rem] mt-5 mb-10 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700">
      <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Archive Management</h2>
      <div className="h-[65vh] overflow-y-auto no-scrollbar">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0f172a] z-10">
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Asset</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Creator</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ISBN</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Stock</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Available</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Protocols</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {books.map((b) => (
                <tr key={b._id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {b.coverImage ? (
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded-lg border border-white/10 group-hover:border-red-600/50 transition-colors"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-14 flex items-center justify-center bg-slate-800 rounded-lg border border-white/10">
                          <FaBook className="text-slate-600 text-lg" />
                        </div>
                      )}

                      <div>
                        <p className="font-black text-white text-sm uppercase italic leading-none group-hover:text-red-500 transition-colors">{b.title}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{b.author}</td>
                  <td className="p-4 text-[10px] font-mono text-slate-500 tracking-tighter">{b.isbn}</td>
                  <td className="p-4 text-center text-[11px] font-bold text-white">{b.totalCopies}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black ${b.availableCopies > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                        {b.availableCopies}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="px-3 py-1.5 bg-white/5 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5"
                        onClick={() => setEditBook({ ...b })}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1.5 bg-red-600/10 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-500/20"
                        onClick={() => deleteBook(b._id)}
                      >
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-10">
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No assets in database</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* EDIT MODAL */}
      {editBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card-light p-8 rounded-3xl w-full max-w-lg border border-white/10 robust-inset shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tight">Edit Asset Protocols</h3>

            <div className="space-y-4">
                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Title</label>
                    <input
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-red-500 focus:outline-none"
                      placeholder="Title"
                      value={editBook.title}
                      onChange={(e) =>
                        setEditBook({ ...editBook, title: e.target.value })
                      }
                    />
                </div>

                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Creator</label>
                    <input
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-red-500 focus:outline-none"
                      placeholder="Author"
                      value={editBook.author}
                      onChange={(e) =>
                        setEditBook({ ...editBook, author: e.target.value })
                      }
                    />
                </div>

                <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Units</label>
                    <input
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-red-500 focus:outline-none"
                      placeholder="Total Copies"
                      type="number"
                      min="0"
                      value={editBook.totalCopies}
                      onChange={(e) =>
                        setEditBook({
                          ...editBook,
                          totalCopies: Number(e.target.value),
                        })
                      }
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                className="px-6 py-2 bg-white/5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setEditBook(null)}
              >
                Abort
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                onClick={updateBook}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
