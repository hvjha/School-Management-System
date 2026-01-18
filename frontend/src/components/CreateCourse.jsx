
import { useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import uploadFile from "../helper/UploadFile";
import { IoClose } from "react-icons/io5";

export default function CreateCourse({ trainers, onCourseCreated }) {
  const [formCourse, setFormCourse] = useState({ trainers: [] });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploadPhoto, setUploadPhoto] = useState(null);

  // Upload Course Thumbnail
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploaded = await uploadFile(file);

    setUploadPhoto(file);

    setFormCourse((prev) => ({
      ...prev,
      course_img: uploaded?.secure_url,
    }));
  };

  // Clear uploaded image
  const clearUploadedPhoto = (e) => {
    e.preventDefault();
    setUploadPhoto(null);
    setFormCourse((prev) => ({ ...prev, course_img: "" }));
  };

  // Submit Course
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/course/course-create", {
        courseId: formCourse.courseId,
        name: formCourse.name,
        price: Number(formCourse.price),
        trainerIds: formCourse.trainers,
        course_img: formCourse.course_img || "", 
      });

      toast.success("Course created");

      // reset form
      setFormCourse({ trainers: [] });
      setUploadPhoto(null);

      if (onCourseCreated) onCourseCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error creating course");
    }
  };

  // Trainer Selection Handler
  const handleTrainerSelect = (trainerId) => {
    if (formCourse.trainers.includes(trainerId)) {
      setFormCourse({
        ...formCourse,
        trainers: formCourse.trainers.filter((id) => id !== trainerId),
      });
    } else {
      setFormCourse({
        ...formCourse,
        trainers: [...formCourse.trainers, trainerId],
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-3xl border border-white/10 robust-inset relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mb-10 -ml-10"></div>

        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red relative z-10">
          Create New Course
        </h2>

        <form onSubmit={createCourse} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Course ID</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="e.g. DSA-101"
              value={formCourse.courseId || ""}
              onChange={(e) =>
                setFormCourse({ ...formCourse, courseId: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Course Name</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Course Name"
              value={formCourse.name || ""}
              onChange={(e) =>
                setFormCourse({ ...formCourse, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Price</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Price"
              value={formCourse.price || ""}
              onChange={(e) =>
                setFormCourse({ ...formCourse, price: e.target.value })
              }
            />
          </div>

          {/* Course Image Upload */}
          <div className="col-span-1 md:col-span-2 space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mission Thumbnail</label>
            <label htmlFor="course_img" className="block cursor-pointer group">
              <div className={`h-24 bg-white/5 flex items-center justify-between px-6 rounded-2xl border border-white/10 group-hover:border-red-600/50 transition-all ${uploadPhoto ? 'border-red-600 bg-red-600/5' : ''}`}>
                 <div className="flex items-center gap-4">
                    {uploadPhoto ? (
                        <div className="w-16 h-16 rounded-xl bg-cover bg-center shadow-lg border border-red-500/30" style={{ backgroundImage: `url(${formCourse.course_img})` }}></div>
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                            <span className="text-2xl text-slate-600 group-hover:text-red-500 transition-colors">IMG</span>
                        </div>
                    )}
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase italic">
                      {uploadPhoto?.name || "Upload Visual Asset"}
                    </span>
                 </div>

                {uploadPhoto?.name && (
                  <button onClick={clearUploadedPhoto} className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition-all shadow-lg">
                    <IoClose />
                  </button>
                )}
              </div>
            </label>

            <input
              id="course_img"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadPhoto}
            />
          </div>

          {/* Dropdown for Trainers */}
          <div className="relative col-span-1 md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Assigned Commanders</label>
            <div
              className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex justify-between items-center">
                  <span className={`font-bold ${formCourse.trainers.length > 0 ? 'text-white' : 'text-slate-500'}`}>
                    {formCourse.trainers.length > 0
                        ? `${formCourse.trainers.length} Commanders Selected`
                        : "Select Personnel"}
                  </span>
                  <span className="text-slate-500 group-hover:text-red-500 transition-colors">▼</span>
              </div>
            </div>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-50 p-3 no-scrollbar glass-card">
                {trainers?.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={formCourse.trainers.includes(t.trainerId)}
                      onChange={() => handleTrainerSelect(t.trainerId)}
                      className="accent-red-600 w-5 h-5 rounded hover:accent-red-500"
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase italic">{t.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{t.trainerId}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button className="col-span-1 md:col-span-2 mt-4 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all border border-red-500/30">
            Create Course
          </button>
        </form>
      </div>
    </div>
  );
}
