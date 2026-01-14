import React from 'react'
import { FaBriefcase, FaHeadset, FaHome, FaHandshake, FaPlus } from 'react-icons/fa';
import Link from 'next/link';

// SidebarItem with neon border for active, improved hover, and icon alignment
function SidebarItem({ icon, label, active = false, onClick, theme = 'dark', href }: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick?: () => void; 
  theme?: 'light' | 'dark';
  href?: string;
}) {
  const content = (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition relative group
        ${active 
          ? theme === 'dark'
            ? "bg-white/10 text-[#13ff8c] font-semibold border-l-4 border-[#13ff8c] shadow-[0_2px_16px_0_rgba(19,255,140,0.15)]"
            : "bg-emerald-100/70 text-emerald-700 font-semibold border-l-4 border-emerald-500 shadow-[0_2px_16px_0_rgba(16,185,129,0.2)]"
          : theme === 'dark'
            ? "hover:bg-white/5 hover:text-[#13ff8c] text-white"
            : "hover:bg-emerald-50/70 hover:text-emerald-600 text-slate-700"
        }
      `}
      onClick={onClick}
    >
      <span className="text-xl flex items-center justify-center w-7 h-7">{icon}</span>
      <span className="text-sm">{label}</span>
      {active && (
        <span className={`absolute left-0 top-0 h-full w-1 rounded-r-lg animate-pulse ${
          theme === 'dark' 
            ? 'bg-gradient-to-b from-[#13ff8c] to-transparent' 
            : 'bg-gradient-to-b from-emerald-500 to-transparent'
        }`} />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export const RecruiterSideBar = ({ active = 'Home', theme = 'dark' }: { active?: string; theme?: 'light' | 'dark' }) => {
  return (
    <div>
      {/* Sidebar - fixed */}
      <aside className={`fixed top-0 left-0 h-screen w-64 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 backdrop-blur-md border-r border-white/10' 
          : 'bg-gradient-to-br from-white/90 to-emerald-50/90 backdrop-blur-md border-r border-emerald-200/50'
      } flex flex-col p-6 gap-6 rounded-tr-2xl rounded-br-2xl shadow-2xl z-30`}>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-tr from-[#13ff8c] to-[#0a1813]' 
              : 'bg-gradient-to-tr from-emerald-500 to-emerald-700'
          } flex items-center justify-center shadow-lg`}>
            <span className="font-bold text-lg text-white">T</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-lg tracking-wide ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>Talenthium</span>
            <span className={`text-xs font-medium ${
              theme === 'dark' ? 'text-[#13ff8c]/70' : 'text-emerald-600/70'
            }`}>Recruiter Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          <SidebarItem 
            icon={<FaHome />} 
            label="Home" 
            active={active === 'Home'} 
            theme={theme} 
            href="/recruiter/dashboard"
          />
          <SidebarItem 
            icon={<FaBriefcase />} 
            label="Jobs" 
            active={active === 'Jobs'} 
            theme={theme} 
            href="/recruiter/jobs"
          />
          <SidebarItem 
            icon={<FaHandshake />} 
            label="Interviews" 
            active={active === 'Interviews'} 
            theme={theme} 
            href="/recruiter/interviews"
          />
          <SidebarItem 
            icon={<FaHeadset />} 
            label="Support" 
            active={active === 'Support'} 
            theme={theme} 
            href="/recruiter/support"
          />
        </nav>

        {/* Footer */}
        <div className={`pt-4 border-t ${
          theme === 'dark' ? 'border-white/10' : 'border-emerald-200/50'
        }`}>
          <div className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>Version 2.0.1</p>
            <p className="mt-1">© 2024 Talenthium</p>
          </div>
        </div>
      </aside>
    </div>
  );
};
