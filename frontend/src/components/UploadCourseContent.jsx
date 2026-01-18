// import React, { useState, useEffect, useRef } from "react";
// import api from "../api/api";
// import uploadFile from "../helper/UploadFile";
// import { toast } from "react-toastify";
// import { IoClose } from "react-icons/io5";
import { FaFilePdf, FaFileImage, FaFileVideo, FaFileAlt } from "react-icons/fa";

// export default function UploadCourseContent() {
//   const [courses, setCourses] = useState([]);
//   const [uploadedFile, setUploadedFile] = useState(null);
//   const fileInputRef = useRef(null);

//   const [form, setForm] = useState({
//     courseId: "",
//     title: "",
//     description: "",
//     file_url: "",
//     file_type: "",
//     thumbnail_url: "",
//     duration: 0,
//   });

//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     api.get("/api/course/courses").then((res) => {
//       setCourses(res.data.courses);
//     });
//   }, []);

//   // ---------------- FILE UPLOAD ----------------
//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true);
//     setUploadedFile(file);

//     const uploaded = await uploadFile(file);
//     setUploading(false);

//     if (!uploaded?.secure_url) {
//       toast.error("Upload failed");
//       return;
//     }

//     const fileType = file.type.includes("video")
//       ? "video"
//       : file.type.includes("image")
//       ? "image"
//       : file.type.includes("pdf")
//       ? "pdf"
//       : "document";

//     setForm((prev) => ({
//       ...prev,
//       file_url: uploaded.secure_url,
//       file_type: fileType,
//     }));

//     // ---------------- VIDEO DURATION + THUMBNAIL ----------------
//     if (fileType === "video") {
//       const video = document.createElement("video");
//       video.src = uploaded.secure_url;

//       video.onloadedmetadata = () => {
//         const seconds = Math.floor(video.duration);

//         setForm((prev) => ({
//           ...prev,
//           duration: seconds,
//         }));
//       };

//       // thumbnail auto link
//       setForm((prev) => ({
//         ...prev,
//         thumbnail_url: uploaded.secure_url + ".jpg",
//       }));
//     }
//   };

//   // ---------------- CLEAR FILE ----------------
//   const clearUploadedFile = (e) => {
//     e.preventDefault();

//     setUploadedFile(null);
//     setForm((prev) => ({
//       ...prev,
//       file_url: "",
//       file_type: "",
//       thumbnail_url: "",
//       duration: 0,
//     }));

//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   // ---------------- SUBMIT ----------------
//   const submitContent = async () => {
//     if (!form.courseId || !form.title || !form.file_url || !form.file_type) {
//       return toast.error("Please fill all required fields");
//     }

//     try {
//       await api.post("/api/content/upload", form);

//       toast.success("Content uploaded successfully!");

//       // reset form
//       setForm({
//         courseId: "",
//         title: "",
//         description: "",
//         file_url: "",
//         file_type: "",
//         thumbnail_url: "",
//         duration: 0,
//       });

//       setUploadedFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err) {
//       toast.error("Upload failed");
//     }
//   };

//   return (
//     <div className="p-6 bg-white shadow rounded max-w-xl mx-auto">
//       <h2 className="text-xl font-bold mb-4">Upload Course Content</h2>

//       <select
//         className="p-2 border rounded w-full mb-3"
//         value={form.courseId}
//         onChange={(e) => setForm({ ...form, courseId: e.target.value })}
//       >
//         <option value="">Select Course</option>
//         {courses.map((c) => (
//           <option key={c.courseId} value={c.courseId}>
//             {c.name}
//           </option>
//         ))}
//       </select>

//       <input
//         type="text"
//         className="p-2 border rounded w-full mb-3"
//         placeholder="Title"
//         value={form.title}
//         onChange={(e) => setForm({ ...form, title: e.target.value })}
//       />

//       <textarea
//         className="p-2 border rounded w-full mb-3"
//         placeholder="Description"
//         rows={3}
//         value={form.description}
//         onChange={(e) => setForm({ ...form, description: e.target.value })}
//       />

//       {/* File Upload */}
//       <label className="block cursor-pointer mb-3">
//         <div className="h-14 bg-gray-200 flex items-center justify-between px-3 rounded">
//           <span className="text-sm">
//             {uploadedFile?.name || "Upload Video / PDF / Image / Document"}
//           </span>

//           {uploadedFile?.name && (
//             <button onClick={clearUploadedFile} className="text-red-600">
//               <IoClose />
//             </button>
//           )}
//         </div>

//         <input
//           type="file"
//           ref={fileInputRef}
//           className="hidden"
//           onChange={handleFileUpload}
//         />
//       </label>

//       {uploading && (
//         <p className="text-blue-500 text-sm mb-2">Uploading...</p>
//       )}

//       {form.file_url && <p className="text-green-600 text-sm mb-2">File ready ✓</p>}

//       <button
//         onClick={submitContent}
//         className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded w-full"
//       >
//         Upload Content
//       </button>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import api from "../api/api";
import uploadFile from "../helper/UploadFile";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

