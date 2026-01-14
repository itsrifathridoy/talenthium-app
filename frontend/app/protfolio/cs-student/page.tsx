"use client";

import { useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDownload, FaGraduationCap, FaLaptopCode, FaTrophy, FaBook, FaUsers, FaHeart, FaGamepad, FaRocket, FaCode } from "react-icons/fa";
import { SiJavascript, SiPython, SiReact, SiNodedotjs, SiCplusplus, SiHtml5, SiCss3 } from "react-icons/si";

export default function CSStudentPortfolio() {
  const [activeSection, setActiveSection] = useState("about");

  const portfolioData = {
    name: "Emma Wilson",
    title: "Computer Science Student",
    tagline: "Learning, building, and innovating one line of code at a time",
    email: "emma.wilson@university.edu",
    phone: "+1 (555) 456-7890",
    location: "Boston, MA",
    avatar: "EW",
    github: "https://github.com/emmawilson",
    linkedin: "https://linkedin.com/in/emmawilson",
    twitter: "https://twitter.com/emmawilson_dev",
    
    about: "Passionate CS student at MIT with a love for problem-solving and creating impactful software. Currently exploring full-stack development, machine learning, and competitive programming. Active member of the university's coding club and hackathon enthusiast. Looking for summer internship opportunities in 2026!",
    
    year: "Junior (3rd Year)",
    university: "Massachusetts Institute of Technology",
    major: "Computer Science & Engineering",
    gpa: "3.85/4.00",
    expectedGraduation: "May 2027",
    
    skills: [
      { name: "Python", icon: SiPython, level: 90 },
      { name: "JavaScript", icon: SiJavascript, level: 85 },
      { name: "C#", icon: FaCode, level: 88 },
      { name: "C++", icon: SiCplusplus, level: 82 },
      { name: "React", icon: SiReact, level: 80 },
      { name: "Node.js", icon: SiNodedotjs, level: 75 },
      { name: "HTML", icon: SiHtml5, level: 92 },
      { name: "CSS", icon: SiCss3, level: 88 },
    ],
    
    experience: [
      {
        title: "Software Engineering Intern",
        company: "Tech Startup XYZ",
        duration: "Summer 2025",
        type: "Internship",
        description: "Developed full-stack features for a SaaS platform serving 10K+ users",
        achievements: [
          "Built 5 major features using React and Node.js",
          "Improved app performance by 30%",
          "Collaborated with senior engineers on architecture decisions"
        ]
      },
      {
        title: "Research Assistant",
        company: "MIT AI Lab",
        duration: "Jan 2025 - Present",
        type: "Part-time",
        description: "Assisting with machine learning research on natural language processing",
        achievements: [
          "Trained and evaluated 10+ ML models",
          "Co-authored research paper (under review)",
          "Managed dataset preparation and cleaning"
        ]
      },
    ],
    
    projects: [
      {
        name: "StudyBuddy - Collaborative Learning Platform",
        description: "Connect students for group study sessions with video chat and shared whiteboards",
        tech: ["React", "Node.js", "WebRTC", "MongoDB"],
        stars: 145,
        status: "Active",
        link: "https://studybuddy-demo.com"
      },
      {
        name: "CodeChallenge Bot",
        description: "Discord bot that sends daily coding challenges and tracks progress",
        tech: ["Python", "Discord.py", "PostgreSQL"],
        stars: 89,
        status: "Active",
        link: null
      },
      {
        name: "Campus Event Finder",
        description: "Mobile app to discover and share campus events",
        tech: ["React Native", "Firebase", "Google Maps API"],
        stars: 67,
        status: "Beta",
        link: null
      },
      {
        name: "AI Tutor Chatbot",
        description: "Intelligent chatbot to help students with homework questions",
        tech: ["Python", "OpenAI API", "Flask"],
        stars: 234,
        status: "Active",
        link: "https://aitutor-demo.com"
      },
    ],
    
    achievements: [
      { title: "1st Place - University Hackathon 2025", icon: "🏆", date: "Oct 2025" },
      { title: "Google Summer of Code Participant", icon: "🌟", date: "Summer 2025" },
      { title: "Dean's List (3 semesters)", icon: "📚", date: "2024-2025" },
      { title: "HackerRank Gold Badge - Problem Solving", icon: "⭐", date: "2025" },
    ],
    
    codingProfiles: [
      { platform: "LeetCode", solved: 456, rating: 1847, rank: "Knight" },
      { platform: "Codeforces", rating: 1654, rank: "Specialist" },
      { platform: "GitHub", repos: 34, stars: 567, followers: 123 },
    ],
    
    courses: [
      "Data Structures & Algorithms",
      "Operating Systems",
      "Computer Networks",
      "Machine Learning",
      "Database Systems",
      "Software Engineering",
      "Web Development",
      "Artificial Intelligence"
    ],
    
    interests: ["Web Development", "Machine Learning", "Competitive Programming", "Game Development", "Open Source", "UI/UX Design"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-pink-950 to-purple-950 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {portfolioData.name}
            </div>
            <div className="hidden md:flex gap-8">
              {["about", "skills", "projects", "experience", "achievements", "contact"].map((section) => (
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
            <button className="px-6 py-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all">
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
              <div className="inline-block px-4 py-2 bg-orange-500/20 rounded-full border border-orange-500/30 text-orange-300 text-sm">
                <FaGraduationCap className="inline mr-2" />
                CS Student @ {portfolioData.university}
              </div>
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {portfolioData.name}
                </span>
              </h1>
              <p className="text-2xl text-gray-300">{portfolioData.title}</p>
              <p className="text-lg text-gray-400">{portfolioData.tagline}</p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-400">Year</div>
                  <div className="font-bold">{portfolioData.year}</div>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-400">GPA</div>
                  <div className="font-bold">{portfolioData.gpa}</div>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg">
                  <div className="text-sm text-gray-400">Graduation</div>
                  <div className="font-bold">{portfolioData.expectedGraduation}</div>
                </div>
              </div>
              
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
              <div className="w-80 h-80 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center text-8xl font-bold shadow-2xl shadow-pink-500/50 transform rotate-3 hover:rotate-0 transition-transform">
                {portfolioData.avatar}
              </div>
              <div className="absolute -top-10 -right-10">
                <FaRocket className="text-6xl text-orange-400 animate-bounce" />
              </div>
              <div className="absolute -bottom-10 -left-10">
                <FaLaptopCode className="text-5xl text-pink-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative py-12 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Projects Built", value: portfolioData.projects.length, icon: FaLaptopCode },
              { label: "Hackathons Won", value: "3", icon: FaTrophy },
              { label: "GitHub Stars", value: "567", icon: FaGithub },
              { label: "LeetCode Problems", value: "456", icon: FaBook }
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <stat.icon className="text-3xl text-pink-400 mx-auto" />
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
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
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                {portfolioData.about}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-pink-400 mb-2">📚 Currently Learning</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    {portfolioData.courses.slice(0, 4).map((course, idx) => (
                      <li key={idx}>• {course}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">💡 Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.interests.slice(0, 4).map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/20 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Technical Skills
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioData.skills.map((skill, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 hover:rotate-1 group">
                <skill.icon className="text-5xl text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-lg font-semibold mb-2">{skill.name}</div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
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
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              My Projects
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105 group">
                <div className="flex items-center justify-between mb-4">
                  <FaLaptopCode className="text-3xl text-pink-400" />
                  <div className="flex items-center gap-4">
                    {project.link && (
                      <a href={project.link} className="text-sm text-orange-400 hover:underline">
                        View Demo →
                      </a>
                    )}
                    <div className="flex items-center gap-1 text-yellow-400">
                      <FaGithub />
                      <span className="text-sm font-bold">{project.stars}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold group-hover:text-pink-400 transition-colors">
                    {project.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    project.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-pink-500/20 rounded-full text-xs text-pink-300">
                      {tech}
                    </span>
                  ))}
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
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Experience
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
                  <div className="text-right">
                    <div className="text-sm text-gray-400 bg-pink-500/20 px-4 py-2 rounded-full mb-2">
                      {exp.duration}
                    </div>
                    <div className="text-xs text-orange-400">{exp.type}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      {achievement}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements & Coding Profiles */}
      <div className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Achievements & Recognition
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {portfolioData.achievements.map((achievement, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/50 transition-all hover:scale-105">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{achievement.title}</h4>
                    <p className="text-sm text-gray-400">{achievement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-6 text-center text-pink-400">Coding Profiles</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {portfolioData.codingProfiles.map((profile, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/50 transition-all text-center">
                <h4 className="text-xl font-bold mb-4 text-orange-400">{profile.platform}</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  {profile.solved && <div>Problems Solved: <span className="font-bold">{profile.solved}</span></div>}
                  {profile.rating && <div>Rating: <span className="font-bold text-pink-400">{profile.rating}</span></div>}
                  {profile.rank && <div>Rank: <span className="font-bold text-purple-400">{profile.rank}</span></div>}
                  {profile.repos && <div>Repositories: <span className="font-bold">{profile.repos}</span></div>}
                  {profile.stars && <div>Stars: <span className="font-bold text-yellow-400">{profile.stars}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Let's Connect!
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Open to internships, collaborations, and exciting opportunities!
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
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-pink-500/50 transition-all hover:scale-105">
            <FaHeart className="inline mr-2" />
            Let's Collaborate
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-8 px-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2026 {portfolioData.name}. Made with <FaHeart className="inline text-pink-400" /> and lots of coffee ☕</p>
        </div>
      </footer>
    </div>
  );
}
