"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { ProjectOverview } from "../../../components/ProjectOverview";
import { ContributionTimeline } from "../../../components/ContributionTimeline";
import { DeploymentSection } from "../../../components/DeploymentSection";
import { RelatedProjects } from "../../../components/RelatedProjects";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt, FaCode, FaCog, FaUsers, FaChartLine, FaEye, FaStar, FaCodeBranch, FaSpinner, FaArrowLeft, FaFolder, FaFolderOpen, FaFileAlt, FaChevronRight, FaExpand, FaCompress } from "react-icons/fa";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { GlassCard } from "../../../components/GlassCard";
import { projectApi } from "../../../lib/project-service";

const mockProject = {
  id: "1",
  title: "Mentor Connect",
  githubUrl: "https://github.com/example/mentor-connect",
  liveUrl: "https://mentorconnect.com",
  status: "Live",
  privacy: "Public",
  owner: {
    name: "Jane Doe",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    role: "Owner",
  },
  tags: ["Open Source", "AI", "Web"],
  icon: <span className='font-bold text-2xl text-white'>M</span>,
  iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
  shortDescription: "Platform to connect with mentors and mentees in tech.",
  detailedDescription: `Mentor Connect is a comprehensive platform designed to bridge the gap between experienced professionals and aspiring learners in the tech industry. Our mission is to facilitate meaningful mentorship relationships that drive career growth and knowledge sharing.

## Key Features

- **Smart Matching Algorithm**: AI-powered system to connect mentors and mentees based on skills, interests, and goals
- **Real-time Communication**: Built-in chat and video conferencing capabilities
- **Progress Tracking**: Set goals, track milestones, and measure growth over time
- **Resource Library**: Curated learning materials and industry insights
- **Community Forums**: Engage with a broader community of learners and experts

## Tech Stack

Built with modern technologies to ensure scalability, performance, and excellent user experience.`,
  techStack: ["Next.js", "TypeScript", "Node.js", "TailwindCSS", "PostgreSQL", "Redis"],
  stats: {
    stars: 1243,
    forks: 89,
    watchers: 156,
  },
  contributors: [
    { name: "Jane Doe", avatar: "https://randomuser.me/api/portraits/women/47.jpg", contributions: 245, role: "Owner" },
    { name: "John Smith", avatar: "https://randomuser.me/api/portraits/men/32.jpg", contributions: 156, role: "Maintainer" },
    { name: "Alice Johnson", avatar: "https://randomuser.me/api/portraits/women/44.jpg", contributions: 98, role: "Contributor" },
    { name: "Bob Wilson", avatar: "https://randomuser.me/api/portraits/men/46.jpg", contributions: 67, role: "Contributor" },
  ],
  contributions: [
    { date: "2024-01-15", type: "Feature", description: "Added AI-powered mentor matching", author: "Jane Doe", commits: 12 },
    { date: "2024-01-10", type: "Fix", description: "Fixed authentication bug", author: "John Smith", commits: 3 },
    { date: "2024-01-05", type: "Feature", description: "Implemented video conferencing", author: "Alice Johnson", commits: 8 },
    { date: "2023-12-28", type: "Docs", description: "Updated API documentation", author: "Bob Wilson", commits: 5 },
  ],
};

const mockFiles = [
  { name: "package.json", path: "/", type: "file" },
  { name: "README.md", path: "/", type: "file" },
  { name: "src", path: "/", type: "folder", children: [
    { name: "components", path: "/src", type: "folder" },
    { name: "pages", path: "/src", type: "folder" },
    { name: "utils", path: "/src", type: "folder" },
    { name: "app.tsx", path: "/src", type: "file" },
  ]},
];

const mockCodeContent = `// Example TypeScript code from the project
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MentorProfile {
  id: string;
  name: string;
  expertise: string[];
  availability: boolean;
}

export function MentorMatcher() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      const response = await fetch('/api/mentors');
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mentor-grid">
      {mentors.map(mentor => (
        <MentorCard key={mentor.id} mentor={mentor} />
      ))}
    </div>
  );
}`;

