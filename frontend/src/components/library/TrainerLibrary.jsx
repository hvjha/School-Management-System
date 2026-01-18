import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { FaBook, FaSearch } from "react-icons/fa";

export default function TrainerLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [myReservations, setMyReservations] = useState([]);

  const categories = [
    "All", "Fiction", "Non-Fiction", "Science", "Technology", "History",
    "Mathematics", "Programming", "Business", "Arts", "Other"
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bookData } = await api.get("/api/library/book/books");
      setBooks(bookData.books || []);
      
      const { data: resData } = await api.get("/api/library/book/reservation/trainer");
      setMyReservations(resData.reservations || []);
    } catch (err) {
      toast.error("Failed to load library data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReserve = async (bookId) => {
    try {
      const { data } = await api.post("/api/library/book/reservation", { bookId });
      toast.success(data.message || "Book reserved successfully");
      fetchData(); // Refresh both books and user's reservation count
    } catch (err) {
      toast.error(err.response?.data?.message || "Reservation failed");
    }
  };

  const activeResCount = myReservations.filter(r => r.status === 'pending').length;
  const reservedBookIds = myReservations.filter(r => r.status === 'pending').map(r => r.book?._id);

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 robust-inset shadow-2xl animate-in fade-in duration-700 min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black text-white text-shadow-red uppercase italic tracking-tight">Tactical Library</h2>
          <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg shadow-red-500/20 flex items-center gap-2 tracking-widest border border-red-500/30">
            Reserves: {activeResCount} / 3
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-4 top-4 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH ARCHIVES..."
              className="pl-12 p-3 bg-white/5 border border-white/10 rounded-xl w-full text-white font-bold text-xs focus:ring-2 focus:ring-red-600/50 focus:outline-none placeholder:text-slate-600 uppercase tracking-wider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs focus:ring-2 focus:ring-red-600/50 focus:outline-none uppercase tracking-wider"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isAlreadyReserved = reservedBookIds.includes(book._id);

            return (
              <div key={book._id} className="glass-card-light rounded-3xl overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-300 border border-white/10 group">
                <div className="h-56 bg-slate-900/50 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-900 transition-colors">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <FaBook size={60} className="text-white/10 group-hover:text-red-600/20 transition-colors" />
                  )}
                  <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-lg font-black uppercase shadow-lg tracking-widest border border-white/10">
                    {book.category}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col bg-white/5 backdrop-blur-sm">
                  <h3 className="font-black text-lg mb-2 line-clamp-1 text-white uppercase italic leading-none">{book.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">{book.author}</p>
                  
                  <div className="text-[10px] font-mono text-slate-500 space-y-2 mb-6 border-t border-white/5 pt-4">
                    <p className="flex justify-between"><span>ISBN</span> <span className="text-slate-300">{book.isbn}</span></p>
                    <p className="flex justify-between"><span>In Stock</span> <span className={`font-black ${book.availableCopies > 0 ? 'text-green-400' : 'text-red-500'}`}>{book.availableCopies} UNITS</span></p>
                  </div>

                  <div className="mt-auto">
                    {isAlreadyReserved ? (
                      <div className="text-[10px] font-black w-full py-3 text-center bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20 uppercase tracking-widest">
                        Reservation Pending
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReserve(book._id)}
                        disabled={activeResCount >= 3}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                          activeResCount >= 3 
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5' 
                          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/20 border border-transparent'
                        }`}
                      >
                        Reserve Asset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500 italic uppercase tracking-widest font-bold">
              No matching assets found in database.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
