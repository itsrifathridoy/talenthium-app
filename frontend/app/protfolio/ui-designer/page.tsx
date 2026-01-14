"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaPalette, FaPencilRuler, FaMagic, FaHeart, FaStar, FaEye, FaDribbble, FaBehance } from "react-icons/fa";
import { SiFigma, SiSketch, SiAdobexd, SiAdobeillustrator, SiAdobephotoshop, SiInvision, SiFramer, SiWebflow } from "react-icons/si";

export default function UIDesignerPortfolio() {
  const [activeSection, setActiveSection] = useState("portfolio");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const portfolioData = {
    name: "Sophia Laurent",
    title: "UI/UX Designer & Visual Artist",
    tagline: "Designing experiences that inspire and delight",
    email: "sophia.laurent@design.studio",
    phone: "+1 (555) 432-1987",
    location: "Los Angeles, CA",
    avatar: "SL",
    behance: "https://behance.net/sophialaurent",
    dribbble: "https://dribbble.com/sophialaurent",
    linkedin: "https://linkedin.com/in/sophialaurent",
    
    about: "Passionate UI/UX designer with 6+ years of experience crafting beautiful, intuitive digital experiences. I blend creativity with user-centered design principles to create interfaces that are not only visually stunning but also highly functional. Specializing in mobile apps, web applications, and design systems.",
    
    tools: [
      { name: "Figma", icon: SiFigma, level: 98, color: "from-purple-400 to-pink-400" },
      { name: "Sketch", icon: SiSketch, level: 92, color: "from-yellow-400 to-orange-400" },
      { name: "Adobe XD", icon: SiAdobexd, level: 90, color: "from-pink-500 to-purple-500" },
      { name: "Illustrator", icon: SiAdobeillustrator, level: 94, color: "from-orange-500 to-yellow-500" },
      { name: "Photoshop", icon: SiAdobephotoshop, level: 88, color: "from-blue-500 to-cyan-500" },
      { name: "Framer", icon: SiFramer, level: 85, color: "from-pink-400 to-red-400" },
      { name: "InVision", icon: SiInvision, level: 87, color: "from-pink-500 to-red-500" },
      { name: "Webflow", icon: SiWebflow, level: 82, color: "from-blue-400 to-purple-400" },
    ],
    
    projects: [
      {
        name: "Fitness App Redesign",
        description: "Complete mobile app redesign with new branding and user flows",
        category: "Mobile App",
        image: "🏃",
        color: "from-green-400 via-teal-400 to-cyan-400",
        stats: { users: "500K+", rating: "4.8★" }
      },
      {
        name: "Banking Dashboard",
        description: "Modern dashboard for financial management with data visualization",
        category: "Web App",
        image: "💰",
        color: "from-blue-400 via-indigo-400 to-purple-400",
        stats: { users: "200K+", rating: "4.9★" }
      },
      {
        name: "E-Commerce Platform",
        description: "Beautiful shopping experience with seamless checkout flow",
        category: "Web App",
        image: "🛍️",
        color: "from-pink-400 via-rose-400 to-red-400",
        stats: { users: "1M+", rating: "4.7★" }
      },
      {
        name: "Social Media App",
        description: "Next-gen social platform with AI-powered content discovery",
        category: "Mobile App",
        image: "📱",
        color: "from-purple-400 via-fuchsia-400 to-pink-400",
        stats: { users: "2M+", rating: "4.8★" }
      },
      {
        name: "Design System",
        description: "Comprehensive design system with 200+ components",
        category: "System",
        image: "🎨",
        color: "from-orange-400 via-amber-400 to-yellow-400",
        stats: { teams: "15+", components: "200+" }
      },
      {
        name: "Food Delivery App",
        description: "Appetizing interface for ordering food with live tracking",
        category: "Mobile App",
        image: "🍕",
        color: "from-red-400 via-orange-400 to-yellow-400",
        stats: { users: "800K+", rating: "4.9★" }
      },
    ],
    
    achievements: [
      { title: "Awwwards Winner", count: "3x", icon: "🏆" },
      { title: "Dribbble Top Shot", count: "50+", icon: "⭐" },
      { title: "Behance Featured", count: "20+", icon: "✨" },
      { title: "Design Awards", count: "12", icon: "🎖️" }
    ],
    
    testimonials: [
      {
        name: "Mark Johnson",
        role: "CEO, TechStart",
        text: "Sophia's designs transformed our product completely. User engagement increased by 200%!",
        avatar: "MJ"
      },
      {
        name: "Lisa Chen",
        role: "Product Manager, AppCo",
        text: "Working with Sophia was amazing. Her attention to detail and creativity are unmatched.",
        avatar: "LC"
      },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-fuchsia-950 to-purple-950 text-white">
      {/* Artistic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-screen animate-float opacity-30 blur-xl"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  ['#ec4899', '#a855f7', '#f97316', '#facc15', '#10b981'][Math.floor(Math.random() * 5)]
                } 0%, transparent 70%)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-15px, 15px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaPalette className="text-3xl text-pink-400" />
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                {portfolioData.name}
              </div>
            </div>
            <div className="hidden md:flex gap-8">
              {["portfolio", "about", "tools", "testimonials", "contact"].map((section) => (
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
            <button className="px-6 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all">
              <FaDownload className="inline mr-2" />
              Portfolio
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
                <FaMagic className="inline mr-2 animate-pulse" />
                UI/UX Designer
              </div>
              <h1 className="text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-3xl text-gray-300">{portfolioData.title}</p>
              <p className="text-xl text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex gap-4 pt-4">
                <a href={portfolioData.behance} className="p-4 bg-white/10 rounded-2xl hover:bg-pink-500/30 transition-all hover:scale-110 hover:-rotate-6">
                  <FaBehance className="text-2xl" />
                </a>
                <a href={portfolioData.dribbble} className="p-4 bg-white/10 rounded-2xl hover:bg-purple-500/30 transition-all hover:scale-110 hover:rotate-6">
                  <FaDribbble className="text-2xl" />
                </a>
                <a href={portfolioData.linkedin} className="p-4 bg-white/10 rounded-2xl hover:bg-fuchsia-500/30 transition-all hover:scale-110">
                  <FaLinkedin className="text-2xl" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-9xl font-bold shadow-2xl shadow-pink-500/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-spin" style={{ animationDuration: '8s' }}></div>
                <span className="relative z-10">{portfolioData.avatar}</span>
              </div>
              <div className="absolute -top-8 -right-8 text-6xl animate-bounce">
                <FaPalette className="text-pink-400" />
              </div>
              <div className="absolute -bottom-8 -left-8 text-5xl animate-pulse">
                <FaPencilRuler className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Bar */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {portfolioData.achievements.map((achievement, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {achievement.count}
                </div>
                <div className="text-sm text-gray-400">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Featured Work
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioData.projects.map((project, idx) => (
              <div
                key={idx}
                className="group cursor-pointer"
                onMouseEnter={() => setSelectedProject(idx)}
                onMouseLeave={() => setSelectedProject(null)}
              >
                <div className={`relative p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className={`text-7xl mb-6 transform group-hover:scale-110 transition-transform`}>
                      {project.image}
                    </div>
                    <div className="text-xs text-pink-400 mb-2">{project.category}</div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">{project.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      {Object.entries(project.stats).map(([key, value], i) => (
                        <div key={i} className="flex items-center gap-1 text-gray-400">
                          {key === 'rating' ? <FaStar className="text-yellow-400" /> : <FaEye className="text-pink-400" />}
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-10 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-pink-500/50 transition-all">
              <FaMagic className="text-4xl text-pink-400 mb-6" />
              <p className="text-lg text-gray-300 leading-relaxed">
                {portfolioData.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Design Tools
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioData.tools.map((tool, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 hover:rotate-3 group">
                <tool.icon className="text-6xl text-pink-400 mb-4 group-hover:scale-125 group-hover:-rotate-12 transition-transform" />
                <div className="text-lg font-semibold mb-2">{tool.name}</div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className={`h-full bg-gradient-to-r ${tool.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${tool.level}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">{tool.level}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Client Love
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {portfolioData.testimonials.map((testimonial, idx) => (
              <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-pink-500/50 transition-all">
                <FaHeart className="text-3xl text-pink-400 mb-4" />
                <p className="text-lg text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Let's Create Magic
            </span>
          </h2>
          <p className="text-2xl text-gray-300 mb-12">
            Have a project in mind? Let's bring your vision to life!
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="flex items-center gap-2 px-8 py-4 bg-white/10 rounded-full hover:bg-pink-500/30 transition-all text-lg">
              <FaEnvelope />
              {portfolioData.email}
            </a>
            <a href={`tel:${portfolioData.phone}`} className="flex items-center gap-2 px-8 py-4 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all text-lg">
              <FaPhone />
              {portfolioData.phone}
            </a>
            <div className="flex items-center gap-2 px-8 py-4 bg-white/10 rounded-full text-lg">
              <FaMapMarkerAlt />
              {portfolioData.location}
            </div>
          </div>
          <button className="px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-fuchsia-500 rounded-full text-xl font-semibold hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-110">
            <FaMagic className="inline mr-3" />
            Start a Project
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. Designed with <FaHeart className="inline text-pink-400 animate-pulse" /> and creativity</p>
        </div>
      </footer>
    </div>
  );
}
