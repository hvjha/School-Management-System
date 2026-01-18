import React, { useState, useEffect } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import uploadFile from "../helper/UploadFile";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";

export default function ManageCourses({ onCourseUpdated }) {
  const [courses, setCourses] = useState([]);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [removingStudents, setRemovingStudents] = useState(false);

  /* ================= LOAD COURSES ================= */
  const loadCourses = async () => {
    try {
      const { data } = await api.get("/api/course/courses");
      setCourses(data.courses || data);
    } catch (err) {
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* ================= TRAINERS ================= */
  const getAllTrainers = () => {
    const trainerMap = {};
    courses.forEach((c) => {
      (c.trainers || []).forEach((t) => {
        trainerMap[t.trainerId] = t.name;
      });
    });
    return Object.entries(trainerMap).map(([id, name]) => ({
      trainerId: id,
      name,
    }));
  };

  /* ================= EDIT COURSE ================= */
  const startEditCourse = (c) => {
    setEditingCourse({
      id: c._id,
      courseId: c.courseId,
      name: c.name,
      price: c.price,
      course_img: c.course_img,
      trainers: (c.trainers || []).map((t) => ({
        trainerId: t.trainerId,
        name: t.name,
      })),
      students: (c.students || []).map((s) => ({
        _id: s._id,
        name: s.name,
        studentId: s.studentId,
      })),
    });
    setSelectedStudents([]);
  };

  const updateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/course/update-course/${editingCourse.id}`, {
        courseId: editingCourse.courseId,
        name: editingCourse.name,
        price: editingCourse.price,
        course_img: editingCourse.course_img,
        trainerIds: editingCourse.trainers.map((t) => t.trainerId),
      });
      toast.success("Course updated");
      setEditingCourse(null);
      loadCourses();
      onCourseUpdated?.();
    } catch (err) {
      toast.error("Error updating course");
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete course?")) return;
    try {
      await api.delete(`/api/course/delete-course/${id}`);
      toast.success("Course deleted");
      loadCourses();
    } catch (err) {
      toast.error("Error deleting course");
    }
  };

  /* ================= TRAINER HANDLING ================= */
  const removeTrainer = (trainerId) => {
    setEditingCourse({
      ...editingCourse,
      trainers: editingCourse.trainers.filter(
        (t) => t.trainerId !== trainerId
      ),
    });
  };

  const addTrainer = (trainerId) => {
    const trainerToAdd = getAllTrainers().find(
      (t) => t.trainerId === trainerId
    );
    if (!trainerToAdd) return;
    if (editingCourse.trainers.some((t) => t.trainerId === trainerId)) return;

    setEditingCourse({
      ...editingCourse,
      trainers: [...editingCourse.trainers, trainerToAdd],
    });
  };

  /* ================= REMOVE STUDENTS ================= */
  const removeSelectedStudents = async () => {
    if (!selectedStudents.length) return;
    if (!confirm("Remove selected students from this course?")) return;

    try {
      setRemovingStudents(true);

      for (const studentId of selectedStudents) {
        await api.put(
          `/api/course/${editingCourse.id}/remove-student`,
          { studentId }
        );
      }

      toast.success("Students removed successfully");

      // update local state
      setEditingCourse((prev) => ({
        ...prev,
        students: prev.students.filter(
          (s) => !selectedStudents.includes(s.studentId)
        ),
      }));

      setSelectedStudents([]);
      loadCourses();
      onCourseUpdated?.();
    } catch (err) {
      toast.error("Failed to remove students");
    } finally {
      setRemovingStudents(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="lg:mt-0 mt-35 pb-20 p-4">
      <h1 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red border-b-2 border-red-600 pb-4 inline-block w-full">
        Manage Courses
      </h1>
      
      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[75vh] p-2 mb-8">
        {!editingCourse && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-items-center">
            {courses.map((c) => (
              <div
                key={c._id}
                className="glass-card p-4 rounded-[2rem] border border-white/10 flex flex-col hover-lift hover-red-glow transition-all duration-300 w-[280px] h-[420px] robust-inset group relative overflow-hidden"
              >
                {/* Image */}
                <div className="h-40 bg-slate-900/50 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5 relative group-hover:border-red-600/30 transition-all">
                  {c.course_img ? (
                    <img
                      src={c.course_img}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={c.name}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                        <MdOutlinePhotoSizeSelectActual className="text-slate-600 group-hover:text-red-500 transition-colors" size={40} />
                        <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="mt-4 flex-1 flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-white uppercase italic leading-tight text-lg group-hover:text-red-500 transition-colors line-clamp-2">
                        {c.name}
                      </p>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                     <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course ID</span>
                        <span className="text-[10px] font-mono text-red-500 font-bold">{c.courseId}</span>
                    </div>

                    <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trainers</span>
                        <span className="text-[10px] font-black text-white">{c.trainers?.length || 0}</span>
                    </div>

                     <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
                        <span className="text-[10px] font-black text-white">{c.students?.length || 0}</span>
                    </div>
                    
                    <div className="text-right mt-2">
                         <span className="text-xl font-black text-green-400 text-shadow-glow">₹{c.price}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
                  <button
                    className="py-2 bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md"
                    onClick={() => startEditCourse(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
                    onClick={() => deleteCourse(c._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
             {courses.length === 0 && (
                <div className="col-span-full py-20 opacity-30 flex flex-col items-center">
                    <p className="text-4xl font-black text-white uppercase tracking-tighter italic">No Data</p>
                    <p className="text-sm font-bold text-slate-500 mt-2">No active courses found.</p>
                </div>
             )}
          </div>
        )}
      </div>

      {/* ================= EDIT FORM ================= */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-300">
             <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/10 robust-inset animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar relative">
                
                <h2 className="text-2xl font-black text-white mb-6 text-center uppercase italic tracking-tighter text-shadow-red sticky top-0 bg-[#0f172a]/95 py-2 z-20 backdrop-blur-xl border-b border-white/10">
                  Edit Course: <span className="text-red-500">{editingCourse.courseId}</span>
                </h2>

                {/* IMAGE */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="h-40 w-full bg-slate-900/50 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/10 group hover:border-red-500 transition-all relative">
                    {editingCourse.course_img ? (
                        <img
                        src={editingCourse.course_img}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                         <div className="flex flex-col items-center gap-2">
                             <MdOutlinePhotoSizeSelectActual className="text-slate-600" size={50} />
                             <span className="text-[10px] font-black uppercase text-slate-500">No Visual</span>
                        </div>
                    )}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <span className="text-white font-black uppercase text-xs">Update Image</span>
                     </div>
                     <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const uploaded = await uploadFile(file);
                            setEditingCourse({
                            ...editingCourse,
                            course_img: uploaded.secure_url,
                            });

                            toast.success("Image updated");
                        }}
                        />
                    </div>
                </div>

                <form onSubmit={updateCourse} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Course ID</label>
                            <input
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:border-red-600 outline-none"
                                value={editingCourse.courseId}
                                onChange={(e) =>
                                setEditingCourse({ ...editingCourse, courseId: e.target.value })
                                }
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Course Name</label>
                            <input
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:border-red-600 outline-none"
                                value={editingCourse.name}
                                onChange={(e) =>
                                setEditingCourse({ ...editingCourse, name: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Price</label>
                            <input
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:border-red-600 outline-none"
                                value={editingCourse.price}
                                onChange={(e) =>
                                setEditingCourse({ ...editingCourse, price: e.target.value })
                                }
                            />
                    </div>

                    {/* TRAINERS */}
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between items-center">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 block">Assign Trainers</label>
                             <select
                                className="bg-slate-900 border border-white/10 text-white text-[10px] font-bold uppercase rounded-lg px-2 py-1 outline-none focus:border-red-600"
                                onChange={(e) => addTrainer(e.target.value)}
                                value=""
                            >
                                <option value="" disabled>+ Add Trainer</option>
                                {getAllTrainers().map((t) => (
                                <option key={t.trainerId} value={t.trainerId}>
                                    {t.name}
                                </option>
                                ))}
                            </select>
                        </div>
                    
                        <div className="bg-black/20 rounded-xl p-2 min-h-[60px] flex flex-wrap gap-2">
                             {editingCourse.trainers.length === 0 && <span className="text-[10px] text-slate-600 italic p-2">No trainers assigned.</span>}
                             {editingCourse.trainers.map((t) => (
                                <div key={t.trainerId} className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-bold text-white uppercase">{t.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTrainer(t.trainerId)}
                                        className="text-red-500 hover:text-white transition-colors text-xs font-bold"
                                    >✕</button>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* STUDENTS */}
                    <div className="mt-6 space-y-2">
                         <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 border-t border-white/10 pt-4">Enrolled Students</h3>

                        {editingCourse.students.length > 0 ? (
                            <div className="bg-black/20 rounded-xl p-4">
                                <select
                                    multiple
                                    className="w-full bg-transparent text-slate-300 text-xs font-mono p-2 border-none outline-none focus:ring-0 h-32 no-scrollbar"
                                    value={selectedStudents}
                                    onChange={(e) =>
                                    setSelectedStudents(
                                        Array.from(
                                        e.target.selectedOptions,
                                        (o) => o.value
                                        )
                                    )
                                    }
                                >
                                    {editingCourse.students.map((s) => (
                                    <option key={s._id} value={s.studentId} className="p-1 hover:bg-white/10 rounded cursor-pointer">
                                        • {s.name} [{s.studentId}]
                                    </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={removeSelectedStudents}
                                    disabled={removingStudents || selectedStudents.length === 0}
                                    className={`w-full mt-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStudents.length > 0 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/5 text-slate-600 cursor-not-allowed'}`}
                                >
                                    {removingStudents ? "Removing..." : "Remove Selected"}
                                </button>
                            </div>
                        ) : (
                           <div className="bg-black/20 rounded-xl p-4 text-center">
                                <p className="text-[10px] text-slate-600 italic">No students enrolled.</p>
                           </div>
                        )}
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button className="flex-1 py-4 bg-green-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditingCourse(null)}
                            className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
}
