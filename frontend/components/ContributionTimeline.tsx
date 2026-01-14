import React from "react";
import { FaGitAlt, FaCodeBranch, FaUser, FaCrown, FaUserCheck, FaExternalLinkAlt, FaFileAlt, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const mockTimeline = [
  { type: "commit", message: "Initial project setup: Created the base folder structure for the application, including src and public directories. Added a comprehensive README.md with project goals, setup instructions, and contribution guidelines. Initialized the git repository, set up .gitignore for Node and environment files, and configured the first package.json with essential dependencies. Established the foundation for future development and collaboration.", author: "Jane Doe", avatar: "https://randomuser.me/api/portraits/women/47.jpg", date: "2024-06-01", role: "Owner" },
  { type: "pr", message: "Implemented user authentication: Added login and registration pages with form validation, integrated JWT-based authentication on the backend, and set up protected routes for authenticated users. Updated the user model and database schema to support password hashing and email verification. Merged frontend and backend changes after code review.", author: "John Smith", avatar: "https://randomuser.me/api/portraits/men/32.jpg", date: "2024-06-02", role: "Contributor" },
  { type: "commit", message: "Resolved chat bug: Fixed an issue where messages were not updating in real time due to a missing WebSocket event handler. Refactored the chat component for better state management and improved error handling. Added unit tests to cover the new logic and verified that chat updates are now instant.", author: "Jane Doe", avatar: "https://randomuser.me/api/portraits/women/47.jpg", date: "2024-06-03", role: "Owner" },
  { type: "pr", message: "UI improvements: Enhanced the overall look and feel of the dashboard and project pages. Updated color palette, improved spacing and alignment, and added responsive design for mobile devices. Refactored several components for better reusability and accessibility. All changes reviewed and approved.", author: "Alice Lee", avatar: "https://randomuser.me/api/portraits/women/44.jpg", date: "2024-06-04", role: "Reviewer" },
];

type FileTreeNode = {
  type: 'folder' | 'added' | 'modified' | 'deleted';
  name: string;
  addedLines?: number;
  deletedLines?: number;
  children?: FileTreeNode[];
};

const dummyFileTree: FileTreeNode[] = [
  {
    type: 'folder', name: 'src', children: [
      {
        type: 'folder', name: 'app', children: [
          { type: 'modified', name: 'layout.tsx', addedLines: 12, deletedLines: 2 },
          { type: 'added', name: 'page.tsx', addedLines: 88 },
        ]
      },
      {
        type: 'folder', name: 'components', children: [
          {
            type: 'folder', name: 'ui', children: [
              { type: 'modified', name: 'button.tsx', addedLines: 7, deletedLines: 1 },
            ]
          },
          { type: 'added', name: 'header.tsx', addedLines: 24 },
          { type: 'deleted', name: 'footer.tsx', deletedLines: 20 },
        ]
      },
      {
        type: 'folder', name: 'lib', children: [
          { type: 'modified', name: 'utils.ts', addedLines: 3, deletedLines: 2 },
        ]
      },
    ]
  }
];
const dummyTechStack = ["Next.js", "TypeScript", "Node.js", "TailwindCSS"];

function renderFileTree(tree: FileTreeNode[], depth = 0): React.ReactNode {
  return tree.map((node: FileTreeNode, idx: number) => {
    if (node.type === 'folder') {
      return (
        <div key={node.name + idx} style={{ marginLeft: depth * 16 }}>
          <div className="flex items-center gap-2 text-white/90 font-mono">
            <span className="text-white/60">&#128193;</span>
            <span>{node.name}</span>
          </div>
          <div>{renderFileTree(node.children || [], depth + 1)}</div>
        </div>
      );
    } else {
      const icon = node.type === 'added' ? <FaPlus className="text-green-400" title="Added" /> : node.type === 'deleted' ? <FaTrash className="text-red-500" title="Deleted" /> : <FaEdit className="text-yellow-400" title="Modified" />;
      return (
        <div key={node.name + idx} style={{ marginLeft: depth * 16 }} className="flex items-center gap-2 font-mono">
          {icon}
          <FaFileAlt className="text-white/40" />
          <span className={node.type === 'deleted' ? 'line-through text-red-400' : ''}>{node.name}</span>
          {typeof node.addedLines === 'number' && node.addedLines > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold text-green-400 bg-white/10 border border-white/10">+{node.addedLines}</span>
          )}
          {typeof node.deletedLines === 'number' && node.deletedLines > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold text-red-500 bg-white/10 border border-white/10">-{node.deletedLines}</span>
          )}
        </div>
      );
    }
  });
}

