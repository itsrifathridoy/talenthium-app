"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaPalette, FaCode, FaMobile, FaDesktop, FaRocket, FaHeart, FaStar, FaEye } from "react-icons/fa";
import { SiReact, SiVuedotjs, SiAngular, SiJavascript, SiTypescript, SiTailwindcss, SiSass, SiWebpack, SiVite, SiFigma, SiNextdotjs, SiRedux } from "react-icons/si";

export default function FrontendDeveloperPortfolio() {
  const [activeSection, setActiveSection] = useState("about");
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const portfolioData = {
    name: "Jessica Martinez",
    title: "Frontend Developer & UI Engineer",
    tagline: "Crafting beautiful, performant user experiences",
    email: "jessica.martinez@frontend.dev",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, CA",
    avatar: "JM",
    github: "https://github.com/jessicamartinez",
    linkedin: "https://linkedin.com/in/jessicamartinez",
    twitter: "https://twitter.com/jessica_codes",
    website: "https://jessicamartinez.dev",
    
    about: "Creative frontend developer with 5+ years of experience building responsive, accessible, and performant web applications. Passionate about modern JavaScript frameworks, CSS animations, and creating delightful user experiences. Strong advocate for clean code, component-driven development, and pixel-perfect implementations.",
    
    skills: [
      { name: "React", icon: SiReact, level: 96, color: "from-cyan-400 to-blue-500" },
      { name: "Next.js", icon: SiNextdotjs, level: 92, color: "from-gray-700 to-black" },
      { name: "TypeScript", icon: SiTypescript, level: 90, color: "from-blue-500 to-blue-700" },
      { name: "JavaScript", icon: SiJavascript, level: 94, color: "from-yellow-400 to-yellow-600" },
      { name: "Vue.js", icon: SiVuedotjs, level: 85, color: "from-green-400 to-green-600" },
      { name: "Angular", icon: SiAngular, level: 80, color: "from-red-500 to-red-700" },
      { name: "Tailwind CSS", icon: SiTailwindcss, level: 95, color: "from-cyan-400 to-blue-600" },
      { name: "Sass/SCSS", icon: SiSass, level: 88, color: "from-pink-400 to-pink-600" },
      { name: "Redux", icon: SiRedux, level: 87, color: "from-purple-500 to-purple-700" },
      { name: "Vite", icon: SiVite, level: 89, color: "from-purple-400 to-yellow-400" },
      { name: "Webpack", icon: SiWebpack, level: 82, color: "from-blue-400 to-blue-600" },
      { name: "Figma", icon: SiFigma, level: 90, color: "from-pink-500 to-purple-500" },
    ],
    
    experience: [
      {
        title: "Senior Frontend Developer",
        company: "DesignTech Inc",
        duration: "2022 - Present",
        description: "Leading frontend development for a design collaboration platform",
        achievements: [
          "Built component library used across 15+ products",
          "Improved Core Web Vitals by 40%",
          "Reduced bundle size by 50% through code splitting",
          "Mentored 4 junior developers"
        ]
      },
      {
        title: "Frontend Developer",
        company: "StartupHub",
        duration: "2019 - 2022",
        description: "Developed responsive web applications using modern frameworks",
        achievements": [
          "Launched 10+ production features",
          "Implemented design system from scratch",
          "Achieved 98+ Lighthouse scores",
          "Led migration from Vue 2 to Vue 3"
        ]
      },
    ],
    
    projects: [
      {
        name: "Component Library Pro",
        description: "Enterprise-grade React component library with 100+ components",
        tech: ["React", "TypeScript", "Storybook", "Tailwind"],
        stars: 3.2,
        npm: "50K+ downloads/month",
        image: "🎨",
        color: "from-cyan-500 to-blue-500"
      },
      {
        name: "E-Commerce Platform",
        description: "Modern shopping experience with cart, checkout, and admin panel",
        tech: ["Next.js", "Redux", "Stripe", "Prisma"],
        stars: 1.8,
        users: "10K+ active users",
        image: "🛒",
        color: "from-purple-500 to-pink-500"
      },
      {
        name: "Real-time Dashboard",
        description: "Analytics dashboard with live data visualization and charts",
        tech: ["React", "D3.js", "WebSocket", "Material-UI"],
        stars: 2.1,
        users: "5K+ daily active",
        image: "📊",
        color: "from-green-500 to-teal-500"
      },
      {
        name: "Design System",
        description: "Complete design system with tokens, components, and documentation",
        tech: ["React", "CSS-in-JS", "Storybook", "Figma"],
        stars: 1.5,
        teams: "8 teams using",
        image: "🎭",
        color: "from-orange-500 to-red-500"
      },
      {
        name: "Animation Library",
        description: "Lightweight animation library for React with 50+ presets",
        tech: ["React", "Framer Motion", "TypeScript"],
        stars: 4.1,
        npm: "100K+ downloads",
        image: "✨",
        color: "from-yellow-500 to-orange-500"
      },
      {
        name: "PWA Mobile App",
        description: "Progressive web app with offline support and push notifications",
        tech: ["React", "Workbox", "Firebase", "Tailwind"],
        stars: 1.3,
        users: "15K+ installs",
        image: "📱",
        color: "from-indigo-500 to-purple-500"
      },
    ],
    
    stats: [
      { label: "Projects Shipped", value: "50+", icon: FaRocket },
      { label: "GitHub Stars", value: "14K+", icon: FaStar },
      { label: "NPM Downloads", value: "200K+", icon: FaCode },
      { label: "Happy Users", value: "100K+", icon: FaHeart }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-fuchsia-950 to-rose-950 text-white overflow-hidden">
      {/* Colorful Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                {portfolioData.name}
              </span>
            </div>
            <div className="hidden md:flex gap-8">
              {["about", "skills", "projects", "experience", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize transition-all ${
                    activeSection === section
                      ? "text-pink-400 font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all">
              <FaDownload className="inline mr-2" />
              Resume
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-pink-500/20 rounded-full border border-pink-500/30 text-pink-300 text-sm">
                <FaPalette className="inline mr-2" />
                Frontend Developer
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300">{portfolioData.title}</p>
              <p className="text-lg text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex gap-4 pt-4">
                <a href={portfolioData.github} className="p-3 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all hover:scale-110">
                  <FaGithub className="text-xl" />
                </a>
                <a href={portfolioData.linkedin} className="p-3 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all hover:scale-110">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href={portfolioData.twitter} className="p-3 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all hover:scale-110">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-cyan-500 via-pink-500 to-yellow-500 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-pink-500/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>
                <span className="relative z-10">{portfolioData.avatar}</span>
              </div>
              <div className="absolute -top-8 -right-8 text-6xl animate-spin" style={{ animationDuration: '10s' }}>
                <FaDesktop className="text-cyan-400" />
              </div>
              <div className="absolute -bottom-8 -left-8 text-5xl animate-bounce">
                <FaMobile className="text-pink-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {portfolioData.stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <stat.icon className="text-3xl text-pink-400 mx-auto" />
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all">
              <p className="text-lg text-gray-300 leading-relaxed">
                {portfolioData.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Tech Stack
            </span>
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 group">
                <skill.icon className="text-5xl text-pink-400 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                <div className="text-lg font-semibold mb-2">{skill.name}</div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">{skill.level}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 group cursor-pointer"
                onMouseEnter={() => setHoveredProject(idx)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {project.image}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-pink-500/20 rounded-lg text-xs text-pink-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar />
                    <span className="font-bold">{project.stars}K</span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {project.npm || project.users || project.teams}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Work Experience
            </span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {portfolioData.experience.map((exp, idx) => (
              <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-pink-300">{exp.title}</h3>
                    <p className="text-lg text-gray-300">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-400 bg-pink-500/20 px-4 py-2 rounded-full">
                    {exp.duration}
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Let's Create Together
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Have a project in mind? Let's build something amazing!
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all">
              <FaEnvelope />
              {portfolioData.email}
            </a>
            <a href={`tel:${portfolioData.phone}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all">
              <FaPhone />
              {portfolioData.phone}
            </a>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full">
              <FaMapMarkerAlt />
              {portfolioData.location}
            </div>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-105">
            <FaRocket className="inline mr-2" />
            Start a Project
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. Designed and built with <FaHeart className="inline text-pink-400" /> and React</p>
        </div>
      </footer>
    </div>
  );
}
