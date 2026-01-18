import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function CourseDetails(){
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  useEffect(()=>{ (async()=>{ try{ const res = await api.get(`/api/course/${id}`); setCourse(res.data.course); }catch(e){ } })() },[id]);

  if(!course) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold">{course.name}</h2>
        <div className="text-sm text-gray-600">{course.courseId} • ₹{course.price}</div>
        <div className="mt-3">
          <h3 className="font-semibold">Trainers</h3>
          <ul>
            {(course.trainers || []).map(t => <li key={t._id}>{t.name} ({t.trainerId})</li>)}
          </ul>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold">Students Enrolled: {(course.students||[]).length}</h3>
        </div>
      </div>
    </div>
  )
}


