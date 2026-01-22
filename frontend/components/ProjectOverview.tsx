import React from "react";
import dynamic from "next/dynamic";
import { FaReact, FaNodeJs, FaPython } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiTailwindcss } from "react-icons/si";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview"),
  { ssr: false }
);

export type ProjectOverviewProps = {
  project: {
    shortDescription: string;
    longDescription: string;
    techStack: string[];
  };
  theme?: 'light' | 'dark';
};

const techIcons: Record<string, React.ReactNode> = {
  "React": <FaReact className="text-cyan-400" />,
  "Node.js": <FaNodeJs className="text-green-500" />,
  "Python": <FaPython className="text-yellow-300" />,
  "Next.js": <SiNextdotjs className="text-white" />,
  "TypeScript": <SiTypescript className="text-blue-400" />,
  "TailwindCSS": <SiTailwindcss className="text-teal-300" />,
};

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, theme = 'dark' }) => {
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
        : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
    } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
      <div>
        <p className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{project.shortDescription}</p>
      </div>
      <div className="markdown-body" data-color-mode={theme}>
        <MarkdownPreview 
          source={project.longDescription} 
          style={{ 
            backgroundColor: 'transparent',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : '#374151',
            padding: 0
          }}
        />
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {project.techStack.map((tech, i) => (
          <span key={i} className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#13ff8c]/10 border border-[#13ff8c]/30 text-[#13ff8c] font-semibold text-sm">
            {techIcons[tech] || null}
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}; 