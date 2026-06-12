import React from "react";
import { FaGitAlt, FaUser, FaCrown, FaUserCheck, FaExternalLinkAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Contribution {
  id: number;
  date: string;
  type: string;
  description: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  hash?: string;
  branch?: string;
  aiSummary?: string;
  aiChanges?: string[];
  aiImpact?: string;
  aiType?: string;
  aiFilesChanged?: number;
  aiAdditions?: number;
  aiDeletions?: number;
}

const roleIcons: Record<string, React.ReactNode> = {
  Owner: <FaCrown className="text-yellow-400" />,
  Contributor: <FaUserCheck className="text-[#13ff8c]" />,
  Reviewer: <FaUser className="text-blue-400" />,
};

const impactColor: Record<string, string> = {
  High: "bg-red-500/20 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const typeColor: Record<string, string> = {
  Feature: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Fix: "bg-red-500/20 text-red-400 border-red-500/30",
  Refactor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Test: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Docs: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Chore: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Style: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function avatarUrl(author: string, url?: string): string {
  if (url && !url.includes("null")) return url;
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`;
}

export const ContributionTimeline: React.FC<{
  theme?: "light" | "dark";
  contributions?: Contribution[];
}> = ({ theme = "dark", contributions = [] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const dark = theme === "dark";
  const selected = openIdx !== null ? contributions[openIdx] : null;

  // Lock body scroll while modal open
  useEffect(() => {
    if (openIdx !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [openIdx]);

  if (contributions.length === 0) {
    return (
      <div className={`${dark ? "bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10" : "bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl"} backdrop-blur-md border rounded-2xl p-6 shadow-lg`}>
        <h2 className={`text-xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Contribution Timeline</h2>
        <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>No contributions yet. Commits will appear here after syncing.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Timeline card ──────────────────────────────────────── */}
      <div className={`${dark ? "bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10" : "bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl"} backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
        <h2 className={`text-xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
          Contribution Timeline
          <span className={`ml-3 text-sm font-normal ${dark ? "text-gray-400" : "text-gray-500"}`}>{contributions.length} commits</span>
        </h2>
        <div className="relative ml-8">
          <div className={`absolute left-4 top-0 bottom-0 w-0.5 rounded-full pointer-events-none ${dark ? "bg-[#13ff8c]/40" : "bg-emerald-300"}`} />
          <ol>
            {contributions.map((item, i) => (
              <li key={item.id ?? i} className="mb-8 relative flex">
                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${dark ? "bg-[#13ff8c]/20 border-[#13ff8c]" : "bg-emerald-100 border-emerald-500"}`}>
                    <FaGitAlt className={dark ? "text-[#13ff8c]" : "text-emerald-600"} />
                  </span>
                </div>
                <div className="ml-12 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <img
                      src={avatarUrl(item.author, item.authorAvatar)}
                      alt={item.author}
                      className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${dark ? "border-white/20" : "border-gray-300"}`}
                    />
                    <span className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{item.author}</span>
                    <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{formatDate(item.date)}</span>
                    {item.authorRole && (
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${dark ? "bg-white/10 text-white border-white/10" : "bg-gray-100 text-gray-700 border-gray-300"}`}>
                        {roleIcons[item.authorRole] ?? <FaUser />} {item.authorRole}
                      </span>
                    )}
                    {item.branch && (
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${dark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{item.branch}</span>
                    )}
                    {item.aiSummary && (
                      <span className={`text-xs px-2 py-0.5 rounded border ${dark ? "bg-[#13ff8c]/10 text-[#13ff8c] border-[#13ff8c]/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>AI analyzed</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className={`flex items-start gap-3 ${dark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow"} border rounded-xl px-4 py-3`}>
                      <div className={`flex-1 text-sm leading-relaxed min-w-0 ${dark ? "text-white/80" : "text-gray-700"}`}>
                        {item.aiSummary || item.description}
                      </div>
                      <button
                        className={`flex-shrink-0 mt-0.5 ${dark ? "text-[#13ff8c] hover:text-[#19fb9b]" : "text-emerald-600 hover:text-emerald-700"}`}
                        title="View details"
                        onClick={() => setOpenIdx(i)}
                      >
                        <FaExternalLinkAlt />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Modal — rendered outside the list, no stacking-context parent ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ alignItems: "center" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setOpenIdx(null)}
            />

            {/* Modal box — scrolls independently */}
            <motion.div
              key="modal-content"
              className={`relative z-10 w-full max-w-xl mx-4 my-8 flex flex-col rounded-2xl shadow-2xl border ${
                dark
                  ? "bg-gradient-to-br from-[#1a2a22] to-[#0a1813] border-white/10"
                  : "bg-white border-gray-200"
              }`}
              style={{ maxHeight: "85vh" }}
              initial={{ scale: 0.95, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className={`flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b ${dark ? "border-white/10" : "border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl(selected.author, selected.authorAvatar)}
                    alt={selected.author}
                    className="w-10 h-10 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <div className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>{selected.author}</div>
                    <div className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      {formatDate(selected.date)}{selected.branch ? ` · ${selected.branch}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  className={`text-2xl font-bold leading-none ${dark ? "text-[#13ff8c] hover:text-[#19fb9b]" : "text-gray-500 hover:text-gray-800"}`}
                  onClick={() => setOpenIdx(null)}
                >
                  &times;
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 flex flex-col gap-5">
                {/* Badges */}
                {(selected.aiType || selected.aiImpact || selected.aiFilesChanged != null) && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.aiType && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${typeColor[selected.aiType] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>{selected.aiType}</span>
                    )}
                    {selected.aiImpact && (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${impactColor[selected.aiImpact] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>{selected.aiImpact} Impact</span>
                    )}
                    {selected.aiFilesChanged != null && (
                      <span className={`text-xs px-3 py-1 rounded-full border ${dark ? "bg-white/5 text-gray-300 border-white/10" : "bg-gray-100 text-gray-600 border-gray-300"}`}>{selected.aiFilesChanged} files</span>
                    )}
                    {selected.aiAdditions != null && (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">+{selected.aiAdditions}</span>
                    )}
                    {selected.aiDeletions != null && (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">-{selected.aiDeletions}</span>
                    )}
                  </div>
                )}

                {/* AI Summary */}
                {selected.aiSummary ? (
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${dark ? "text-[#13ff8c]" : "text-emerald-700"}`}>AI Summary</div>
                    <div className={`text-sm leading-relaxed ${dark ? "text-white/80" : "text-gray-700"}`}>{selected.aiSummary}</div>
                  </div>
                ) : (
                  <div className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>AI summary not yet generated for this commit.</div>
                )}

                {/* AI Changes */}
                {selected.aiChanges && selected.aiChanges.length > 0 && (
                  <div>
                    <div className={`text-sm font-semibold mb-2 ${dark ? "text-white/90" : "text-gray-800"}`}>Changes</div>
                    <ul className="space-y-2">
                      {selected.aiChanges.map((change, j) => (
                        <li key={j} className={`flex items-start gap-2 text-sm ${dark ? "text-white/70" : "text-gray-600"}`}>
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? "bg-[#13ff8c]" : "bg-emerald-500"}`} />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commit message */}
                <div>
                  <div className={`text-sm font-semibold mb-1 ${dark ? "text-white/50" : "text-gray-400"}`}>Commit Message</div>
                  <div className={`text-sm font-mono p-3 rounded-lg break-words ${dark ? "bg-black/30 text-white/60" : "bg-gray-50 text-gray-600"}`}>{selected.description}</div>
                </div>

                {/* Hash */}
                {selected.hash && (
                  <div className={`text-xs font-mono ${dark ? "text-gray-600" : "text-gray-400"}`}>{selected.hash.substring(0, 12)}</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
