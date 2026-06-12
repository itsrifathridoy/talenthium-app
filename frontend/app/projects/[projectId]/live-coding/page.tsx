"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SideBar } from "../../../../components/SideBar";
import LiveCodingTab from "../LiveCodingTab";
import { projectApi } from "../../../../lib/project-service";
import { FaArrowLeft, FaTerminal } from "react-icons/fa";

export default function LiveCodingPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [projectTitle, setProjectTitle] = useState("Project");
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    projectApi
      .get(`/api/projects/${projectId}/details`)
      .then((res) => {
        setProjectTitle(res.data.title || "Project");
        setGithubUrl(res.data.githubUrl || res.data.gitLink || "");
      })
      .catch(() => {});
  }, [projectId]);

  const dk = theme === "dark";

  return (
    <div
      className={`fixed inset-0 flex ${
        dk
          ? "bg-[#0a1813]"
          : "bg-gradient-to-br from-emerald-50 via-white to-emerald-100"
      }`}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] ${
            dk
              ? "bg-[radial-gradient(circle,rgba(19,255,140,0.07)_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_60%)]"
          }`}
        />
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-[17%] z-30">
        <SideBar active="Projects" theme={theme} />
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-col ml-[17%] flex-1 h-screen overflow-hidden">
        {/* Header strip */}
        <div
          className={`shrink-0 flex items-center gap-3 px-6 h-14 border-b ${
            dk
              ? "bg-[#0a1813]/95 border-white/10 backdrop-blur-md"
              : "bg-white/90 border-gray-200 backdrop-blur-md shadow-sm"
          }`}
        >
          <Link
            href={`/projects/${projectId}`}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              dk
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <FaArrowLeft className="text-xs" />
            <span>{projectTitle}</span>
          </Link>

          <span className={dk ? "text-white/20" : "text-gray-300"}>/</span>

          <div className="flex items-center gap-2">
            <FaTerminal
              className={`text-sm ${dk ? "text-[#13ff8c]" : "text-emerald-600"}`}
            />
            <span
              className={`text-sm font-semibold ${
                dk ? "text-white" : "text-gray-900"
              }`}
            >
              Live Coding
            </span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => {
              const next = dk ? "light" : "dark";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
            className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dk
                ? "bg-white/5 text-gray-400 hover:bg-white/10"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {dk ? "☀ Light" : "☾ Dark"}
          </button>
        </div>

        {/* Editor — fills remaining height */}
        <div className="flex-1 overflow-hidden p-3">
          <LiveCodingTab
            theme={theme}
            projectId={projectId}
            projectTitle={projectTitle}
            githubUrl={githubUrl}
          />
        </div>
      </div>
    </div>
  );
}
