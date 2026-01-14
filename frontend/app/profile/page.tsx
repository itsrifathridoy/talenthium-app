"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { 
  FaEdit, 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt, 
  FaDownload,
  FaPlus,
  FaStar,
  FaCode,
  FaUsers,
  FaAward,
  FaBookmark,
  FaFileAlt,
  FaCertificate,
  FaProjectDiagram,
  FaComments,
  FaBriefcase,
  FaGraduationCap,
  FaChartLine,
  FaBook,
  FaTrophy,
  FaThumbsUp,
  FaPuzzlePiece,
  FaEllipsisH,
  FaChevronDown,
  FaReact,
  FaNodeJs,
  FaPython
} from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';
import Link from 'next/link';

// Mock user data
const userData = {
  id: 1,
  firstName: "Alex",
  lastName: "Thompson",
  username: "alex.thompson",
  email: "alex.thompson@talenthium.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  title: "Full Stack Developer",
  company: "TechCorp Inc.",
  bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud architecture. Always eager to learn new technologies and mentor upcoming developers.",
  avatar: "AT",
  joinDate: "January 2023",
  isVerified: true,
  isMentor: true,
  profileViews: 1247,
  connections: 342,
  rating: 4.8,
  totalProjects: 24,
  mentoringSessions: 89,
  contributionStreak: 156,
  
  // Social links
  socialLinks: {
    github: "https://github.com/alexthompson",
    linkedin: "https://linkedin.com/in/alexthompson",
    twitter: "https://twitter.com/alexthompson",
    website: "https://alexthompson.dev"
  },

  // Skills
  skills: [
    { name: "React", level: 95, category: "Frontend" },
    { name: "Node.js", level: 90, category: "Backend" },
    { name: "TypeScript", level: 88, category: "Language" },
    { name: "Python", level: 85, category: "Language" },
    { name: "AWS", level: 82, category: "Cloud" },
    { name: "Docker", level: 80, category: "DevOps" },
    { name: "MongoDB", level: 78, category: "Database" },
    { name: "PostgreSQL", level: 85, category: "Database" }
  ],

  // Experience - Grouped by Company
  experience: [
    {
      company: "TechCorp Inc.",
      logo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
      positions: [
        {
          id: 1,
          title: "Senior Full Stack Developer",
          duration: "Mar 2022 - Present",
          location: "San Francisco, CA",
          type: "Full-time",
          description: "Lead development of microservices architecture serving 1M+ users. Built scalable React applications and RESTful APIs.",
          achievements: [
            "Improved application performance by 40%",
            "Led team of 5 developers", 
            "Implemented CI/CD pipelines"
          ]
        },
        {
          id: 2,
          title: "Full Stack Developer",
          duration: "Jan 2021 - Feb 2022",
          location: "San Francisco, CA", 
          type: "Full-time",
          description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.",
          achievements: [
            "Built 8+ production features",
            "Reduced API response time by 25%",
            "Mentored 2 junior developers"
          ]
        }
      ]
    },
    {
      company: "StartupXYZ",
      logo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
      positions: [
        {
          id: 3,
          title: "Software Engineer II",
          duration: "May 2021 - Aug 2023",
          location: "Bengaluru, India",
          type: "Full-time", 
          description: "Developed responsive web applications using React and modern JavaScript frameworks. Led frontend architecture decisions.",
          achievements: [
            "Built 15+ production applications",
            "Reduced bundle size by 30%",
            "Implemented responsive design system"
          ]
        },
        {
          id: 4,
          title: "Software Engineer",
          duration: "Jul 2019 - Apr 2021",
          location: "Bengaluru, India",
          type: "Full-time",
          description: "Worked on various frontend projects using React and JavaScript. Contributed to code reviews and best practices.",
          achievements: [
            "Delivered 12+ feature releases",
            "Improved code test coverage to 85%",
            "Optimized application performance"
          ]
        },
        {
          id: 5,
          title: "Software Engineering Intern", 
          duration: "Dec 2018 - Jun 2019",
          location: "Bengaluru, India",
          type: "Internship",
          description: "Gained hands-on experience in web development. Worked on small features and bug fixes under senior developer guidance.",
          achievements: [
            "Fixed 25+ bugs and issues",
            "Learned React and modern JS",
            "Contributed to team documentation"
          ]
        }
      ]
    }
  ],

  // Projects
  projects: [
    {
      id: 1,
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React, Node.js, and Stripe integration",
      image: "https://cdn-icons-png.flaticon.com/512/3081/3081648.png",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      githubUrl: "https://github.com/alexthompson/ecommerce",
      liveUrl: "https://ecommerce-demo.alexthompson.dev",
      stars: 234,
      forks: 45,
      status: "Live"
    },
    {
      id: 2,
      name: "Task Management App",
      description: "Collaborative task management with real-time updates and team features",
      image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      technologies: ["React", "Socket.io", "Express", "PostgreSQL"],
      githubUrl: "https://github.com/alexthompson/taskmanager",
      liveUrl: "https://tasks.alexthompson.dev",
      stars: 189,
      forks: 32,
      status: "Live"
    },
    {
      id: 3,
      name: "AI Code Assistant",
      description: "VS Code extension that provides AI-powered code suggestions and reviews",
      image: "https://cdn-icons-png.flaticon.com/512/2103/2103658.png",
      technologies: ["TypeScript", "OpenAI API", "VS Code API"],
      githubUrl: "https://github.com/alexthompson/ai-assistant",
      liveUrl: null,
      stars: 156,
      forks: 28,
      status: "Development"
    }
  ],

  // Achievements
  achievements: [
    {
      id: 1,
      title: "Top Contributor 2024",
      description: "Awarded for outstanding contributions to open source projects",
      date: "Dec 2024",
      icon: "🏆"
    },
    {
      id: 2,
      title: "Mentor of the Month",
      description: "Recognized for helping 20+ developers improve their skills",
      date: "Nov 2024", 
      icon: "🎓"
    },
    {
      id: 3,
      title: "100 Days Streak",
      description: "Maintained coding streak for 100 consecutive days",
      date: "Oct 2024",
      icon: "🔥"
    }
  ],

  // Education
  education: [
    {
      id: 1,
      degree: "Bachelor of Science in Computer Science & Engineering",
      school: "United International University",
      logo: "https://jsinthiya.pages.dev/uiu.svg",
      duration: "Feb 2022 – Present",
      location: "Dhaka, Bangladesh",
      gpa: "3.82/4.00 CGPA",
      description: "Undergraduate",
      achievements: []
    },
    {
      id: 2,
      degree: "Higher Secondary School Certificate (HSC), Science",
      school: "Dhaka Cantonment Girls' Public School & College",
      logo: "https://jsinthiya.pages.dev/college.gif",
      duration: "2020",
      location: "Dhaka, Bangladesh",
      gpa: "5.00/5.00 GPA",
      description: "Secondary",
      achievements: []
    },
    {
      id: 3,
      degree: "Secondary School Certificate (SSC), Science",
      school: "Banani Bidyaniketan School & College",
      logo: "https://jsinthiya.pages.dev/school.png",
      duration: "2018",
      location: "Dhaka, Bangladesh",
      gpa: "5.00/5.00 GPA",
      description: "Secondary",
      achievements: []
    }
  ],

  // Publications
  publications: [
    {
      id: 1,
      title: "Scalable Real-time Data Processing in Distributed Systems",
      authors: "Alex Thompson, Dr. Sarah Johnson, Dr. Michael Chen",
      journal: "IEEE Transactions on Parallel and Distributed Systems",
      year: 2020,
      type: "Journal Article",
      citations: 45,
      doi: "10.1109/TPDS.2020.1234567",
      abstract: "This paper presents a novel approach to real-time data processing in distributed environments, achieving 40% better performance than existing solutions."
    },
    {
      id: 2,
      title: "Machine Learning Approaches for Code Quality Assessment",
      authors: "Alex Thompson, Dr. Emily Rodriguez",
      journal: "ACM Computing Surveys",
      year: 2019,
      type: "Conference Paper",
      citations: 28,
      doi: "10.1145/3301275.3301276",
      abstract: "An comprehensive survey of ML techniques applied to automatic code quality assessment and bug prediction."
    },
    {
      id: 3,
      title: "Modern Frontend Architecture Patterns",
      authors: "Alex Thompson",
      journal: "Medium Tech Blog",
      year: 2024,
      type: "Blog Post",
      citations: 156,
      doi: null,
      abstract: "A practical guide to implementing scalable frontend architectures using modern JavaScript frameworks."
    }
  ],

  // Recommendations
  recommendations: [
    {
      id: 1,
      recommender: "Sarah Johnson",
      title: "Senior Engineering Manager",
      company: "Google",
      relationship: "Direct Manager",
      date: "Dec 2024",
      avatar: "SJ",
      text: "Alex is one of the most talented developers I've had the pleasure of working with. Their ability to architect scalable solutions while mentoring junior developers is exceptional. Alex consistently delivers high-quality code and has a natural leadership ability."
    },
    {
      id: 2,
      recommender: "Michael Chen",
      title: "Tech Lead",
      company: "TechCorp Inc.",
      relationship: "Colleague",
      date: "Nov 2024",
      avatar: "MC",
      text: "Working with Alex on our microservices migration was incredible. They brought fresh perspectives and helped us improve our system performance by 40%. Alex is detail-oriented, collaborative, and always willing to share knowledge."
    },
    {
      id: 3,
      recommender: "Emily Rodriguez",
      title: "Product Manager",
      company: "StartupXYZ",
      relationship: "Cross-functional Partner",
      date: "Oct 2024",
      avatar: "ER",
      text: "Alex bridged the gap between technical complexity and business requirements beautifully. They translated complex technical concepts into understandable terms and always delivered features that exceeded expectations."
    }
  ],

  // Problem Solving Profiles
  codingProfiles: [
    {
      platform: "LeetCode",
      username: "alexthompson_dev",
      ranking: 1247,
      totalProblems: 890,
      solvedProblems: 745,
      easyProblems: 285,
      mediumProblems: 340,
      hardProblems: 120,
      contestRating: 2156,
      badges: ["Knight", "Guardian", "50 Days Badge 2024"],
      logo: "https://cdn-icons-png.flaticon.com/512/2721/2721297.png"
    },
    {
      platform: "Codeforces",
      username: "alex_codes",
      ranking: 892,
      rating: 1876,
      maxRating: 1923,
      contestsParticipated: 45,
      problemsSolved: 432,
      rank: "Candidate Master",
      badges: ["Div 2 Winner", "Problem Setter"],
      logo: "https://cdn-icons-png.flaticon.com/512/2721/2721297.png"
    },
    {
      platform: "HackerRank",
      username: "alexthompson_hr",
      ranking: 567,
      totalScore: 12450,
      problemsSolved: 234,
      certificates: ["Problem Solving (Advanced)", "JavaScript (Advanced)", "React (Intermediate)"],
      skills: ["Algorithms", "Data Structures", "Mathematics", "AI"],
      badges: ["5 Star Problem Solver", "Gold Badge - JavaScript"],
      logo: "https://cdn-icons-png.flaticon.com/512/2721/2721297.png"
    }
  ],

  // Attachments/Documents - REMOVED
};

