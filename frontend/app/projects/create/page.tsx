"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaGithub, FaLink, FaEye, FaEdit } from "react-icons/fa";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { GlassCard } from "../../../components/GlassCard";
import { GitHubRepoSelector } from "../../../components/GitHubRepoSelector";
import { useAuth } from "../../../lib/auth-context";
import { createProject } from "../../../lib/project-service";
import Markdown from "react-markdown";
import "./markdown-editor.css";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  language: string | null;
  starsCount: number;
  forksCount: number;
  defaultBranch: string;
  htmlUrl: string;
  owner: {
    id: number;
    login: string;
    avatarUrl: string;
    type: string;
  };
}

export default function CreateProjectPage() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slogan: "",
    shortDescription: "",
    detailedDescription: "",
    projectLink: "",
    privacy: "PUBLIC",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRepositorySelect = (repo: Repository | null) => {
    setSelectedRepository(repo);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!formData.shortDescription.trim()) {
      setError("Short description is required");
      return;
    }

    if (!formData.detailedDescription.trim()) {
      setError("Detailed description is required");
      return;
    }

    if (!selectedRepository) {
      setError("Please select a GitHub repository");
      return;
    }

    try {
      setIsSubmitting(true);

      // Wait for auth to initialize
      if (!isInitialized) {
        setError("Authentication system is initializing. Please wait...");
        setIsSubmitting(false);
        return;
      }

      if (!isAuthenticated || !user || !user.userID) {
        setError("User not authenticated. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        slogan: formData.slogan || null,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        projectLink: formData.projectLink || null,
        privacy: formData.privacy,
        githubRepository: selectedRepository.fullName,
        githubRepositoryId: selectedRepository.id.toString(),
        defaultBranch: selectedRepository.defaultBranch,
      };

      const response = await createProject(payload);

      const data = response.data;
      setSuccess(true);
      setFormData({
        name: "",
        slogan: "",
        shortDescription: "",
        detailedDescription: "",
        projectLink: "",
        privacy: "PUBLIC",
      });
      setSelectedRepository(null);

      // Redirect after success
      setTimeout(() => {
        window.location.href = `/projects/${data.id}`;
      }, 1500);
    } catch (err) {
      console.error("Error creating project:", err);

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as any;
        const validationErrors = data?.errors;
        const message = data?.message || err.message || "Failed to create project";

        if (validationErrors && typeof validationErrors === "object") {
          const firstError = Object.values(validationErrors)[0];
          setError(typeof firstError === "string" ? firstError : message);
        } else {
          setError(message);
        }
      } else {
        setError(err instanceof Error ? err.message : "Failed to create project");
      }
    } finally {
      setIsSubmitting(false);
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
          <h1
            className={`text-3xl font-bold mb-3 ${
              theme === "light" ? "text-gray-900" : "text-white"
            }`}
          >
            Create New Project
          </h1>
          <p
            className={`text-base ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Share your amazing project with the community
          </p>
        </div>

        {/* Loading state while auth initializes */}
        {!isInitialized && (
          <div
            className={`p-4 rounded-lg border text-center ${
              theme === "light"
                ? "bg-blue-50 border-blue-300 text-blue-800"
                : "bg-blue-500/10 border-blue-500/40 text-blue-300"
            }`}
          >
            Loading authentication... Please wait.
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            className={`p-4 rounded-lg border ${
              theme === "light"
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-green-500/10 border-green-500/40 text-green-300"
            }`}
          >
            ✓ Project created successfully! Redirecting...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className={`p-4 rounded-lg border ${
              theme === "light"
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-red-500/10 border-red-500/40 text-red-300"
            }`}
          >
            ✗ {error}
          </div>
        )}

        <div className="w-full max-w-none">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className={`space-y-5 ${!isInitialized ? "opacity-50 pointer-events-none" : ""}`}>
              {/* Project Name */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your project name"
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300"
                      : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20"
                  }`}
                  required
                />
              </div>

              {/* Slogan */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Slogan
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleInputChange}
                  placeholder="A catchy tagline for your project"
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300"
                      : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20"
                  }`}
                />
                <p
                  className={`text-xs mt-1 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Optional: A brief, memorable phrase that captures your
                  project's essence
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Short Description *
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="A brief summary of your project (1-2 sentences)"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm resize-none transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300"
                      : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20"
                  }`}
                  required
                />
                <p
                  className={`text-xs mt-1 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  This will be shown in project cards and search results
                </p>
              </div>

              {/* Project Link */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Project Link
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="projectLink"
                    value={formData.projectLink}
                    onChange={handleInputChange}
                    placeholder="https://yourproject.com (optional)"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm transition-all duration-300 ${
                      theme === "light"
                        ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300"
                        : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20"
                    }`}
                  />
                  <FaLink
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${
                      theme === "light" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-1 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Live demo, portfolio page, or any relevant project URL
                </p>
              </div>

              {/* Privacy */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Privacy *
                </label>
                <div className="flex gap-3">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.privacy === "PUBLIC"
                      ? theme === "light"
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-[#13ff8c]/10 border-[#13ff8c]/40"
                      : theme === "light"
                        ? "bg-white/80 border-gray-200 hover:border-gray-300"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}>
                    <input
                      type="radio"
                      name="privacy"
                      value="PUBLIC"
                      checked={formData.privacy === "PUBLIC"}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}>Public</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.privacy === "PRIVATE"
                      ? theme === "light"
                        ? "bg-blue-50 border-blue-300"
                        : "bg-blue-500/10 border-blue-500/40"
                      : theme === "light"
                        ? "bg-white/80 border-gray-200 hover:border-gray-300"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}>
                    <input
                      type="radio"
                      name="privacy"
                      value="PRIVATE"
                      checked={formData.privacy === "PRIVATE"}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}>Private</span>
                  </label>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {formData.privacy === "PUBLIC" 
                    ? "Your project will be visible to everyone" 
                    : "Only you can see this project"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Full Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`block text-xs font-semibold uppercase tracking-wider ${
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }`}
                  >
                    Detailed Description * (Markdown Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => setMarkdownPreview(!markdownPreview)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                      theme === "light"
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "bg-white/10 hover:bg-white/20 text-gray-300"
                    }`}
                  >
                    {markdownPreview ? (
                      <>
                        <FaEdit /> Edit
                      </>
                    ) : (
                      <>
                        <FaEye /> Preview
                      </>
                    )}
                  </button>
                </div>
                
                {markdownPreview ? (
                  <div className={`rounded-lg border p-4 min-h-[300px] overflow-auto markdown-preview ${
                    theme === "light" ? "markdown-light border-gray-200 bg-white/80" : "markdown-dark border-white/10 bg-white/5"
                  }`}>
                    <Markdown>
                      {formData.detailedDescription || "*Write some markdown to see the preview...*"}
                    </Markdown>
                  </div>
                ) : (
                  <textarea
                    name="detailedDescription"
                    value={formData.detailedDescription}
                    onChange={handleInputChange}
                    placeholder="# Project Title&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Tech Stack&#10;Built with React, Node.js, and more...&#10;&#10;Use **bold**, *italic*, `code`, and more markdown syntax!"
                    rows={12}
                    className={`w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 backdrop-blur-sm resize-none transition-all duration-300 font-mono text-sm ${
                      theme === "light"
                        ? "bg-white/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-100 focus:border-emerald-400 hover:border-gray-300"
                        : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#13ff8c]/20 focus:border-[#13ff8c] hover:border-white/20"
                    }`}
                    required
                  />
                )}
                <p
                  className={`text-xs mt-1 ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Use markdown syntax for formatting. Click preview to see how it looks!
                </p>
              </div>

              {/* GitHub Repository Selection */}
              {isInitialized && isAuthenticated && user ? (
                <GitHubRepoSelector
                  theme={theme}
                  onRepositorySelect={handleRepositorySelect}
                  selectedRepository={selectedRepository}
                />
              ) : isInitialized && (!isAuthenticated || !user) ? (
                <div
                  className={`p-4 rounded-lg border ${
                    theme === "light"
                      ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                      : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                  }`}
                >
                  Please log in to connect your GitHub repository.
                </div>
              ) : null}
            </div>

            {/* Submit Button - Full Width */}
            <div className="lg:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg border font-semibold text-base shadow-lg backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === "light"
                    ? "bg-emerald-500 border-emerald-600 text-white focus:ring-emerald-200 hover:bg-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-[#13ff8c]/90 border-[#13ff8c] text-black focus:ring-[#13ff8c]/30 hover:bg-[#19fb9b] hover:shadow-[0_0_20px_rgba(19,255,140,0.3)]"
                }`}
              >
                {isSubmitting ? "Creating..." : "🚀 Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
} 