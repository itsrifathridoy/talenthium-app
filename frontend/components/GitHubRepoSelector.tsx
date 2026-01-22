"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaGithub, FaLink, FaSpinner, FaSync } from "react-icons/fa";
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
  owner: {
    id: number;
    login: string;
    avatarUrl: string;
    type: string;
  };
}

interface GitHubRepoSelectorProps {
  theme: "light" | "dark";
  onRepositorySelect: (repo: Repository) => void;
  selectedRepository: Repository | null;
}

export const GitHubRepoSelector: React.FC<GitHubRepoSelectorProps> = ({
  theme,
  onRepositorySelect,
  selectedRepository,
}) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showDropdown]);

  // Get userId from auth context
  useEffect(() => {
    // Wait for auth to initialize before checking user
    if (!isInitialized) {
      return;
    }

    if (isAuthenticated && user && user.userID) {
      checkInstallationStatus(user.userID.toString());
    }

    // Check if we're returning from GitHub callback
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get("github");
    const errorStatus = params.get("error");

    if (githubStatus === "connected" && user && user.userID) {
      setError(null);
      // Reload repos after successful installation
      checkInstallationStatus(user.userID.toString());
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorStatus) {
      setError(`GitHub authorization failed: ${errorStatus}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, user, isInitialized]);

  const checkInstallationStatus = async (userId: string) => {
    try {
      setIsLoadingRepos(true);
      const response = await projectApi.get("/github/repos", {
        headers: {
          "X-USERID": userId,
        },
      });
      const data = response.data;

      setIsInstalled(data.isInstalled);
      if (data.isInstalled && Array.isArray(data.repositories)) {
        // Normalize backend payload (snake_case) to frontend model (camelCase)
        const mappedRepos: Repository[] = data.repositories.map((repo: any) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          isPrivate: repo.private,
          language: repo.language,
          starsCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          defaultBranch: repo.default_branch,
          htmlUrl: repo.html_url,
          owner: {
            id: repo.owner?.id,
            login: repo.owner?.login,
            avatarUrl: repo.owner?.avatar_url,
            type: repo.owner?.type,
          },
        }));
        setRepositories(mappedRepos);
      }
      setError(null);
    } catch (err) {
      console.error("Error checking installation status:", err);
      setError("Failed to check installation status");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleAuthorizeGitHub = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user || !user.userID) {
        setError("User information is not available");
        return;
      }

      // Step 1: Generate installation token
      const tokenResponse = await projectApi.get("/github/installation-token", {
        headers: {
          "X-USERID": user.userID.toString(),
        },
      });

      const token = tokenResponse.data.token || tokenResponse.data;

      // Step 2: Navigate to GitHub install page in the same tab
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';
      const installUrl = `${apiUrl}/project-service/github/install?token=${token}`;

      window.location.href = installUrl;
      
      // Keep a friendly message in case the redirect is blocked
      setError("Redirecting to GitHub for authorization...");
    } catch (err) {
      console.error("Error during authorization:", err);
      setError(err instanceof Error ? err.message : "Authorization failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRepos = async () => {
    if (!user || !user.userID) {
      setError("User information is not available");
      return;
    }
    await checkInstallationStatus(user.userID.toString());
  };

  const handleDisconnect = () => {
    if (!user || !user.userID) {
      setError("User information is not available");
      return;
    }

    const performDisconnect = async () => {
      try {
        setIsLoadingRepos(true);
        await projectApi.delete("/github/installation", {
          headers: {
            "X-USERID": user.userID.toString(),
          },
        });

        setIsInstalled(false);
        setRepositories([]);
        onRepositorySelect(null);
        setError(null);
      } catch (err) {
        console.error("Failed to uninstall GitHub App:", err);
        setError("Failed to disconnect GitHub. Please try again.");
      } finally {
        setIsLoadingRepos(false);
      }
    };

    void performDisconnect();
  };

  const handleSelectRepo = (repo: Repository) => {
    onRepositorySelect(repo);
    setShowDropdown(false);
  };

  return (
    <div>
      <label
        className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${
          theme === "light" ? "text-gray-700" : "text-gray-300"
        }`}
      >
        GitHub Repository
      </label>

      {!isInstalled ? (
        <button
          type="button"
          onClick={handleAuthorizeGitHub}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === "light"
              ? "bg-gray-900 border-gray-800 text-white hover:bg-gray-800 focus:ring-gray-300 hover:shadow-lg"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20 focus:ring-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="text-lg animate-spin" />
              <span>Authorizing...</span>
            </>
          ) : (
            <>
              <FaGithub className="text-lg" />
              <span>Connect with GitHub</span>
            </>
          )}
        </button>
      ) : (
        <div
          className={`rounded-lg border ${
            theme === "light"
              ? "bg-green-50 border-green-300"
              : "bg-green-500/10 border-green-500/40"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-200/50">
            <div className="flex items-center gap-2">
              <FaGithub
                className={`text-lg ${
                  theme === "light" ? "text-green-600" : "text-green-400"
                }`}
              />
              <span
                className={`font-semibold ${
                  theme === "light" ? "text-green-800" : "text-green-300"
                }`}
              >
                GitHub Connected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefreshRepos}
                disabled={isLoadingRepos}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  theme === "light"
                    ? "text-green-600 hover:text-green-700 hover:bg-green-100 disabled:opacity-50"
                    : "text-green-400 hover:text-green-300 hover:bg-green-500/20 disabled:opacity-50"
                }`}
              >
                {isLoadingRepos ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSync />
                )}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  theme === "light"
                    ? "text-green-600 hover:text-green-700 hover:bg-green-100"
                    : "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                }`}
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Repository Selector */}
          <div className="p-4">
            {isLoadingRepos ? (
              <div
                className={`flex items-center gap-2 py-2 ${
                  theme === "light" ? "text-green-700" : "text-green-200"
                }`}
              >
                <FaSpinner className="animate-spin" />
                <span className="text-sm">Loading repositories...</span>
              </div>
            ) : repositories.length === 0 ? (
              <div
                className={`text-sm ${
                  theme === "light" ? "text-green-700" : "text-green-200"
                }`}
              >
                No repositories found. Please ensure the GitHub App has access to at least one repository.
              </div>
            ) : (
              <div className="relative">
                {/* Repository Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 shadow-sm ${
                    theme === "light"
                      ? "bg-white border-green-200 text-gray-900 hover:bg-green-50 hover:shadow-md"
                      : "bg-white/10 border-green-500/40 text-white hover:bg-green-500/15 hover:shadow-[0_8px_30px_rgba(19,255,140,0.15)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {selectedRepository ? (
                        <div>
                          <div className="font-medium">
                            {selectedRepository.fullName}
                          </div>
                          {selectedRepository.description && (
                            <div
                              className={`text-xs ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {selectedRepository.description.substring(0, 50)}
                              {selectedRepository.description.length > 50 &&
                                "..."}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className={
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }
                        >
                          Select a repository...
                        </span>
                      )}
                    </span>
                    <span
                      className={`transform transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {/* Dropdown List */}
                {showDropdown && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl z-50 max-h-96 overflow-hidden backdrop-blur-sm ${
                      theme === "light"
                        ? "bg-white/95 border-gray-200"
                        : "bg-gray-900/95 border-gray-700"
                    }`}
                  >
                    {/* Search bar */}
                    <div
                      className={`p-3 border-b ${
                        theme === "light" ? "border-gray-200" : "border-gray-800"
                      }`}
                    >
                      <input
                        type="text"
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search repositories..."
                        className={`w-full rounded px-3 py-2 text-sm outline-none transition-colors ${
                          theme === "light"
                            ? "bg-gray-50 text-gray-900 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            : "bg-gray-800 text-white border border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-500/40"
                        }`}
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {repositories
                        .filter((repo) => {
                          const term = searchTerm.toLowerCase();
                          if (!term) return true;
                          return (
                            repo.fullName.toLowerCase().includes(term) ||
                            (repo.description || "").toLowerCase().includes(term) ||
                            (repo.language || "").toLowerCase().includes(term)
                          );
                        })
                        .map((repo) => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => handleSelectRepo(repo)}
                            className={`w-full text-left px-4 py-3 border-b transition-colors hover:font-semibold ${
                              selectedRepository?.id === repo.id
                                ? theme === "light"
                                  ? "bg-green-100 text-green-900"
                                  : "bg-green-500/20 text-green-300"
                                : theme === "light"
                                ? "bg-white text-gray-900 hover:bg-gray-50"
                                : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                          >
                            <div className="font-medium">{repo.fullName}</div>
                            <div
                              className={`text-xs mt-1 ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {repo.description ||
                                "No description provided"}
                            </div>
                            <div
                              className={`text-xs mt-1 flex gap-3 ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {repo.language && (
                                <span>Language: {repo.language}</span>
                              )}
                              <span>⭐ {repo.starsCount}</span>
                              <span>🍴 {repo.forksCount}</span>
                            </div>
                          </button>
                        ))}

                      {repositories.filter((repo) => {
                        const term = searchTerm.toLowerCase();
                        if (!term) return false;
                        return !(
                          repo.fullName.toLowerCase().includes(term) ||
                          (repo.description || "").toLowerCase().includes(term) ||
                          (repo.language || "").toLowerCase().includes(term)
                        );
                      }).length === repositories.length && searchTerm && (
                        <div
                          className={`px-4 py-3 text-sm ${
                            theme === "light" ? "text-gray-600" : "text-gray-300"
                          }`}
                        >
                          No repositories match "{searchTerm}".
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info text */}
            <p
              className={`text-xs mt-3 ${
                theme === "light"
                  ? "text-green-700"
                  : "text-green-200"
              }`}
            >
              {selectedRepository
                ? `Selected: ${selectedRepository.fullName}`
                : "Your project will be connected to the selected GitHub repository"}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className={`mt-2 p-3 rounded text-xs ${
            theme === "light"
              ? "bg-red-50 border border-red-300 text-red-700"
              : "bg-red-500/10 border border-red-500/40 text-red-300"
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
};
