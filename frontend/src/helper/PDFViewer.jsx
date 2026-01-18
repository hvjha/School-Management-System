// Enhanced PDF Viewer with multiple fallback methods
import { useState } from "react";

export default function PDFViewer({ url }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMethod, setViewMethod] = useState("google"); // google, direct, or mozilla

  if (!url) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-bold">❌ No PDF URL provided</p>
      </div>
    );
  }

  // Google Docs Viewer URL (most reliable for cross-origin PDFs)
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  
  // Mozilla PDF.js viewer (alternative)
  const mozillaUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;

  // Determine which URL to use
  const viewerUrl = viewMethod === "google" ? googleDocsUrl : 
                    viewMethod === "mozilla" ? mozillaUrl : 
                    url;

  return (
    <div className="w-full space-y-4">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Viewer method selector */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => {
            setViewMethod("google");
            setLoading(true);
            setError(false);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            viewMethod === "google"
              ? "bg-red-600 text-white"
              : "bg-white/10 text-slate-400 hover:bg-white/20"
          }`}
        >
          📄 Google Viewer
        </button>
        <button
          onClick={() => {
            setViewMethod("direct");
            setLoading(true);
            setError(false);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            viewMethod === "direct"
              ? "bg-red-600 text-white"
              : "bg-white/10 text-slate-400 hover:bg-white/20"
          }`}
        >
          🌐 Direct View
        </button>
        <button
          onClick={() => {
            setViewMethod("mozilla");
            setLoading(true);
            setError(false);
          }}
          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
            viewMethod === "mozilla"
              ? "bg-red-600 text-white"
              : "bg-white/10 text-slate-400 hover:bg-white/20"
          }`}
        >
          📚 Mozilla PDF.js
        </button>
      </div>

      {/* PDF Iframe - Reduced height */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          key={viewMethod}
          src={viewerUrl}
          className="w-full h-[400px]"
          title="PDF Viewer"
          style={{ border: "none" }}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </div>

      {/* Error message if iframe fails */}
      {error && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-2xl p-4 text-center">
          <p className="text-red-400 font-bold text-sm">
            ⚠️ Having trouble loading the PDF? Try a different viewer method above or use the buttons below.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold uppercase tracking-wider text-xs rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          📄 Open in New Tab
        </a>
        <a
          href={url}
          download
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold uppercase tracking-wider text-xs rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          ⬇️ Download PDF
        </a>
      </div>
    </div>
  );
}
