import React from "react";
import { FaGithub, FaExclamationCircle } from "react-icons/fa";

const mockIssues = [
  { id: 1, title: "Fix login bug", url: "https://github.com/example/mentor-connect/issues/1", assignee: "Jane Doe" },
  { id: 2, title: "Improve mobile UI", url: "https://github.com/example/mentor-connect/issues/2", assignee: "John Smith" },
];

export const IssuesSection: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => (
  <div className={`${
    theme === 'dark' 
      ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
      : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
  } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Open Issues</h2>
    <ul className="flex flex-col gap-4">
      {mockIssues.map(issue => (
        <li key={issue.id} className="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/10">
          <FaExclamationCircle className="text-yellow-400 text-lg" />
          <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-[#13ff8c] font-semibold hover:underline flex-1">{issue.title}</a>
          <span className="text-xs text-white/70">Assigned to: {issue.assignee}</span>
          <a href={issue.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-white/40 hover:text-[#13ff8c]">
            <FaGithub />
          </a>
        </li>
      ))}
    </ul>
  </div>
); 