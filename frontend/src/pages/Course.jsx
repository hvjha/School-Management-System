import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AllCourseCard from '../cards/AllCourseCard';

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/course/courses');
        setCourses(res.data.courses || []);
      } catch (e) {
        console.error("Failed to load courses", e);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mb-10 mt-18">
      <h2 className="text-3xl font-black mb-10 text-center text-white italic">EXPLORE <span className="text-blue-500">CURRICULUMS</span></h2>

      <div className="flex flex-wrap gap-6 justify-center">
        {courses.map((c) => (
          <AllCourseCard
            key={c._id}
            course={c}
            onSelect={setSelectedCourse}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center z-50 p-6">
          <div className="glass-card rounded-[2.5rem] p-8 w-full max-w-md relative animate-in fade-in zoom-in duration-300">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
              onClick={() => setSelectedCourse(null)}
            >
              ✕
            </button>

            <h2 className="text-3xl font-black mb-6 text-white leading-tight">{selectedCourse.name}</h2>

            <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Course Identity</p>
              <p className="text-lg font-mono font-bold text-blue-400">{selectedCourse.courseId}</p>
            </div>

            {selectedCourse.trainers?.map((t) => (
              <div key={t.trainerId} className="text-sm text-gray-700 mb-1">
                <p><strong>Trainer Name:</strong> {t.name} </p>
                <p><strong>Trainer ID:</strong> {t.trainerId} </p>
                <p><strong>Trainer Experience:</strong> {t.experience} </p>
                <p><strong>Institution:</strong> {t.company} </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
