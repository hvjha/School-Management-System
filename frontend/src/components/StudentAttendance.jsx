

import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";

export default function StudentAttendance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Get params from URL
  const studentIdParam = searchParams.get("studentId");
  const courseIdParam = searchParams.get("courseId");
  const studentId = studentIdParam || user?.studentId;
  
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseIdParam || "all");
  const [viewMode, setViewMode] = useState("calendar");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);

  // Check user role
  const isAdmin = user?.role === "superadmin";
  const isTrainer = user?.role === "trainer";
  const canEdit = isAdmin;

  useEffect(() => {
    if (studentId) {
      fetchAttendanceData();
    }
  }, [studentId, selectedMonth]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();
      
      // Build query params
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });
      
      // Add course filter if viewing specific course
      if (courseIdParam) {
        params.append('courseId', courseIdParam);
      }
      
      const res = await api.get(`/api/attendance/student/${studentId}?${params}`);
      setAttendanceData(res.data.attendance || []);
      setStudentData(res.data.student);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Get all days of the month including Sundays for proper calendar display
  const getMonthDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Calculate offset for first day (Monday = 0, Tuesday = 1, etc.)
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ type: 'empty' });
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0) {
        days.push({ type: 'sunday', date });
      } else {
        days.push({ type: 'workday', date });
      }
    }

    return days;
  };

  const days = getMonthDays();

  const getCourses = () => {
    const coursesMap = new Map();
    attendanceData.forEach((a) => {
      if (!coursesMap.has(a.course._id)) {
        coursesMap.set(a.course._id, {
          _id: a.course._id,
          name: a.course.name,
          courseId: a.course.courseId,
        });
      }
    });
    return Array.from(coursesMap.values());
  };

  const courses = getCourses();

  // Get status for a specific day and course
  const getStatusForDate = (courseId, date) => {
    // Create UTC date string for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const record = attendanceData.find((a) => {
      const recordDate = new Date(a.date);
      const recordYear = recordDate.getUTCFullYear();
      const recordMonth = String(recordDate.getUTCMonth() + 1).padStart(2, '0');
      const recordDay = String(recordDate.getUTCDate()).padStart(2, '0');
      const recordDateStr = `${recordYear}-${recordMonth}-${recordDay}`;
      
      return a.course._id === courseId && recordDateStr === dateStr;
    });
    
    return record;
  };

  // Calculate attendance percentage for a specific course
  const calculateAttendancePercentage = (courseId) => {
    const filteredData = attendanceData.filter((a) => a.course._id === courseId);

    if (filteredData.length === 0) return 0;

    const presentCount = filteredData.filter((a) => a.status === "present").length;
    return ((presentCount / filteredData.length) * 100).toFixed(2);
  };

  // Get stats for a specific course
  const getCourseStats = (courseId) => {
    // If viewing all, or specific course, we should ideally use the stats provided by backend
    // but since getCourseStats is used per-course in the calendar view, we calculate it here
    const filteredData = attendanceData.filter((a) => a.course._id === courseId);
    
    // Logic to calculate implicit absents for this specific course
    let implicitAbsents = 0;
    const now = new Date();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const effectiveEndDate = lastDay > now ? now : lastDay;
    
    const recordDates = new Set(filteredData.map(a => new Date(a.date).toISOString().split('T')[0]));
    
    let current = new Date(year, month, 1);
    while (current <= effectiveEndDate) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      if (dayOfWeek !== 0 && !recordDates.has(dateStr)) {
        implicitAbsents++;
      }
      current.setDate(current.getDate() + 1);
    }

    const presentDays = filteredData.filter((a) => a.status === "present").length;
    const explicitAbsentDays = filteredData.filter((a) => a.status === "absent").length;
    const totalAbsentDays = explicitAbsentDays + implicitAbsents;
    const totalDays = presentDays + totalAbsentDays;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    return { totalDays, presentDays, absentDays: totalAbsentDays, percentage, implicitAbsents };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  // Change month
  const changeMonth = (delta) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setSelectedMonth(newMonth);
  };

  // Update attendance status (Admin only)
  const updateAttendance = async (attendanceId, newStatus) => {
    try {
      await api.put(`/api/attendance/${attendanceId}`, { status: newStatus });
      toast.success("Attendance updated successfully");
      fetchAttendanceData();
      setEditingRecord(null);
    } catch (err) {
      console.error("Failed to update attendance", err);
      toast.error(err.response?.data?.message || "Failed to update attendance");
    }
  };

  // Delete attendance record (Admin only)
  const deleteAttendance = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await api.delete(`/api/attendance/${attendanceId}`);
      toast.success("Attendance deleted successfully");
      fetchAttendanceData();
    } catch (err) {
      console.error("Failed to delete attendance", err);
      toast.error(err.response?.data?.message || "Failed to delete attendance");
    }
  };

  const getFilteredAttendance = () => {
    let filtered = attendanceData;

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter((a) => a.course._id === selectedCourse);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading attendance data...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">Student not found</div>
      </div>
    );
  }

  const filteredAttendance = getFilteredAttendance();

  return (
    <div className="min-h-screen p-6 mt-18 mb-10">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-red-500 hover:text-red-400 flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors"
        >
          ← Back to Tactical Overview
        </button>

        {/* Student Header */}
        <div className="glass-card rounded-[2.5rem] p-8 mb-8 border border-white/10 robust-inset">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 shadow-2xl">
                {studentData.profile_pic ? (
                  <img
                    src={studentData.profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-3xl">
                    {studentData.name[0]}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white text-shadow-red leading-none">{studentData.name}</h1>
              <p className="text-slate-400 font-bold">
                <span className="text-red-500 uppercase tracking-widest text-[10px] block mb-1">Student ID</span>
                {studentData.studentId} • {studentData.email}
              </p>
              {courseIdParam && courses.length > 0 && (
                <p className="text-sm text-red-400 font-black uppercase tracking-wider mt-2">
                  Tactical Unit: {courses[0].name}
                </p>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-6 py-2.5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${
                viewMode === "calendar"
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              Calendar Intel
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-6 py-2.5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${
                viewMode === "table"
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              Data Streams
            </button>
          </div>
        </div>

        {/* Month Navigation & Filters */}
        <div className="glass-card rounded-3xl p-6 mb-8 border border-white/5 robust-inset">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
              >
                ← Prev
              </button>
              <span className="font-black text-xl text-white uppercase tracking-widest text-shadow-red px-4">
                {formatMonthYear(selectedMonth)}
              </span>
              <button
                onClick={() => changeMonth(1)}
                disabled={
                  selectedMonth.getMonth() === new Date().getMonth() &&
                  selectedMonth.getFullYear() === new Date().getFullYear()
                }
                className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Course Filter */}
            {!courseIdParam && courses.length > 1 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20"
              >
                <option value="all" className="bg-slate-900">All Corridors</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id} className="bg-slate-900">
                    {course.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="space-y-6">
            {(selectedCourse === "all" ? courses : courses.filter(c => c._id === selectedCourse)).map((course) => {
              const stats = getCourseStats(course._id);
              return (
                <div key={course._id} className="glass-card rounded-[2.5rem] border border-white/10 robust-inset shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-white text-shadow-red">{course.name}</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mt-1">{course.courseId}</p>
                    </div>
                  </div>

                  {/* Course-specific Stats */}
                  <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                      <p className="text-3xl font-black text-white">{stats.percentage}%</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Days</p>
                      <p className="text-3xl font-black text-red-500">{stats.presentDays}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anomalies</p>
                      <p className="text-3xl font-black text-red-600/50">{stats.absentDays}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Ops</p>
                      <p className="text-3xl font-black text-slate-300">{stats.totalDays}</p>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-3">
                    {/* Day Headers */}
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div
                        key={day}
                        className="text-center font-black text-[10px] text-slate-500 uppercase tracking-widest p-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {days.map((dayObj, index) => {
                      if (dayObj.type === 'empty') {
                        return <div key={`empty-${index}`} className="p-4"></div>;
                      }

                      if (dayObj.type === 'sunday') {
                        return (
                          <div
                            key={`sunday-${dayObj.date.toISOString()}`}
                            className="p-4 rounded-2xl text-center bg-white/5 border border-white/5 opacity-40"
                          >
                            <div className="text-xs font-black text-slate-500">
                              {dayObj.date.getDate()}
                            </div>
                            <div className="text-[8px] mt-1 font-black text-slate-600 uppercase tracking-tighter">
                              REST
                            </div>
                          </div>
                        );
                      }

                      const date = dayObj.date;
                      const record = getStatusForDate(course._id, date);
                      const isPresent = record?.status === "present";
                      const isAbsent = record?.status === "absent";
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      const isWorkday = date.getDay() !== 0; 
                      const isPastOrToday = date <= new Date();
                      const isImplicitAbsent = !record && isWorkday && isPastOrToday;

                      return (
                        <div
                          key={date.toISOString()}
                          className={`p-4 rounded-2xl text-center border transition-all duration-500 ${
                            isPresent
                              ? "bg-red-600/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                              : isAbsent
                              ? "bg-slate-800/80 border-slate-700 opacity-60"
                              : isImplicitAbsent
                              ? "bg-slate-900 border-red-900/40 opacity-50"
                              : "bg-white/5 border-white/5"
                          } ${isToday ? "ring-2 ring-red-500 scale-110 z-10 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : ""}`}
                        >
                          <div className={`text-sm font-black ${isToday ? "text-red-500" : "text-white"}`}>
                            {date.getDate()}
                          </div>
                          <div className="text-[10px] mt-1">
                            {isPresent ? (
                              <span className="text-red-500 font-black">PRES</span>
                            ) : isAbsent || isImplicitAbsent ? (
                              <span className="text-slate-500 font-black opacity-50">NULL</span>
                            ) : (
                              <span className="text-slate-700">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 mt-8 p-6 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex-wrap border border-white/5">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-4 h-4 bg-red-600/20 border border-red-500/50 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)]"></div>
                      <span>Confirmed Present</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-4 h-4 bg-slate-800/80 border border-slate-700 rounded opacity-60"></div>
                      <span>Marked Absent</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-4 h-4 bg-slate-900 border border-red-900/40 rounded opacity-50"></div>
                      <span>Auto Absent (Workday)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-4 h-4 bg-white/5 border border-white/5 rounded opacity-40"></div>
                      <span>Sunday / Rest Day</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 robust-inset animate-in fade-in slide-in-from-bottom-5 duration-700">
            {filteredAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <p className="text-2xl font-black text-white uppercase tracking-widest">No Intelligence Data</p>
                <p className="text-sm font-bold text-slate-500 mt-2">Zero records found for current cycle</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Log</th>
                      <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Status</th>
                      <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Vitals</th>
                      <th className="p-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Overseer</th>
                      {canEdit && <th className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAttendance.map((record) => {
                      const isEditing = editingRecord === record._id;
                      const recordDate = new Date(record.date);
                      return (
                        <tr key={record._id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-6">
                            <div className="text-white font-black text-sm">{formatDate(record.date)}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {recordDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="text-white font-black text-sm group-hover:text-red-500 transition-colors uppercase italic">{record.course.name}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{record.course.courseId}</div>
                          </td>
                          <td className="p-6 text-center">
                            {isEditing ? (
                              <select
                                value={record.status}
                                onChange={(e) => updateAttendance(record._id, e.target.value)}
                                className="bg-slate-900 text-white border border-red-600/30 rounded-lg px-3 py-1 text-xs font-black"
                              >
                                <option value="present">PRESENT</option>
                                <option value="absent">ABSENT</option>
                              </select>
                            ) : (
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                record.status === "present"
                                  ? "bg-red-600/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                  : "bg-slate-800 text-slate-400 border-slate-700 opacity-60"
                              }`}>
                                {record.status}
                              </span>
                            )}
                          </td>
                          <td className="p-6">
                            <div className="text-white font-bold text-xs uppercase">{record.markedBy?.name || "System"}</div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Authority</div>
                          </td>
                          {canEdit && (
                            <td className="p-6 text-center">
                              <div className="flex gap-2 justify-center">
                                {isEditing ? (
                                  <button onClick={() => setEditingRecord(null)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-all"><IoClose /></button>
                                ) : (
                                  <>
                                    <button onClick={() => setEditingRecord(record._id)} className="px-4 py-1.5 bg-red-600/10 text-red-500 text-[10px] font-black rounded-xl border border-red-500/20 hover:bg-red-600 hover:text-white transition-all tracking-widest uppercase">Adjust</button>
                                    <button onClick={() => deleteAttendance(record._id)} className="px-4 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all uppercase">Delete</button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}