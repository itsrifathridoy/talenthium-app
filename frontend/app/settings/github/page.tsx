"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaGithub, FaSpinner, FaSync, FaStar, FaCodeBranch, FaLock, FaUnlock } from "react-icons/fa";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { projectApi } from "@/lib/project-service";

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
  owner: { id: number; login: string; avatarUrl: string; type: string };
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "w-5 h-5"} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Java: "#b07219", Go: "#00ADD8", Rust: "#dea584", CSS: "#563d7c",
  HTML: "#e34c26", "C++": "#f34b7d", "C#": "#178600",
};

export default function GitHubSettingsPage() {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const { user, isAuthenticated, isInitialized } = useAuth();
  const searchParams = useSearchParams();

  const [isInstalled, setIsInstalled] = useState(false);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const checkStatus = useCallback(async (userId: string) => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await projectApi.get("/github/repos", {
        headers: { "X-USERID": userId },
      });
      const data = res.data;
      setIsInstalled(!!data.isInstalled);
      if (data.isInstalled && Array.isArray(data.repositories)) {
        setRepos(
          data.repositories.map((r: any) => ({
            id: r.id,
            name: r.name,
            fullName: r.full_name ?? r.fullName,
            description: r.description,
            isPrivate: r.private ?? r.isPrivate,
            language: r.language,
            starsCount: r.stargazers_count ?? r.starsCount ?? 0,
            forksCount: r.forks_count ?? r.forksCount ?? 0,
            defaultBranch: r.default_branch ?? r.defaultBranch ?? "main",
            htmlUrl: r.html_url ?? r.htmlUrl,
            owner: {
              id: r.owner?.id,
              login: r.owner?.login,
              avatarUrl: r.owner?.avatar_url ?? r.owner?.avatarUrl,
              type: r.owner?.type,
            },
          }))
        );
      }
    } catch {
      setError("Failed to fetch GitHub status.");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  // Initial load + handle redirect params
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.userID) return;

    const githubParam = searchParams.get("github");
    const errorParam = searchParams.get("error");

    if (githubParam === "connected") {
      setSuccessMsg("GitHub App connected successfully!");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (errorParam) {
      setError(`GitHub authorization failed: ${errorParam}`);
      window.history.replaceState({}, "", window.location.pathname);
    }

    checkStatus(user.userID.toString());
  }, [isInitialized, isAuthenticated, user, searchParams, checkStatus]);

  const handleConnect = async () => {
    if (!user?.userID) return;
    setLoadingConnect(true);
    setError(null);
    try {
      const tokenRes = await projectApi.get("/github/installation-token", {
        headers: { "X-USERID": user.userID.toString() },
      });
      const token = tokenRes.data.token ?? tokenRes.data;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088";
      window.location.href = `${apiUrl}/project-service/github/install?token=${token}`;
    } catch {
      setError("Failed to start GitHub authorization. Please try again.");
      setLoadingConnect(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.userID) return;
    setLoadingDisconnect(true);
    setError(null);
    try {
      await projectApi.delete("/github/installation", {
        headers: { "X-USERID": user.userID.toString() },
      });
      setIsInstalled(false);
      setRepos([]);
      setSuccessMsg("GitHub App disconnected.");
    } catch {
      setError("Failed to disconnect. Please try again.");
    } finally {
      setLoadingDisconnect(false);
    }
  };

  // Styles
  const dark = theme === "dark";
  const card = dark ? "bg-[#0d1f17] border border-[#13ff8c]/20" : "bg-white border border-emerald-100 shadow-sm";
  const textPrimary = dark ? "text-white" : "text-slate-800";
  const textSub = dark ? "text-slate-400" : "text-slate-500";
  const accent = dark ? "text-[#13ff8c]" : "text-emerald-600";
  const accentBg = dark ? "bg-[#13ff8c]/10 text-[#13ff8c]" : "bg-emerald-100 text-emerald-600";
  const inputCls = dark
    ? "bg-[#0a1813] border border-[#13ff8c]/20 text-white placeholder-slate-500 focus:border-[#13ff8c]/50"
    : "bg-slate-50 border border-emerald-200 text-slate-800 placeholder-slate-400 focus:border-emerald-400";

  const filteredRepos = repos.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.fullName.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q) || (r.language ?? "").toLowerCase().includes(q);
  });

  return (
    <DashboardLayout sidebarActive="Profile" theme={theme} setTheme={setTheme} topbarTitle="GitHub Settings">
      <div className="max-w-3xl flex flex-col gap-6">

        {/* Header card */}
        <div className={`rounded-2xl p-6 ${card}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${accentBg}`}>
              <GitHubIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>GitHub Integration</h2>
              <p className={`text-sm ${textSub}`}>
                Connect via GitHub App to import and manage repositories in your projects.
              </p>
            </div>
            <div className="ml-auto">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isInstalled
                  ? dark ? "bg-[#13ff8c]/15 text-[#13ff8c]" : "bg-emerald-100 text-emerald-700"
                  : dark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-600"
              }`}>
                {loadingRepos ? "Checking…" : isInstalled ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className={`rounded-xl px-5 py-3 text-sm font-medium ${dark ? "bg-[#13ff8c]/10 text-[#13ff8c] border border-[#13ff8c]/25" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
            {successMsg}
          </div>
        )}
        {error && (
          <div className={`rounded-xl px-5 py-3 text-sm font-medium ${dark ? "bg-red-500/10 text-red-400 border border-red-500/25" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {error}
          </div>
        )}

        {/* Connect / Disconnect */}
        <div className={`rounded-2xl p-6 flex flex-col gap-4 ${card}`}>
          {!isInstalled ? (
            <>
              <p className={`text-sm ${textSub}`}>
                Install the Talenthium GitHub App to grant access to your repositories. You choose which repos to share.
              </p>
              <button
                onClick={handleConnect}
                disabled={loadingConnect || !isInitialized}
                className={`flex items-center justify-center gap-3 w-full py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                  dark
                    ? "bg-gradient-to-r from-[#13ff8c] to-[#0ea574] text-black hover:shadow-[0_0_20px_rgba(19,255,140,0.3)]"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg"
                }`}
              >
                {loadingConnect ? <FaSpinner className="animate-spin" /> : <GitHubIcon />}
                {loadingConnect ? "Redirecting to GitHub…" : "Connect GitHub Account"}
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className={`flex items-center gap-2 text-sm ${accent} font-medium`}>
                <GitHubIcon className="w-4 h-4" />
                {repos.length} {repos.length === 1 ? "repository" : "repositories"} accessible
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => user?.userID && checkStatus(user.userID.toString())}
                  disabled={loadingRepos}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    dark ? "border-[#13ff8c]/30 text-[#13ff8c] hover:bg-[#13ff8c]/10" : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  } disabled:opacity-50`}
                >
                  {loadingRepos ? <FaSpinner className="animate-spin" /> : <FaSync />}
                  Refresh
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loadingDisconnect}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    dark ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-red-300 text-red-600 hover:bg-red-50"
                  } disabled:opacity-50`}
                >
                  {loadingDisconnect ? <FaSpinner className="animate-spin" /> : null}
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Repo list */}
        {isInstalled && (
          <div className={`rounded-2xl flex flex-col gap-0 overflow-hidden ${card}`}>
            <div className={`px-6 py-4 border-b ${dark ? "border-[#13ff8c]/10" : "border-emerald-100"}`}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories…"
                className={`w-full rounded-lg px-4 py-2 text-sm outline-none transition-colors ${inputCls}`}
              />
            </div>

            {loadingRepos ? (
              <div className={`flex items-center gap-3 px-6 py-8 ${textSub}`}>
                <FaSpinner className="animate-spin" /> Loading repositories…
              </div>
            ) : filteredRepos.length === 0 ? (
              <p className={`px-6 py-8 text-sm ${textSub}`}>
                {search ? `No repositories match "${search}".` : "No repositories found. Ensure the GitHub App has access to at least one repo."}
              </p>
            ) : (
              filteredRepos.map((repo, i) => (
                <div
                  key={repo.id}
                  className={`px-6 py-4 flex items-start gap-4 ${
                    i < filteredRepos.length - 1
                      ? dark ? "border-b border-[#13ff8c]/10" : "border-b border-emerald-50"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold text-sm hover:underline truncate ${accent}`}
                      >
                        {repo.fullName}
                      </a>
                      <span className={`flex items-center gap-1 text-xs ${textSub}`}>
                        {repo.isPrivate ? <FaLock className="w-2.5 h-2.5" /> : <FaUnlock className="w-2.5 h-2.5" />}
                        {repo.isPrivate ? "Private" : "Public"}
                      </span>
                    </div>
                    {repo.description && (
                      <p className={`text-xs mt-1 truncate ${textSub}`}>{repo.description}</p>
                    )}
                    <div className={`flex items-center gap-4 mt-2 text-xs ${textSub}`}>
                      {repo.language && (
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: LANG_COLORS[repo.language] ?? "#8b949e" }}
                          />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaStar className="w-3 h-3" /> {repo.starsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCodeBranch className="w-3 h-3" /> {repo.forksCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
