import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../api/api";
import { IoClose } from "react-icons/io5";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaQuestionCircle, FaArrowRight, FaCamera } from "react-icons/fa";
import uploadFile from "../helper/UploadFile";

export default function Auth() {
  const { login, register } = useContext(AuthContext);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({});
  const [uploadPhoto, setUploadPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [question, setQuestion] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const uploaded = await uploadFile(file);
    setLoading(false);

    setUploadPhoto(file);
    setForm((prev) => ({
      ...prev,
      profile_pic: uploaded?.secure_url,
    }));
  };

  const clearUploadedPhoto = (e) => {
    e.preventDefault();
    setUploadPhoto(null);
    setForm((prev) => ({ ...prev, profile_pic: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "register") {
      const phoneDigits = form.phone?.replace(/\D/g, "").trim();
      if (!phoneDigits || phoneDigits.length !== 10) {
        setLoading(false);
        return toast.error("Phone number must be exactly 10 digits");
      }
      form.phone = phoneDigits; 
    }

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          profile_pic: form.profile_pic || "",
          phone: form.phone,
          role: "student",
          securityQuestion: form.securityQuestion || "DOB?",
          securityAnswer: form.securityAnswer || "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };
  
  const askQuestion = async () => {
    if (!form.email) return toast.error("Enter email first");
    try {
      const res = await api.post("/api/forgot-password/question", { email: form.email });
      setQuestion(res.data.securityQuestion);
      setShowForgot(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching question");
    }
  };

  const verifyAnswer = async () => {
    try {
      const res = await api.post("/api/forgot-password/verify", {
        email: form.email,
        securityAnswer: form.securityAnswer,
      });
      setResetToken(res.data.resetToken);
      toast.success("Answer verified — set new password");
    } catch (err) {
      toast.error("Wrong answer");
    }
  };

  const reset = async () => {
    try {
      await api.post("/api/forgot-password/reset", { resetToken, newPassword });
      toast.success("Password reset successful");
      setShowForgot(false);
    } catch (err) {
      toast.error("Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24 pb-12 overflow-hidden relative">
      {/* Background Accents - adjusted for red theme */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl -mr-80 -mt-80 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl -ml-80 -mb-80 opacity-20"></div>

      <div className="max-w-5xl w-full glass-card rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden grid lg:grid-cols-2 relative z-10 transition-all duration-500">
        
        {/* Left Side: Form */}
        <div className="p-8 lg:p-12 space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {mode === "login" ? "Enter your credentials to continue your journey." : "Join our elite community of tech learners and mentors."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    name="name"
                    required
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
                  />
                </div>
                
                <div className="relative group">
                  <label htmlFor="profile_pic" className="block cursor-pointer">
                    <div className="flex items-center gap-3 w-full pl-4 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl group hover:border-red-600/30 transition-all">
                      <FaCamera className="text-slate-400" />
                      <span className="text-slate-400 text-sm font-medium truncate">
                        {uploadPhoto?.name || "Profile Photo"}
                      </span>
                      {uploadPhoto && (
                        <button onClick={clearUploadedPhoto} className="ml-auto text-red-500 p-1 hover:bg-red-500/10 rounded-lg transition-colors">
                          <IoClose />
                        </button>
                      )}
                    </div>
                  </label>
                  <input id="profile_pic" type="file" className="hidden" onChange={handleUploadPhoto} />
                </div>

                <div className="relative group">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    name="phone"
                    required
                    maxLength={10}
                    onChange={handleChange}
                    onInput={(e) => (e.target.value = e.target.value.replace(/\D/g, ""))}
                    placeholder="Phone Number"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="relative group">
                  <FaQuestionCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                  <input
                    name="securityQuestion"
                    required
                    onChange={handleChange}
                    placeholder="Security Question (e.g. DOB?)"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
                  />
                </div>
                
                <div className="relative group md:col-span-2">
                  <input
                    name="securityAnswer"
                    required
                    onChange={handleChange}
                    placeholder="Security Answer"
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
              />
            </div>

            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              <input
                name="password"
                type="password"
                required
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:bg-white/10 transition-all font-medium text-sm text-white placeholder:text-slate-500"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 group border-0 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <style jsx>{`
            button:active {
                transform: scale(0.98);
            }
            `}</style>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm font-black text-slate-500 hover:text-red-500 transition-colors cursor-pointer uppercase tracking-tighter"
              >
                {mode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
          </form>

          {/* Forgot Password Flow */}
          <div className="pt-6 border-t border-white/5">
             {!showForgot ? (
                <button onClick={askQuestion} className="text-xs font-black text-slate-500 hover:text-red-500 transition-colors cursor-pointer uppercase tracking-widest">
                  Forgot your password?
                </button>
             ) : (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                   <div className="p-4 bg-white/5 rounded-2xl text-[13px] border border-white/5">
                      <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] block mb-1">Security Question</span>
                      <p className="text-white font-bold">{question}</p>
                   </div>
                   <input
                     name="securityAnswer"
                     onChange={handleChange}
                     placeholder="Your Answer"
                     className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none text-white text-sm transition-all focus:bg-white/10"
                   />
                   <div className="flex gap-2">
                     <button onClick={verifyAnswer} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all cursor-pointer">Verify</button>
                     <button onClick={() => setShowForgot(false)} className="px-5 py-2.5 text-slate-400 text-xs font-bold hover:text-white cursor-pointer">Cancel</button>
                   </div>

                   {resetToken && (
                      <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in duration-500">
                         <input
                           type="password"
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           placeholder="New Password"
                           className="w-full px-5 py-3 bg-white/5 border border-red-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/20 text-white text-sm transition-all"
                         />
                         <button onClick={reset} className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-red-500/20 cursor-pointer">Reset Password</button>
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>

        {/* Right Side: Decorative Panel */}
        <div className="hidden lg:block relative bg-[#0f172a] group">
          <img 
            src="/hero_bg.png" 
            alt="Welcome" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-[20s] linear"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-transparent to-[#0f172a]"></div>
          
          <div className="relative h-full flex flex-col justify-end p-12 text-white space-y-6">
            <div className="space-y-2">
              <h3 className="text-4xl font-black leading-tight text-shadow-red">Elevate Every Aspect of Your Technology <span className="text-red-500">Education</span>.</h3>
              <p className="text-slate-400 text-lg font-medium">Join us and access world-class resources, expert trainers, and a thriving student community.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
               <div className="space-y-1">
                  <p className="text-2xl font-black text-red-500">50+</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Industry Courses</p>
               </div>
               <div className="space-y-1">
                  <p className="text-2xl font-black text-red-500">24/7</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">System Support</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
