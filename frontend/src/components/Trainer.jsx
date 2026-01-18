import React, { useEffect, useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import uploadFile from "../helper/UploadFile";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTrainers, setTotalTrainers] = useState(0);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [page, setPage] = useState(1);

  const trainersPerPage = 5;

  // ------------------ LOAD TRAINERS ------------------
  const loadTrainers = async () => {
    try {
      const { data } = await api.get("/api/admin/user-details");

      setTrainers(data?.users?.trainers || []);
      setTotalStudents(data?.totalStudents || 0);
      setTotalTrainers(data?.totalTrainers || 0);
    } catch (err) {
      toast.error("Failed to load trainers");
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  // ------------------ DELETE TRAINER ------------------
  const deleteTrainer = async (id) => {
    if (!window.confirm("Delete trainer permanently?")) return;

    try {
      await api.delete(`/api/admin/delete/${id}`);
      toast.success("Trainer deleted");
      loadTrainers();
    } catch (err) {
      toast.error("Failed to delete trainer");
    }
  };

  // ------------------ REMOVE TRAINER FROM A COURSE ------------------
  const removeCourseFromTrainer = async (trainerId, courseId) => {
    if (!window.confirm("Remove trainer from this course?")) return;

    try {
      await api.put(`/api/course/remove-trainer-from-course`, {
        trainerId,
        courseId,
      });

      toast.success("Trainer removed from course");
      loadTrainers();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to remove trainer from course"
      );
    }
  };

  // ------------------ UPDATE TRAINER ------------------
   const updateTrainer = async (e) => {
    e.preventDefault();

    if (!editingTrainer.name || !editingTrainer.email) {
      return toast.error("Name & Email required");
    }

    if (String(editingTrainer.phone).length !== 10) {
      return toast.error("Phone must be 10 digits");
    }

    try {
     await api.post(`/api/admin/update-user/${editingTrainer._id}`, {
    name: editingTrainer.name,
    email: editingTrainer.email,
    phone: editingTrainer.phone,
    experience: editingTrainer.experience,
    company: editingTrainer.company,
    profile_pic:editingTrainer.profile_pic
});


      toast.success("Trainer updated");
      setEditingTrainer(null);
      await loadTrainers();
    } catch (err) {
      toast.error("Failed to update trainer");
    }
  };
  // ------------------ PROFILE PHOTO UPLOAD ------------------

  // ------------------ PAGINATION ------------------
  const start = (page - 1) * trainersPerPage;
  const paginatedTrainers = trainers.slice(start, start + trainersPerPage);

  return (
    <div className="lg:mt-0 mt-35 p-6 space-y-8 h-screen no-scrollbar overflow-y-auto">

      {/* -------------------------------- Overview Cards ------------------------------ */}
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start mb-6">

        <div className="flex flex-row lg:flex-col gap-6 w-full lg:w-auto justify-center">
          <div className="glass-card p-8 rounded-[2.5rem] w-full lg:w-[220px] text-center border-b-4 border-red-600 robust-inset shadow-xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Total Trainers</h2>
            <p className="text-4xl font-black text-white">{totalTrainers}</p>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] w-full lg:w-[220px] text-center border-b-4 border-red-900 robust-inset shadow-xl">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Total Students</h2>
            <p className="text-4xl font-black text-white">{totalStudents}</p>
          </div>
        </div>

        {/* Students Per Trainer */}
        <div className="glass-card rounded-[2.5rem] p-8 w-full max-w-2xl overflow-hidden border border-white/10 robust-inset shadow-2xl transition-all hover:border-red-600/30">
          <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-6 text-shadow-red italic border-l-4 border-red-600 pl-4">
            Trainer Statistics
          </h2>

          <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <th className="p-4 rounded-l-xl">Trainer</th>
                    <th className="p-4 rounded-r-xl">Students Assigned</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {paginatedTrainers.map((t) => (
                    <tr key={t._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-white font-black text-sm group-hover:text-red-500 transition-colors uppercase italic">{t.name}</td>
                      <td className="p-4">
                        <span className="bg-red-600/20 text-red-500 px-3 py-1 rounded-full text-xs font-black">
                          {t.teachingCourses?.reduce(
                            (acc, c) => acc + (c.students?.length || 0),
                            0
                          )} STUDENTS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

          {/* Pagination */}
          <div className="flex gap-4 justify-end mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                page === 1 ? "bg-white/5 text-slate-600 opacity-20 border border-white/5" : "bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
              }`}
            >
              Back
            </button>

            <button
              disabled={start + trainersPerPage >= trainers.length}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                start + trainersPerPage >= trainers.length
                  ? "bg-white/5 text-slate-600 opacity-20 border border-white/5"
                  : "bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
              }`}
            >
              Advance
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------- Trainers Full Table ------------------------- */}
      <div className="glass-card rounded-[2.5rem] p-8 overflow-hidden border border-white/10 robust-inset shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">

        <h1 className="text-3xl font-black text-white mb-8 text-center text-shadow-red uppercase italic tracking-tight">Active Trainers</h1>

        <div className="overflow-x-auto no-scrollbar max-h-[45vh]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0f172a] z-10">
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Trainer</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ID</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Course Name</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Course ID</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Students</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {trainers.map((trainer) =>
                  trainer.teachingCourses.length > 0 ? (
                    trainer.teachingCourses.map((course, idx) => (
                      <tr key={`${trainer._id}-${idx}`} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                            <div className="text-white font-black text-sm group-hover:text-red-500 transition-colors uppercase italic">{trainer.name}</div>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-500">{trainer.trainerId}</td>
                        <td className="p-4 text-white font-bold text-xs uppercase">{course.name}</td>
                        <td className="p-4 font-mono text-[10px] text-red-900/40 uppercase">{course.courseId}</td>
                        <td className="p-4 text-center">
                          <span className="bg-red-600/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black">
                            {course.students?.length || 0} STUDENTS
                          </span>
                        </td>

                        <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                                <button
                                    className="px-3 py-1 bg-white/5 text-white rounded-lg text-[9px] font-black uppercase border border-white/5 hover:bg-red-600 transition-all"
                                    onClick={() => setEditingTrainer(trainer)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="px-3 py-1 bg-slate-900 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                                    onClick={() => deleteTrainer(trainer._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={trainer._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                         <div className="text-white font-black text-sm uppercase italic">{trainer.name}</div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">{trainer.trainerId}</td>

                      <td className="p-4" colSpan={3}>
                        <span className="text-slate-700 italic font-black uppercase text-[10px]">No courses assigned</span>
                      </td>

                      <td className="p-4 text-center">
                         <div className="flex gap-2 justify-center">
                            <button
                              className="px-3 py-1 bg-white/5 text-white rounded-lg text-[9px] font-black uppercase border border-white/5 hover:bg-red-600 transition-all"
                              onClick={() => setEditingTrainer(trainer)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1 bg-slate-900 text-slate-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                              onClick={() => deleteTrainer(trainer._id)}
                            >
                              Delete
                            </button>
                         </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* ------------------------------------ EDIT MODAL -------------------------------- */}
      {editingTrainer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-in fade-in duration-300">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-lg max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">

            <h2 className="text-2xl font-black text-white mb-8 text-center uppercase italic text-shadow-red border-b-2 border-red-600 pb-4 inline-block w-full">
              Edit Trainer Profile
            </h2>

            {/* Profile Pic */}
            <div className="flex flex-col items-center mb-8">
               <div className="relative group cursor-pointer">
                 <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                 <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-red-600 transition-all duration-300 shadow-xl">
                    {editingTrainer.profile_pic ? (
                      <img
                        src={editingTrainer.profile_pic}
                        alt={editingTrainer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-3xl font-black uppercase">
                        {editingTrainer.name?.charAt(0)}
                      </div>
                    )}
                 </div>
                 <div className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-[#0f172a]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                 </div>
                 <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const uploaded = await uploadFile(file);
                      setEditingTrainer({
                        ...editingTrainer,
                        profile_pic: uploaded?.secure_url,
                      });
                      toast.success("Profile picture updated");
                    }}
                  />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">Tap to Upload Photo</p>
            </div>

            {/* Form */}
            <form onSubmit={updateTrainer} className="space-y-5">

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Name</label>
                 <input
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                    placeholder="Name"
                    value={editingTrainer.name}
                    onChange={(e) =>
                      setEditingTrainer({ ...editingTrainer, name: e.target.value })
                    }
                  />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email</label>
                 <input
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                    placeholder="Email"
                    value={editingTrainer.email}
                    onChange={(e) =>
                      setEditingTrainer({ ...editingTrainer, email: e.target.value })
                    }
                  />
              </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Phone</label>
                 <input
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none"
                    placeholder="Phone"
                    value={editingTrainer.phone}
                    onChange={(e) =>
                      setEditingTrainer({ ...editingTrainer, phone: e.target.value })
                    }
                  />
              </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
              <button
                type="submit"
                className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all hover:scale-[1.02]"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditingTrainer(null)}
                className="flex-1 py-4 bg-white/5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-white/5 hover:bg-white/10 hover:text-white transition-all"
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
