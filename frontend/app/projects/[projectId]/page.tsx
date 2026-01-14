"use client";
import * as React from "react";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { ProjectHeader } from "../../../components/ProjectHeader";
import { ProjectOverview } from "../../../components/ProjectOverview";
import { ContributionTimeline } from "../../../components/ContributionTimeline";
import { DeploymentSection } from "../../../components/DeploymentSection";
import { IssuesSection } from "../../../components/IssuesSection";
import { FeedbackSection } from "../../../components/FeedbackSection";
import { SidebarActions } from "../../../components/SidebarActions";
import { RelatedProjects } from "../../../components/RelatedProjects";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const mockProject = {
  id: "1",
  title: "Mentor Connect",
  githubUrl: "https://github.com/example/mentor-connect",
  liveUrl: "https://mentorconnect.com",
  status: "Live",
  visibility: "Public",
  owner: {
    name: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    role: "Owner",
  },
  tags: ["Open Source", "AI", "Web"],
  icon: <span className='font-bold text-2xl text-black'>M</span>,
  iconBg: 'bg-blue-400',
  shortDescription: "Platform to connect with mentors and mentees. ",
  longDescription: `# Mentor Connect\n\nMentor Connect is a platform that helps users find mentors and mentees in tech.\n\n- Built with Next.js, TypeScript, and Node.js\n- Real-time chat, project boards, and more!`,
  techStack: ["Next.js", "TypeScript", "Node.js", "TailwindCSS"],
};

export default function ProjectPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!actionsOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setActionsOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actionsOpen]);
  return (
    <DashboardLayout
      sidebarActive="Projects"
      topbarTitle={mockProject.title}
      theme={theme}
      setTheme={setTheme}
    >
      {/* Main sections */}
      <div className="flex flex-col gap-8 w-full relative">
        <ProjectHeader project={mockProject} onActionClick={() => setActionsOpen(true)} theme={theme} />
        <ProjectOverview project={mockProject} theme={theme} />
        <ContributionTimeline theme={theme} />
        <DeploymentSection theme={theme} />
        {/* <IssuesSection theme={theme} />
        <FeedbackSection theme={theme} /> */}
        <RelatedProjects theme={theme} />
        
        <AnimatePresence>
          {actionsOpen && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/60 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActionsOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                className={`fixed top-0 right-0 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-[#1a2a22]/90 to-[#0a1813]/90' 
                    : 'bg-gradient-to-br from-white/95 to-gray-50/95'
                } h-full w-full max-w-xs z-50 ${
                  theme === 'dark' ? 'border-l border-white/10' : 'border-l border-gray-300'
                }`}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40, duration: 0.3 }}
                style={{ boxShadow: '0 0 32px 0 rgba(0,0,0,0.15)' }}
              >
                <div className="h-full flex flex-col">
                  <SidebarActions theme={theme} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
} 