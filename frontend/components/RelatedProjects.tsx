import React from "react";
import { FaExternalLinkAlt, FaGithub, FaStar, FaCodeBranch } from "react-icons/fa";

const related = [
  { 
    title: "Dev Portfolio", 
    url: "https://devportfolio.com", 
    githubUrl: "https://github.com/example/dev-portfolio",
    description: "A modern, responsive portfolio website built with Next.js and TypeScript. Features dark/light mode, smooth animations, and showcase sections for projects and skills.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop&crop=center",
    techStack: ["Next.js", "TypeScript", "Tailwind"],
    stars: 142,
    forks: 28,
    status: "Active"
  },
  { 
    title: "AI Collaboration Platform", 
    url: "https://aicollab.com", 
    githubUrl: "https://github.com/example/ai-collab",
    description: "An open-source platform for AI researchers and developers to collaborate on machine learning projects. Includes real-time code sharing and model training pipelines.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop&crop=center",
    techStack: ["Python", "React", "TensorFlow"],
    stars: 89,
    forks: 15,
    status: "Active"
  },
  { 
    title: "Open Source Docs", 
    url: "https://opensource-docs.com", 
    githubUrl: "https://github.com/example/os-docs",
    description: "Comprehensive documentation platform for open source projects. Auto-generates docs from code comments and supports multiple programming languages.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=center",
    techStack: ["Vue.js", "Node.js", "MongoDB"],
    stars: 256,
    forks: 67,
    status: "Maintained"
  },
];

export const RelatedProjects: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      theme === 'light' 
        ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
        : 'bg-white/5 border-white/10 backdrop-blur-sm'
    }`}>
      <h3 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
        theme === 'light' ? 'text-gray-900' : 'text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'
        }`}></div>
        Related Projects
      </h3>
      
      <div className="space-y-4">
        {related.map((project, index) => (
          <div key={index} className={`group relative overflow-hidden rounded-lg border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
            theme === 'light' 
              ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100/50' 
              : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:bg-white/10'
          }`}>
            <div className="flex">
              {/* Image Section */}
              <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {project.status}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-semibold text-lg leading-tight ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>
                    {project.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 ml-3">
                    {/* GitHub Stats */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`flex items-center gap-1 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        <FaStar className="w-3 h-3" />
                        <span>{project.stars}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        <FaCodeBranch className="w-3 h-3" />
                        <span>{project.forks}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className={`text-sm leading-relaxed mb-3 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {project.description}
                </p>
                
                {/* Tech Stack */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, techIndex) => (
                      <span 
                        key={techIndex} 
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          theme === 'light' 
                            ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                            : 'bg-white/10 text-gray-300 border border-white/20'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-2 rounded-md transition-all duration-200 hover:scale-110 ${
                        theme === 'light' 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                      title="View on GitHub"
                    >
                      <FaGithub className="w-4 h-4" />
                    </a>
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`p-2 rounded-md transition-all duration-200 hover:scale-110 ${
                        theme === 'light' 
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700' 
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300'
                      }`}
                      title="Visit Project"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 