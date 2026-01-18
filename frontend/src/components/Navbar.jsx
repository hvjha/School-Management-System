import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaGraduationCap, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRoleClick = () => {
    if (!user) return;
    if (user.role === "superadmin") navigate("/admin");
    else if (user.role === "trainer") navigate("/trainer");
    else if (user.role === "student") navigate("/student");
  };


  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-8 py-4 flex items-center justify-between glass-nav shadow-lg ${
      scrolled ? "py-3" : ""
    }`}>
      <div className="flex items-center gap-8">
        {/* Brand/Logo */}
        <div 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <FaGraduationCap size={22} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            EDU<span className="text-blue-500">HUB</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => navigate("/about")}
            className="text-sm font-bold transition-colors text-white/70 hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => navigate("/courses")}
            className="text-sm font-bold transition-colors text-white/70 hover:text-white"
          >
            Courses
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Join Now
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRoleClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all bg-white/10 text-white hover:bg-white/20"
            >
              <FaUserCircle size={18} />
              <span className="capitalize">{user.role.replace('superadmin', 'Admin')}</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
            >
              <FaSignOutAlt className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
