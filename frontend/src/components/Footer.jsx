import React from "react";
import { FaGraduationCap, FaTwitter, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white/5 backdrop-blur-md text-white pt-16 pb-8 border-t border-white/5">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FaGraduationCap size={18} />
            </div>
            <span className="text-lg font-black tracking-tighter">
              EDU<span className="text-blue-600">HUB</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Empowering the next generation of tech leaders through expert-led education and seamless management.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-colors text-slate-400 hover:text-white"><FaTwitter /></a>
            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-colors text-slate-400 hover:text-white"><FaLinkedin /></a>
            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-colors text-slate-400 hover:text-white"><FaGithub /></a>
            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-colors text-slate-400 hover:text-white"><FaInstagram /></a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold mb-6">Explore</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="/courses" className="hover:text-blue-500 transition-colors">All Courses</a></li>
            <li><a href="/about" className="hover:text-blue-500 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Success Stories</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Events</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li><a href="#" className="hover:text-blue-500 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Contact Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Newsletter</h4>
          <p className="text-slate-400 text-sm mb-4">Stay updated with our latest news and offers.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium">
        <p>&copy; {new Date().getFullYear()} EDUHUB. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Security</a>
          <a href="#" className="hover:text-white">Manage Cookies</a>
        </div>
      </div>
    </footer>
  );
}
