"use client";

import React, {
  useEffect, useRef, useState, useCallback, useMemo,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/lib/auth-context";
import { projectApi } from "@/lib/project-service";
import {
  FaPlay, FaTerminal, FaFile, FaFolder, FaFolderOpen,
  FaCircle, FaPlus, FaChevronRight, FaChevronDown, FaSpinner, FaUsers,
  FaCodeBranch, FaCheck, FaTimes,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

// ── cursor palette ────────────────────────────────────────────────────────────
const CURSOR_COLORS = [
  "#f78166", "#79c0ff", "#56d364", "#d2a8ff",
  "#ffa657", "#76e3ea", "#e3b341", "#ff7b72",
];

function getCursorColor(uid: string): string {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = uid.charCodeAt(i) + ((h << 5) - h);
  return CURSOR_COLORS[Math.abs(h) % CURSOR_COLORS.length];
}

function isLightHex(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

// module-level style injection (shared across mounts)
const _injectedCursorStyles = new Set<string>();
function injectCursorStyle(safeUid: string, color: string) {
  if (_injectedCursorStyles.has(safeUid)) return;
  _injectedCursorStyles.add(safeUid);
  const s = document.createElement("style");
  s.id = `rc-style-${safeUid}`;
  s.textContent = `
    .rc-${safeUid}{border-left:2.5px solid ${color}!important;margin-left:-1px;}
    .rc-widget-${safeUid}{
      background:${color};
      color:${isLightHex(color) ? "#000" : "#fff"};
      font-size:11px;font-weight:600;
      font-family:'JetBrains Mono','Fira Code',monospace;
      padding:0 6px 1px;border-radius:0 3px 3px 3px;
      white-space:nowrap;pointer-events:none;user-select:none;
      line-height:18px;opacity:.92;
    }`;
  document.head.appendChild(s);
}

// ── types ─────────────────────────────────────────────────────────────────────
interface FileEntry {
  path: string; type: "blob" | "tree";
  name: string; parentPath: string; depth: number;
}
interface ConnectedUser {
  userId: string; userName: string; userAvatar: string;
}
interface RemoteCursor {
  name: string; filename: string; line: number; column: number; color: string;
}
type BootState = "idle" | "booting" | "cloning" | "ready" | "error";

// ── helpers ───────────────────────────────────────────────────────────────────
const FILE_LANG: Record<string, string> = {
  js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",
  json:"json",css:"css",html:"html",py:"python",md:"markdown",
  sh:"shell",yml:"yaml",yaml:"yaml",xml:"xml",java:"java",go:"go",rs:"rust",
};

const PISTON_RUNTIMES: Record<string, { language: string; version: string }> = {
  py:   { language: "python", version: "3.10.0" },
  java: { language: "java",   version: "15.0.2" },
};
function langOf(n: string) { return FILE_LANG[n.split(".").pop()??""]??"plaintext"; }
function parseGithubUrl(url: string) {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (m) return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
  const s = url.match(/^([^/]+)\/([^/]+)$/);
  if (s) return { owner: s[1], repo: s[2] };
  return null;
}
function isText(path: string) {
  const bin = new Set(["png","jpg","jpeg","gif","svg","ico","webp","bmp","tiff",
    "ttf","woff","woff2","eot","otf","mp3","mp4","wav","zip","tar","gz","pdf",
    "exe","dll","so","bin","lock"]);
  return !bin.has(path.split(".").pop()?.toLowerCase()??"");
}
function safeCss(uid: string) { return uid.replace(/[^a-zA-Z0-9]/g, "_"); }

// ── WebContainer singleton ────────────────────────────────────────────────────
let wcInstance: any = null;
let wcBooting = false;
let wcCbs: Array<(wc: any) => void> = [];
async function getWebContainer(): Promise<any> {
  if (wcInstance) return wcInstance;
  if (wcBooting) return new Promise((r) => wcCbs.push(r));
  wcBooting = true;
  const { WebContainer } = await import("@webcontainer/api");
  wcInstance = await WebContainer.boot();
  wcCbs.forEach((cb) => cb(wcInstance)); wcCbs = []; wcBooting = false;
  return wcInstance;
}

// ── File tree UI ──────────────────────────────────────────────────────────────
function FileTree({ entries, activeFile, loadedFiles, remoteCursors, onSelect, theme }: {
  entries: FileEntry[]; activeFile: string; loadedFiles: Set<string>;
  remoteCursors: Record<string, RemoteCursor>;
  onSelect: (p: string) => void; theme: "light" | "dark";
}) {
  const dk = theme === "dark";
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (p: string) => setOpen((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const topLevel = entries.filter((e) => e.depth === 0);

  // which files have remote cursors on them
  const cursorFiles = new Set(Object.values(remoteCursors).map((c) => c.filename));

  function renderEntry(e: FileEntry): React.ReactNode {
    const isDir = e.type === "tree";
    const isActive = e.path === activeFile;
    const isOpen = open.has(e.path);
    const hasCursor = !isDir && cursorFiles.has(e.path);
    const children = isDir ? entries.filter((c) => c.parentPath === e.path && c.depth === e.depth + 1) : [];
    const userOnFile = !isDir && Object.entries(remoteCursors).find(([, c]) => c.filename === e.path);

    return (
      <div key={e.path}>
        <button type="button" onClick={() => isDir ? toggle(e.path) : onSelect(e.path)}
          style={{ paddingLeft: `${8 + e.depth * 12}px` }}
          className={`flex items-center gap-1.5 w-full text-left py-1 pr-2 rounded text-xs transition-all ${
            isActive
              ? dk ? "bg-[#13ff8c]/15 text-[#13ff8c]" : "bg-emerald-100 text-emerald-800"
              : dk ? "text-gray-400 hover:bg-white/5 hover:text-gray-200" : "text-gray-600 hover:bg-gray-100"
          }`}>
          {isDir ? (
            <>
              {isOpen ? <FaChevronDown className="text-[9px] shrink-0 opacity-60" /> : <FaChevronRight className="text-[9px] shrink-0 opacity-60" />}
              {isOpen ? <FaFolderOpen className="text-yellow-400/80 shrink-0 text-[11px]" /> : <FaFolder className="text-yellow-400/60 shrink-0 text-[11px]" />}
            </>
          ) : (
            <>
              <span className="w-3" />
              <FaFile className={`text-[9px] shrink-0 ${loadedFiles.has(e.path) ? dk ? "text-[#13ff8c]/60" : "text-emerald-500" : "opacity-30"}`} />
            </>
          )}
          <span className="truncate flex-1">{e.name}</span>
          {/* cursor indicator dots for users on this file */}
          {hasCursor && userOnFile && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: userOnFile[1].color }} />
          )}
        </button>
        {isDir && isOpen && children.map(renderEntry)}
      </div>
    );
  }
  return <div className="flex flex-col gap-0.5">{topLevel.map(renderEntry)}</div>;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function LiveCodingTab({
  theme, projectId, projectTitle, githubUrl,
}: {
  theme: "light" | "dark"; projectId: string; projectTitle: string; githubUrl: string;
}) {
  const { user } = useAuth();
  const dk = theme === "dark";

  // editor
  const [activeFile, setActiveFile] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [fileCache, setFileCache] = useState<Record<string, string>>({});
  const [loadedFiles, setLoadedFiles] = useState<Set<string>>(new Set());

  // tree
  const [treeEntries, setTreeEntries] = useState<FileEntry[]>([]);

  // boot
  const [bootState, setBootState] = useState<BootState>("idle");
  const [bootLog, setBootLog] = useState<string[]>([]);

  // collab
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const [joinToast, setJoinToast] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // new file
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // npm scripts (package.json)
  const [pkgScripts, setPkgScripts] = useState<Record<string, string>>({});
  const [showScriptMenu, setShowScriptMenu] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // commit & push
  const [modifiedFiles, setModifiedFiles] = useState<Set<string>>(new Set());
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [commitBranch, setCommitBranch] = useState("");
  const [selectedCommitFiles, setSelectedCommitFiles] = useState<Set<string>>(new Set());
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitResult, setCommitResult] = useState<{ ok: boolean; msg: string; url?: string } | null>(null);

  // refs
  const wcRef = useRef<any>(null);
  const termDivRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const shellInputRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const stompRef = useRef<Client | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorCollRef = useRef<Map<string, any>>(new Map());
  const widgetMapRef = useRef<Map<string, any>>(new Map());
  const isRemoteChange = useRef(false);
  const sendCodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendCursorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // boot guards
  const bootStartedRef = useRef(false);
  const wcReadyRef = useRef(false);
  const cloneStartedRef = useRef(false);
  const githubUrlRef = useRef(githubUrl);

  const userId = String(user?.userID ?? "anon-" + Math.random().toString(36).slice(2, 8));
  const userName = (user as any)?.name || (user as any)?.email || "Anonymous";
  const userAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;
  const myColor = getCursorColor(userId);

  const log = useCallback((msg: string) => setBootLog((p) => [...p, msg]), []);

  // ── cursor decorations ───────────────────────────────────────────────────────

  const applyRemoteCursors = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // clear all existing
    decorCollRef.current.forEach((coll) => coll.clear());
    decorCollRef.current.clear();
    widgetMapRef.current.forEach((w) => editor.removeContentWidget(w));
    widgetMapRef.current.clear();

    // apply cursors for users currently on this file
    Object.entries(remoteCursors).forEach(([uid, cursor]) => {
      if (cursor.filename !== activeFile) return;
      const sid = safeCss(uid);
      injectCursorStyle(sid, cursor.color);

      // decoration (cursor line)
      try {
        const coll = editor.createDecorationsCollection([{
          range: new monaco.Range(cursor.line, cursor.column, cursor.line, cursor.column),
          options: {
            className: `rc-${sid}`,
            stickiness: 1,
          },
        }]);
        decorCollRef.current.set(uid, coll);
      } catch {}

      // content widget (name label)
      const domNode = document.createElement("div");
      domNode.className = `rc-widget-${sid}`;
      domNode.textContent = cursor.name.length > 14 ? cursor.name.slice(0, 12) + "…" : cursor.name;
      const widget = {
        getId: () => `rcw-${uid}`,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: { lineNumber: cursor.line, column: cursor.column },
          preference: [
            monaco.editor.ContentWidgetPositionPreference.ABOVE,
            monaco.editor.ContentWidgetPositionPreference.BELOW,
          ],
        }),
      };
      try {
        editor.addContentWidget(widget);
        widgetMapRef.current.set(uid, widget);
      } catch {}
    });
  }, [remoteCursors, activeFile]);

  useEffect(() => {
    applyRemoteCursors();
  }, [applyRemoteCursors]);

  // ── xterm ────────────────────────────────────────────────────────────────────

  const initXterm = useCallback(async (wc: any) => {
    if (!termDivRef.current || xtermRef.current) return;
    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    await import("@xterm/xterm/css/xterm.css");

    const term = new Terminal({
      convertEol: true, cursorBlink: true, fontSize: 13,
      fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
      theme: {
        background: "#0d1117", foreground: "#e6edf3", cursor: "#58a6ff",
        selectionBackground: "#264f78",
        black:"#0d1117", brightBlack:"#768390",
        red:"#ff7b72", brightRed:"#ffa198",
        green:"#3fb950", brightGreen:"#56d364",
        yellow:"#d29922", brightYellow:"#e3b341",
        blue:"#58a6ff", brightBlue:"#79c0ff",
        magenta:"#d2a8ff", brightMagenta:"#f0abff",
        cyan:"#76e3ea", brightCyan:"#b3f0ff",
        white:"#e6edf3", brightWhite:"#cdd9e5",
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(termDivRef.current);
    fit.fit();
    xtermRef.current = term;
    new ResizeObserver(() => fit.fit()).observe(termDivRef.current!);

    const shell = await wc.spawn("jsh", { terminal: { cols: term.cols, rows: term.rows } });
    shell.output.pipeTo(new WritableStream({ write: (d: string) => term.write(d) }));
    const writer = shell.input.getWriter();
    shellInputRef.current = writer;
    term.onData((d: string) => writer.write(d));
    term.writeln(`\x1b[1;32mShell ready.\x1b[0m  Project: \x1b[1m${projectTitle}\x1b[0m\n`);
  }, [projectTitle]);

  // ── clone repo ────────────────────────────────────────────────────────────────

  const cloneRepo = useCallback(async (wc: any) => {
    const url = githubUrlRef.current;
    const parsed = parseGithubUrl(url);
    if (!parsed) { log("⚠ Could not parse GitHub URL: " + url); return; }
    const { owner, repo } = parsed;

    log(`Cloning ${owner}/${repo}...`);
    xtermRef.current?.writeln(`\x1b[33mCloning \x1b[1m${owner}/${repo}\x1b[0m\x1b[33m...\x1b[0m`);
    setBootState("cloning");

    // fetch flat tree
    let entries: FileEntry[] = [];
    try {
      const res = await projectApi.get(`/api/projects/github/tree-formatted/${owner}/${repo}?format=flat`);
      const raw: any[] = Array.isArray(res.data) ? res.data : Object.values(res.data).flat();
      entries = raw.map((item: any) => ({
        path: item.path,
        type: item.type === "tree" ? "tree" : "blob",
        name: item.name || item.path.split("/").pop() || item.path,
        parentPath: item.parentPath || item.path.split("/").slice(0, -1).join("/"),
        depth: item.depth ?? item.path.split("/").length - 1,
      }));
    } catch (e: any) {
      log("✗ " + e.message);
      xtermRef.current?.writeln(`\x1b[31m✗ ${e.message}\x1b[0m`);
      return;
    }

    const textFiles = entries.filter((e) => e.type === "blob" && isText(e.path));
    log(`${textFiles.length} files found. Writing to container...`);
    xtermRef.current?.writeln(`\x1b[90m${textFiles.length} files. Writing...\x1b[0m`);
    setTreeEntries(entries);

    // create dirs
    const dirs = new Set<string>();
    textFiles.forEach((f) => {
      const parts = f.path.split("/");
      for (let i = 1; i < parts.length; i++) dirs.add("/" + parts.slice(0, i).join("/"));
    });
    for (const dir of dirs) { try { await wc.fs.mkdir(dir, { recursive: true }); } catch {} }

    // fetch & write files in batches
    let written = 0;
    const cache: Record<string, string> = {};
    for (let i = 0; i < textFiles.length; i += 8) {
      const chunk = textFiles.slice(i, i + 8);
      await Promise.all(chunk.map(async (file) => {
        try {
          const res = await projectApi.get(
            `/api/projects/github/content/${owner}/${repo}?filePath=${encodeURIComponent(file.path)}`
          );
          const content: string = typeof res.data === "string" ? res.data : res.data?.content ?? "";
          await wc.fs.writeFile("/" + file.path, content);
          cache[file.path] = content;
          written++;
        } catch {}
      }));
      xtermRef.current?.write(`\r\x1b[90mWriting... ${Math.min(written, textFiles.length)}/${textFiles.length}\x1b[0m`);
    }

    setFileCache(cache);
    setLoadedFiles(new Set(Object.keys(cache)));
    xtermRef.current?.writeln(`\r\x1b[32m✓ Cloned — ${written} files ready.\x1b[0m`);

    // open first meaningful file
    const prefer = ["index.js","index.ts","src/index.ts","src/App.tsx","app.js","main.js","main.ts"];
    const first = textFiles.find((f) => prefer.some((p) => f.path === p || f.path.endsWith("/" + p)))
      ?? textFiles.find((f) => f.path.endsWith(".md")) ?? textFiles[0];
    if (first && cache[first.path] !== undefined) {
      setActiveFile(first.path);
      setEditorContent(cache[first.path]);
    }

    log(`Ready — ${written} files.`);
    setBootState("ready");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  // ── boot ──────────────────────────────────────────────────────────────────────

  useEffect(() => { githubUrlRef.current = githubUrl; }, [githubUrl]);

  const tryCloneOnce = useCallback(() => {
    if (cloneStartedRef.current || !wcReadyRef.current || !githubUrlRef.current) return;
    cloneStartedRef.current = true;
    cloneRepo(wcRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bootStartedRef.current) return;
    bootStartedRef.current = true;
    setBootState("booting");
    log("Booting WebContainer...");
    getWebContainer().then(async (wc) => {
      wcRef.current = wc; wcReadyRef.current = true;
      log("WebContainer ready.");
      await initXterm(wc);
      log("Shell started.");
      tryCloneOnce();
    }).catch((e) => { log("✗ " + e.message); setBootState("error"); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!githubUrl) return;
    tryCloneOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubUrl]);

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new (SockJS as any)(`${WS_BASE}/ws/live-coding`),
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true);

        // code changes
        client.subscribe(`/topic/live/${projectId}/code`, (msg) => {
          const { senderId, filename, content } = JSON.parse(msg.body);
          if (senderId === userId) return;
          isRemoteChange.current = true;
          setFileCache((p) => ({ ...p, [filename]: content }));
          setActiveFile((cur) => { if (cur === filename) setEditorContent(content); return cur; });
          setTimeout(() => { isRemoteChange.current = false; }, 60);
        });

        // cursor positions
        client.subscribe(`/topic/live/${projectId}/cursor`, (msg) => {
          const { senderId, senderName, filename, line, column } = JSON.parse(msg.body);
          if (senderId === userId) return;
          const color = getCursorColor(senderId);
          setRemoteCursors((prev) => ({
            ...prev,
            [senderId]: { name: senderName, filename, line, column, color },
          }));
        });

        // presence
        client.subscribe(`/topic/live/${projectId}/presence`, (msg) => {
          const p = JSON.parse(msg.body);
          if (p.userId === userId) return;
          if (p.type === "join") {
            setConnectedUsers((prev) =>
              prev.some((u) => u.userId === p.userId) ? prev
                : [...prev, { userId: p.userId, userName: p.userName, userAvatar: p.userAvatar }]
            );
            // join toast
            setJoinToast(`${p.userName} joined`);
            setTimeout(() => setJoinToast(null), 3500);
          } else {
            setConnectedUsers((prev) => prev.filter((u) => u.userId !== p.userId));
            // remove cursor of departed user
            setRemoteCursors((prev) => {
              const n = { ...prev }; delete n[p.userId]; return n;
            });
          }
        });

        client.publish({
          destination: `/app/live/${projectId}/presence`,
          body: JSON.stringify({ userId, userName, userAvatar, type: "join", timestamp: Date.now() }),
        });
      },
      onDisconnect: () => setWsConnected(false),
    });
    client.activate();
    stompRef.current = client;
    return () => {
      if (client.connected) {
        client.publish({
          destination: `/app/live/${projectId}/presence`,
          body: JSON.stringify({ userId, userName, userAvatar, type: "leave", timestamp: Date.now() }),
        });
      }
      client.deactivate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── broadcast helpers ─────────────────────────────────────────────────────────

  const broadcastCode = useCallback((filename: string, content: string) => {
    stompRef.current?.publish({
      destination: `/app/live/${projectId}/code`,
      body: JSON.stringify({ senderId: userId, senderName: userName, senderAvatar: userAvatar, filename, content, timestamp: Date.now() }),
    });
  }, [projectId, userId, userName, userAvatar]);

  const broadcastCursor = useCallback((line: number, column: number) => {
    if (!activeFile || !stompRef.current?.connected) return;
    stompRef.current.publish({
      destination: `/app/live/${projectId}/cursor`,
      body: JSON.stringify({ senderId: userId, senderName: userName, filename: activeFile, line, column, timestamp: Date.now() }),
    });
  }, [projectId, userId, userName, activeFile]);

  // ── Monaco onMount ────────────────────────────────────────────────────────────

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e: any) => {
      if (sendCursorTimer.current) clearTimeout(sendCursorTimer.current);
      sendCursorTimer.current = setTimeout(() => {
        broadcastCursor(e.position.lineNumber, e.position.column);
      }, 80);
    });
  }, [broadcastCursor]);

  // ── editor change ─────────────────────────────────────────────────────────────

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined || isRemoteChange.current || !activeFile) return;
    setEditorContent(value);
    setFileCache((p) => ({ ...p, [activeFile]: value }));
    setModifiedFiles((p) => new Set([...p, activeFile]));
    wcRef.current?.fs.writeFile("/" + activeFile, value).catch(() => {});
    if (sendCodeTimer.current) clearTimeout(sendCodeTimer.current);
    sendCodeTimer.current = setTimeout(() => broadcastCode(activeFile, value), 200);
  }, [activeFile, broadcastCode]);

  // ── open file ─────────────────────────────────────────────────────────────────

  const openFile = useCallback(async (path: string) => {
    setActiveFile(path);
    if (fileCache[path] !== undefined) { setEditorContent(fileCache[path]); return; }
    try {
      const content = await wcRef.current?.fs.readFile("/" + path, "utf-8");
      if (content !== undefined) {
        setEditorContent(content);
        setFileCache((p) => ({ ...p, [path]: content }));
        setLoadedFiles((p) => new Set([...p, path]));
        return;
      }
    } catch {}
    const parsed = parseGithubUrl(githubUrlRef.current);
    if (!parsed) return;
    try {
      const res = await projectApi.get(
        `/api/projects/github/content/${parsed.owner}/${parsed.repo}?filePath=${encodeURIComponent(path)}`
      );
      const content: string = typeof res.data === "string" ? res.data : res.data?.content ?? "";
      setEditorContent(content);
      setFileCache((p) => ({ ...p, [path]: content }));
      setLoadedFiles((p) => new Set([...p, path]));
      wcRef.current?.fs.writeFile("/" + path, content).catch(() => {});
    } catch (e: any) {
      setEditorContent(`// Failed to load ${path}\n// ${e.message}`);
    }
  }, [fileCache]);

  // ── new file ──────────────────────────────────────────────────────────────────

  const addNewFile = () => {
    const name = newFileName.trim();
    if (!name) return;
    setTreeEntries((p) => [...p, {
      path: name, type: "blob",
      name: name.split("/").pop() ?? name,
      parentPath: name.split("/").slice(0, -1).join("/"),
      depth: name.split("/").length - 1,
    }]);
    setFileCache((p) => ({ ...p, [name]: "" }));
    setLoadedFiles((p) => new Set([...p, name]));
    setActiveFile(name); setEditorContent("");
    wcRef.current?.fs.writeFile("/" + name, "").catch(() => {});
    setNewFileName(""); setShowNewFile(false);
  };

  // ── parse package.json scripts ────────────────────────────────────────────────

  useEffect(() => {
    if (!activeFile.endsWith("package.json")) { setPkgScripts({}); return; }
    try {
      const pkg = JSON.parse(editorContent);
      setPkgScripts(pkg.scripts ?? {});
    } catch {
      setPkgScripts({});
    }
  }, [activeFile, editorContent]);

  // ── run ───────────────────────────────────────────────────────────────────────

  const executeViaRuntime = useCallback(async (ext: string, code: string, filename: string): Promise<boolean> => {
    const runtime = PISTON_RUNTIMES[ext];
    if (!runtime) return false;
    setIsRunning(true);
    xtermRef.current?.writeln(`\x1b[33m▶ Running ${filename} (${runtime.language})…\x1b[0m`);
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ name: filename, content: code }],
        }),
      });
      const data = await res.json();
      const stdout = (data.run?.stdout ?? "").trimEnd();
      const stderr = (data.run?.stderr ?? "").trimEnd();
      const code2  = data.run?.code ?? 0;
      if (stdout) xtermRef.current?.writeln(stdout);
      if (stderr) xtermRef.current?.writeln(`\x1b[31m${stderr}\x1b[0m`);
      xtermRef.current?.writeln(`\x1b[90m[Exited ${code2}]\x1b[0m`);
    } catch (e: any) {
      xtermRef.current?.writeln(`\x1b[31m✗ ${e.message}\x1b[0m`);
    } finally {
      setIsRunning(false);
    }
    return true;
  }, []);

  const handleRunSpringBoot = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    xtermRef.current?.writeln(`\x1b[33m▶ Building Spring Boot project (mvn compile)…\x1b[0m`);
    try {
      const res = await projectApi.post("/api/projects/execute/maven", { files: fileCache });
      const { output, exitCode } = res.data;
      if (output?.trim()) xtermRef.current?.writeln(output.trimEnd());
      xtermRef.current?.writeln(
        exitCode === 0
          ? `\x1b[32m✓ Build successful\x1b[0m`
          : `\x1b[31m✗ Build failed (code ${exitCode})\x1b[0m`
      );
    } catch (e: any) {
      xtermRef.current?.writeln(`\x1b[31m✗ ${e?.response?.data?.message ?? e.message}\x1b[0m`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, fileCache]);

  const handleRun = useCallback(async () => {
    if (!activeFile || isRunning) return;
    const ext = activeFile.split(".").pop()?.toLowerCase() ?? "";
    const code = fileCache[activeFile] ?? editorContent;
    const filename = activeFile.split("/").pop() ?? activeFile;
    const handled = await executeViaRuntime(ext, code, filename);
    if (handled) return;
    if (!shellInputRef.current) return;
    const cmd = ext === "ts" ? `npx ts-node ${activeFile}\n` : `node ${activeFile}\n`;
    shellInputRef.current.write(cmd);
    xtermRef.current?.focus();
  }, [activeFile, isRunning, fileCache, editorContent, executeViaRuntime]);

  const handleRunScript = useCallback((name: string) => {
    if (!shellInputRef.current) return;
    shellInputRef.current.write(`npm run ${name}\n`);
    xtermRef.current?.focus();
    setShowScriptMenu(false);
  }, []);

  // ── commit & push ─────────────────────────────────────────────────────────────

  const openCommitModal = () => {
    setSelectedCommitFiles(new Set(modifiedFiles));
    setCommitResult(null);
    setShowCommitModal(true);
  };

  const handleCommitPush = async () => {
    if (!commitMessage.trim() || selectedCommitFiles.size === 0) return;
    const parsed = parseGithubUrl(githubUrlRef.current);
    if (!parsed) return;

    const filesToCommit: Record<string, string> = {};
    selectedCommitFiles.forEach((f) => {
      if (fileCache[f] !== undefined) filesToCommit[f] = fileCache[f];
    });

    setCommitLoading(true);
    setCommitResult(null);
    try {
      const res = await projectApi.post(
        `/api/projects/github/commit/${parsed.owner}/${parsed.repo}`,
        {
          commitMessage: commitMessage.trim(),
          branch: commitBranch.trim() || null,
          files: filesToCommit,
          authorName: userName,
          authorEmail: (user as any)?.email ?? "",
        }
      );
      const { sha, url, branch: usedBranch, filesCommitted } = res.data;
      setCommitResult({ ok: true, msg: `Committed ${filesCommitted} file(s) to ${usedBranch} — ${sha.slice(0, 7)}`, url });
      // clear modified tracking for committed files
      setModifiedFiles((prev) => {
        const n = new Set(prev);
        selectedCommitFiles.forEach((f) => n.delete(f));
        return n;
      });
      setCommitMessage("");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e.message ?? "Commit failed";
      setCommitResult({ ok: false, msg });
    } finally {
      setCommitLoading(false);
    }
  };

  // ── memos ─────────────────────────────────────────────────────────────────────

  const hasPomXml = useMemo(() =>
    treeEntries.some((e) => e.name === "pom.xml" && e.depth === 0),
  [treeEntries]);

  const fileTreeMemo = useMemo(() => (
    <FileTree entries={treeEntries} activeFile={activeFile} loadedFiles={loadedFiles}
      remoteCursors={remoteCursors} onSelect={openFile} theme={theme} />
  ), [treeEntries, activeFile, loadedFiles, remoteCursors, openFile, theme]);

  const allParticipants = useMemo(() => [
    { userId, userName, userAvatar, color: myColor, isMe: true },
    ...connectedUsers.map((u) => ({ ...u, color: getCursorColor(u.userId), isMe: false })),
  ], [userId, userName, userAvatar, myColor, connectedUsers]);

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col h-full rounded-2xl border overflow-hidden relative ${dk ? "bg-[#0d1117] border-white/10" : "bg-white border-gray-200"}`}>

      {/* ── Join toast ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {joinToast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg"
            style={{ background: dk ? "rgba(56,212,100,0.15)" : "#dcfce7", border: `1px solid ${dk ? "rgba(56,212,100,0.3)" : "#86efac"}`, color: dk ? "#56d364" : "#166534" }}>
            <FaCircle className="text-[7px]" /> {joinToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Commit modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCommitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCommitModal(false); }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md mx-4 rounded-2xl border shadow-2xl overflow-hidden ${
                dk ? "bg-[#161b22] border-white/15" : "bg-white border-gray-200"
              }`}>
              {/* header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${dk ? "border-white/10" : "border-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <FaCodeBranch className={dk ? "text-[#13ff8c]" : "text-emerald-600"} />
                  <span className={`font-semibold text-sm ${dk ? "text-white" : "text-gray-900"}`}>Commit &amp; Push</span>
                </div>
                <button type="button" onClick={() => setShowCommitModal(false)}
                  className={`p-1.5 rounded-lg transition-colors ${dk ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}>
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* body */}
              <div className="px-5 py-4 flex flex-col gap-4">
                {/* commit message */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${dk ? "text-gray-400" : "text-gray-600"}`}>Commit message</label>
                  <textarea
                    rows={2}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="feat: update files via Live Coding"
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none transition-colors ${
                      dk
                        ? "bg-[#0d1117] border-white/15 text-white placeholder-gray-600 focus:border-[#13ff8c]/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                    }`}
                  />
                </div>

                {/* branch */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${dk ? "text-gray-400" : "text-gray-600"}`}>
                    Branch <span className={`font-normal ${dk ? "text-gray-600" : "text-gray-400"}`}>(leave blank for default)</span>
                  </label>
                  <input
                    type="text"
                    value={commitBranch}
                    onChange={(e) => setCommitBranch(e.target.value)}
                    placeholder="main"
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors ${
                      dk
                        ? "bg-[#0d1117] border-white/15 text-white placeholder-gray-600 focus:border-[#13ff8c]/60"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400"
                    }`}
                  />
                </div>

                {/* files list */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${dk ? "text-gray-400" : "text-gray-600"}`}>
                    Files to commit
                    <span className={`ml-1 font-normal ${dk ? "text-gray-600" : "text-gray-400"}`}>
                      ({selectedCommitFiles.size} / {modifiedFiles.size})
                    </span>
                  </label>
                  <div className={`rounded-lg border max-h-36 overflow-y-auto ${dk ? "border-white/10 bg-[#0d1117]" : "border-gray-200 bg-gray-50"}`}>
                    {Array.from(modifiedFiles).map((f) => {
                      const checked = selectedCommitFiles.has(f);
                      return (
                        <label key={f} className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer select-none transition-colors ${
                          dk ? "hover:bg-white/5" : "hover:bg-gray-100"
                        }`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => setSelectedCommitFiles((prev) => {
                              const n = new Set(prev);
                              checked ? n.delete(f) : n.add(f);
                              return n;
                            })}
                            className="accent-emerald-500 w-3.5 h-3.5 shrink-0" />
                          <span className={`text-xs font-mono truncate ${dk ? "text-gray-300" : "text-gray-700"}`}>{f}</span>
                        </label>
                      );
                    })}
                    {modifiedFiles.size === 0 && (
                      <div className={`px-3 py-3 text-xs text-center ${dk ? "text-gray-600" : "text-gray-400"}`}>
                        No modified files
                      </div>
                    )}
                  </div>
                </div>

                {/* result banner */}
                {commitResult && (
                  <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs ${
                    commitResult.ok
                      ? dk ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-green-50 text-green-700 border border-green-200"
                      : dk ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {commitResult.ok ? <FaCheck className="shrink-0 mt-0.5" /> : <FaTimes className="shrink-0 mt-0.5" />}
                    <div>
                      <div>{commitResult.msg}</div>
                      {commitResult.url && (
                        <a href={commitResult.url} target="_blank" rel="noreferrer"
                          className="underline opacity-80 hover:opacity-100 mt-0.5 block">
                          View on GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* footer */}
              <div className={`flex items-center justify-end gap-2 px-5 py-3 border-t ${dk ? "border-white/10" : "border-gray-100"}`}>
                <button type="button" onClick={() => setShowCommitModal(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dk ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}>
                  {commitResult?.ok ? "Close" : "Cancel"}
                </button>
                <button type="button"
                  disabled={commitLoading || !commitMessage.trim() || selectedCommitFiles.size === 0}
                  onClick={handleCommitPush}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
                    dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}>
                  {commitLoading ? <FaSpinner className="animate-spin text-[9px]" /> : <FaCodeBranch className="text-[9px]" />}
                  {commitLoading ? "Pushing…" : "Commit & Push"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className={`shrink-0 flex items-center gap-3 px-4 h-11 border-b ${dk ? "bg-[#161b22] border-white/10" : "bg-gray-50 border-gray-200"}`}>

        {/* connection */}
        <div className="flex items-center gap-1.5">
          <FaCircle className={`text-[7px] ${wsConnected ? "text-green-400" : "text-gray-500"}`} />
          <span className={`text-xs font-medium ${dk ? "text-gray-400" : "text-gray-500"}`}>
            {bootState === "booting" ? "Booting…" : bootState === "cloning" ? "Cloning…" : bootState === "ready" ? "Live" : "Idle"}
          </span>
        </div>

        <span className={`text-xs ${dk ? "text-white/10" : "text-gray-200"}`}>|</span>

        {/* participants strip */}
        <div className="flex items-center gap-1.5 relative">
          {allParticipants.map((p) => (
            <div key={p.userId} title={p.isMe ? "You" : p.userName}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium cursor-default"
              style={{ border: `1.5px solid ${p.color}`, color: p.color, background: `${p.color}15` }}>
              <img src={p.userAvatar} alt={p.userName} className="w-4 h-4 rounded-full" />
              <span>{p.isMe ? "You" : p.userName.split(" ")[0]}</span>
            </div>
          ))}

          {/* full participants panel toggle */}
          <button type="button" onClick={() => setShowParticipants((v) => !v)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-all ${
              dk ? "text-gray-500 hover:text-gray-300 hover:bg-white/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}>
            <FaUsers className="text-[10px]" />
            <span>{allParticipants.length}</span>
          </button>

          {/* participants dropdown */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                className={`absolute top-8 left-0 z-50 rounded-xl border shadow-2xl min-w-[200px] overflow-hidden ${
                  dk ? "bg-[#161b22] border-white/15" : "bg-white border-gray-200"
                }`}
                onMouseLeave={() => setShowParticipants(false)}>
                <div className={`px-3 py-2 text-[10px] font-semibold tracking-widest uppercase border-b ${dk ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-100"}`}>
                  In this session
                </div>
                {allParticipants.map((p) => {
                  const cursor = !p.isMe ? remoteCursors[p.userId] : null;
                  return (
                    <div key={p.userId} className={`flex items-center gap-3 px-3 py-2.5 ${dk ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                      <div className="relative shrink-0">
                        <img src={p.userAvatar} alt={p.userName} className="w-8 h-8 rounded-full" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                          style={{ background: p.color, borderColor: dk ? "#161b22" : "white" }} />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold truncate ${dk ? "text-white" : "text-gray-900"}`}>
                          {p.userName}{p.isMe && <span className={`ml-1 text-xs font-normal ${dk ? "text-gray-500" : "text-gray-400"}`}>(you)</span>}
                        </div>
                        {cursor && (
                          <div className={`text-xs truncate ${dk ? "text-gray-500" : "text-gray-400"}`}>
                            {cursor.filename}:{cursor.line}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {activeFile && (
            <span className={`text-xs font-mono ${dk ? "text-gray-500" : "text-gray-400"}`}>{activeFile}</span>
          )}
          {/* Commit & Push button */}
          <button type="button"
            disabled={bootState !== "ready" || modifiedFiles.size === 0}
            onClick={openCommitModal}
            title={modifiedFiles.size === 0 ? "No local changes" : `${modifiedFiles.size} modified file(s)`}
            className={`relative flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
              dk ? "bg-white/10 text-gray-300 hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}>
            <FaCodeBranch className="text-[9px]" /> Commit
            {modifiedFiles.size > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-amber-400 text-black">
                {modifiedFiles.size}
              </span>
            )}
          </button>
          {/* Spring Boot build button */}
          {hasPomXml ? (
            <button type="button"
              disabled={bootState !== "ready" || isRunning}
              onClick={handleRunSpringBoot}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
                dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}>
              {isRunning ? <FaSpinner className="animate-spin text-[9px]" /> : <FaPlay className="text-[9px]" />}
              {isRunning ? "Building…" : "Build"}
            </button>
          ) : Object.keys(pkgScripts).length > 0 ? (
            /* npm scripts dropdown */
            <div className="relative">
              <button type="button"
                disabled={bootState !== "ready"}
                onClick={() => setShowScriptMenu((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
                  dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}>
                <FaPlay className="text-[9px]" /> Run
                <FaChevronDown className="text-[8px]" />
              </button>
              <AnimatePresence>
                {showScriptMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className={`absolute right-0 top-8 z-50 rounded-xl border shadow-2xl min-w-[200px] overflow-hidden ${
                      dk ? "bg-[#161b22] border-white/15" : "bg-white border-gray-200"
                    }`}
                    onMouseLeave={() => setShowScriptMenu(false)}>
                    <div className={`px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase border-b ${
                      dk ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-100"
                    }`}>
                      npm scripts
                    </div>
                    {Object.entries(pkgScripts).map(([name, cmd]) => (
                      <button key={name} type="button" onClick={() => handleRunScript(name)}
                        className={`flex flex-col w-full text-left px-3 py-2 transition-colors ${
                          dk ? "hover:bg-white/5 text-gray-300" : "hover:bg-gray-50 text-gray-700"
                        }`}>
                        <span className="text-xs font-semibold">{name}</span>
                        <span className={`text-[10px] font-mono truncate max-w-[180px] ${dk ? "text-gray-600" : "text-gray-400"}`}>{cmd}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Python / Java / Node run */
            <button type="button"
              disabled={bootState !== "ready" || !activeFile || isRunning}
              onClick={handleRun}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-40 ${
                dk ? "bg-[#13ff8c] text-black hover:bg-[#19fb9b]" : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}>
              {isRunning ? <FaSpinner className="animate-spin text-[9px]" /> : <FaPlay className="text-[9px]" />}
              {isRunning ? "Running…" : "Run"}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* File sidebar */}
        <div className={`w-48 shrink-0 flex flex-col border-r overflow-hidden ${dk ? "bg-[#0d1117] border-white/10" : "bg-gray-50 border-gray-200"}`}>
          <div className={`flex items-center justify-between px-3 py-2 shrink-0 border-b text-[10px] font-semibold tracking-widest uppercase ${dk ? "border-white/10 text-gray-600" : "border-gray-200 text-gray-400"}`}>
            Explorer
            <button type="button" onClick={() => setShowNewFile((v) => !v)}
              className={`p-1 rounded ${dk ? "hover:bg-white/10 text-gray-500" : "hover:bg-gray-200 text-gray-400"}`}>
              <FaPlus className="text-[10px]" />
            </button>
          </div>
          <AnimatePresence>
            {showNewFile && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden shrink-0 px-2 py-1">
                <input autoFocus type="text" value={newFileName} onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addNewFile(); if (e.key === "Escape") setShowNewFile(false); }}
                  placeholder="filename.js"
                  className={`w-full px-2 py-1 text-xs rounded border outline-none ${dk ? "bg-white/10 border-white/20 text-white placeholder-gray-600" : "bg-white border-gray-300 text-gray-900"}`} />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1 overflow-y-auto p-1">
            {treeEntries.length > 0 ? fileTreeMemo : (
              <div className={`flex flex-col items-center justify-center h-full gap-2 ${dk ? "text-gray-600" : "text-gray-400"}`}>
                {(bootState === "booting" || bootState === "cloning") && <FaSpinner className="animate-spin text-sm" />}
                <span className="text-xs text-center px-2">
                  {bootState === "booting" ? "Booting…" : bootState === "cloning" ? "Cloning…" : "No files"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Editor + terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Monaco */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {bootState === "ready" && activeFile ? (
              <Editor
                height="100%"
                language={langOf(activeFile)}
                value={editorContent}
                theme={dk ? "vs-dark" : "light"}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false }, fontSize: 13, lineHeight: 20,
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  fontLigatures: true, scrollBeyondLastLine: false,
                  padding: { top: 12 }, renderWhitespace: "none",
                  smoothScrolling: true, automaticLayout: true,
                }}
              />
            ) : (
              <div className={`h-full flex flex-col items-center justify-center gap-4 px-8 ${dk ? "bg-[#0d1117]" : "bg-white"}`}>
                <FaTerminal className={`text-3xl ${dk ? "text-[#13ff8c]/30" : "text-emerald-300"}`} />
                <div className={`w-full max-w-sm font-mono text-xs space-y-1 ${dk ? "text-gray-400" : "text-gray-600"}`}>
                  {bootLog.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={dk ? "text-[#13ff8c]/50" : "text-emerald-500"}>›</span>
                      <span>{l}</span>
                    </div>
                  ))}
                  {(bootState === "booting" || bootState === "cloning") && (
                    <div className="flex items-center gap-2 mt-2">
                      <FaSpinner className={`animate-spin ${dk ? "text-[#13ff8c]" : "text-emerald-500"}`} />
                      <span>{bootState === "booting" ? "Starting runtime…" : "Fetching files…"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* xterm terminal */}
          <div className={`shrink-0 border-t ${dk ? "border-white/10" : "border-gray-200"}`} style={{ height: "38%" }}>
            <div className={`flex items-center gap-2 px-4 h-8 border-b text-xs font-semibold ${dk ? "bg-[#161b22] border-white/10 text-gray-500" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
              <FaTerminal className="text-[10px]" /> TERMINAL
            </div>
            <div ref={termDivRef} className="w-full bg-[#0d1117]" style={{ height: "calc(100% - 32px)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
