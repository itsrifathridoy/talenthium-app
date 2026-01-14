"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaCloud, FaServer, FaNetworkWired, FaLock, FaRocket, FaChartBar, FaCertificate } from "react-icons/fa";
import { SiAmazon, SiGooglecloud, SiKubernetes, SiDocker, SiTerraform, SiAnsible, SiJenkins } from "react-icons/si";

export default function CloudEngineerPortfolio() {
  const [activeSection, setActiveSection] = useState("about");

  const portfolioData = {
    name: "Michael Rodriguez",
    title: "Senior Cloud Architect & DevOps Specialist",
    tagline: "Architecting scalable cloud solutions in the stratosphere",
    email: "michael.rodriguez@cloudpro.com",
    phone: "+1 (555) 789-0123",
    location: "Seattle, WA",
    avatar: "MR",
    github: "https://github.com/mrodriguez",
    linkedin: "https://linkedin.com/in/mrodriguez",
    twitter: "https://twitter.com/mrodriguez_cloud",
    
    about: "Certified cloud architect with 8+ years of experience designing and implementing enterprise-scale cloud infrastructure. Expert in AWS, Azure, and GCP with a proven track record of reducing operational costs by 40% while improving system reliability. Passionate about infrastructure as code and automated deployments.",
    
    certifications: [
      "AWS Certified Solutions Architect - Professional",
      "Google Cloud Professional Cloud Architect",
      "Microsoft Azure Solutions Architect Expert",
      "Certified Kubernetes Administrator (CKA)",
      "HashiCorp Certified: Terraform Associate"
    ],
    
    skills: [
      { name: "AWS", icon: SiAmazon, level: 98, color: "from-orange-500 to-yellow-500" },
      { name: "Azure", icon: FaCloud, level: 92, color: "from-blue-500 to-cyan-500" },
      { name: "GCP", icon: SiGooglecloud, level: 90, color: "from-red-500 to-yellow-500" },
      { name: "Kubernetes", icon: SiKubernetes, level: 95, color: "from-blue-400 to-blue-600" },
      { name: "Docker", icon: SiDocker, level: 93, color: "from-blue-500 to-blue-700" },
      { name: "Terraform", icon: SiTerraform, level: 96, color: "from-purple-500 to-purple-700" },
      { name: "Ansible", icon: SiAnsible, level: 88, color: "from-red-500 to-red-700" },
      { name: "Jenkins", icon: SiJenkins, level: 85, color: "from-red-400 to-orange-500" },
    ],
    
    experience: [
      {
        title: "Lead Cloud Architect",
        company: "CloudScale Inc",
        duration: "2021 - Present",
        description: "Architecting multi-cloud solutions for Fortune 500 companies",
        achievements: [
          "Migrated 200+ microservices to Kubernetes",
          "Reduced cloud costs by $2M annually",
          "Led team of 12 cloud engineers"
        ]
      },
      {
        title: "Senior DevOps Engineer",
        company: "TechGiant Corp",
        duration: "2018 - 2021",
        description: "Implemented CI/CD pipelines and infrastructure automation",
        achievements: [
          "Automated 95% of deployment processes",
          "Improved system uptime to 99.99%",
          "Built disaster recovery system"
        ]
      },
    ],
    
    projects: [
      {
        name: "Multi-Cloud Orchestration Platform",
        description: "Unified platform for managing resources across AWS, Azure, and GCP",
        tech: ["Terraform", "Kubernetes", "Go", "React"],
        impact: "Managing $5M+ cloud infrastructure",
        metrics: "99.99% uptime"
      },
      {
        name: "Serverless Analytics Pipeline",
        description: "Real-time data processing using serverless architecture",
        tech: ["AWS Lambda", "Kinesis", "S3", "Python"],
        impact: "Processing 10TB+ data daily",
        metrics: "60% cost reduction"
      },
      {
        name: "Cloud Cost Optimization Tool",
        description: "AI-powered tool for identifying and eliminating cloud waste",
        tech: ["Python", "AWS APIs", "Machine Learning"],
        impact: "Saved $3M across clients",
        metrics: "40% average savings"
      },
    ],
    
    education: {
      degree: "M.S. in Cloud Computing & Distributed Systems",
      school: "MIT",
      year: "2018",
      gpa: "3.9/4.0"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-blue-950 to-cyan-950 text-white">
      {/* Cloud Animation Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-32 bg-white/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-80 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-36 bg-sky-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-40px) translateX(-20px); }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              {portfolioData.name}
            </div>
            <div className="hidden md:flex gap-8">
              {["about", "skills", "experience", "projects", "certifications", "contact"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize transition-all ${
                    activeSection === section
                      ? "text-cyan-400 font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
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
              <div className="inline-block px-4 py-2 bg-sky-500/20 rounded-full border border-sky-500/30 text-sky-300 text-sm">
                <FaCloud className="inline mr-2" />
                Cloud Architect
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300">{portfolioData.title}</p>
              <p className="text-lg text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex gap-4 pt-4">
                <a href={portfolioData.github} className="p-3 bg-white/10 rounded-full hover:bg-cyan-500/30 transition-all hover:scale-110">
                  <FaGithub className="text-xl" />
                </a>
                <a href={portfolioData.linkedin} className="p-3 bg-white/10 rounded-full hover:bg-cyan-500/30 transition-all hover:scale-110">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href={portfolioData.twitter} className="p-3 bg-white/10 rounded-full hover:bg-cyan-500/30 transition-all hover:scale-110">
                  <FaTwitter className="text-xl" />
                </a>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-cyan-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                <span className="relative z-10">{portfolioData.avatar}</span>
              </div>
              <FaCloud className="absolute top-10 right-10 text-6xl text-white/20 animate-float" />
              <FaCloud className="absolute bottom-20 left-10 text-4xl text-white/20 animate-float-delayed" />
              <FaCloud className="absolute top-1/2 right-0 text-5xl text-white/20 animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Years in Cloud", value: "8+", icon: FaCloud },
              { label: "Cloud Migrations", value: "50+", icon: FaRocket },
              { label: "Cost Savings", value: "$5M+", icon: FaChartBar },
              { label: "Certifications", value: "5", icon: FaCertificate }
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <stat.icon className="text-3xl text-cyan-400 mx-auto" />
                <div className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
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
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all">
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
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Cloud Expertise
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-105 group">
                <skill.icon className="text-5xl text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
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

      {/* Certifications Section */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Professional Certifications
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {portfolioData.certifications.map((cert, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-105 group text-center">
                <FaCertificate className="text-4xl text-cyan-400 mx-auto mb-4 group-hover:rotate-12 transition-transform" />
                <p className="text-sm text-gray-300">{cert}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Professional Journey
            </span>
          </h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {portfolioData.experience.map((exp, idx) => (
              <div key={idx} className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-300">{exp.title}</h3>
                    <p className="text-lg text-gray-300">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-400 bg-cyan-500/20 px-4 py-2 rounded-full">
                    {exp.duration}
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <FaCloud className="text-cyan-400" />
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
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Cloud Solutions
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all hover:scale-105 group">
                <FaServer className="text-4xl text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaRocket className="text-cyan-400" />
                    {project.impact}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaChartBar className="text-cyan-400" />
                    {project.metrics}
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
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Education
            </span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all">
              <h3 className="text-2xl font-bold mb-2 text-cyan-300">{portfolioData.education.degree}</h3>
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
            <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
              Let's Build in the Cloud
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Ready to scale your infrastructure to new heights?
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-cyan-500/30 transition-all">
              <FaEnvelope />
              {portfolioData.email}
            </a>
            <a href={`tel:${portfolioData.phone}`} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-cyan-500/30 transition-all">
              <FaPhone />
              {portfolioData.phone}
            </a>
            <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full">
              <FaMapMarkerAlt />
              {portfolioData.location}
            </div>
          </div>
          <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all hover:scale-105">
            <FaRocket className="inline mr-2" />
            Start a Cloud Project
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. Powered by Cloud Technology.</p>
        </div>
      </footer>
    </div>
  );
}
