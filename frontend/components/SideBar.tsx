import React from 'react'
import { FaBriefcase, FaChalkboard, FaChartLine, FaHandshake, FaHeadset, FaProjectDiagram, FaUser, FaUsers } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import Link from 'next/link';

// SidebarItem with neon border for active, improved hover, and icon alignment
function SidebarItem({ icon, label, active = false, onClick, theme = 'dark' }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; theme?: 'light' | 'dark' }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition relative group
        ${active 
          ? theme === 'dark'
            ? "bg-white/10 text-[#13ff8c] font-semibold border-l-4 border-[#13ff8c] shadow-[0_2px_16px_0_rgba(19,255,140,0.15)]"
            : "bg-blue-100/70 text-blue-800 font-semibold border-l-4 border-blue-600 shadow-[0_2px_16px_0_rgba(37,99,235,0.25)]"
          : theme === 'dark'
            ? "hover:bg-white/5 hover:text-[#13ff8c] text-white"
            : "hover:bg-blue-50/70 hover:text-blue-700 text-slate-700"
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
            : 'bg-gradient-to-b from-blue-600 to-transparent'
        }`} />
      )}
    </div>
  );
}

export const SideBar = ({ active = 'Home', theme = 'dark' }: { active?: string; theme?: 'light' | 'dark' }) => {
  return (
    <div>
      {/* Sidebar - fixed */}
      <aside className={`fixed top-0 left-0 h-screen w-64 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 backdrop-blur-md border-r border-white/10' 
          : 'bg-gradient-to-br from-white/90 to-blue-100/90 backdrop-blur-md border-r border-blue-300/50'
      } flex flex-col p-6 gap-6 rounded-tr-2xl rounded-br-2xl shadow-2xl z-30`}>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-tr from-[#13ff8c] to-[#0a1813]' 
              : 'bg-gradient-to-tr from-blue-600 to-blue-800'
          } flex items-center justify-center shadow-lg`}>
            <span className="font-bold text-lg text-white">T</span>
          </div>
          <span className={`font-bold text-lg tracking-wide ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>Talenthium</span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          <Link href="/dashboard">
            <SidebarItem icon={<MdDashboard />} label="Home" active={active === 'Dashboard'} theme={theme} />
          </Link>
          <Link href="/profile">
            <SidebarItem icon={<FaUser />} label="Profile" active={active === 'Profile'} theme={theme} />
          </Link>
          <Link href="/projects">
            <SidebarItem icon={<FaProjectDiagram />} label="Projects" active={active === 'Projects'} theme={theme} />
          </Link>
          <Link href="/mentorship">
            <SidebarItem icon={<FaChalkboard />} label="Mentorship" active={active === 'Mentorship'} theme={theme} />
          </Link>
          <Link href="/jobs">
            <SidebarItem icon={<FaBriefcase />} label="Jobs" active={active === 'Jobs'} theme={theme} />
          </Link>
          <Link href="/interviews">
            <SidebarItem icon={<FaHandshake />} label="Interviews" active={active === 'Interviews'} theme={theme} />
          </Link>
          {/* Section Divider */}
          <div className="flex items-center gap-2 my-4">
            <span className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/50'}`} />
            <span className={`text-xs font-semibold tracking-wider ${
              theme === 'dark' ? 'text-[#13ff8c]' : 'text-blue-700'
            }`}>COMMUNITY</span>
            <span className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/50'}`} />
          </div>
          <Link href={"/community"}>
            <SidebarItem icon={<FaUsers />} label="Community" active={active === 'Community'} theme={theme} />
          </Link> 
          <Link href={"/analysis"}>
            <SidebarItem icon={<FaChartLine />} label="Analysis" active={active === 'Analysis'} theme={theme} />
          </Link>
          {/* Section Divider */}
          <div className="flex items-center gap-2 my-4">
            <span className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/50'}`} />
            <span className={`text-xs font-semibold tracking-wider ${
              theme === 'dark' ? 'text-[#13ff8c]' : 'text-blue-700'
            }`}>UTILITY</span>
            <span className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-300/50'}`} />
          </div>
          <SidebarItem icon={<FaHeadset />} label="Support" active={active === 'Support'} theme={theme} />
        </nav>
      </aside>
    </div>
  );
};
