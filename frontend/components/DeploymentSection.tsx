"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaRocket, FaSync, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaCodeBranch, FaCog, FaCopy, FaLink, FaKey, FaExclamationTriangle, FaTerminal, FaGlobe, FaLock, FaPlus, FaCode,
} from "react-icons/fa";
import {
  triggerDeploy, getDeployments, provisionDeployment, configureGit, getDeploymentLogsUrl,
  getDomains, generateDomainHost, createDomain,
  getEnvironment, saveEnvironment,
} from "../lib/project-service";

interface DeploymentInfo {
  deploymentId: string;
  title?: string;
  description?: string;
  status: string;
  logPath?: string;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
}

interface DomainInfo {
  domainId: string;
  host: string;
  https: boolean;
  port?: number | null;
  path?: string | null;
  certificateType?: string;
  createdAt?: string;
}

interface Props {
  theme?: "light" | "dark";
  projectId: string | number;
  isOwner?: boolean;
  githubUrl?: string;
  webhookUrl?: string;
  deployPublicKey?: string;
  initialDeployments?: DeploymentInfo[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_BG_DARK: Record<string, string> = {
  SUCCESSFUL: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  FAILED:     "bg-red-500/15 text-red-400 border-red-500/30",
  BUILDING:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  STARTED:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  CANCELLED:  "bg-gray-500/15 text-gray-400 border-gray-500/30",
};
const STATUS_BG_LIGHT: Record<string, string> = {
  SUCCESSFUL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED:     "bg-red-50 text-red-700 border-red-200",
  BUILDING:   "bg-amber-50 text-amber-700 border-amber-200",
  STARTED:    "bg-blue-50 text-blue-700 border-blue-200",
  CANCELLED:  "bg-gray-100 text-gray-500 border-gray-200",
};
const STATUS_DOT: Record<string, string> = {
  SUCCESSFUL: "bg-emerald-400",
  FAILED:     "bg-red-400",
  BUILDING:   "bg-amber-400",
  STARTED:    "bg-blue-400",
  CANCELLED:  "bg-gray-400",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function duration(start?: string, end?: string) {
  if (!start) return null;
  const s = Math.floor((new Date(end ?? Date.now()).getTime() - new Date(start).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ─── Log helpers ─────────────────────────────────────────────────────────────

type LogLevel = "error" | "warn" | "success" | "step" | "cmd" | "muted" | "default";

function classifyLine(line: string): LogLevel {
  if (/^\s*$/.test(line)) return "muted";
  const l = line.toLowerCase();
  if (/\b(error|err:|fatal|exception|failed|failure|traceback|panic|abort)\b/.test(l)) return "error";
  if (/\b(warn(?:ing)?|deprecated|attention)\b/.test(l)) return "warn";
  if (/\b(success(?:fully)?|done|completed?|finished|passed|built|deployed|ready)\b/.test(l)) return "success";
  if (/^(?:step\s*\d|\[\d+\/\d+\]|---|\+\+\+|={3,}|>>\s|►)/.test(line.trim())) return "step";
  if (/^\s*\$\s/.test(line) || /^(?:run(?:ning)?|exec(?:uting)?)\s/i.test(line.trim())) return "cmd";
  return "default";
}

const LOG_COLORS_DARK: Record<LogLevel, string> = {
  error:   "text-red-400 bg-red-500/[0.07]",
  warn:    "text-amber-400 bg-amber-500/[0.07]",
  success: "text-emerald-400",
  step:    "text-sky-400 font-semibold",
  cmd:     "text-violet-400",
  muted:   "text-gray-700",
  default: "text-gray-300",
};

const LOG_COLORS_LIGHT: Record<LogLevel, string> = {
  error:   "text-red-700 bg-red-50",
  warn:    "text-amber-700 bg-amber-50",
  success: "text-emerald-700",
  step:    "text-sky-700 font-semibold",
  cmd:     "text-violet-700",
  muted:   "text-gray-400",
  default: "text-gray-200",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const DeploymentSection: React.FC<Props> = ({
  theme = "dark",
  projectId,
  isOwner = false,
  webhookUrl: initialWebhookUrl,
  deployPublicKey: initialPublicKey,
  initialDeployments = [],
}) => {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>(initialDeployments);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [publicKey, setPublicKey] = useState(initialPublicKey ?? "");
  const [confirmDeploy, setConfirmDeploy] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingLogsFor, setViewingLogsFor] = useState<string | null>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [logsConnected, setLogsConnected] = useState(false);

  // Step 1 — Create App
  const [provisioning, setProvisioning] = useState(false);
  const [provisionMsg, setProvisionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Step 2 — Configure Git
  const [configuringGit, setConfiguringGit] = useState(false);
  const [gitBranch, setGitBranch] = useState("");
  const [gitBuildPath, setGitBuildPath] = useState("/");
  const [gitWatchPaths, setGitWatchPaths] = useState("");
  const [gitSubmodules, setGitSubmodules] = useState(false);
  const [gitMsg, setGitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Copy states
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Log scroll ref
  const logScrollRef = useRef<HTMLDivElement>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"deployments" | "domain" | "environment">("deployments");

  // Domain state
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const [generatingHost, setGeneratingHost] = useState(false);
  const [newHost, setNewHost] = useState("");
  const [newHttps, setNewHttps] = useState(true);
  const [newCertType, setNewCertType] = useState("letsencrypt");
  const [newPort, setNewPort] = useState("");
  const [newPath, setNewPath] = useState("");
  const [domainMsg, setDomainMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [creatingDomain, setCreatingDomain] = useState(false);

  // Environment state
  const [envContent, setEnvContent] = useState("");
  const [buildArgsContent, setBuildArgsContent] = useState("");
  const [createEnvFile, setCreateEnvFile] = useState(true);
  const [envLoaded, setEnvLoaded] = useState(false);
  const [envSaving, setEnvSaving] = useState(false);
  const [envMsg, setEnvMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dk = theme === "dark";

  // Derived step flags
  const isProvisioned = !!webhookUrl;
  const isGitConfigured = !!publicKey;

  const loadDeployments = useCallback(async () => {
    try {
      const res = await getDeployments(projectId);
      setDeployments(res.data ?? []);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    loadDeployments();
    const interval = setInterval(loadDeployments, 5000);
    return () => clearInterval(interval);
  }, [loadDeployments]);

  const loadDomains = useCallback(async () => {
    try {
      const res = await getDomains(projectId);
      setDomains(res.data ?? []);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "domain") loadDomains();
  }, [activeTab, loadDomains]);

  const loadEnvironment = useCallback(async () => {
    try {
      const res = await getEnvironment(projectId);
      setEnvContent(res.data.env ?? "");
      setBuildArgsContent(res.data.buildArgs ?? "");
      setCreateEnvFile(res.data.createEnvFile ?? true);
      setEnvLoaded(true);
    } catch { /* silent */ }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "environment" && !envLoaded) loadEnvironment();
  }, [activeTab, envLoaded, loadEnvironment]);

  useEffect(() => {
    if (!viewingLogsFor) return;
    setLogLines([]);
    setLogsConnected(true);
    const es = new EventSource(getDeploymentLogsUrl(projectId, viewingLogsFor), { withCredentials: true });
    es.onmessage = (e) => setLogLines((prev) => [...prev, e.data]);
    es.onerror = () => { setLogsConnected(false); es.close(); };
    return () => { es.close(); setLogsConnected(false); };
  }, [viewingLogsFor, projectId]);

  useEffect(() => {
    const el = logScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logLines]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeployments();
    setRefreshing(false);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployMsg(null);
    setConfirmDeploy(false);
    try {
      await triggerDeploy(projectId, {});
      setDeployMsg({ ok: true, text: "Deployment triggered!" });
      await loadDeployments();
    } catch (err: any) {
      setDeployMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Deployment failed." });
    } finally {
      setDeploying(false);
    }
  };

  // Step 1: Create App
  const handleProvision = async () => {
    setProvisioning(true);
    setProvisionMsg(null);
    try {
      const res = await provisionDeployment(projectId);
      const url = res.data.webhookUrl ?? "";
      if (url) setWebhookUrl(url);
      setProvisionMsg({ ok: true, text: "App created! Now configure Git with SSH below." });
    } catch (err: any) {
      setProvisionMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Provisioning failed." });
    } finally {
      setProvisioning(false);
    }
  };

  // Step 2: Configure Git
  const handleConfigureGit = async (reuseExistingKey: boolean) => {
    setConfiguringGit(true);
    setGitMsg(null);
    try {
      const parsedWatchPaths = gitWatchPaths
        .split(/[\n,]+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const res = await configureGit(projectId, {
        branch: gitBranch.trim() || undefined,
        buildPath: gitBuildPath.trim() || "/",
        watchPaths: parsedWatchPaths,
        enableSubmodules: gitSubmodules,
        reuseExistingKey,
      });
      setPublicKey(res.data.publicKey ?? "");
      setGitMsg({
        ok: true,
        text: reuseExistingKey
          ? "Git provider updated with existing SSH key."
          : "New SSH key generated and git provider configured. Add the public key to your GitHub repo, then deploy.",
      });
    } catch (err: any) {
      setGitMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Configuration failed." });
    } finally {
      setConfiguringGit(false);
    }
  };

  const handleCopy = () => {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKey = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateHost = async () => {
    setGeneratingHost(true);
    setDomainMsg(null);
    try {
      const res = await generateDomainHost(projectId);
      setNewHost(res.data ?? "");
    } catch (err: any) {
      setDomainMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Failed to generate hostname." });
    } finally {
      setGeneratingHost(false);
    }
  };

  const handleCreateDomain = async () => {
    if (!newHost.trim()) { setDomainMsg({ ok: false, text: "Host is required." }); return; }
    setCreatingDomain(true);
    setDomainMsg(null);
    try {
      await createDomain(projectId, {
        host: newHost.trim(),
        https: newHttps,
        certificateType: newCertType,
        port: newPort ? parseInt(newPort, 10) : null,
        path: newPath.trim() || null,
      });
      setDomainMsg({ ok: true, text: `Domain ${newHost.trim()} created!` });
      setNewHost("");
      setNewPort("");
      setNewPath("");
      await loadDomains();
    } catch (err: any) {
      setDomainMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Failed to create domain." });
    } finally {
      setCreatingDomain(false);
    }
  };


  const handleSaveEnvironment = async () => {
    setEnvSaving(true);
    setEnvMsg(null);
    try {
      await saveEnvironment(projectId, {
        env: envContent,
        buildArgs: buildArgsContent,
        createEnvFile,
      });
      setEnvMsg({ ok: true, text: "Environment variables saved. Redeploy to apply changes." });
    } catch (err: any) {
      setEnvMsg({ ok: false, text: err?.response?.data?.message ?? err?.message ?? "Save failed." });
    } finally {
      setEnvSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${dk ? "text-white" : "text-gray-900"}`}>Deployments</h2>
            <p className={`text-sm mt-0.5 ${dk ? "text-gray-400" : "text-gray-500"}`}>
              {deployments.length === 0 ? "No deployments yet" : `${deployments.length} deployment${deployments.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "deployments" && (
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-all ${
                  dk ? "text-gray-400 hover:text-white hover:bg-white/10 border-white/8" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
                }`}
              >
                <FaSync className={refreshing ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            {/* Step 1: Create App — only shown if not yet provisioned */}
            {isOwner && !isProvisioned && (
              <button
                onClick={handleProvision}
                disabled={provisioning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-60 ${
                  dk
                    ? "bg-white/8 text-gray-300 hover:bg-white/12 border-white/10"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
                }`}
              >
                {provisioning ? <FaSpinner className="animate-spin" /> : <FaCog />}
                <span>{provisioning ? "Creating…" : "Create App"}</span>
              </button>
            )}

            {/* Step 3: Deploy — only shown after git is configured */}
            {isOwner && isProvisioned && isGitConfigured && (
              confirmDeploy ? (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${dk ? "text-amber-400" : "text-amber-600"}`}>
                    <FaExclamationTriangle className="inline mr-1.5 mb-0.5" />Confirm deploy?
                  </span>
                  <button
                    onClick={handleDeploy}
                    disabled={deploying}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                      dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {deploying ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeploy(false)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      dk ? "text-gray-400 hover:text-white border-white/10 hover:bg-white/8" : "text-gray-500 hover:text-gray-800 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setConfirmDeploy(true); setDeployMsg(null); }}
                  disabled={deploying}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:opacity-60 ${
                    dk
                      ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b] shadow-[#13ff8c]/20"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                  }`}
                >
                  {deploying ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                  Deploy Now
                </button>
              )
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className={`flex gap-1 p-1 rounded-xl w-fit ${dk ? "bg-white/5" : "bg-gray-100"}`}>
          {([
            { id: "deployments", label: "Deployments", icon: <FaRocket className="text-[11px]" /> },
            { id: "domain",      label: "Domains",      icon: <FaGlobe  className="text-[11px]" /> },
            { id: "environment", label: "Environment",  icon: <FaCode   className="text-[11px]" /> },
          ] as const).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? dk ? "bg-white/10 text-white shadow" : "bg-white text-gray-900 shadow-sm"
                  : dk ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ── Deployments tab ────────────────────────────────────────────────── */}
        {activeTab === "deployments" && <>

        {/* Deploy feedback */}
        {deployMsg && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
            deployMsg.ok
              ? dk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
              : dk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {deployMsg.ok ? <FaCheckCircle className="shrink-0" /> : <FaTimesCircle className="shrink-0" />}
            {deployMsg.text}
          </div>
        )}

        {/* Step 1 feedback */}
        {provisionMsg && (
          <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm border ${
            provisionMsg.ok
              ? dk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
              : dk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {provisionMsg.ok ? <FaCheckCircle className="mt-0.5 shrink-0" /> : <FaTimesCircle className="mt-0.5 shrink-0" />}
            {provisionMsg.text}
          </div>
        )}

        {/* Step 2: Configure Git with SSH — shown after app is provisioned */}
        {isOwner && isProvisioned && (
          <div className={`rounded-2xl border p-5 space-y-4 ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2">
              <FaKey className={`text-sm ${dk ? "text-[#13ff8c]" : "text-emerald-600"}`} />
              <span className={`text-sm font-semibold ${dk ? "text-white" : "text-gray-900"}`}>
                {isGitConfigured ? "Reconfigure Git (SSH)" : "Step 2 — Configure Git with SSH"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Branch */}
              <div className="relative">
                <FaCodeBranch className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dk ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Branch (default: main)"
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                    dk
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                  }`}
                />
              </div>

              {/* Build path */}
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono ${dk ? "text-gray-500" : "text-gray-400"}`}>/</span>
                <input
                  type="text"
                  placeholder="Build path (default: /)"
                  value={gitBuildPath}
                  onChange={(e) => setGitBuildPath(e.target.value)}
                  className={`w-full pl-6 pr-4 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors ${
                    dk
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                  }`}
                />
              </div>
            </div>

            {/* Watch paths */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${dk ? "text-gray-400" : "text-gray-600"}`}>
                Watch paths <span className={`font-normal ${dk ? "text-gray-600" : "text-gray-400"}`}>(optional — one per line or comma-separated)</span>
              </label>
              <textarea
                rows={2}
                placeholder={"src/\npackage.json"}
                value={gitWatchPaths}
                onChange={(e) => setGitWatchPaths(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors resize-none ${
                  dk
                    ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                }`}
              />
            </div>

            {/* Submodules + action buttons row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className={`flex items-center gap-2.5 cursor-pointer select-none text-sm ${dk ? "text-gray-300" : "text-gray-700"}`}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gitSubmodules}
                  onClick={() => setGitSubmodules((v) => !v)}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                    gitSubmodules
                      ? dk ? "bg-[#13ff8c]" : "bg-emerald-500"
                      : dk ? "bg-white/15" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      gitSubmodules ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                Enable submodules
              </label>

              <div className="flex items-center gap-2">
                {/* Save with existing key — only shown when a key is already stored */}
                {publicKey && (
                  <button
                    onClick={() => handleConfigureGit(true)}
                    disabled={configuringGit}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 border ${
                      dk
                        ? "bg-[#13ff8c]/15 text-[#13ff8c] hover:bg-[#13ff8c]/25 border-[#13ff8c]/30"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                    }`}
                  >
                    {configuringGit ? <FaSpinner className="animate-spin" /> : <FaCog />}
                    Save Config
                  </button>
                )}

                {/* Generate new key */}
                <button
                  onClick={() => handleConfigureGit(false)}
                  disabled={configuringGit}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 border ${
                    dk
                      ? "bg-white/8 text-gray-200 hover:bg-white/15 border-white/10"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {configuringGit ? <FaSpinner className="animate-spin" /> : <FaKey />}
                  {publicKey ? "Regenerate Key" : "Generate SSH Key"}
                </button>
              </div>
            </div>

            {gitMsg && (
              <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm border ${
                gitMsg.ok
                  ? dk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : dk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {gitMsg.ok ? <FaCheckCircle className="mt-0.5 shrink-0" /> : <FaTimesCircle className="mt-0.5 shrink-0" />}
                {gitMsg.text}
              </div>
            )}

            {/* Public key display */}
            {publicKey && (
              <div className="space-y-2">
                <p className={`text-xs font-medium ${dk ? "text-gray-300" : "text-gray-700"}`}>
                  Deploy Public Key — add this to your GitHub repo as a deploy key:
                </p>
                <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${dk ? "bg-black/30 border-white/8" : "bg-white border-gray-200"}`}>
                  <span className={`flex-1 text-xs font-mono break-all leading-relaxed ${dk ? "text-gray-300" : "text-gray-700"}`}>
                    {publicKey}
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all mt-0.5 ${
                      copiedKey
                        ? dk ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                        : dk ? "bg-white/8 text-gray-400 hover:text-white hover:bg-white/15" : "bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {copiedKey ? <FaCheckCircle /> : <FaCopy />}
                    {copiedKey ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className={`text-xs ${dk ? "text-gray-600" : "text-gray-400"}`}>
                  GitHub repo → Settings → Deploy keys → Add deploy key → paste above. Enable <strong>Allow write access</strong>.
                </p>
              </div>
            )}

            {/* Webhook URL */}
            {webhookUrl && (
              <div className={`rounded-xl border p-4 space-y-2 ${dk ? "bg-black/20 border-white/6" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  <FaLink className={`text-xs ${dk ? "text-[#13ff8c]" : "text-emerald-600"}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${dk ? "text-gray-300" : "text-gray-700"}`}>
                    GitHub Webhook URL
                  </span>
                </div>
                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${dk ? "bg-black/30 border-white/8" : "bg-gray-50 border-gray-200"}`}>
                  <span className={`flex-1 text-xs font-mono truncate ${dk ? "text-gray-300" : "text-gray-700"}`}>
                    {webhookUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                      copied
                        ? dk ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                        : dk ? "bg-white/8 text-gray-400 hover:text-white hover:bg-white/15" : "bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {copied ? <FaCheckCircle /> : <FaCopy />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className={`text-xs ${dk ? "text-gray-600" : "text-gray-400"}`}>
                  GitHub repo → Settings → Webhooks → Payload URL. Content type: <code className="font-mono">application/json</code>. This URL is also auto-registered on first provision.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Deployment list */}
        <div className={`rounded-2xl border overflow-hidden ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
          {deployments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className={`flex items-center justify-center w-14 h-14 rounded-2xl text-2xl ${dk ? "bg-white/5 text-gray-500" : "bg-gray-50 text-gray-300"}`}>
                <FaRocket />
              </span>
              <p className={`text-sm font-medium ${dk ? "text-gray-400" : "text-gray-500"}`}>No deployments yet</p>
              {isOwner && isProvisioned && isGitConfigured && (
                <button
                  onClick={() => { setConfirmDeploy(true); setDeployMsg(null); }}
                  className={`mt-1 text-sm font-semibold ${dk ? "text-[#13ff8c] hover:text-[#19fb9b]" : "text-emerald-600 hover:text-emerald-700"}`}
                >
                  Deploy Now →
                </button>
              )}
            </div>
          ) : (
            <ul>
              {deployments.map((d, i) => {
                const rawStatus = (d.status ?? "").toLowerCase();
                const uiStatus = rawStatus === "done" ? "SUCCESSFUL"
                  : rawStatus === "error" ? "FAILED"
                  : rawStatus === "running" || rawStatus === "building" ? "BUILDING"
                  : rawStatus.toUpperCase();
                const isActive = rawStatus === "running" || rawStatus === "building";
                const statusBg = dk ? STATUS_BG_DARK[uiStatus] ?? STATUS_BG_DARK.CANCELLED
                                    : STATUS_BG_LIGHT[uiStatus] ?? STATUS_BG_LIGHT.CANCELLED;
                const dot = STATUS_DOT[uiStatus] ?? "bg-gray-400";
                const isViewingLogs = viewingLogsFor === d.deploymentId;
                const commitMatch = d.description?.match(/[0-9a-f]{7,40}/i);

                return (
                  <li key={d.deploymentId} className={i !== deployments.length - 1 ? (dk ? "border-b border-white/5" : "border-b border-gray-100") : ""}>
                    {/* Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`relative flex shrink-0 w-2.5 h-2.5 rounded-full ${dot}`}>
                          {isActive && <span className={`absolute inset-0 rounded-full animate-ping ${dot} opacity-75`} />}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${dk ? "text-white" : "text-gray-900"}`}>
                            {d.title ?? d.deploymentId}
                          </p>
                          <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-0.5 ${dk ? "text-gray-500" : "text-gray-400"}`}>
                            {commitMatch && (
                              <span className={`font-mono px-1 rounded ${dk ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
                                {commitMatch[0].substring(0, 7)}
                              </span>
                            )}
                            <span>{formatDate(d.startedAt)}</span>
                            {d.finishedAt
                              ? <span className={dk ? "text-gray-600" : "text-gray-300"}>· {duration(d.startedAt, d.finishedAt)}</span>
                              : isActive && <span className={dk ? "text-amber-500" : "text-amber-600"}>· {duration(d.startedAt)} elapsed</span>
                            }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusBg}`}>
                          {isActive && <FaSpinner className="animate-spin text-[10px]" />}
                          {uiStatus}
                        </span>
                        {d.logPath && (
                          <button
                            onClick={() => { setViewingLogsFor(isViewingLogs ? null : d.deploymentId); }}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              isViewingLogs
                                ? dk ? "bg-[#13ff8c]/15 text-[#13ff8c] border-[#13ff8c]/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : dk ? "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/12" : "bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            <FaTerminal className="text-[10px]" />
                            {isViewingLogs ? "Hide Logs" : "View Logs"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Log panel */}
                    {isViewingLogs && (() => {
                      const errCount = logLines.filter(l => classifyLine(l) === "error").length;
                      const warnCount = logLines.filter(l => classifyLine(l) === "warn").length;
                      const okCount = logLines.filter(l => classifyLine(l) === "success").length;
                      const logColors = dk ? LOG_COLORS_DARK : LOG_COLORS_LIGHT;
                      return (
                        <div className={`${dk ? "border-t border-white/5" : "border-t border-gray-100"}`}>
                          {/* Toolbar */}
                          <div className={`flex items-center justify-between px-6 py-2 text-xs ${dk ? "bg-black/20" : "bg-gray-50"}`}>
                            <div className="flex items-center gap-3">
                              {/* Live/done status */}
                              <span className="flex items-center gap-1.5 font-mono">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${logsConnected ? (dk ? "bg-[#13ff8c] shadow-[0_0_4px_#13ff8c]" : "bg-emerald-500") : "bg-gray-400"}`} />
                                <span className={dk ? "text-gray-500" : "text-gray-400"}>{logsConnected ? "Live" : "Done"}</span>
                              </span>
                              {/* Counts */}
                              {errCount > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-red-400">
                                  <FaTimesCircle className="text-[10px]" />{errCount} error{errCount !== 1 ? "s" : ""}
                                </span>
                              )}
                              {warnCount > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-amber-400">
                                  <FaExclamationTriangle className="text-[10px]" />{warnCount} warn{warnCount !== 1 ? "s" : ""}
                                </span>
                              )}
                              {okCount > 0 && (
                                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                                  <FaCheckCircle className="text-[10px]" />{okCount} ok
                                </span>
                              )}
                              <span className={`font-mono ${dk ? "text-gray-600" : "text-gray-400"}`}>{logLines.length} lines</span>
                            </div>
                            {/* Copy all */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(logLines.join("\n"));
                                setCopiedLogs(true);
                                setTimeout(() => setCopiedLogs(false), 2000);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                                copiedLogs
                                  ? dk ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                                  : dk ? "bg-white/6 text-gray-400 hover:text-white hover:bg-white/12" : "bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200"
                              }`}
                            >
                              {copiedLogs ? <FaCheckCircle className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                              {copiedLogs ? "Copied!" : "Copy all"}
                            </button>
                          </div>

                          {/* Lines */}
                          <div
                            ref={logScrollRef}
                            className={`h-80 overflow-y-auto text-xs font-mono leading-[1.6] px-0 ${dk ? "bg-[#090f0b]" : "bg-gray-950"}`}
                          >
                            {logLines.length === 0 ? (
                              <p className={`px-6 py-4 ${dk ? "text-gray-600" : "text-gray-500"}`}>Waiting for logs…</p>
                            ) : (
                              logLines.map((line, idx) => {
                                const level = classifyLine(line);
                                const color = logColors[level];
                                const isErr = level === "error";
                                const isWarn = level === "warn";
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start group ${color} ${(isErr || isWarn) ? "w-full" : ""}`}
                                  >
                                    {/* Line number */}
                                    <span className={`shrink-0 w-10 text-right pr-3 pt-px select-none ${dk ? "text-gray-700 group-hover:text-gray-500" : "text-gray-700 group-hover:text-gray-500"}`} style={{ lineHeight: "inherit" }}>
                                      {idx + 1}
                                    </span>
                                    {/* Level indicator strip */}
                                    <span className={`shrink-0 w-0.5 self-stretch mr-3 rounded-full ${
                                      isErr ? "bg-red-500" : isWarn ? "bg-amber-500" : level === "success" ? "bg-emerald-500/40" : level === "step" ? "bg-sky-500/40" : "transparent"
                                    }`} />
                                    {/* Text */}
                                    <span className="flex-1 whitespace-pre-wrap break-all py-px pr-4">{line}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        </> /* end deployments tab */}

        {/* ── Domain tab ─────────────────────────────────────────────────────── */}
        {activeTab === "domain" && (
          <div className="space-y-4">
            {/* Domain list */}
            <div className={`rounded-2xl border overflow-hidden ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className={`flex items-center justify-between px-5 py-3 border-b ${dk ? "border-white/5" : "border-gray-100"}`}>
                <span className={`text-sm font-semibold flex items-center gap-2 ${dk ? "text-white" : "text-gray-900"}`}>
                  <FaGlobe className={dk ? "text-[#13ff8c]" : "text-emerald-600"} />
                  Active Domains
                </span>
                <button
                  onClick={loadDomains}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    dk ? "text-gray-400 hover:text-white hover:bg-white/10 border-white/8" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <FaSync className={domainLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {domains.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <FaGlobe className={`text-2xl ${dk ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-sm ${dk ? "text-gray-500" : "text-gray-400"}`}>No domains configured</p>
                </div>
              ) : (
                <ul>
                  {domains.map((d, i) => (
                    <li
                      key={d.domainId}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 ${
                        i !== domains.length - 1 ? (dk ? "border-b border-white/5" : "border-b border-gray-100") : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {d.https
                          ? <FaLock className={`shrink-0 text-xs ${dk ? "text-emerald-400" : "text-emerald-600"}`} />
                          : <FaGlobe className={`shrink-0 text-xs ${dk ? "text-gray-500" : "text-gray-400"}`} />}
                        <div className="min-w-0">
                          <a
                            href={`${d.https ? "https" : "http"}://${d.host}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-mono truncate block hover:underline ${dk ? "text-white" : "text-gray-900"}`}
                          >
                            {d.host}
                          </a>
                          <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-0.5 ${dk ? "text-gray-500" : "text-gray-400"}`}>
                            {d.port && <span>:{d.port}</span>}
                            {d.path && d.path !== "/" && <span>{d.path}</span>}
                            {d.certificateType && d.certificateType !== "none" && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${dk ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                                {d.certificateType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        d.https
                          ? dk ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : dk ? "bg-gray-500/15 text-gray-400 border-gray-500/30" : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {d.https ? <FaLock className="text-[9px]" /> : <FaGlobe className="text-[9px]" />}
                        {d.https ? "HTTPS" : "HTTP"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add domain form */}
            {isOwner && isProvisioned && (
              <div className={`rounded-2xl border p-5 space-y-4 ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  <FaPlus className={`text-xs ${dk ? "text-[#13ff8c]" : "text-emerald-600"}`} />
                  <span className={`text-sm font-semibold ${dk ? "text-white" : "text-gray-900"}`}>Add Domain</span>
                </div>

                {/* Host row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="hostname (e.g. myapp.example.com)"
                    value={newHost}
                    onChange={(e) => setNewHost(e.target.value)}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-mono outline-none transition-colors ${
                      dk
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                    }`}
                  />
                  <button
                    onClick={handleGenerateHost}
                    disabled={generatingHost}
                    title="Auto-generate a sslip.io hostname"
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-60 whitespace-nowrap ${
                      dk
                        ? "bg-white/8 text-gray-300 hover:bg-white/15 border-white/10"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {generatingHost ? <FaSpinner className="animate-spin" /> : <FaGlobe />}
                    Generate
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Port */}
                  <input
                    type="number"
                    placeholder="Port (e.g. 3000)"
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      dk
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                    }`}
                  />
                  {/* Path */}
                  <input
                    type="text"
                    placeholder="Path (e.g. /)"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      dk
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#13ff8c]/40"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                    }`}
                  />
                  {/* Certificate type */}
                  <select
                    value={newCertType}
                    onChange={(e) => setNewCertType(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                      dk
                        ? "bg-[#0f1a14] border-white/10 text-white focus:border-[#13ff8c]/40"
                        : "bg-white border-gray-200 text-gray-900 focus:border-emerald-400"
                    }`}
                  >
                    <option value="none">No TLS</option>
                    <option value="letsencrypt">Let&apos;s Encrypt</option>
                  </select>
                  {/* HTTPS toggle */}
                  <label className={`flex items-center gap-2 cursor-pointer select-none text-sm ${dk ? "text-gray-300" : "text-gray-700"}`}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={newHttps}
                      onClick={() => setNewHttps((v) => !v)}
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                        newHttps ? dk ? "bg-[#13ff8c]" : "bg-emerald-500" : dk ? "bg-white/15" : "bg-gray-200"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newHttps ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                    HTTPS
                  </label>
                </div>

                {domainMsg && (
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
                    domainMsg.ok
                      ? dk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : dk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
                  }`}>
                    {domainMsg.ok ? <FaCheckCircle className="shrink-0" /> : <FaTimesCircle className="shrink-0" />}
                    {domainMsg.text}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleCreateDomain}
                    disabled={creatingDomain || !newHost.trim()}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
                      dk
                        ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {creatingDomain ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                    Create Domain
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Environment tab ──────────────────────────────────────────────────── */}
        {activeTab === "environment" && (
          <div className="space-y-4">
            {/* Editor card */}
            <div className={`rounded-2xl border overflow-hidden ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              {/* Header bar */}
              <div className={`flex items-center justify-between px-5 py-3 border-b ${dk ? "border-white/5 bg-black/20" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  <FaCode className={`text-xs ${dk ? "text-[#13ff8c]" : "text-emerald-600"}`} />
                  <span className={`text-sm font-semibold ${dk ? "text-white" : "text-gray-900"}`}>Environment Variables</span>
                  <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>· one per line, KEY=VALUE</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadEnvironment}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      dk ? "text-gray-400 hover:text-white hover:bg-white/10 border-white/8" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <FaSync />
                    Reload
                  </button>
                  {isOwner && isProvisioned && (
                    <button
                      onClick={handleSaveEnvironment}
                      disabled={envSaving}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60 ${
                        dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-500 text-white hover:bg-emerald-600"
                      }`}
                    >
                      {envSaving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* Main env textarea */}
              <div className="relative">
                {/* Line numbers */}
                <div
                  aria-hidden
                  className={`absolute left-0 top-0 bottom-0 w-10 flex flex-col items-end pt-3 pr-2 text-xs font-mono select-none pointer-events-none overflow-hidden ${dk ? "text-gray-700" : "text-gray-400"}`}
                  style={{ lineHeight: "1.6rem" }}
                >
                  {(envContent + "\n").split("\n").map((_, i) => (
                    <span key={i} style={{ lineHeight: "1.6rem" }}>{i + 1}</span>
                  ))}
                </div>
                <textarea
                  spellCheck={false}
                  value={envContent}
                  onChange={(e) => setEnvContent(e.target.value)}
                  placeholder={"PORT=3000\nNODE_ENV=production\nDATABASE_URL=postgres://..."}
                  rows={Math.max(8, envContent.split("\n").length + 2)}
                  className={`w-full pl-12 pr-4 py-3 text-xs font-mono leading-[1.6rem] outline-none resize-none border-0 ${
                    dk
                      ? "bg-transparent text-gray-200 placeholder-gray-700 caret-[#13ff8c]"
                      : "bg-transparent text-gray-800 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Footer options */}
              <div className={`flex flex-wrap items-center gap-4 px-5 py-3 border-t ${dk ? "border-white/5 bg-black/10" : "border-gray-100 bg-gray-50"}`}>
                {/* createEnvFile toggle */}
                <label className={`flex items-center gap-2 cursor-pointer select-none text-sm ${dk ? "text-gray-300" : "text-gray-700"}`}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={createEnvFile}
                    onClick={() => setCreateEnvFile((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                      createEnvFile ? dk ? "bg-[#13ff8c]" : "bg-emerald-500" : dk ? "bg-white/15" : "bg-gray-200"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${createEnvFile ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                  Create <code className={`text-[11px] px-1 rounded ${dk ? "bg-white/8 text-gray-300" : "bg-gray-100 text-gray-700"}`}>.env</code> file in container
                </label>

                {/* Line / char count */}
                <span className={`ml-auto text-xs font-mono ${dk ? "text-gray-600" : "text-gray-400"}`}>
                  {envContent.split("\n").filter(Boolean).length} vars · {envContent.length} chars
                </span>
              </div>
            </div>

            {/* Build Args card */}
            <div className={`rounded-2xl border overflow-hidden ${dk ? "bg-[#0f1a14]/60 border-white/8" : "bg-white border-gray-200 shadow-sm"}`}>
              <div className={`flex items-center gap-2 px-5 py-3 border-b ${dk ? "border-white/5 bg-black/20" : "border-gray-100 bg-gray-50"}`}>
                <span className={`text-sm font-semibold ${dk ? "text-white" : "text-gray-900"}`}>Build Args</span>
                <span className={`text-xs ${dk ? "text-gray-500" : "text-gray-400"}`}>· passed to Docker build as --build-arg</span>
              </div>
              <textarea
                spellCheck={false}
                value={buildArgsContent}
                onChange={(e) => setBuildArgsContent(e.target.value)}
                placeholder={"NPM_TOKEN=...\nNODE_VERSION=20"}
                rows={4}
                className={`w-full px-5 py-3 text-xs font-mono leading-[1.6rem] outline-none resize-none border-0 ${
                  dk
                    ? "bg-transparent text-gray-200 placeholder-gray-700 caret-[#13ff8c]"
                    : "bg-transparent text-gray-800 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Feedback */}
            {envMsg && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
                envMsg.ok
                  ? dk ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : dk ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {envMsg.ok ? <FaCheckCircle className="shrink-0" /> : <FaTimesCircle className="shrink-0" />}
                {envMsg.text}
              </div>
            )}

            {!isProvisioned && (
              <p className={`text-sm text-center py-4 ${dk ? "text-gray-500" : "text-gray-400"}`}>
                Create an app first (Deployments tab → Create App) before setting environment variables.
              </p>
            )}
          </div>
        )}

      </div>
    </>
  );
};
