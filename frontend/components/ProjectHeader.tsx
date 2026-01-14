import React from "react";
import { FaGithub, FaExternalLinkAlt, FaReact, FaNodeJs, FaPython, FaEllipsisV, FaProjectDiagram } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiTailwindcss } from "react-icons/si";

const techIcons: Record<string, React.ReactNode> = {
  "React": <FaReact className="text-cyan-400" />,
  "Node.js": <FaNodeJs className="text-green-500" />,
  "Python": <FaPython className="text-yellow-300" />,
  "Next.js": <SiNextdotjs className="text-white" />,
  "TypeScript": <SiTypescript className="text-blue-400" />,
  "TailwindCSS": <SiTailwindcss className="text-teal-300" />,
};

export type ProjectHeaderProps = {
  project: {
    title: string;
    githubUrl: string;
    liveUrl: string;
    status: string;
    visibility: string;
    owner: { name: string; avatar: string; role: string };
    tags: string[];
    icon?: React.ReactNode;
    iconBg?: string;
    shortDescription?: string;
    techStack?: string[];
  };
  onActionClick?: () => void;
  theme?: 'light' | 'dark';
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onActionClick, theme = 'dark' }) => {
  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
        : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
    } backdrop-blur-md border rounded-2xl p-6 shadow-lg`}>
      <div className="flex items-start gap-6">
        {/* Project Icon */}
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg text-3xl font-bold ${project.iconBg || 'bg-[#13ff8c]/80 text-black'}`}>
          {project.icon || <FaProjectDiagram className="text-black" />}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Top row: title, status, visibility, action button */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className={`text-3xl md:text-4xl font-extrabold truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ml-2 ${
                  project.status === "Live" 
                    ? theme === 'dark' 
                      ? "bg-[#13ff8c]/20 text-[#13ff8c]" 
                      : "bg-emerald-100 text-emerald-700"
                    : project.status === "Archived" 
                      ? theme === 'dark'
                        ? "bg-gray-400/20 text-gray-300" 
                        : "bg-gray-100 text-gray-600"
                      : theme === 'dark'
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-yellow-100 text-yellow-700"
                }`}>{project.status}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ml-1 ${
                  project.visibility === "Public" 
                    ? theme === 'dark'
                      ? "bg-blue-500/20 text-blue-400" 
                      : "bg-blue-100 text-blue-600"
                    : theme === 'dark'
                      ? "bg-gray-500/20 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                }`}>{project.visibility}</span>
              </div>
            </div>
            {onActionClick && (
              <button
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-[#13ff8c]/20 text-[#13ff8c] hover:text-[#19fb9b] border-white/10' 
                    : 'bg-gray-100 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border-gray-300'
                } border shadow transition-all mt-2 md:mt-0`}
                onClick={onActionClick}
                aria-label="Project Actions"
              >
                <FaEllipsisV className="text-lg" />
              </button>
            )}
          </div>
          {/* Links row */}
          <div className="flex items-center gap-4 flex-wrap">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-sm font-semibold ${
              theme === 'dark' ? 'text-[#13ff8c] hover:text-[#19fb9b]' : 'text-emerald-600 hover:text-emerald-700'
            }`}>
              <FaGithub className="inline-block" /> GitHub
            </a>
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-sm font-semibold ${
              theme === 'dark' ? 'text-[#13ff8c] hover:text-[#19fb9b]' : 'text-emerald-600 hover:text-emerald-700'
            }`}>
              <FaExternalLinkAlt className="inline-block" /> Live
            </a>
          </div>
          {/* Owner and tags row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <img src={project.owner.avatar} alt={project.owner.name} className={`w-12 h-12 rounded-full border-2 shadow ${
                theme === 'dark' ? 'border-[#13ff8c]' : 'border-emerald-500'
              }`} />
              <div className="flex flex-col items-start">
                <span className={`font-bold text-base ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{project.owner.name}</span>
                <span className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
                }`}>{project.owner.role}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {project.tags.map((tag, i) => (
                <span key={i} className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  theme === 'dark' 
                    ? 'bg-white/10 text-white border-white/10' 
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                } border`}>{tag}</span>
              ))}
            </div>
          </div>
          {/* Short Description at the end */}
          {project.shortDescription && (
            <div className={`text-base mt-4 whitespace-pre-line ${
              theme === 'dark' ? 'text-white/80' : 'text-gray-600'
            }`}>{project.shortDescription}</div>
          )}
          {/* Tech stack icons and names */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {project.techStack.map((tech, i) => (
                <span key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${
                  theme === 'dark' 
                    ? 'bg-[#13ff8c]/10 border-[#13ff8c]/30 text-[#13ff8c]' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                } border`}>
                  {techIcons[tech] || null}
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 