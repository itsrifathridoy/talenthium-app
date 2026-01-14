"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaCog, FaRocket, FaServer, FaInfinity, FaChartLine, FaShieldAlt, FaCheckCircle, FaHeart } from "react-icons/fa";
import { SiDocker, SiKubernetes, SiJenkins, SiGitlab, SiTerraform, SiAnsible, SiPrometheus, SiGrafana, SiLinux, SiPython, SiGo } from "react-icons/si";

export default function DevOpsEngineerPortfolio() {
  const [activeSection, setActiveSection] = useState("about");

  const portfolioData = {
    name: "David Kumar",
    title: "DevOps Engineer & Infrastructure Automation Specialist",
    tagline: "Automating the future, one pipeline at a time",
    email: "david.kumar@devopspro.com",
    phone: "+1 (555) 321-6547",
    location: "Austin, TX",
    avatar: "DK",
    github: "https://github.com/davidkumar",
    linkedin: "https://linkedin.com/in/davidkumar",
    twitter: "https://twitter.com/davidkumar_ops",
    
    about: "Experienced DevOps Engineer with 7+ years specializing in CI/CD automation, infrastructure as code, and container orchestration. Expert in building highly available, scalable systems that enable development teams to ship faster with confidence. Passionate about eliminating manual processes and improving deployment velocity.",
    
    skills: [
      { name: "Docker", icon: SiDocker, level: 96, color: "from-blue-400 to-blue-600" },
      { name: "Kubernetes", icon: SiKubernetes, level: 94, color: "from-blue-500 to-cyan-500" },
      { name: "Jenkins", icon: SiJenkins, level: 92, color: "from-red-400 to-orange-500" },
      { name: "GitLab CI", icon: SiGitlab, level: 90, color: "from-orange-500 to-orange-700" },
      { name: "Terraform", icon: SiTerraform, level: 95, color: "from-purple-500 to-purple-700" },
      { name: "Ansible", icon: SiAnsible, level: 88, color: "from-red-500 to-red-700" },
      { name: "Prometheus", icon: SiPrometheus, level: 87, color: "from-orange-400 to-red-500" },
      { name: "Grafana", icon: SiGrafana, level: 85, color: "from-orange-500 to-yellow-500" },
      { name: "Linux", icon: SiLinux, level: 93, color: "from-yellow-400 to-yellow-600" },
      { name: "Python", icon: SiPython, level: 89, color: "from-blue-500 to-yellow-500" },
      { name: "Bash", icon: FaServer, level: 91, color: "from-green-500 to-green-700" },
      { name: "Go", icon: SiGo, level: 82, color: "from-cyan-400 to-blue-500" },
    ],
    
    experience: [
      {
        title: "Senior DevOps Engineer",
        company: "CloudNative Corp",
        duration: "2022 - Present",
        description: "Leading DevOps transformation initiatives for enterprise clients",
        achievements: [
          "Reduced deployment time from 2 hours to 15 minutes",
          "Achieved 99.99% uptime across 50+ microservices",
          "Built fully automated CI/CD pipeline serving 100+ developers",
          "Reduced infrastructure costs by 35% through optimization"
        ]
      },
      {
        title: "DevOps Engineer",
        company: "TechScale Inc",
        duration: "2019 - 2022",
        description: "Implemented container orchestration and monitoring solutions",
        achievements: [
          "Migrated monolith to microservices on Kubernetes",
          "Implemented comprehensive monitoring with Prometheus/Grafana",
          "Automated infrastructure provisioning with Terraform",
          "Established disaster recovery procedures"
        ]
      },
    ],
    
    projects: [
      {
        name: "Multi-Cloud CI/CD Platform",
        description: "Enterprise-grade CI/CD platform supporting AWS, Azure, and GCP deployments",
        tech: ["Jenkins", "Kubernetes", "Terraform", "ArgoCD"],
        impact: "1000+ daily deployments",
        metrics: ["99.8% success rate", "15min avg deploy time"]
      },
      {
        name: "Infrastructure as Code Framework",
        description: "Reusable Terraform modules for rapid infrastructure provisioning",
        tech: ["Terraform", "AWS", "Azure", "GCP"],
        impact: "Used by 20+ teams",
        metrics: ["90% faster provisioning", "Zero config drift"]
      },
      {
        name: "Observability Stack",
        description: "Complete monitoring, logging, and alerting solution",
        tech: ["Prometheus", "Grafana", "ELK Stack", "Jaeger"],
        impact: "Monitoring 200+ services",
        metrics: ["Sub-second query time", "500K+ metrics/sec"]
      },
      {
        name: "GitOps Deployment Engine",
        description: "Automated deployment system using GitOps principles",
        tech: ["ArgoCD", "Flux", "Kubernetes", "Git"],
        impact: "100+ production apps",
        metrics: ["Zero-downtime deploys", "Automatic rollbacks"]
      },
    ],
    
    certifications: [
      "Certified Kubernetes Administrator (CKA)",
      "Certified Kubernetes Application Developer (CKAD)",
      "AWS Certified DevOps Engineer - Professional",
      "HashiCorp Certified: Terraform Associate",
      "Docker Certified Associate"
    ],
    
    metrics: [
      { label: "Deployment Frequency", value: "50+/day", icon: FaRocket },
      { label: "Lead Time", value: "< 1 hour", icon: FaChartLine },
      { label: "MTTR", value: "< 30 min", icon: FaCog },
      { label: "System Uptime", value: "99.99%", icon: FaCheckCircle }
    ],
    
    education: {
      degree: "B.S. in Computer Engineering",
      school: "University of Texas at Austin",
      year: "2017",
      gpa: "3.7/4.0"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 text-white">
      {/* Pipeline Animation Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pipeline"></div>
        <div className="absolute top-2/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent animate-pipeline" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pipeline" style={{ animationDelay: '4s' }}></div>
        
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <style jsx>{`
        @keyframes pipeline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-pipeline {
          animation: pipeline 8s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaInfinity className="text-2xl text-emerald-400" />
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {portfolioData.name}
              </div>
            </div>
            <div className="hidden md:flex gap-8">
              {["about", "skills", "experience", "projects", "certifications", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize transition-all ${
                    activeSection === section
                      ? "text-emerald-400 font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
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
              <div className="inline-block px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30 text-emerald-300 text-sm">
                <FaInfinity className="inline mr-2" />
                DevOps Expert
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300">{portfolioData.title}</p>
              <p className="text-lg text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex gap-4 pt-4">
                <a href={portfolioData.github} className="p-3 bg-white/10 rounded-full hover:bg-emerald-500/30 transition-all hover:scale-110">
                  <FaGithub className="text-xl" />
                </a>
                <a href={portfolioData.linkedin} className="p-3 bg-white/10 rounded-full hover:bg-emerald-500/30 transition-all hover:scale-110">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href={portfolioData.twitter} className="p-3 bg-white/10 rounded-full hover:bg-emerald-500/30 transition-all hover:scale-110">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-emerald-500/50 transform hover:rotate-3 transition-transform relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse"></div>
                <span className="relative z-10">{portfolioData.avatar}</span>
              </div>
              <div className="absolute top-0 right-0 -mr-4 -mt-4">
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
                  <FaCog className="text-3xl text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 -ml-4 -mb-4">
                <div className="bg-teal-500/20 backdrop-blur-sm rounded-xl p-4 border border-teal-500/30">
                  <FaServer className="text-3xl text-teal-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DevOps Metrics */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {portfolioData.metrics.map((metric, idx) => (
              <div key={idx} className="text-center space-y-2">
                <metric.icon className="text-3xl text-emerald-400 mx-auto" />
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all">
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
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              DevOps Toolchain
            </span>
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105 group">
                <skill.icon className="text-5xl text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
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

      {/* Experience Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Professional Experience
            </span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {portfolioData.experience.map((exp, idx) => (
              <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-emerald-300">{exp.title}</h3>
                    <p className="text-lg text-gray-300">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-400 bg-emerald-500/20 px-4 py-2 rounded-full">
                    {exp.duration}
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>{achievement}</span>
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
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Infrastructure Projects
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <FaRocket className="text-4xl text-emerald-400" />
                  <FaInfinity className="text-3xl text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-500/20 rounded-full text-xs text-emerald-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaServer className="text-emerald-400" />
                    <span className="font-semibold">Impact:</span> {project.impact}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.metrics.map((metric, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-500/20 rounded text-xs text-teal-300">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Certifications
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {portfolioData.certifications.map((cert, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all hover:scale-105 group text-center">
                <FaShieldAlt className="text-4xl text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-gray-300">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all">
              <h3 className="text-2xl font-bold mb-2 text-emerald-300">{portfolioData.education.degree}</h3>
              <p className="text-xl text-gray-300 mb-2">{portfolioData.education.school}</p>
              <p className="text-gray-400">{portfolioData.education.year} • GPA: {portfolioData.education.gpa}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Let's Automate Together
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Ready to transform your infrastructure and deployment processes?
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-emerald-500/30 transition-all">
              <FaEnvelope />
              {portfolioData.email}
            </a>
            <a href={`tel:${portfolioData.phone}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-emerald-500/30 transition-all">
              <FaPhone />
              {portfolioData.phone}
            </a>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full">
              <FaMapMarkerAlt />
              {portfolioData.location}
            </div>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105">
            <FaInfinity className="inline mr-2" />
            Start DevOps Journey
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. Automated with <span className="text-emerald-400">❤️</span> and DevOps Magic</p>
        </div>
      </footer>
    </div>
  );
}
