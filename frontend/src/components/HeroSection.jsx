import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] mt-18 flex items-center overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero_bg.png" 
          alt="Atmospheric Background" 
          className="w-full h-full object-cover opacity-40 scale-110 motion-safe:animate-[pulse_10s_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0f172a] via-transparent to-[#0f172a]/80"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-bounce-slow">
            <FaRocket className="text-xs" />
            <span>Elevate Your Learning Journey</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight text-shadow-sm">
            Master the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 text-glow">Technology</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Join thousands of students and expert trainers in a state-of-the-art educational ecosystem. 
            From expert-led courses to seamless library management, we provide everything you need to excel.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all transform hover-scale shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              Explore Courses <FaGraduationCap />
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2 hover-scale"
            >
              Get Started <FaChalkboardTeacher />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-slate-500">Expert Courses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-sm text-slate-500">Professional Trainers</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white text-shadow-sm">5000+</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Students</div>
            </div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="hidden lg:block relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <img 
              src="/hero_illustration.png" 
              alt="Learning Ecosystem Illustration" 
              className="w-full h-auto object-cover transform transition-transform group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-blue-500 to-transparent"></div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
