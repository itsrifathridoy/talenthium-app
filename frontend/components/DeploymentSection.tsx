import React from "react";

const mockLogs = [
  "[12:00] Build started...",
  "[12:01] Installing dependencies...",
  "[12:03] Build successful!",
  "[12:04] Deploying to production...",
  "[12:05] Deployment complete."
];

export const DeploymentSection: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => (
  <div className={`${
    theme === 'dark' 
      ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
      : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
  } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Deployment</h2>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 min-w-[250px]">
        <div className={`rounded-lg overflow-hidden border aspect-video flex items-center justify-center ${
          theme === 'dark' 
            ? 'border-white/20 bg-black/40' 
            : 'border-gray-300 bg-gray-50 shadow-inner'
        }`}>
          {/* Replace with iframe if allowed */}
          <a href="https://mentorconnect.com" target="_blank" rel="noopener noreferrer" className={`text-lg font-bold underline ${
            theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
          }`}>Live Preview</a>
        </div>
      </div>
      <div className="flex-1 min-w-[250px] flex flex-col gap-2">
        <div className={`rounded-lg p-4 text-xs font-mono h-40 overflow-y-auto border shadow-inner ${
          theme === 'dark' 
            ? 'bg-black/30 text-white border-white/10' 
            : 'bg-gray-100 text-gray-800 border-gray-300'
        }`}>
          {mockLogs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
        <div className="flex gap-2 mt-2">
          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${
            theme === 'dark' 
              ? 'bg-[#13ff8c]/20 text-[#13ff8c]' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>Status: Live</span>
          <button className={`px-4 py-2 rounded-lg font-bold shadow transition-all text-sm ${
            theme === 'dark' 
              ? 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}>Re-deploy</button>
        </div>
      </div>
    </div>
  </div>
); 