type TabType = "overview" | "contributions" | "contributors" | "code" | "settings";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedFile, setSelectedFile] = useState<string>("src/app.tsx");
  const [project, setProject] = useState<any>(mockProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<any | null>(null);
  const [diffFiles, setDiffFiles] = useState<any[]>([]);
  const [diffSelectedFile, setDiffSelectedFile] = useState<any | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [diffMeta, setDiffMeta] = useState<{ message: string; author: string; date: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [repoTree, setRepoTree] = useState<any>(null);
  const [repoTreeLoading, setRepoTreeLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileContentLoading, setFileContentLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Fetch project details from API
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectApi.get(`/api/projects/${projectId}/details`);
        
        // Map API response to component-compatible format
        const apiProject = response.data;
        const mappedProject = {
          id: apiProject.id,
          title: apiProject.title,
          githubUrl: apiProject.githubUrl,
          liveUrl: apiProject.liveUrl,
          status: apiProject.status,
          privacy: apiProject.privacy,
          owner: apiProject.owner,
          tags: apiProject.tags || [],
          icon: <span className='font-bold text-2xl text-white'>{apiProject.title.charAt(0)}</span>,
          iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          shortDescription: apiProject.shortDescription || '',
          detailedDescription: apiProject.detailedDescription || '',
          longDescription: apiProject.detailedDescription || '',
          techStack: apiProject.techStack || [],
          stats: apiProject.stats,
          contributors: (apiProject.contributors || []).map((c: any) => ({
            name: c.name,
            avatar: c.avatar,
            contributions: c.contributions,
            role: c.role,
            profileLink: c.profileLink,
          })),
          contributions: (apiProject.contributions || []).map((c: any) => ({
            date: c.date,
            type: c.type,
            description: c.description,
            author: c.author,
            commits: c.commits,
            hash: c.hash,
          })),
        };
        
        setProject(mappedProject);
      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Failed to load project details. Using sample data.');
        setProject(mockProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Fetch repository tree when Code tab is active
  useEffect(() => {
    if (activeTab === "code" && project?.githubUrl && !repoTree) {
      fetchRepositoryTree();
    }
  }, [activeTab, project?.githubUrl, repoTree]);

  const fetchRepositoryTree = async () => {
    if (!project?.githubUrl) return;
    
    try {
      setRepoTreeLoading(true);
      setRepoTree(null); // Reset tree
      console.log('Fetching repository tree for:', project.githubUrl);
      
      // Extract owner and repo from GitHub URL (supports both full URL and short format)
      let owner: string, repo: string;
      
      // Try full URL format first: https://github.com/owner/repo
      const fullUrlMatch = project.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (fullUrlMatch) {
        [, owner, repo] = fullUrlMatch;
      } else {
        // Try short format: owner/repo
        const shortMatch = project.githubUrl.match(/^([^\/]+)\/([^\/]+)$/);
        if (shortMatch) {
          [, owner, repo] = shortMatch;
        } else {
          console.error('Invalid GitHub URL format:', project.githubUrl);
          return;
        }
      }
      
      const cleanRepo = repo.replace(/\.git$/, '');
      
      console.log('Fetching tree for:', owner, '/', cleanRepo);
      
      const response = await projectApi.get(
        `/api/projects/github/tree-formatted/${owner}/${cleanRepo}?format=nested`
      );
      
      console.log('Repository tree loaded:', response.data);
      setRepoTree(response.data);
    } catch (err) {
      console.error('Failed to fetch repository tree:', err);
      setRepoTree({ children: [] }); // Set empty tree on error
    } finally {
      setRepoTreeLoading(false);
    }
  };

  const fetchFileContent = async (filePath: string) => {
    if (!project?.githubUrl) return;
    
    try {
      setFileContentLoading(true);
      console.log('Fetching file content for:', filePath);
      
      // Extract owner and repo from GitHub URL (supports both full URL and short format)
      let owner: string, repo: string;
      
      // Try full URL format first: https://github.com/owner/repo
      const fullUrlMatch = project.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (fullUrlMatch) {
        [, owner, repo] = fullUrlMatch;
      } else {
        // Try short format: owner/repo
        const shortMatch = project.githubUrl.match(/^([^\/]+)\/([^\/]+)$/);
        if (shortMatch) {
          [, owner, repo] = shortMatch;
        } else {
          console.error('Invalid GitHub URL format:', project.githubUrl);
          return;
        }
      }
      
      const cleanRepo = repo.replace(/\.git$/, '');
      
      console.log('Fetching file:', owner, '/', cleanRepo, '/', filePath);
      
      const response = await projectApi.get(
        `/api/projects/github/content/${owner}/${cleanRepo}?filePath=${encodeURIComponent(filePath)}`
      );
      
      console.log('File content loaded');
      setFileContent(response.data.content || '');
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      setFileContent('// Failed to load file content\n// Error: ' + (err as any)?.message);
    } finally {
      setFileContentLoading(false);
    }
  };

  const handleContributionSelect = async (contribution: any | null) => {
    if (!contribution) {
      setSelectedContribution(null);
      setDiffFiles([]);
      setDiffSelectedFile(null);
      setDiffMeta(null);
      setDiffError(null);
      setDiffLoading(false);
      return;
    }

    if (!projectId || !contribution?.hash) return;

    setSelectedContribution(contribution);
    setDiffLoading(true);
    setDiffError(null);

    try {
      const resp = await projectApi.get(`/api/projects/${projectId}/commits/${contribution.hash}/diff`);
      const data = resp.data;

      const files = (data.files || []).map((f: any) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: f.patch || "",
      }));

      setDiffFiles(files);
      setDiffSelectedFile(files.length ? files[0] : null);
      setDiffMeta({
        message: data.commit?.message || contribution.description || "",
        author: data.commit?.author?.name || contribution.author || "",
        date: data.commit?.author?.date || contribution.date || "",
      });
    } catch (err: any) {
      console.error("Failed to fetch commit diff", err);
      setDiffError("Failed to load diff for this contribution.");
      setDiffFiles([]);
      setDiffSelectedFile(null);
      setDiffMeta(null);
    } finally {
      setDiffLoading(false);
    }
  };

  const languageFromFilename = (filename: string | undefined) => {
    if (!filename) return "plaintext";
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "jsx":
        return "javascript";
      case "java":
        return "java";
      case "py":
        return "python";
      case "rb":
        return "ruby";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "kt":
        return "kotlin";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "md":
        return "markdown";
      case "yml":
      case "yaml":
        return "yaml";
      case "json":
        return "json";
      case "sql":
        return "sql";
      default:
        return "plaintext";
    }
  };

  const patchToDiffTexts = (patch: string) => {
    const originalLines: string[] = [];
    const modifiedLines: string[] = [];
    const lines = (patch || "").split("\n");

    for (const line of lines) {
      // Skip diff headers and hunk markers
      if (
        line.startsWith("@@") ||
        line.startsWith("diff --git") ||
        line.startsWith("index ") ||
        line.startsWith("--- ") ||
        line.startsWith("+++ ") ||
        line.startsWith("\\ No newline")
      ) {
        continue;
      }

      // Line was deleted: add to original only
      if (line.startsWith("-")) {
        originalLines.push(line.slice(1));
        continue;
      }

      // Line was added: add to modified only
      if (line.startsWith("+")) {
        modifiedLines.push(line.slice(1));
        continue;
      }

      // Context line (unchanged): add to both
      const clean = line.startsWith(" ") ? line.slice(1) : line;
      originalLines.push(clean);
      modifiedLines.push(clean);
    }

    return {
      original: originalLines.join("\n"),
      modified: modifiedLines.join("\n"),
    };
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FaEye /> },
    { id: "contributions", label: "Contributions", icon: <FaChartLine /> },
    { id: "contributors", label: "Contributors", icon: <FaUsers /> },
    { id: "code", label: "Code", icon: <FaCode /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <>
      {isFullscreen && (
        <div className={`fixed inset-0 z-50 flex flex-col ${theme === 'dark' ? 'bg-[#0a0e0c]' : 'bg-white'}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
            <div>
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {diffSelectedFile?.filename}
              </h3>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {diffSelectedFile?.changes || 0} changes · +{diffSelectedFile?.additions || 0} / -{diffSelectedFile?.deletions || 0}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                theme === 'dark'
                  ? 'bg-white/10 text-gray-100 hover:bg-white/20 border border-white/15'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <FaCompress /> Exit fullscreen
            </button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            {/* File Tree Sidebar */}
            <div className={`w-72 border-r ${theme === 'dark' ? 'border-white/10 bg-[#0b0e0c]' : 'border-gray-200 bg-gray-50'} overflow-y-auto`}>
              <div className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Files changed
              </div>
              <div className="px-2 pb-3 space-y-1">
                {diffFiles.length === 0 ? (
                  <div className={`px-3 py-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    No files
                  </div>
                ) : (
                  <ContributionFileTree files={diffFiles} theme={theme} selectedFile={diffSelectedFile} onSelectFile={setDiffSelectedFile} />
                )}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="text-sm font-semibold truncate">{diffSelectedFile?.filename}</div>
              </div>
              <div className="flex-1 overflow-hidden">
                {diffSelectedFile?.patch ? (
                  <DiffEditor
                    height="100%"
                    language={languageFromFilename(diffSelectedFile.filename)}
                    original={(() => {
                      const lines = (diffSelectedFile.patch || "").split("\n");
                      const originalLines: string[] = [];
                      for (const line of lines) {
                        if (line.startsWith("@@") || line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("\\ No newline")) continue;
                        if (line.startsWith("-")) { originalLines.push(line.slice(1)); continue; }
                        if (line.startsWith("+")) continue;
                        const clean = line.startsWith(" ") ? line.slice(1) : line;
                        originalLines.push(clean);
                      }
                      return originalLines.join("\n");
                    })()}
                    modified={(() => {
                      const lines = (diffSelectedFile.patch || "").split("\n");
                      const modifiedLines: string[] = [];
                      for (const line of lines) {
                        if (line.startsWith("@@") || line.startsWith("diff --git") || line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ") || line.startsWith("\\ No newline")) continue;
                        if (line.startsWith("-")) continue;
                        if (line.startsWith("+")) { modifiedLines.push(line.slice(1)); continue; }
                        const clean = line.startsWith(" ") ? line.slice(1) : line;
                        modifiedLines.push(clean);
                      }
                      return modifiedLines.join("\n");
                    })()}
                    options={{
                      readOnly: true,
                      renderSideBySide: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: "on",
                      wordWrap: "on",
                      renderIndicators: true,
                    }}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  />
                ) : (
                  <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No patch data available for this file.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
    <DashboardLayout
      sidebarActive="Projects"
      topbarTitle={project.title}
      theme={theme}
      setTheme={setTheme}
    >
      {loading ? (
        <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#0a1813]' : 'bg-white'}`}>
          <div className="text-center">
            <FaSpinner className={`text-4xl animate-spin mx-auto mb-4 ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`} />
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading project details...</p>
          </div>
        </div>
      ) : error ? (
        <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
          {error}
        </div>
      ) : null}
      
      <div className="flex flex-col gap-6 w-full">
        {/* Project Header */}
        <GlassCard theme={theme} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl p-8`}>
          <div className="flex items-start gap-6">
            {/* Project Icon */}
            <div className={`${project.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl`}>
              {project.icon}
            </div>
            
            {/* Project Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.status === 'Live' 
                    ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                    : theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {project.privacy}
                </span>
              </div>
              
              <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {project.shortDescription}
              </p>
              
              {/* Stats & Links */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaStar className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{project.stats?.stars || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCodeBranch className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{project.stats?.forks || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEye className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{project.stats?.watchers || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-white/10 hover:bg-white/20 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } transition-colors`}
                  >
                    <FaGithub /> GitHub
                  </a>
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-[#13ff8c]/20 hover:bg-[#13ff8c]/30 text-[#13ff8c]' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                      } transition-colors`}
                    >
                      <FaExternalLinkAlt /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {(project.tags || []).map((tag: string, i: number) => (
              <span 
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-white/5 text-gray-300 border border-white/10' 
                    : 'bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-2 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} overflow-x-auto`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === tab.id
                  ? theme === 'dark'
                    ? 'text-[#13ff8c]'
                    : 'text-emerald-600'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-[#13ff8c]' : 'bg-emerald-600'
                  }`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && <OverviewTab theme={theme} project={project} />}
            {activeTab === "contributions" && (
              <ContributionsTab
                theme={theme}
                contributions={project.contributions}
                onSelectContribution={handleContributionSelect}
                selectedContribution={selectedContribution}
                diffFiles={diffFiles}
                diffSelectedFile={diffSelectedFile}
                onSelectDiffFile={setDiffSelectedFile}
                diffLoading={diffLoading}
                diffError={diffError}
                diffMeta={diffMeta}
                languageFromFilename={languageFromFilename}
                patchToDiffTexts={patchToDiffTexts}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
              />
            )}
            {activeTab === "contributors" && <ContributorsTab theme={theme} contributors={project.contributors} />}
            {activeTab === "code" && (
              <CodeTab 
                theme={theme} 
                repoTree={repoTree}
                repoTreeLoading={repoTreeLoading}
                selectedFile={selectedFile} 
                setSelectedFile={setSelectedFile}
                fileContent={fileContent}
                fileContentLoading={fileContentLoading}
                onFileSelect={fetchFileContent}
                onRefreshTree={fetchRepositoryTree}
              />
            )}
            {activeTab === "settings" && <SettingsTab theme={theme} project={project} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
      )}
    </>
  );
}

// Contribution File Tree Component for Fullscreen
function ContributionFileTree({
  files,
  theme,
  selectedFile,
  onSelectFile,
}: {
  files: any[];
  theme: "light" | "dark";
  selectedFile: any | null;
  onSelectFile: (file: any) => void;
}) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const statusSymbols: Record<string, string> = {
    added: "+",
    removed: "-",
    deleted: "-",
    modified: "~",
    renamed: ">",
  };

  const fileStatusStyle = (status: string) => {
    switch (status) {
      case "added":
        return theme === "dark" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "removed":
      case "deleted":
        return theme === "dark" ? "bg-red-500/15 text-red-300 border border-red-500/30" : "bg-red-100 text-red-700 border border-red-200";
      case "modified":
        return theme === "dark" ? "bg-blue-500/15 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return theme === "dark" ? "bg-white/10 text-gray-200 border border-white/15" : "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const buildFileTree = (fileList: any[]) => {
    const root: any[] = [];
    fileList.forEach((file) => {
      const parts = (file.filename || "").split("/");
      let current = root;
      let currentPath = "";
      parts.forEach((part: string, idx: number) => {
        const path = currentPath ? `${currentPath}/${part}` : part;
        let node = current.find((n: any) => n.name === part && n.isFolder === (idx !== parts.length - 1));
        if (!node) {
          node = {
            name: part,
            path,
            isFolder: idx !== parts.length - 1,
            children: [] as any[],
            file: undefined,
            status: undefined,
          };
          current.push(node);
        }
        if (idx === parts.length - 1) {
          node.file = file;
          node.status = file.status;
        } else {
          current = node.children;
        }
        currentPath = path;
      });
    });
    return root;
  };

  const fileTree = React.useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.isFolder;
      const isActive = !!node.file && selectedFile?.filename === node.file.filename;
      const isExpanded = expandedFolders.has(node.path);
      const paddingLeft = 12 + depth * 14;
      return (
        <div key={node.path} className="space-y-1">
          <div
            className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between gap-2 ${
              isActive
                ? theme === "dark"
                  ? "bg-[#13ff8c]/10 border-[#13ff8c]/40 text-[#13ff8c]"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
                : theme === "dark"
                  ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            } transition-colors`}
            style={{ paddingLeft }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else if (node.file) {
                onSelectFile(node.file);
              }
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isFolder ? (
                <>
                  <FaChevronRight
                    className={`text-xs transition-transform ${
                      isExpanded ? "rotate-90" : "rotate-0"
                    } ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                  />
                  {isExpanded ? (
                    <FaFolderOpen className={`text-base ${theme === "dark" ? "text-emerald-300" : "text-emerald-600"}`} />
                  ) : (
                    <FaFolder className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  )}
                </>
              ) : (
                <FaFileAlt className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              )}
              <span className="truncate">{node.name}</span>
            </div>
            {!isFolder && node.status && (
              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${fileStatusStyle(node.status)}`}>
                {statusSymbols[node.status] || ""}
              </span>
            )}
          </div>
          {isFolder && isExpanded && node.children && node.children.length > 0 && (
            <div className="space-y-1">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return <>{fileTree.length === 0 ? null : renderTree(fileTree)}</>;
}

function OverviewTab({ theme, project }: { theme: "light" | "dark"; project: any }) {
  return (
    <div className="space-y-6">
      {/* Original Overview Section */}
      <ProjectOverview project={project} theme={theme} />
      
      {/* Contribution Timeline */}
      <ContributionTimeline theme={theme} />
      
      {/* Deployment Section */}
      <DeploymentSection theme={theme} />
      
      {/* Related Projects */}
      <RelatedProjects theme={theme} />
    </div>
  );
}

// Contributions Tab Component
function ContributionsTab({
  theme,
  contributions,
  onSelectContribution,
  selectedContribution,
  diffFiles,
  diffSelectedFile,
  onSelectDiffFile,
  diffLoading,
  diffError,
  diffMeta,
  languageFromFilename,
  patchToDiffTexts,
  isFullscreen,
  setIsFullscreen,
}: {
  theme: "light" | "dark";
  contributions: any[];
  onSelectContribution: (contribution: any | null) => void;
  selectedContribution: any | null;
  diffFiles: any[];
  diffSelectedFile: any | null;
  onSelectDiffFile: (file: any | null) => void;
  diffLoading: boolean;
  diffError: string | null;
  diffMeta: { message: string; author: string; date: string } | null;
  languageFromFilename: (filename: string | undefined) => string;
  patchToDiffTexts: (patch: string) => { original: string; modified: string };
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
}) {
  const typeColors: Record<string, { dark: string; light: string }> = {
    Feature: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-100 text-blue-700' },
    Fix: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-100 text-red-700' },
    Docs: { dark: 'bg-purple-500/20 text-purple-400', light: 'bg-purple-100 text-purple-700' },
  };

  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  
  // Get unique branches and group contributions
  const branches = React.useMemo(() => {
    const branchSet = new Set<string>();
    contributions.forEach((c: any) => {
      if (c.branch) branchSet.add(c.branch);
    });
    const branchArray = Array.from(branchSet).sort((a, b) => {
      // Sort: main/master first, then alphabetically
      if (a === 'main' || a === 'master') return -1;
      if (b === 'main' || b === 'master') return 1;
      return a.localeCompare(b);
    });
    console.log('Available branches:', branchArray);
    return branchArray;
  }, [contributions]);

  // Default to first branch (main/master or first available)
  const [selectedBranch, setSelectedBranch] = React.useState<string>('');
  
  React.useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      console.log('Setting default branch to:', branches[0]);
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // Filter contributions by selected branch - MUST be defined before contribList
  const filteredContributions = React.useMemo(() => {
    if (!selectedBranch) return contributions;
    const filtered = contributions.filter((c: any) => c.branch === selectedBranch);
    console.log(`Filtering by branch '${selectedBranch}':`, filtered.length, 'commits');
    return filtered;
  }, [contributions, selectedBranch]);

  const contribList = filteredContributions || [];
  const statusSymbols: Record<string, string> = {
    added: "+",
    removed: "-",
    deleted: "-",
    modified: "~",
    renamed: ">",
  };
  const fileStatusStyle = (status: string) => {
    switch (status) {
      case "added":
        return theme === "dark" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "removed":
      case "deleted":
        return theme === "dark" ? "bg-red-500/15 text-red-300 border border-red-500/30" : "bg-red-100 text-red-700 border border-red-200";
      case "modified":
        return theme === "dark" ? "bg-blue-500/15 text-blue-300 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return theme === "dark" ? "bg-white/10 text-gray-200 border border-white/15" : "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const hasSelection = !!selectedContribution;
  const diffContent = React.useMemo(() => {
    if (!diffSelectedFile?.patch) {
      return { original: "", modified: "" };
    }
    return patchToDiffTexts(diffSelectedFile.patch);
  }, [diffSelectedFile, patchToDiffTexts]);

  const buildFileTree = (files: any[]) => {
    const root: any[] = [];
    files.forEach((file) => {
      const parts = (file.filename || "").split("/");
      let current = root;
      let currentPath = "";
      parts.forEach((part: string, idx: number) => {
        const path = currentPath ? `${currentPath}/${part}` : part;
        let node = current.find((n: any) => n.name === part && n.isFolder === (idx !== parts.length - 1));
        if (!node) {
          node = {
            name: part,
            path,
            isFolder: idx !== parts.length - 1,
            children: [] as any[],
            file: undefined,
            status: undefined,
          };
          current.push(node);
        }
        if (idx === parts.length - 1) {
          node.file = file;
          node.status = file.status;
        } else {
          current = node.children;
        }
        currentPath = path;
      });
    });
    return root;
  };

  const fileTree = React.useMemo(() => buildFileTree(diffFiles), [diffFiles]);

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node) => {
      const isFolder = node.isFolder;
      const isActive = !!node.file && diffSelectedFile?.filename === node.file.filename;
      const isExpanded = expandedFolders.has(node.path);
      const paddingLeft = 12 + depth * 14;
      return (
        <div key={node.path} className="space-y-1">
          <div
            className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between gap-2 ${
              isActive
                ? theme === "dark"
                  ? "bg-[#13ff8c]/10 border-[#13ff8c]/40 text-[#13ff8c]"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
                : theme === "dark"
                  ? "bg-white/5 border-white/10 text-gray-200 hover:bg-white/10"
                  : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
            } transition-colors`}
            style={{ paddingLeft }}
            onClick={() => {
              if (isFolder) {
                toggleFolder(node.path);
              } else if (node.file) {
                onSelectDiffFile(node.file);
              }
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isFolder ? (
                <>
                  <FaChevronRight
                    className={`text-xs transition-transform ${
                      isExpanded ? "rotate-90" : "rotate-0"
                    } ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                  />
                  {isExpanded ? (
                    <FaFolderOpen className={`text-base ${theme === "dark" ? "text-emerald-300" : "text-emerald-600"}`} />
                  ) : (
                    <FaFolder className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  )}
                </>
              ) : (
                <FaFileAlt className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              )}
              <span className="truncate">{node.name}</span>
            </div>
            {!isFolder && node.status && (
              <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${fileStatusStyle(node.status)}`}>
                {statusSymbols[node.status] || ""}
              </span>
            )}
          </div>
          {isFolder && isExpanded && node.children && node.children.length > 0 && (
            <div className="space-y-1">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <GlassCard theme={theme} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl p-6`}>
      {!hasSelection ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Contributions
            </h2>
            <div className="flex items-center gap-3">
              {branches.length > 0 ? (
                <div className="flex items-center gap-2">
                  <FaCodeBranch className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/15'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-[#13ff8c]/40' : 'focus:ring-emerald-500/40'
                    }`}
                  >
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  No branch data
                </span>
              )}
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {contribList.length} {contribList.length === 1 ? 'commit' : 'commits'}
              </span>
            </div>
          </div>

          {contribList.length === 0 ? (
            <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No contributions yet
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {contribList.map((contribution: any, i: number) => (
                <motion.button
                  type="button"
                  key={i}
                  onClick={() => onSelectContribution(contribution)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          typeColors[contribution.type]?.[theme] || (theme === 'dark' ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700')
                        }`}>
                          {contribution.type}
                        </span>
                        {contribution.branch && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            <FaCodeBranch className="text-xs" />
                            {contribution.branch}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {contribution.description}
                      </h3>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contribution.date}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {contribution.hash && (
                        <span className={`text-xs font-mono px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contribution.hash.substring(0, 10)}
                        </span>
                      )}
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {contribution.commits} commits
                      </div>
                    </div>
                  </div>
                  <div className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    by {contribution.author}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {diffMeta?.message || selectedContribution?.description || 'Contribution'}
              </h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {diffMeta?.author || selectedContribution?.author} · {diffMeta?.date || selectedContribution?.date}
                </span>
                {selectedContribution?.branch && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    <FaCodeBranch className="text-xs" />
                    {selectedContribution.branch}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedContribution?.hash && (
                <span className={`text-xs font-mono px-2 py-1 rounded ${theme === 'dark' ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedContribution.hash.substring(0, 12)}
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectContribution(null)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  theme === 'dark'
                    ? 'bg-white/10 text-gray-100 hover:bg-white/20 border border-white/15'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <FaArrowLeft /> Back to list
              </button>
            </div>
          </div>

          <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-[#0b1511] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            {diffLoading ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className={`animate-spin text-2xl ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`} />
                <span className={`ml-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Loading diff...</span>
              </div>
            ) : diffError ? (
              <div className={`p-6 text-center ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>
                {diffError}
              </div>
            ) : diffFiles.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-64 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-lg font-semibold">No diff available</p>
                <p className="text-sm mt-2">This commit does not contain diff data.</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row h-full max-h-[680px]">
                <div className={`lg:w-64 border-b lg:border-b-0 lg:border-r ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} overflow-y-auto`}>
                  <div className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Files changed
                  </div>
                  <div className="px-2 pb-3 space-y-1">
                    {fileTree.length === 0 ? (
                      <div className={`px-3 py-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        No files
                      </div>
                    ) : (
                      renderTree(fileTree)
                    )}
                  </div>
                </div>

                <div className="flex-1 min-h-[420px] overflow-hidden">
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-white/10 text-gray-200' : 'border-gray-200 text-gray-800'}`}>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{diffSelectedFile?.filename}</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {diffSelectedFile?.changes || 0} changes · +{diffSelectedFile?.additions || 0} / -{diffSelectedFile?.deletions || 0}
                      </div>
                    </div>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-white/10 text-gray-100 hover:bg-white/20 border border-white/15'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                    }`}
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>

                <div className={`rounded-b-2xl ${theme === 'dark' ? 'bg-black/40' : 'bg-white'} overflow-hidden`}>
                  {diffSelectedFile?.patch ? (
                    <DiffEditor
                      height="600px"
                      language={languageFromFilename(diffSelectedFile.filename)}
                      original={diffContent.original}
                      modified={diffContent.modified}
                      options={{
                        readOnly: true,
                        renderSideBySide: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: "on",
                        wordWrap: "on",
                        renderIndicators: true,
                      }}
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    />
                    ) : (
                      <div className={`p-6 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No patch data available for this file.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// Contributors Tab Component
function ContributorsTab({ theme, contributors }: { theme: "light" | "dark"; contributors: any[] }) {
  const contribList = contributors || [];

  return (
    <GlassCard theme={theme} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl p-8`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Project Contributors
      </h2>
      {contribList.length === 0 ? (
        <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          No contributors yet
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contribList.map((contributor: any, i: number) => (
            <motion.a
              key={i}
              href={contributor.profileLink}
              target={contributor.profileLink?.startsWith('http://localhost') ? '_self' : '_blank'}
              rel={contributor.profileLink?.startsWith('http://localhost') ? undefined : 'noopener noreferrer'}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`block p-6 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:shadow-lg'
              } transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={contributor.avatar}
                  alt={contributor.name}
                  className="w-16 h-16 rounded-full border-2 border-white/20"
                />
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {contributor.name}
                  </h3>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {contributor.role}
                  </span>
                </div>
              </div>
              <div className={`flex items-center justify-between pt-4 border-t ${
                theme === 'dark' ? 'border-white/10' : 'border-gray-200'
              }`}>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Contributions
                </span>
                <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`}>
                  {contributor.contributions}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// Code Tab Component
function CodeTab({ 
  theme, 
  repoTree,
  repoTreeLoading,
  selectedFile, 
  setSelectedFile,
  fileContent,
  fileContentLoading,
  onFileSelect,
  onRefreshTree,
}: { 
  theme: "light" | "dark"; 
  repoTree: any;
  repoTreeLoading: boolean;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  fileContent: string;
  fileContentLoading: boolean;
  onFileSelect: (filePath: string) => void;
  onRefreshTree: () => void;
}) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getLanguageFromPath = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'yml': case 'yaml': return 'yaml';
      case 'xml': return 'xml';
      case 'sql': return 'sql';
      default: return 'plaintext';
    }
  };

  const renderTreeNode = (node: any, depth = 0) => {
    if (!node) return null;
    
    const isFolder = node.type === 'tree' || node.children;
    const isExpanded = expandedFolders.has(node.path);
    const isActive = selectedFile === node.path;
    const paddingLeft = 12 + depth * 14;
    
    // Extract filename from path (get the last part after the last '/')
    const displayName = node.path.split('/').pop() || node.path;

    return (
      <div key={node.path}>
        <button
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node.path);
              onFileSelect(node.path);
            }
          }}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            isActive
              ? theme === 'dark'
                ? 'bg-[#13ff8c]/20 text-[#13ff8c]'
                : 'bg-emerald-100 text-emerald-700'
              : theme === 'dark'
                ? 'text-gray-300 hover:bg-white/5'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft }}
        >
          {isFolder ? (
            <>
              <FaChevronRight
                className={`text-xs transition-transform ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                } ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              />
              {isExpanded ? (
                <FaFolderOpen className={theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'} />
              ) : (
                <FaFolder className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              )}
            </>
          ) : (
            <FaFileAlt className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
          )}
          <span className="truncate text-sm">{displayName}</span>
        </button>
        {isFolder && isExpanded && node.children && (
          <div className="space-y-1 mt-1">
            {node.children.map((child: any) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* File Explorer */}
      <GlassCard theme={theme} className={`lg:col-span-1 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl p-6 max-h-[700px] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Files
          </h3>
          <button
            onClick={onRefreshTree}
            className={`px-2 py-1 text-xs rounded ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Refresh"
          >
            🔄
          </button>
        </div>
        {repoTreeLoading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className={`animate-spin ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`} />
            <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</span>
          </div>
        ) : repoTree?.children && repoTree.children.length > 0 ? (
          <div className="space-y-1">
            {repoTree.children.map((node: any) => renderTreeNode(node))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              No files found
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {project?.githubUrl ? 'Check console for errors' : 'No repository URL'}
            </p>
          </div>
        )}
      </GlassCard>

      {/* Code Editor */}
      <GlassCard theme={theme} className={`lg:col-span-3 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <FaCode className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedFile || 'Select a file'}
            </span>
          </div>
        </div>
        <div className="h-[600px]">
          {fileContentLoading ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className={`animate-spin text-2xl ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`} />
            </div>
          ) : (
            <Editor
              height="100%"
              language={getLanguageFromPath(selectedFile)}
              value={fileContent || '// Select a file to view its content'}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ theme, project }: { theme: "light" | "dark"; project: any }) {
  return (
    <div className="space-y-6">
      <GlassCard theme={theme} className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'} border rounded-2xl p-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          General Settings
        </h2>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Project Name
            </label>
            <input
              type="text"
              defaultValue={project.title}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#13ff8c]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 ${
                theme === 'dark' ? 'focus:ring-[#13ff8c]/20' : 'focus:ring-emerald-500/20'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              defaultValue={project.shortDescription}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#13ff8c]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 ${
                theme === 'dark' ? 'focus:ring-[#13ff8c]/20' : 'focus:ring-emerald-500/20'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Privacy
            </label>
            <select
              defaultValue={project.privacy}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#13ff8c]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 ${
                theme === 'dark' ? 'focus:ring-[#13ff8c]/20' : 'focus:ring-emerald-500/20'
              }`}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              Save Changes
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard theme={theme} className={`${theme === 'dark' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border rounded-2xl p-8`}>
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
          Danger Zone
        </h2>
        <p className={`mb-6 ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <button
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Delete Project
        </button>
      </GlassCard>
    </div>
  );
} 