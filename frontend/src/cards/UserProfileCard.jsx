import React from "react";
import { RxAvatar } from "react-icons/rx";
import uploadFile from "../helper/UploadFile";

export default function UserProfileCard({
  user,
  editMode,
  updatedUser,
  setUpdatedUser,
  handleUpdate,
  setEditMode,
  courses = [],
}) {
  if (!user) return null;
  const isTrainer = user.role === "trainer";
  const isStudent = user.role === "student";

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    const uploaded = await uploadFile(file);
    setUpdatedUser({ ...updatedUser, profile_pic: uploaded?.secure_url });
  };

  return (
    <div className="flex flex-col items-center glass-card-light rounded-[2.5rem] p-8 w-80 text-left border border-white/10 robust-inset">
      {/* IMAGE / AVATAR */}
      <div className="flex justify-center w-36 h-36 rounded-full bg-slate-900/50 border-4 border-red-600 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-red-600/10 animate-pulse"></div>
        {updatedUser?.profile_pic || user?.profile_pic ? (
          <img
            src={updatedUser?.profile_pic || user?.profile_pic}
            alt="Profile"
            className="w-full h-full object-cover relative z-10"
          />
        ) : (
          <RxAvatar size={144} className="text-white relative z-10" />
        )}
      </div>

      {/* EDIT MODE */}
      {editMode ? (
        <div className="flex flex-col gap-2 w-full mt-3">
          {/* Upload Photo */}
          <label className="text-indigo-600 font-medium cursor-pointer text-sm">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e.target.files[0])}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={updatedUser.name}
            onChange={(e) =>
              setUpdatedUser({ ...updatedUser, name: e.target.value })
            }
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs focus:border-red-600 focus:outline-none placeholder:text-slate-500 mb-2"
            placeholder="Name"
          />

          <input
            type="email"
            value={updatedUser.email}
            onChange={(e) =>
              setUpdatedUser({ ...updatedUser, email: e.target.value })
            }
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs focus:border-red-600 focus:outline-none placeholder:text-slate-500 mb-2"
            placeholder="Email"
          />

          <input
            disabled
            type="text"
            value={
              isTrainer
                ? updatedUser.trainerId || user.trainerId
                : updatedUser.studentId || user.studentId
            }
            className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-500 font-bold text-xs mb-2 cursor-not-allowed"
            placeholder="Student ID"
          />

          {/* Phone input — digits only */}
          <input
            type="text"
            value={String(updatedUser.phone || "")}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setUpdatedUser({ ...updatedUser, phone: digits });
            }}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs focus:border-red-600 focus:outline-none placeholder:text-slate-500 mb-4"
            placeholder="Phone"
            maxLength={10}
          />

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all border border-red-500/20"
            >
              Save Data
            </button>

            <button
              onClick={() => {
                setEditMode(false);
                setUpdatedUser(user);
              }}
              className="flex-1 bg-white/5 text-slate-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Abort
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL VIEW */
        <div className="flex flex-col gap-4 mt-8 w-full">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Full Name</p>
            <p className="text-lg font-black text-white text-shadow-red">{user.name}</p>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Email Address</p>
            <p className="text-md font-bold text-white/90 truncate">{user.email}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Contact</p>
              <p className="text-sm font-bold text-white">{user.phone || "N/A"}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Identifier</p>
              <p className="text-sm font-black text-white">{isTrainer ? user.trainerId : user.studentId}</p>
            </div>
          </div>

          {/* TRAINER EXTRA INFO */}
          {isTrainer && (
            <>
              <p>
                <strong>Total Courses Taught:</strong> {courses.length}
              </p>
              <p>
                <strong>Experience:</strong> {user.experience || "N/A"}
              </p>
              <p>
                <strong>Company:</strong> {user.company || "N/A"}
              </p>
              <p>
                <strong>Total Students Taught:</strong>{" "}
                {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
              </p>

              <div className="mt-2">
                <strong>Courses:</strong>
                <ul className="list-disc list-inside mt-1 text-left mx-auto w-max">
                  {courses.map((c) => (
                    <li key={c._id}>
                      {c.name} ({c.courseId})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {isStudent && (
          <button
            onClick={() => setEditMode(true)}
            className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/20"
          >
            Update Protocol
          </button>
          )}
        </div>
      )}
    </div>
  );
}
