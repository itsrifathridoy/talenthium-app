"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { FaGithub, FaLink, FaUnlink } from "react-icons/fa";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { GlassCard } from "../../../components/GlassCard";

export default function CreateProjectPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubRepo, setGithubRepo] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleGithubConnect = () => {
    // Mock GitHub connection - in real app this would open OAuth flow
    setIsGithubConnected(!isGithubConnected);
    if (!isGithubConnected) {
      setGithubRepo("user/example-repository");
    } else {
      setGithubRepo("");
    }
  };

  return (
    <DashboardLayout
      sidebarActive="Projects"
      topbarTitle="Create Project"
      theme={theme}
      setTheme={setTheme}
    >
      <div className="flex flex-col gap-8">
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-bold mb-3 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>Create New Project</h1>
          <p className={`text-base ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>Share your amazing project with the community</p>
        </div>
        
        <div className="w-full max-w-none">
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Project Name */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>Project Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter your project name" 
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20'
                  }`} 
                  required
                />
              </div>

              {/* Slogan */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>Slogan</label>
                <input 
                  type="text" 
                  placeholder="A catchy tagline for your project" 
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20'
                  }`} 
                />
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>Optional: A brief, memorable phrase that captures your project's essence</p>
              </div>

              {/* Short Description */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>Short Description *</label>
                <textarea 
                  placeholder="A brief summary of your project (1-2 sentences)" 
                  rows={3} 
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm resize-none transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20'
                  }`} 
                  required
                />
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>This will be shown in project cards and search results</p>
              </div>

              {/* Project Link */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>Project Link</label>
                <div className="relative">
                  <input 
                    type="url" 
                    placeholder="https://yourproject.com (optional)" 
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                      theme === 'light'
                        ? 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300'
                        : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20'
                    }`} 
                  />
                  <FaLink className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>Live demo, portfolio page, or any relevant project URL</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Full Description */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>Detailed Description *</label>
                <textarea 
                  placeholder="Provide a comprehensive description of your project, its features, technologies used, goals, and what makes it special..." 
                  rows={6} 
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm resize-none transition-all duration-300 ${
                    theme === 'light'
                      ? 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300'
                      : 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20'
                  }`} 
                  required
                />
                <p className={`text-xs mt-1 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>Include details about features, tech stack, objectives, and any other relevant information</p>
              </div>

              {/* GitHub Connection */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>GitHub Repository</label>
                
                {!isGithubConnected ? (
                  <button 
                    type="button"
                    onClick={handleGithubConnect}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 hover:scale-[1.01] ${
                      theme === 'light'
                        ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800 focus:ring-gray-300 hover:shadow-lg'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                    }`}
                  >
                    <FaGithub className="text-lg" />
                    <span>Connect with GitHub</span>
                  </button>
                ) : (
                  <div className={`p-4 rounded-lg border ${
                    theme === 'light'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-green-500/10 border-green-500/40'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaGithub className={`text-lg ${
                          theme === 'light' ? 'text-green-600' : 'text-green-400'
                        }`} />
                        <span className={`font-semibold ${
                          theme === 'light' ? 'text-green-800' : 'text-green-300'
                        }`}>Connected to GitHub</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGithubConnect}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          theme === 'light' 
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-100' 
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        }`}
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className={`text-sm ${
                      theme === 'light' ? 'text-green-700' : 'text-green-200'
                    }`}>
                      Repository: <span className="font-mono font-medium">{githubRepo}</span>
                    </div>
                  </div>
                )}
                
                <p className={`text-xs mt-2 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {!isGithubConnected 
                    ? "Optional: Connect your GitHub repository to sync code, issues, and contributions automatically"
                    : "Your project will automatically sync with the connected GitHub repository"
                  }
                </p>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className="lg:col-span-2 pt-4">
              <button 
                type="submit" 
                className={`w-full px-6 py-3 rounded-lg border font-semibold text-base shadow-lg backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 hover:scale-[1.01] ${
                  theme === 'light'
                    ? 'bg-emerald-500 border-emerald-600 text-white focus:ring-emerald-200 hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-[#13ff8c]/90 border-[#13ff8c] text-black focus:ring-[#13ff8c]/30 hover:bg-[#19fb9b] hover:shadow-[0_0_20px_rgba(19,255,140,0.3)]'
                }`}
              >
                🚀 Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 