export default function UploadCourseContent() {
  const [courses, setCourses] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    file_url: "",
    file_type: "",
    thumbnail_url: "",
    duration: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch all courses on mount
  useEffect(() => {
    api.get("/api/course/courses")
      .then((res) => setCourses(res.data.courses))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  // ---------------- DIRECT CLOUDINARY UPLOAD ----------------
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.warning("Large file detected (over 100MB). Upload may take several minutes.");
    }

    setUploading(true);
    setUploadedFile(file);
    setProgress(0);

    try {
      // DIRECT UPLOAD TO CLOUDINARY (No backend needed!)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'school_uploads');
      formData.append('folder', 'school_management_uploads');

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dghffr4t1/auto/upload`;

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        
        if (xhr.status === 200) {
          const uploaded = JSON.parse(xhr.responseText);
          
          const fileType = file.type.includes("video")
            ? "video"
            : file.type.includes("image")
            ? "image"
            : file.type.includes("pdf")
            ? "pdf"
            : "document";

          setForm((prev) => ({
            ...prev,
            file_url: uploaded.secure_url,
            file_type: fileType,
          }));

          // VIDEO DURATION + THUMBNAIL
          if (fileType === "video") {
            const video = document.createElement("video");
            video.src = uploaded.secure_url;
            video.onloadedmetadata = () => {
              setForm((prev) => ({ 
                ...prev, 
                duration: Math.floor(video.duration),
                thumbnail_url: uploaded.secure_url + ".jpg"
              }));
            };
          }
          
          toast.success("File uploaded successfully!");
        } else {
          toast.error("Upload failed");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error("Upload failed");
      };

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);

    } catch (err) {
      console.error(err);
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  // ---------------- CLEAR FILE ----------------
  const clearUploadedFile = (e) => {
    e.preventDefault();

    setUploadedFile(null);
    setForm((prev) => ({
      ...prev,
      file_url: "",
      file_type: "",
      thumbnail_url: "",
      duration: 0,
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- SUBMIT ----------------
  const submitContent = async () => {
    if (!form.courseId || !form.title || !form.file_url || !form.file_type) {
      return toast.error("Please fill all required fields");
    }

    try {
      await api.post("/api/content/upload", form);

      toast.success("Content uploaded successfully!");

      // Reset form
      setForm({
        courseId: "",
        title: "",
        description: "",
        file_url: "",
        file_type: "",
        thumbnail_url: "",
        duration: 0,
      });
      setUploadedFile(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[50vh] p-4 lg:mt-0 mt-20 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/10 robust-inset relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 opacity-70"></div>

        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase italic tracking-tighter text-shadow-red ">
          Upload Course Content
        </h2>

        {/* Course Selector */}
        <div className="space-y-2 mb-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Course</label>
             <div className="relative">
                <select
                    className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10 appearance-none uppercase"
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                        {c.name}
                    </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold">▼</div>
            </div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Title</label>
            <input
                type="text"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:border-red-600 transition-all outline-none focus:bg-white/10"
                placeholder="Enter title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
        </div>

        {/* Description */}
         <div className="space-y-2 mb-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
            <textarea
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:border-red-600 transition-all outline-none focus:bg-white/10 min-h-[100px]"
                placeholder="Brief description of the content..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
        </div>

        {/* File Upload */}
        <div className="space-y-2 mb-6">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">File</label>
            <label className="block cursor-pointer group">
            <div className={`h-20 bg-white/5 flex items-center justify-between px-6 rounded-2xl border border-white/10 group-hover:border-red-600/50 transition-all ${uploadedFile ? 'border-red-600 bg-red-600/5' : ''}`}>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase italic flex items-center gap-3">
                    {uploadedFile?.name || "Upload Video / PDF / Image / Document"}
                </span>

                {uploadedFile?.name && (
                <div className="flex items-center gap-3">
                    {uploadedFile.type.includes("pdf") ? <FaFilePdf className="text-red-500 text-2xl drop-shadow-glow" /> : 
                        uploadedFile.type.includes("image") ? <FaFileImage className="text-blue-500 text-2xl drop-shadow-glow" /> :
                        uploadedFile.type.includes("video") ? <FaFileVideo className="text-purple-500 text-2xl drop-shadow-glow" /> :
                        <FaFileAlt className="text-gray-500 text-2xl" />}
                    
                    <button onClick={clearUploadedFile} className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 transition-all shadow-lg ml-2">
                         <IoClose />
                    </button>
                </div>
                )}
                 {!uploadedFile?.name && (
                     <span className="text-2xl text-slate-500 group-hover:text-red-500 transition-colors">⬆</span>
                 )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
            />
            </label>
        </div>

        {/* Progress Bar */}
        {uploading && (
            <div className="mb-6 space-y-1">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                 </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                        className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )}

        {/* File ready */}
        {form.file_url && !uploading && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
                 <span className="text-green-500 text-lg">✓</span>
                 <p className="text-green-400 text-xs font-black uppercase tracking-widest">File Ready</p>
            </div>
        )}

        {/* Submit */}
        <button
            onClick={submitContent}
            className="w-full mt-2 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all border border-red-500/30"
        >
            Upload Content
        </button>
      </div>
    </div>
  );
}
