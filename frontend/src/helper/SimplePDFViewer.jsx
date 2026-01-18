// Alternative PDF Viewer using iframe (more reliable for Cloudinary)
export default function SimplePDFViewer({ url }) {
  if (!url) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-2xl p-6 text-center">
        <p className="text-red-400 font-bold">❌ No PDF URL provided</p>
      </div>
    );
  }

  console.log("📄 Loading PDF from:", url);

  // Try to use Google Docs viewer as a fallback (works well with PDFs)
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="w-full space-y-4">
      {/* Direct PDF Embed */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <iframe
          src={url}
          className="w-full h-[600px]"
          title="PDF Viewer"
          style={{ border: "none" }}
        />
      </div>

      {/* Fallback: Open in new tab button */}
      <div className="flex gap-4 justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold uppercase tracking-wider text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          📄 Open PDF in New Tab
        </a>
        <a
          href={url}
          download
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold uppercase tracking-wider text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
          ⬇️ Download PDF
        </a>
      </div>

      {/* If iframe fails, show Google Docs viewer */}
      <details className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <summary className="cursor-pointer text-slate-300 font-bold uppercase text-xs tracking-wider">
          Alternative Viewer (If PDF doesn't load above)
        </summary>
        <div className="mt-4 rounded-lg overflow-hidden">
          <iframe
            src={googleDocsUrl}
            className="w-full h-[600px]"
            title="Alternative PDF Viewer"
            style={{ border: "none" }}
          />
        </div>
      </details>
    </div>
  );
}