const roleIcons: Record<string, React.ReactNode> = {
  "Owner": <FaCrown className="text-yellow-400" />, "Contributor": <FaUserCheck className="text-[#13ff8c]" />, "Reviewer": <FaUser className="text-blue-400" />
};

export const ContributionTimeline: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (openIdx !== null) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [openIdx]);
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
        : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
    } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
      <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contribution Timeline</h2>
      <div className="relative ml-8 z-0">
        {/* Timeline vertical line (z-0) */}
        <div className={`absolute left-4 top-0 bottom-0 w-0.5 rounded-full z-0 pointer-events-none ${
          theme === 'dark' ? 'bg-[#13ff8c]/40' : 'bg-emerald-300'
        }`} style={{marginLeft: 0}} />
        <ol className="relative z-10">
          {mockTimeline.map((item, i) => (
            <li key={i} className="mb-8 relative flex">
              {/* Timeline icon (z-10) */}
              <div className="absolute left-0 top-0 z-10 flex items-center justify-center w-8 h-8" style={{transform: 'translateY(0)'}}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  item.type === 'commit' 
                    ? theme === 'dark'
                      ? 'bg-[#13ff8c]/20 border-[#13ff8c]'
                      : 'bg-emerald-100 border-emerald-500'
                    : theme === 'dark'
                      ? 'bg-blue-400/20 border-blue-400'
                      : 'bg-blue-100 border-blue-500'
                }`}>
                  {item.type === "commit" ? (
                    <FaGitAlt className={theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'} />
                  ) : (
                    <FaCodeBranch className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                  )}
                </span>
              </div>
              <div className="ml-12 flex-1">
                <div className="flex items-center gap-3">
                  <img src={item.avatar} alt={item.author} className={`w-8 h-8 rounded-full border-2 ${
                    theme === 'dark' ? 'border-white' : 'border-gray-300'
                  }`} />
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.author}</span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.date}</span>
                  <span className={`ml-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${
                    theme === 'dark' 
                      ? 'bg-white/10 text-white border-white/10' 
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}>{roleIcons[item.role]} {item.role}</span>
                </div>
                <div className="mt-1">
                  <div className={`flex items-center ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
                      : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-lg'
                  } border rounded-xl px-5 py-3 shadow-lg backdrop-blur-md w-full`}>
                    <div className={`flex-1 text-sm ${
                      theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                    }`}>
                      {item.message}
                    </div>
                    <button
                      className={`ml-4 flex items-center justify-center focus:outline-none ${
                        theme === 'dark' 
                          ? 'text-[#13ff8c] hover:text-[#19fb9b]' 
                          : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                      title="Open details"
                      onClick={() => setOpenIdx(i)}
                    >
                      <FaExternalLinkAlt className="text-lg" />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div
                      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={() => setOpenIdx(null)} />
                      {/* Modal */}
                      <motion.div
                        className="relative z-10 w-full max-w-lg bg-gradient-to-br from-[#1a2a22]/90 to-[#0a1813]/90 border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col gap-6 max-h-[80vh] overflow-y-auto pointer-events-auto"
                        initial={{ scale: 0.95, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 40, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.25 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-white">Commit Details</span>
                          <button className="text-[#13ff8c] text-2xl font-bold hover:text-[#19fb9b]" onClick={() => setOpenIdx(null)}>&times;</button>
                        </div>
                        <div>
                          <div className="text-white/90 text-base font-semibold mb-1">Commit Message</div>
                          <div className="text-white/80 text-sm mb-4">{item.message}</div>
                          <div className="text-white/90 text-base font-semibold mb-1">Changed Files</div>
                          <div className="bg-black/40 border border-white/10 rounded-lg p-4 text-xs text-white/90 overflow-x-auto mb-4">
                            {renderFileTree(dummyFileTree)}
                          </div>
                          <div className="text-white/90 text-base font-semibold mb-1">AI Commit Summary</div>
                          <div className="text-white/80 text-sm mb-4">{item.message}</div>
                          <div className="text-white/90 text-base font-semibold mb-1">Tech Stack / Libraries Used</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {dummyTechStack.map((tech, j) => (
                              <span key={j} className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#13ff8c]/10 border border-[#13ff8c]/30 text-[#13ff8c] font-semibold text-sm">{tech}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          ))}
        </ol>
      </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-[#13ff8c]/10 border border-[#13ff8c]/30 rounded-lg px-4 py-2 text-[#13ff8c] font-semibold text-sm">Your Commits: 5</div>
          <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg px-4 py-2 text-blue-400 font-semibold text-sm">Your PRs: 2</div>
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-4 py-2 text-yellow-400 font-semibold text-sm">Reviews: 1</div>
        </div>
      </div>
    );
  }; 