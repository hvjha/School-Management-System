// import React from 'react'
// import { Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'
// import Home from './pages/Home'
// import Auth from './pages/Auth'
// import Course from './pages/Course'
// import CourseDetails from './pages/CourseDetails'
// import AdminDashboard from './pages/AdminDashboard'
// import TrainerDashboard from './pages/TrainerDashboard'
// import StudentDashboard from './pages/StudentDashboard'
// import AdminRoute from './components/AdminRoute'
// import TrainerRoute from './components/TrainerRoute'
// import StudentRoute from './components/StudentRoute'
// import { ToastContainer } from 'react-toastify'
// import Footer from './components/Footer'
// import HeroDashboard from './pages/HeroDashboard'
// import StudentAttendance from './components/StudentAttendance'



// export default function App(){
//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/auth" element={<Auth />} />
//         <Route path="/courses" element={<Course />} />
//         <Route path="/courses/:id" element={<CourseDetails />} />
//         <Route path = "/about" element = {<HeroDashboard/>}/>
//         <Route path="/my-attendance" element={<StudentAttendance />} />
      
//         <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
//         <Route path="/trainer" element={<TrainerRoute><TrainerDashboard /></TrainerRoute>} />
//         <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
//       </Routes>
//       <ToastContainer position="top-right" />
//       <Footer/>
//     </>
//   )
// }

import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Course from './pages/Course'
import CourseDetails from './pages/CourseDetails'
import AdminDashboard from './pages/AdminDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import StudentDashboard from './pages/StudentDashboard'
import AdminRoute from './components/AdminRoute'
import TrainerRoute from './components/TrainerRoute'
import StudentRoute from './components/StudentRoute'
import { ToastContainer } from 'react-toastify'
import Footer from './components/Footer'
import HeroDashboard from './pages/HeroDashboard'
import StudentAttendance from './components/StudentAttendance'


export default function App(){
  return (
    <div className="relative min-h-screen">
      <div className="robust-bg">
        <div className="robust-bg-blob top-0 left-0"></div>
        <div className="robust-bg-blob bottom-0 right-0" style={{ animationDelay: '-10s' }}></div>
      </div>
      
      <Navbar />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/about" element={<HeroDashboard/>} />
          
          {/* Student's own attendance view */}
          <Route path="/my-attendance" element={<StudentRoute><StudentAttendance /></StudentRoute>} />
          
          {/* Universal attendance view (for trainers/admins to view any student) */}
          <Route path="/student-attendance" element={<StudentAttendance />} />
        
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/trainer" element={<TrainerRoute><TrainerDashboard /></TrainerRoute>} />
          <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        </Routes>
      </div>
      <ToastContainer position="top-right" />
      <Footer/>
    </div>
  )
}