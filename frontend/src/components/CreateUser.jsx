import React, { useState } from "react";
import api from "../api/api";
import { toast } from "react-toastify";
import uploadFile from "../helper/UploadFile";
import { IoClose } from "react-icons/io5";

export default function CreateUser() {
  const [formUser, setFormUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    phone: "",
    profile_pic: "",
    securityQuestion: "",
    securityAnswer: "",
    experience: "", // only for trainer
    company: "",    // only for trainer
  });

  const [uploadPhoto, setUploadPhoto] = useState(null);

  // Handle Text Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({ ...prev, [name]: value }));
  };

  // Upload Profile Photo
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploaded = await uploadFile(file);

    setUploadPhoto(file);

    setFormUser((prev) => ({
      ...prev,
      profile_pic: uploaded?.secure_url,
    }));
  };

  const clearUploadedPhoto = (e) => {
    e.preventDefault();
    setUploadPhoto(null);
    setFormUser((prev) => ({ ...prev, profile_pic: "" }));
  };

  // Create User
  const createUser = async (e) => {
    e.preventDefault();

    // Validate phone (10 digits only)
    const phoneDigits = formUser.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return toast.error("Phone number must be 10 digits");
    }

    try {
      const res = await api.post("/api/admin/create-user", {
        ...formUser,
        phone: phoneDigits,
      });

      if (res.data.success) {
        toast.success("User created successfully");

        // Reset form
        setFormUser({
          name: "",
          email: "",
          password: "",
          role: "student",
          phone: "",
          profile_pic: "",
          securityQuestion: "",
          securityAnswer: "",
          experience: "",
          company: "",
        });
        setUploadPhoto(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="flex justify-center items-center h-full p-4 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-3xl border border-white/10 robust-inset relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-900"></div>

        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red">
          New Unit Enrollment
        </h2>

        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

          {/* Name */}
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Appellation</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Full Name"
              name="name"
              value={formUser.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Comms Address</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Email Address"
              name="email"
              value={formUser.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Access Key</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Password"
              name="password"
              type="password"
              value={formUser.password}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Access Level</label>
             <select
              className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10 appearance-none uppercase"
              name="role"
              value={formUser.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="superadmin">General (Super Admin)</option>
            </select>
          </div>

          {/* Phone */}
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Secure Line</label>
             <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="10-digit Number"
              name="phone"
              maxLength={10}
              value={formUser.phone}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
                handleChange(e);
              }}
            />
          </div>

          {/* Conditional: Experience & Company for Trainer */}
          {formUser.role === "trainer" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Field Exp.</label>
                <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
                  placeholder="Years Active"
                  name="experience"
                  value={formUser.experience}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Allegiance</label>
                 <input
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
                  placeholder="Company / Org"
                  name="company"
                  value={formUser.company}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Profile Photo Upload */}
          <div className="col-span-1 md:col-span-2 space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Visual Identification</label>
            <label htmlFor="profile_pic" className="block group cursor-pointer">
              <div className={`h-20 bg-white/5 flex items-center justify-between px-6 rounded-2xl border border-white/10 group-hover:border-red-600/50 transition-all ${uploadPhoto ? 'border-red-600 bg-red-600/5' : ''}`}>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase italic flex items-center gap-2">
                  {uploadPhoto?.name ? (
                     <>
                      <span className="text-red-500">✓</span> {uploadPhoto.name}
                     </>
                  ) : "Upload Profile Photo"}
                </span>
                {uploadPhoto?.name ? (
                  <button
                    onClick={clearUploadedPhoto}
                    className="text-white bg-red-600 p-1 rounded-full hover:bg-red-700 transition-all shadow-lg"
                  >
                    <IoClose />
                  </button>
                ) : (
                   <span className="text-2xl text-slate-500 group-hover:text-red-500 transition-colors">+</span>
                )}
              </div>
            </label>
            <input
              id="profile_pic"
              type="file"
              className="hidden"
              onChange={handleUploadPhoto}
            />
          </div>

          <div className="col-span-1 md:col-span-2 border-t border-white/10 my-2"></div>

          {/* Security Question */}
           <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Student/Password</label>
            <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Security Question"
              name="securityQuestion"
              value={formUser.securityQuestion}
              onChange={handleChange}
            />
          </div>

          {/* Security Answer */}
           <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Clearance Code</label>
            <input
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
              placeholder="Security Answer"
              name="securityAnswer"
              value={formUser.securityAnswer}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            className="col-span-1 md:col-span-2 mt-4 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all border border-red-500/30"
            type="submit"
          >
            Authorize Personnel
          </button>
        </form>
      </div>
    </div>
  );
}


