import React, { useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import uploadFile from "../../helper/UploadFile";
import { IoClose } from "react-icons/io5";

const CATEGORY_OPTIONS = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Mathematics",
  "Programming",
  "Business",
  "Arts",
  "Other",
];

export default function AddBook() {
  const [formBook, setFormBook] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Other",
    publisher: "",
    publishedYear: "",
    totalCopies: 1,
    availableCopies: 1,
    description: "",
    coverImage: "",
    shelfLocation: "",
  });

  const [uploadCover, setUploadCover] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormBook((prev) => ({ ...prev, [name]: value }));
  };

  // Upload cover image
  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploaded = await uploadFile(file);
      setUploadCover(file);

      setFormBook((prev) => ({
        ...prev,
        coverImage: uploaded?.secure_url,
      }));
    } catch {
      toast.error("Cover image upload failed");
    }
  };

  const clearUploadedCover = (e) => {
    e.preventDefault();
    setUploadCover(null);
    setFormBook((prev) => ({ ...prev, coverImage: "" }));
  };

  const submitBook = async (e) => {
    e.preventDefault();

    if (!formBook.title || !formBook.author || !formBook.isbn) {
      return toast.error("Title, Author and ISBN are required");
    }

    try {
      const res = await api.post("/api/library/book/add", {
        ...formBook,
        publishedYear: Number(formBook.publishedYear),
        totalCopies: Number(formBook.totalCopies),
      });

      if (res.data.success) {
        toast.success("Book added successfully");
        setFormBook({
          title: "",
          author: "",
          isbn: "",
          category: "Other",
          publisher: "",
          publishedYear: "",
          totalCopies: 1,
          availableCopies: 1,
          description: "",
          coverImage: "",
          shelfLocation: "",
        });
        setUploadCover(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add book");
    }
  };

  return (
    <div className="flex justify-center items-center h-full animate-in fade-in duration-700">
      <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl max-w-3xl w-full border border-white/10 robust-inset mt-5">
        <h2 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Initialize New Asset</h2>

        <form onSubmit={submitBook} className="grid grid-cols-2 gap-6">

          <input
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Asset Title"
            name="title"
            value={formBook.title}
            onChange={handleChange}
          />

          <input
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Creator / Author"
            name="author"
            value={formBook.author}
            onChange={handleChange}
          />

          <input
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="ISBN Identifier"
            name="isbn"
            value={formBook.isbn}
            onChange={handleChange}
          />

          {/* ✅ Category Dropdown */}
          <select
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-red-600 transition-all text-sm"
            name="category"
            value={formBook.category}
            onChange={handleChange}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat}
              </option>
            ))}
          </select>

          <input
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Publisher Identity"
            name="publisher"
            value={formBook.publisher}
            onChange={handleChange}
          />

          <input
            type="number"
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Publication Cycle (Year)"
            name="publishedYear"
            value={formBook.publishedYear}
            onChange={handleChange}
          />

          <input
            type="number"
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Total Units"
            name="totalCopies"
            value={formBook.totalCopies}
            onChange={handleChange}
          />

          <input
            type="number"
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm"
            placeholder="Available Units"
            name="availableCopies"
            value={formBook.availableCopies}
            onChange={handleChange}
          />

          <input
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm col-span-2"
            placeholder="Storage Coordinate (Shelf)"
            name="shelfLocation"
            value={formBook.shelfLocation}
            onChange={handleChange}
          />

          <textarea
            className="p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-all text-sm col-span-2"
            placeholder="Asset Description / Briefing"
            name="description"
            rows={3}
            value={formBook.description}
            onChange={handleChange}
          />

          {/* Cover Image Upload */}
          <div className="col-span-2">
            <label htmlFor="coverImage">
              <div className="h-16 bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-between px-6 rounded-xl cursor-pointer hover:bg-white/10 hover:border-red-500/50 transition-all group">
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-red-400">
                  {uploadCover?.name || "Upload Cover Schematic"}
                </span>
                {uploadCover && (
                  <button onClick={clearUploadedCover} className="text-red-600 hover:scale-125 transition-transform">
                    <IoClose size={20} />
                  </button>
                )}
              </div>
            </label>
            <input
              id="coverImage"
              type="file"
              className="hidden"
              onChange={handleUploadCover}
            />
          </div>

          <button
            type="submit"
            className="col-span-2 px-6 py-4 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all hover:scale-105"
          >
            Deploy Asset to Database
          </button>
        </form>
      </div>
    </div>
  );
}
