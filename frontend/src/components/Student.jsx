import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [trainers, setTrainers] = useState([]);

  // Load students from API
  const loadStudents = async () => {
    try {
      const { data } = await api.get("/api/admin/user-details");
      setStudents(data?.users?.students || []);
    } catch (err) {
      toast.error("Failed to fetch students");
      console.error(err);
    }
  };

  // Load trainers from API
  const loadTrainers = async () => {
    try {
      const { data } = await api.get("/api/admin/get-all-trainers");
      setTrainers(data.trainers || []);
    } catch (err) {
      toast.error("Failed to fetch trainers");
      console.error(err);
    }
  };

  useEffect(() => {
    loadStudents();
    loadTrainers();
  }, []);

  // Delete student
  const deleteStudent = async (id) => {
    if (!window.confirm("Delete student permanently?")) return;
    try {
      await api.delete(`/api/admin/delete/${id}`);
      toast.success("Student deleted");
      await loadStudents();
    } catch (err) {
      toast.error("Failed to delete student");
      console.error(err);
    }
  };

  // Remove course from student
  const removeCourseFromStudent = async (studentId, courseId) => {
    if (!window.confirm("Remove student from this course?")) return;

    try {
      await api.put(`/api/course/remove-course-from-student`, {
        studentId,
        courseId,
      });

      toast.success("Course removed from student");

      // Optimistic update in edit modal
      if (editingStudent?.studentId === studentId) {
        setEditingStudent((prev) => ({
          ...prev,
          enrolledCourses: prev.enrolledCourses.filter((c) => c.courseId !== courseId),
        }));
      }

      await loadStudents();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to remove course");
    }
  };

  // Update student info and assign trainers
  const updateStudent = async (e) => {
    e.preventDefault();

    try {
      // Update basic info
      await api.post(`/api/admin/update-user/${editingStudent._id}`, {
        name: editingStudent.name,
        email: editingStudent.email,
        phone:editingStudent.phone
      });

      // Assign trainers for courses that have trainerIdToAssign
      await Promise.all(
        (editingStudent.enrolledCourses || [])
          .filter((c) => c.trainerIdToAssign)
          .map((c) =>
            api.put("/api/course/assign-trainer", {
              courseId: c.courseId,
              trainerId: c.trainerIdToAssign,
            })
          )
      );

      toast.success("Student updated successfully");
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update student");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(JSON.parse(JSON.stringify(student))); 
  };

  return (
    <div className="p-6 h-screen no-scrollbar overflow-y-auto">
      {editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-white mb-6 uppercase italic text-shadow-red border-l-4 border-red-600 pl-4">
              Edit Student
            </h2>
            <form onSubmit={updateStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Name</label>
                <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                  value={editingStudent.name || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  placeholder="Name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email</label>
                <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                  value={editingStudent.email || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Phone</label>
                <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                  value={editingStudent.phone || ""}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, phone: e.target.value })
                  }
                  placeholder="Phone"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Enrolled Courses</h3>
                <div className="max-h-[30vh] overflow-y-auto no-scrollbar space-y-3 p-1">
                  {editingStudent.enrolledCourses?.map((c, idx) => (
                    <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-red-600/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-black text-white uppercase italic">{c.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{c.courseId}</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-slate-400">
                          Trainer: <span className="text-red-500 font-black">{c.trainer ? c.trainer.name : "Not Assigned"}</span>
                        </p>

                        {!c.trainer && (
                          <select
                            className="w-full p-3 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:border-red-600"
                            value={c.trainerIdToAssign || ""}
                            onChange={(e) => {
                              const updated = [...editingStudent.enrolledCourses];
                              updated[idx].trainerIdToAssign = e.target.value;
                              const name =
                                trainers.find((t) => t.trainerId === e.target.value)?.name ||
                                "";
                              if (name) updated[idx].trainer = {
                                name,
                                trainerId: e.target.value,
                              };
                              setEditingStudent({ ...editingStudent, enrolledCourses: updated });
                            }}
                          >
                            <option value="">Assign Trainer</option>
                            {trainers.map((t) => (
                              <option key={t._id} value={t.trainerId}>
                                {t.name} ({t.trainerId})
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeCourseFromStudent(editingStudent.studentId, c.courseId)
                          }
                          className="w-max px-3 py-1 bg-red-600/10 text-red-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all">
                  Update
                </button>
                <button
                  type="button"
                  className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar lg:max-h-[85vh] flex flex-wrap gap-8 justify-center p-4">
        {!editingStudent &&
          (students.length > 0 ? (
            students.map((s) => (
              <div
                key={s._id}
                className="glass-card p-8 rounded-[3rem] border border-white/10 hover-lift hover-red-glow transition-all duration-700 flex flex-col justify-between w-[400px] h-min-[500px] robust-inset group"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors tracking-tight text-shadow-red">{s.name}</h2>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">ID: {s.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-bold bg-white/5 p-3 rounded-2xl border border-white/5">
                          <span className="text-red-500 text-shadow-red">@</span> {s.email}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs font-bold bg-white/5 p-3 rounded-2xl border border-white/5">
                          <span className="text-red-500 text-shadow-red">#</span> {s.phone || "N/A"}
                      </div>
                  </div>

                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-l-2 border-red-600 pl-2">Enrolled Courses</h3>
                  <div className="h-[20vh] overflow-y-auto no-scrollbar space-y-3">
                    {s.enrolledCourses?.length > 0 ? (
                      s.enrolledCourses.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex flex-col gap-1 group-hover:bg-red-600/5 transition-all"
                        >
                            <p className="text-sm font-black text-white leading-tight uppercase italic">{c.name}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-bold text-slate-500">{c.courseId}</span>
                                <span className="text-[9px] font-black text-red-500 uppercase">{c.trainer?.name || "No Trainer"}</span>
                            </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 italic font-bold">No courses enrolled.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={() => handleEdit(s)}
                    className="flex-1 py-3 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/10 hover:bg-red-600 hover:border-red-500 transition-all font-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStudent(s._id)}
                    className="flex-1 py-3 bg-slate-900/50 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 opacity-20 flex flex-col items-center">
                <p className="text-4xl font-black text-white uppercase tracking-tighter italic">No Data</p>
                <p className="text-sm font-bold text-slate-500 mt-2">No students found.</p>
            </div>
          ))}
      </div>
    </div>
  );
}
