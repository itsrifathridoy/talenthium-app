"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaBrain, FaRobot, FaChartLine, FaCode, FaStar, FaQuoteLeft } from "react-icons/fa";
import { SiPython, SiTensorflow, SiPytorch, SiKeras, SiScikitlearn, SiJupyter, SiDocker, SiKubernetes } from "react-icons/si";

export default function AIMLEngineerPortfolio() {
  const [activeSection, setActiveSection] = useState("about");

  const portfolioData = {
    name: "Dr. Sarah Chen",
    title: "AI/ML Engineer & Research Scientist",
    tagline: "Building intelligent systems that learn and adapt",
    email: "sarah.chen@aiexpert.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    avatar: "SC",
    github: "https://github.com/sarahchen",
    linkedin: "https://linkedin.com/in/sarahchen",
    twitter: "https://twitter.com/sarahchen_ai",
    
    about: "Passionate AI/ML Engineer with 6+ years of experience in deep learning, natural language processing, and computer vision. Specialized in developing production-ready ML models that solve real-world problems. Ph.D. in Computer Science with focus on Neural Architecture Search.",
    
    skills: [
      { name: "Python", icon: SiPython, level: 98 },
      { name: "TensorFlow", icon: SiTensorflow, level: 95 },
      { name: "PyTorch", icon: SiPytorch, level: 93 },
      { name: "Keras", icon: SiKeras, level: 90 },
      { name: "Scikit-learn", icon: SiScikitlearn, level: 92 },
      { name: "Jupyter", icon: SiJupyter, level: 88 },
      { name: "Docker", icon: SiDocker, level: 85 },
      { name: "Kubernetes", icon: SiKubernetes, level: 80 },
    ],
    
    experience: [
      {
        title: "Senior ML Engineer",
        company: "TechAI Corp",
        duration: "2022 - Present",
        description: "Leading ML infrastructure team, developing production ML systems serving 10M+ users",
        achievements: ["Reduced model inference time by 60%", "Built AutoML pipeline", "Published 3 research papers"]
      },
      {
        title: "ML Research Scientist",
        company: "AI Research Lab",
        duration: "2020 - 2022",
        description: "Conducted cutting-edge research in NLP and computer vision",
        achievements: ["Developed novel transformer architecture", "15+ conference publications", "2 patents filed"]
      },
    ],
    
    projects: [
      {
        name: "Neural Style Transfer Engine",
        description: "Real-time style transfer using optimized CNN architecture",
        tech: ["PyTorch", "FastAPI", "React"],
        stars: 2.3,
        impact: "Used by 50K+ artists"
      },
      {
        name: "AutoML Platform",
        description: "Automated machine learning pipeline for model selection and hyperparameter tuning",
        tech: ["TensorFlow", "Keras", "Python"],
        stars: 1.8,
        impact: "Reduced training time by 70%"
      },
      {
        name: "Sentiment Analysis API",
        description: "Multi-language sentiment analysis using BERT transformers",
        tech: ["Transformers", "FastAPI", "Docker"],
        stars: 3.1,
        impact: "Processing 1M+ requests/day"
      },
    ],
    
    publications: [
      {
        title: "Efficient Neural Architecture Search using Reinforcement Learning",
        venue: "NeurIPS 2023",
        citations: 156
      },
      {
        title: "Multi-modal Learning for Image Captioning",
        venue: "CVPR 2022",
        citations: 89
      },
    ],
    
    education: {
      degree: "Ph.D. in Computer Science",
      school: "Stanford University",
      year: "2020",
      focus: "Neural Architecture Search & Deep Learning"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {portfolioData.name}
            </div>
            <div className="hidden md:flex gap-8">
              {["about", "skills", "experience", "projects", "publications", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize transition-all ${
                    activeSection === section
                      ? "text-purple-400 font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all">
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
              <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-300 text-sm">
                <FaBrain className="inline mr-2" />
                AI/ML Expert
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300">{portfolioData.title}</p>
              <p className="text-lg text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex gap-4 pt-4">
                <a href={portfolioData.github} className="p-3 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all hover:scale-110">
                  <FaGithub className="text-xl" />
                </a>
                <a href={portfolioData.linkedin} className="p-3 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all hover:scale-110">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href={portfolioData.twitter} className="p-3 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all hover:scale-110">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-purple-500/50">
                {portfolioData.avatar}
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Years Experience", value: "6+", icon: FaChartLine },
              { label: "ML Models Deployed", value: "50+", icon: FaRobot },
              { label: "Research Papers", value: "20+", icon: FaStar },
              { label: "GitHub Stars", value: "7.2K", icon: FaGithub }
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <stat.icon className="text-3xl text-purple-400 mx-auto" />
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
              <FaQuoteLeft className="text-3xl text-purple-400 mb-4" />
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
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Technical Skills
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 group">
                <skill.icon className="text-4xl text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-semibold mb-2">{skill.name}</div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">{skill.level}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {portfolioData.experience.map((exp, idx) => (
              <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-300">{exp.title}</h3>
                    <p className="text-lg text-gray-300">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-400 bg-purple-500/20 px-4 py-2 rounded-full">
                    {exp.duration}
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <FaRobot className="text-3xl text-purple-400" />
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar />
                    <span className="font-bold">{project.stars}K</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500 italic">{project.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publications Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Research Publications
            </span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {portfolioData.publications.map((pub, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
                <h3 className="text-xl font-bold mb-2 text-purple-300">{pub.title}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-gray-400">{pub.venue}</p>
                  <div className="text-sm bg-purple-500/20 px-4 py-2 rounded-full text-purple-300">
                    {pub.citations} citations
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
              <h3 className="text-2xl font-bold mb-2 text-purple-300">{portfolioData.education.degree}</h3>
              <p className="text-xl text-gray-300 mb-2">{portfolioData.education.school}</p>
              <p className="text-gray-400 mb-4">{portfolioData.education.year}</p>
              <p className="text-sm text-gray-500 italic">Focus: {portfolioData.education.focus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let's Connect
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Interested in collaborating or discussing AI/ML projects?
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all">
              <FaEnvelope />
              {portfolioData.email}
            </a>
            <a href={`tel:${portfolioData.phone}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-purple-500/30 transition-all">
              <FaPhone />
              {portfolioData.phone}
            </a>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full">
              <FaMapMarkerAlt />
              {portfolioData.location}
            </div>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105">
            Schedule a Meeting
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