const mainTabs = [
  { id: 'overview', label: 'Overview', icon: FaUsers },
  { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
  { id: 'experience', label: 'Experience', icon: FaBriefcase },
  { id: 'education', label: 'Education', icon: FaGraduationCap },
  { id: 'skills', label: 'Skills', icon: FaCode },
  { id: 'publications', label: 'Publications', icon: FaBook },
];

const moreTabs = [
  { id: 'coding-arena', label: 'Coding Arena', icon: FaPuzzlePiece },
  { id: 'recommendations', label: 'Recommendations', icon: FaThumbsUp },
  { id: 'achievements', label: 'Achievements', icon: FaAward }
];

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get all valid tab IDs
  const allValidTabs = [
    ...mainTabs.map(tab => tab.id),
    ...moreTabs.map(tab => tab.id)
  ];

  // Initialize activeTab directly from URL parameters
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam && allValidTabs.includes(tabParam)) {
      return tabParam;
    }
    return 'overview';
  };

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
      if (savedTheme) return savedTheme;
    }
    return "light";
  });
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // No need for useEffect to set theme from localStorage; handled in useState initializer

  // Handle URL query parameters for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && !allValidTabs.includes(tabParam)) {
      // Invalid tab parameter, redirect to overview
      router.replace('/profile?tab=overview');
    } else if (tabParam && allValidTabs.includes(tabParam)) {
      // Valid tab parameter, update state if different
      if (activeTab !== tabParam) {
        setActiveTab(tabParam);
      }
    } else if (!tabParam && activeTab !== 'overview') {
      // No tab parameter, default to overview
      setActiveTab('overview');
    }
  }, [searchParams, router, allValidTabs, activeTab]);

  // Function to change tab and update URL
  const changeTab = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/profile?tab=${tabId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.more-dropdown')) {
          setShowMoreDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreDropdown]);

  const handleMoreButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!showMoreDropdown) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setShowMoreDropdown(!showMoreDropdown);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Professional Summary */}
            <div className={`p-6 rounded-xl border ${
              theme === 'light' 
                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                : 'bg-white/5 border-white/10 backdrop-blur-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>Professional Summary</h3>
                <button className={`p-2 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-[#13ff8c] hover:bg-[#13ff8c]/10'
                }`}>
                  <FaEdit />
                </button>
              </div>
              <p className={`leading-relaxed ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>{userData.bio}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Projects', value: userData.totalProjects, icon: FaProjectDiagram, color: 'blue' },
                { label: 'Publications', value: userData.publications.length, icon: FaBook, color: 'purple' },
                { label: 'Rating', value: userData.rating, icon: FaStar, color: 'yellow' },
                { label: 'Connections', value: userData.connections, icon: FaUsers, color: 'green' }
              ].map((stat, index) => (
                <div key={index} className={`p-4 rounded-xl border text-center transition-all duration-300 hover:scale-105 ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm hover:shadow-xl' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10'
                }`}>
                  <stat.icon className={`mx-auto mb-2 text-xl ${
                    stat.color === 'blue' ? (theme === 'light' ? 'text-blue-600' : 'text-blue-400') :
                    stat.color === 'purple' ? (theme === 'light' ? 'text-purple-600' : 'text-purple-400') :
                    stat.color === 'yellow' ? (theme === 'light' ? 'text-yellow-600' : 'text-yellow-400') :
                    (theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]')
                  }`} />
                  <div className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{stat.value}</div>
                  <div className={`text-sm ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Two Column Layout for Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Tech Stack */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Top Tech Stack</h3>
                    <Link href="/profile?tab=skills" className={`text-sm font-medium ${
                      theme === 'light' ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#13ff8c] hover:text-[#19fb9b]'
                    }`}>
                      View All →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {userData.skills.slice(0, 6).map((skill, index) => {
                      // Get appropriate icon for each technology
                      const getSkillIcon = (skillName: string) => {
                        switch (skillName.toLowerCase()) {
                          case 'react':
                            return <FaReact className="text-cyan-400" />;
                          case 'node.js':
                            return <FaNodeJs className="text-green-500" />;
                          case 'typescript':
                            return <SiTypescript className="text-blue-400" />;
                          case 'python':
                            return <FaPython className="text-yellow-500" />;
                          case 'aws':
                            return <span className="text-orange-400">☁️</span>;
                          case 'docker':
                            return <span className="text-blue-500">🐳</span>;
                          case 'mongodb':
                            return <span className="text-green-600">🍃</span>;
                          case 'postgresql':
                            return <span className="text-blue-600">🐘</span>;
                          default:
                            return <FaCode className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'} />;
                        }
                      };

                      return (
                        <span key={index} className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold text-sm ${
                          theme === 'light' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-[#13ff8c]/10 border-[#13ff8c]/30 text-[#13ff8c]'
                        } border`}>
                          {getSkillIcon(skill.name)}
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Top Publications */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Top Publications</h3>
                    <Link href="/profile?tab=publications" className={`text-sm font-medium ${
                      theme === 'light' ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#13ff8c] hover:text-[#19fb9b]'
                    }`}>
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {userData.publications.slice(0, 2).map((pub) => (
                      <div key={pub.id} className={`p-4 rounded-lg border ${
                        theme === 'light' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <h4 className={`font-semibold text-sm mb-1 ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{pub.title}</h4>
                        <p className={`text-xs mb-2 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>{pub.journal} • {pub.year}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`flex items-center gap-1 ${
                            theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                          }`}>
                            <FaBook />
                            {pub.type}
                          </span>
                          <span className={`flex items-center gap-1 ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            📊 {pub.citations} citations
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Best Projects */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Featured Projects</h3>
                    <Link href="/profile?tab=projects" className={`text-sm font-medium ${
                      theme === 'light' ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#13ff8c] hover:text-[#19fb9b]'
                    }`}>
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {userData.projects.slice(0, 2).map((project) => (
                      <div key={project.id} className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                        theme === 'light' 
                          ? 'bg-gray-50 border-gray-200 hover:shadow-md' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <img src={project.image} alt={project.name} className="w-6 h-6 object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold text-sm truncate ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>{project.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                project.status === 'Live' 
                                  ? (theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400')
                                  : (theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/20 text-yellow-400')
                              }`}>{project.status}</span>
                            </div>
                            <p className={`text-xs mb-2 line-clamp-2 ${
                              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                            }`}>{project.description}</p>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`flex items-center gap-1 ${
                                theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'
                              }`}>
                                <FaStar />
                                {project.stars}
                              </span>
                              <span className={`flex items-center gap-1 ${
                                theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                              }`}>
                                🍴 {project.forks}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Honors & Awards */}
                <div className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Honors & Awards</h3>
                    <Link href="/profile?tab=achievements" className={`text-sm font-medium ${
                      theme === 'light' ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#13ff8c] hover:text-[#19fb9b]'
                    }`}>
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {userData.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className={`p-3 rounded-lg border ${
                        theme === 'light' 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>{achievement.title}</h4>
                            <p className={`text-xs ${
                              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                            }`}>{achievement.description}</p>
                            <p className={`text-xs font-medium mt-1 ${
                              theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                            }`}>{achievement.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>My Projects ({userData.projects.length})</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Add Project
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData.projects.map((project) => (
                <div key={project.id} className={`p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm hover:shadow-xl' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10'
                }`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                      <img src={project.image} alt={project.name} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>{project.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          project.status === 'Live'
                            ? theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400'
                            : theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>{project.status}</span>
                      </div>
                      <p className={`text-sm mb-3 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>{project.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs mb-3">
                        <span className={`flex items-center gap-1 ${
                          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <FaStar className={theme === 'light' ? 'text-yellow-500' : 'text-yellow-400'} />
                          {project.stars}
                        </span>
                        <span className={`${
                          theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                        }`}>Forks: {project.forks}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <span key={techIndex} className={`px-2 py-0.5 rounded text-xs ${
                            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-gray-300'
                          }`}>{tech}</span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-gray-300'
                          }`}>+{project.technologies.length - 3}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <a href={project.githubUrl} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                          theme === 'light'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}>
                          <FaGithub />
                          Code
                        </a>
                        {project.liveUrl && (
                          <a href={project.liveUrl} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            theme === 'light'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-[#13ff8c]/20 text-[#13ff8c] hover:bg-[#13ff8c]/30'
                          }`}>
                            <FaGlobe />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Work Experience</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Add Experience
              </button>
            </div>

            <div className="space-y-8">
              {userData.experience.map((company, companyIndex) => (
                <div key={companyIndex} className={`relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  theme === 'light' 
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm hover:shadow-xl' 
                    : 'bg-[#13ff8c]/10 border-[#13ff8c]/30 shadow-lg hover:shadow-2xl backdrop-blur-sm'
                }`}>
                  {/* Company Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      {/* Company Logo with Google-style elevation */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg ${
                        theme === 'light' 
                          ? 'bg-white border border-gray-100' 
                          : 'bg-gray-700 border border-gray-600'
                      }`}>
                        <img src={company.logo} alt={company.company} className="w-10 h-10 object-contain" />
                      </div>
                      {/* Vertical line extending down from logo through all positions */}
                      {company.positions.length > 0 && (
                        <div className={`absolute left-1/2 top-14 w-0.5 ${
                          theme === 'light' ? 'bg-gradient-to-b from-blue-200 to-gray-200' : 'bg-gradient-to-b from-blue-400/50 to-gray-600'
                        }`} 
                        style={{ 
                          transform: 'translateX(-50%)',
                          height: `${company.positions.length * 140 - 40}px`
                        }}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-xl font-semibold tracking-tight ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{company.company}</h4>
                      <p className={`text-sm mt-1 ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>{company.positions.length} position{company.positions.length > 1 ? 's' : ''}</p>
                    </div>
                    {/* Company action menu */}
                    <button className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
                      theme === 'light'
                        ? 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                        : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
                    }`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Positions */}
                  <div className="space-y-6">
                    {company.positions.map((position, positionIndex) => (
                      <div key={position.id} className={`relative flex items-start p-4 rounded-xl transition-all duration-300`}>
                        {/* Curved line from company logo to position */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg 
                            className="absolute left-0 top-4 w-16 h-8" 
                            viewBox="0 0 64 32"
                            fill="none"
                          >
                            <path 
                              d="M 24 0 Q 40 0 64 16" 
                              stroke={theme === 'light' ? '#e3f2fd' : 'rgba(59, 130, 246, 0.3)'} 
                              strokeWidth="2" 
                              fill="none"
                            />
                          </svg>
                          
                          {/* Position indicator dot with Google-style ripple */}
                          <div className={`absolute right-0 top-7 w-3 h-3 rounded-full shadow-sm ${
                            theme === 'light' 
                              ? 'bg-blue-500 ring-2 ring-blue-100' 
                              : 'bg-blue-400 ring-2 ring-blue-400/20'
                          }`}></div>
                        </div>

                        {/* Position Details */}
                        <div className="flex-1 ml-2 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className={`font-semibold text-lg tracking-tight ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}>{position.title}</h5>
                              
                              {/* Verification Badge with Google-style chip */}
                              <div className="flex items-center gap-3 mt-2">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                  theme === 'light' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    theme === 'light' ? 'bg-green-500' : 'bg-green-400'
                                  }`}></div>
                                  Verified
                                </div>
                              </div>
                              
                              <div className={`flex items-center gap-6 mt-3 text-sm ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  {position.duration}
                                </span>
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  {position.location}
                                </span>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  theme === 'light' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-[#13ff8c]/20 text-[#13ff8c] border border-[#13ff8c]/30'
                                }`}>{position.type}</span>
                              </div>
                            </div>
                            
                            {/* Edit Button with Google-style FAB */}
                            <button className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
                              theme === 'light'
                                ? 'text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-md'
                                : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
                            }`}>
                              <FaEdit className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Description with Google-style typography */}
                          <p className={`mt-4 text-sm leading-relaxed ${
                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                          }`}>{position.description}</p>

                          {/* Skills/Technologies with Google-style chips */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {position.achievements.slice(0, 3).map((skill, skillIndex) => (
                              <span key={skillIndex} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                theme === 'light' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                              }`}>
                                {skill.length > 30 ? skill.substring(0, 30) + '...' : skill}
                              </span>
                            ))}
                            {position.achievements.length > 3 && (
                              <button className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                theme === 'light' 
                                  ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100' 
                                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                              }`}>
                                +{position.achievements.length - 3} more
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Education</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Add Education
              </button>
            </div>

            <div className="space-y-6">
              {userData.education.map((edu) => (
                <div key={edu.id} className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                      <img src={edu.logo} alt={edu.school} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className={`font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{edu.degree}</h4>
                          <p className={`text-sm ${
                            theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                          }`}>{edu.school}</p>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'text-gray-400 hover:bg-gray-100'
                            : 'text-gray-500 hover:bg-white/10'
                        }`}>
                          <FaEdit />
                        </button>
                      </div>
                      
                      <div className={`flex items-center gap-4 text-sm mb-3 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          {edu.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          {edu.location}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
                        }`}>GPA: {edu.gpa}</span>
                      </div>

                      <p className={`mb-4 ${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                      }`}>{edu.description}</p>

                      <div>
                        <h5 className={`font-semibold mb-2 ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>Achievements:</h5>
                        <ul className="space-y-1">
                          {edu.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className={`flex items-start gap-2 text-sm ${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                                theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                              }`}></div>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Technical Skills</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Add Skill
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData.skills.map((skill, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{skill.name}</h4>
                      <p className={`text-xs ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                      }`}>{skill.category}</p>
                    </div>
                    <span className={`text-sm font-bold ${
                      theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                    }`}>{skill.level}%</span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-2 ${
                    theme === 'dark' ? 'bg-white/10' : ''
                  }`}>
                    <div 
                      className={`h-2 rounded-full ${
                        theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                      }`}
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'publications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Publications & Research</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Add Publication
              </button>
            </div>

            <div className="space-y-6">
              {userData.publications.map((pub) => (
                <div key={pub.id} className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{pub.title}</h4>
                      <p className={`text-sm mb-2 ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>By: {pub.authors}</p>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className={`${
                          theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                        }`}>{pub.journal}</span>
                        <span className={`${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>{pub.year}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
                        }`}>{pub.type}</span>
                        <span className={`flex items-center gap-1 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          <FaStar className={theme === 'light' ? 'text-yellow-500' : 'text-yellow-400'} />
                          {pub.citations} citations
                        </span>
                      </div>
                    </div>
                    <button className={`p-2 rounded-lg transition-colors ${
                      theme === 'light'
                        ? 'text-gray-400 hover:bg-gray-100'
                        : 'text-gray-500 hover:bg-white/10'
                    }`}>
                      <FaEdit />
                    </button>
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-4 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}>{pub.abstract}</p>
                  
                  {pub.doi && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>DOI:</span>
                      <a href={`https://doi.org/${pub.doi}`} className={`text-xs ${
                        theme === 'light' ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#13ff8c] hover:text-[#19fb9b]'
                      }`}>
                        {pub.doi}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'coding-arena':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Coding Arena 🏆</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Connect Platform
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userData.codingProfiles.map((profile, index) => (
                <div key={index} className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                      <img src={profile.logo} alt={profile.platform} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}>{profile.platform}</h4>
                      <p className={`text-sm ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>@{profile.username}</p>
                    </div>
                  </div>

                  {profile.platform === 'LeetCode' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.ranking}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Global Ranking</div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.contestRating}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Contest Rating</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm font-semibold mb-2 ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>Problems Solved: {profile.solvedProblems}/{profile.totalProblems}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className={theme === 'light' ? 'text-green-600' : 'text-green-400'}>Easy: {profile.easyProblems}</span>
                            <span className={theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'}>Medium: {profile.mediumProblems}</span>
                            <span className={theme === 'light' ? 'text-red-600' : 'text-red-400'}>Hard: {profile.hardProblems}</span>
                          </div>
                          <div className={`w-full bg-gray-200 rounded-full h-2 ${
                            theme === 'dark' ? 'bg-white/10' : ''
                          }`}>
                            <div 
                              className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-2 rounded-full"
                              style={{ width: `${profile.solvedProblems && profile.totalProblems ? (profile.solvedProblems / profile.totalProblems) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.platform === 'Codeforces' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.rating}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Current Rating</div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.maxRating}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Max Rating</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                        }`}>{profile.rank}</span>
                        <span className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                        }`}>{profile.contestsParticipated} contests</span>
                      </div>
                    </div>
                  )}

                  {profile.platform === 'HackerRank' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.totalScore}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Total Score</div>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          theme === 'light' ? 'bg-gray-50' : 'bg-white/5'
                        }`}>
                          <div className={`text-lg font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{profile.problemsSolved}</div>
                          <div className={`text-xs ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>Problems Solved</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className={`text-sm font-semibold mb-2 ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>Certificates:</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.certificates.slice(0, 2).map((cert, certIndex) => (
                            <span key={certIndex} className={`px-2 py-1 rounded text-xs ${
                              theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-500/20 text-green-400'
                            }`}>{cert}</span>
                          ))}
                          {profile.certificates.length > 2 && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-white/10 text-gray-300'
                            }`}>+{profile.certificates.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {profile.badges.slice(0, 3).map((badge, badgeIndex) => (
                        <span key={badgeIndex} className={`px-2 py-1 rounded text-xs font-medium ${
                          theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>🏆 {badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>Recommendations</h3>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
              }`}>
                <FaPlus className="text-sm" />
                Request Recommendation
              </button>
            </div>

            <div className="space-y-6">
              {userData.recommendations.map((rec) => (
                <div key={rec.id} className={`p-6 rounded-xl border ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                    }`}>
                      {rec.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className={`font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}>{rec.recommender}</h4>
                          <p className={`text-sm ${
                            theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                          }`}>{rec.title} at {rec.company}</p>
                          <p className={`text-xs ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                          }`}>{rec.relationship} • {rec.date}</p>
                        </div>
                        <button className={`p-2 rounded-lg transition-colors ${
                          theme === 'light'
                            ? 'text-gray-400 hover:bg-gray-100'
                            : 'text-gray-500 hover:bg-white/10'
                        }`}>
                          <FaEdit />
                        </button>
                      </div>
                      
                      <blockquote className={`text-sm leading-relaxed italic border-l-4 pl-4 ${
                        theme === 'light' 
                          ? 'text-gray-700 border-emerald-300' 
                          : 'text-gray-300 border-[#13ff8c]'
                      }`}>
                        "{rec.text}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <h3 className={`text-lg font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>Achievements & Certifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.achievements.map((achievement) => (
                <div key={achievement.id} className={`p-6 rounded-xl border text-center transition-all duration-200 hover:scale-[1.02] ${
                  theme === 'light' 
                    ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm hover:shadow-xl' 
                    : 'bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10'
                }`}>
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h4 className={`font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{achievement.title}</h4>
                  <p className={`text-sm mb-3 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>{achievement.description}</p>
                  <p className={`text-xs ${
                    theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                  }`}>{achievement.date}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      sidebarActive="Profile"
      topbarTitle="My Profile"
      theme={theme}
      setTheme={setTheme}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className={`p-6 rounded-xl border ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
            : 'bg-white/5 border-white/10 backdrop-blur-sm'
        }`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#13ff8c]/20 text-[#13ff8c]'
              }`}>
                {getInitials(userData.firstName, userData.lastName)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-2xl font-bold ${
                    theme === 'light' ? 'text-gray-900' : 'text-white'
                  }`}>{userData.firstName} {userData.lastName}</h1>
                  {userData.isVerified && (
                    <div className={`p-1 rounded-full ${
                      theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'
                    }`}>
                      <FaCertificate className={`text-sm ${
                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      }`} />
                    </div>
                  )}
                  {userData.isMentor && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                    }`}>Mentor</span>
                  )}
                </div>
                <p className={`text-lg font-medium mb-1 ${
                  theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                }`}>{userData.title}</p>
                <p className={`mb-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>{userData.company}</p>
                <div className={`flex items-center gap-4 text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt />
                    {userData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    Joined {userData.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info and Actions */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className={theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'} />
                      <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{userData.email}</span>
                      <button className={`text-xs ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>Edit</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className={theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'} />
                      <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{userData.phone}</span>
                      <button className={`text-xs ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>Edit</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className={theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'} />
                      <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{userData.username}</span>
                      <button className={`text-xs ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>Edit</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaChartLine className={theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'} />
                      <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{userData.profileViews} profile views</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className={`p-2 rounded-lg transition-colors ${
                    theme === 'light'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                  }`}>
                    <FaEdit />
                  </button>
                  <button className={`p-2 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}>
                    <FaDownload />
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: FaGithub, url: userData.socialLinks.github },
                  { icon: FaLinkedin, url: userData.socialLinks.linkedin },
                  { icon: FaTwitter, url: userData.socialLinks.twitter },
                  { icon: FaGlobe, url: userData.socialLinks.website }
                ].map((social, index) => (
                  <a key={index} href={social.url} className={`p-2 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}>
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`rounded-xl border relative ${
          theme === 'light' 
            ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm' 
            : 'bg-white/5 border-white/10 backdrop-blur-sm'
        }`}>
          <div className="flex overflow-x-auto">
            {/* Main Tabs */}
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? theme === 'light'
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-[#13ff8c] text-[#13ff8c] bg-[#13ff8c]/10'
                    : theme === 'light'
                      ? 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="text-sm" />
                {tab.label}
              </button>
            ))}
            
            {/* More Dropdown */}
            <div className="relative more-dropdown">
              <button
                onClick={handleMoreButtonClick}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  moreTabs.some(tab => tab.id === activeTab)
                    ? theme === 'light'
                      ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                      : 'border-[#13ff8c] text-[#13ff8c] bg-[#13ff8c]/10'
                    : theme === 'light'
                      ? 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FaEllipsisH className="text-sm" />
                More
                <FaChevronDown className={`text-xs transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Position Dropdown Menu */}
        {showMoreDropdown && (
          <div 
            className={`fixed w-56 rounded-lg border shadow-xl z-[9999] more-dropdown ${
              theme === 'light'
                ? 'bg-white border-gray-200 shadow-xl'
                : 'bg-gray-800 border-gray-700 shadow-xl'
            }`}
            style={{ 
              top: dropdownPosition.top, 
              right: dropdownPosition.right
            }}
          >
            {moreTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  changeTab(tab.id);
                  setShowMoreDropdown(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  activeTab === tab.id
                    ? theme === 'light'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-[#13ff8c]/10 text-[#13ff8c]'
                    : theme === 'light'
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <tab.icon className="text-sm" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
}
