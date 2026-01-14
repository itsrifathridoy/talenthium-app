"use client";
import React from "react";
import { SideBar } from "../SideBar";
import { TopBar } from "../TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarActive?: string;
  topbarTitle?: string;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

export function DashboardLayout({
  children,
  sidebarActive = "Dashboard",
  topbarTitle,
  theme,
  setTheme,
}: DashboardLayoutProps) {
  return (
    <div className={`relative min-h-screen flex ${theme === 'dark' ? 'bg-[#0a1813]' : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100'} overflow-x-hidden overflow-hidden`}>
      {/* Green radial glow */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] ${
          theme === 'dark' 
            ? 'bg-[radial-gradient(circle,rgba(19,255,140,0.12)_0%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_60%)]'
        }`}></div>
      </div>
      
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={theme === 'dark' ? '#1a2a22' : 'rgba(16,185,129,0.1)'}
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Layout: Sidebar | Main Content */}
      <div className="flex w-full h-screen">
        {/* Sidebar - fixed */}
        <div className="fixed left-0 top-0 h-screen w-[17%] z-30">
          <SideBar active={sidebarActive} theme={theme} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-[17%] h-screen">
          {/* Topbar - sticky */}
          <div className="sticky top-0 z-20">
            <TopBar title={topbarTitle} theme={theme} setTheme={setTheme} />
          </div>
          
          {/* Scrollable main content */}
          <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>

      {/* Global styles for scrollbar theming */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' 
            ? 'linear-gradient(135deg, #13ff8c 40%, #0a1813 100%)' 
            : 'linear-gradient(135deg, #10b981 40%, #059669 100%)'};
          border-radius: 8px;
          box-shadow: ${theme === 'dark' 
            ? '0 2px 8px rgba(19, 255, 140, 0.3)' 
            : '0 2px 8px rgba(16, 185, 129, 0.3)'};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' 
            ? 'linear-gradient(135deg, #19fb9b 50%, #0a1813 100%)' 
            : 'linear-gradient(135deg, #059669 50%, #047857 100%)'};
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? '#0a1813' : '#f0fdf4'};
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
