import React from "react";
import { FaEdit, FaShareAlt, FaCommentDots, FaUserPlus, FaArchive, FaTrash } from "react-icons/fa";

const isOwner = true;

export const SidebarActions: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => (
  <div className={`p-6 flex flex-col gap-4 sticky top-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow transition-all text-sm ${
      theme === 'dark' 
        ? 'bg-[#13ff8c]/90 text-black hover:bg-[#19fb9b]' 
        : 'bg-emerald-500 text-white hover:bg-emerald-600'
    }`}>
      <FaEdit /> Edit Project
    </button>
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all text-sm ${
      theme === 'dark' 
        ? 'bg-white/10 border-white/20 text-[#13ff8c] hover:bg-white/20 hover:text-[#19fb9b]' 
        : 'bg-white border-gray-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
    } border`}>
      <FaShareAlt /> Share Project
    </button>
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all text-sm ${
      theme === 'dark' 
        ? 'bg-white/10 border-white/20 text-[#13ff8c] hover:bg-white/20 hover:text-[#19fb9b]' 
        : 'bg-white border-gray-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
    } border`}>
      <FaCommentDots /> Request Feedback
    </button>
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all text-sm ${
      theme === 'dark' 
        ? 'bg-white/10 border-white/20 text-[#13ff8c] hover:bg-white/20 hover:text-[#19fb9b]' 
        : 'bg-white border-gray-300 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
    } border`}>
      <FaUserPlus /> Apply as Contributor
    </button>
    {isOwner && (
      <>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all text-sm ${
          theme === 'dark' 
            ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30' 
            : 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
        } border`}>
          <FaArchive /> Archive Project
        </button>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all text-sm ${
          theme === 'dark' 
            ? 'bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30' 
            : 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
        } border`}>
          <FaTrash /> Delete Project
        </button>
      </>
    )}
  </div>
); 