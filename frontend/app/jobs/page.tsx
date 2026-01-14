"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaBuilding, FaUsers, FaCode, FaPalette, FaChartLine, FaShieldAlt, FaFilter, FaBookmark, FaHeart } from "react-icons/fa";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import Link from "next/link";

// Mock job data
const trendingJobs = [
    {
        id: 1,
        title: "Senior UI Designer",
        company: "TechCorp",
        location: "Remote, USA",
        type: "Full-time",
        salary: "$20K",
        period: "Monthly",
        description: "Join our design team to create beautiful and functional user interfaces.",
        skills: ["Figma", "Adobe XD", "Prototyping"],
        posted: "2 days ago",
        applicants: 45,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111432.png",
        featured: true,
        bookmarked: false
    },
    {
        id: 2,
        title: "Product Designer",
        company: "StartupXYZ",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$25K",
        period: "Monthly",
        description: "Lead product design for our innovative mobile app platform.",
        skills: ["Design Systems", "User Research", "Prototyping"],
        posted: "1 day ago",
        applicants: 32,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
        featured: false,
        bookmarked: true
    },
    {
        id: 3,
        title: "Marketing Officer",
        company: "GrowthCo",
        location: "New York, NY",
        type: "Contract",
        salary: "$15K",
        period: "Monthly",
        description: "Drive marketing campaigns and brand awareness initiatives.",
        skills: ["Digital Marketing", "Analytics", "Content Strategy"],
        posted: "3 days ago",
        applicants: 78,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
        featured: true,
        bookmarked: false
    },
    {
        id: 4,
        title: "Frontend Developer",
        company: "DevStudio",
        location: "Remote",
        type: "Full-time",
        salary: "$30K",
        period: "Monthly",
        description: "Build modern web applications using React and TypeScript.",
        skills: ["React", "TypeScript", "Next.js"],
        posted: "1 week ago",
        applicants: 156,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
        featured: false,
        bookmarked: false
    },
    {
        id: 5,
        title: "Data Scientist",
        company: "Analytics Pro",
        location: "Seattle, WA",
        type: "Full-time",
        salary: "$35K",
        period: "Monthly",
        description: "Analyze complex datasets to drive business insights and decisions.",
        skills: ["Python", "Machine Learning", "SQL"],
        posted: "5 days ago",
        applicants: 89,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174854.png",
        featured: false,
        bookmarked: true
    },
    {
        id: 6,
        title: "DevOps Engineer",
        company: "CloudTech",
        location: "Austin, TX",
        type: "Full-time",
        salary: "$28K",
        period: "Monthly",
        description: "Manage cloud infrastructure and deployment pipelines.",
        skills: ["AWS", "Docker", "Kubernetes"],
        posted: "1 week ago",
        applicants: 67,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968866.png",
        featured: true,
        bookmarked: false
    },
    {
        id: 7,
        title: "Mobile App Developer",
        company: "MobileTech",
        location: "Los Angeles, CA",
        type: "Full-time",
        salary: "$32K",
        period: "Monthly",
        description: "Develop cutting-edge mobile applications for iOS and Android platforms.",
        skills: ["React Native", "Swift", "Kotlin"],
        posted: "3 days ago",
        applicants: 92,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/888/888839.png",
        featured: true,
        bookmarked: false
    },
    {
        id: 8,
        title: "Cybersecurity Analyst",
        company: "SecureNet",
        location: "Washington, DC",
        type: "Full-time",
        salary: "$40K",
        period: "Monthly",
        description: "Protect organizational assets by monitoring and analyzing security threats.",
        skills: ["CISSP", "Penetration Testing", "Network Security"],
        posted: "2 days ago",
        applicants: 54,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174883.png",
        featured: false,
        bookmarked: true
    },
    {
        id: 9,
        title: "Full Stack Developer",
        company: "WebCraft",
        location: "Remote",
        type: "Contract",
        salary: "$35K",
        period: "Monthly",
        description: "Build end-to-end web applications using modern technologies.",
        skills: ["Node.js", "PostgreSQL", "Vue.js"],
        posted: "4 days ago",
        applicants: 128,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968672.png",
        featured: false,
        bookmarked: false
    },
    {
        id: 10,
        title: "AI/ML Engineer",
        company: "FutureTech",
        location: "San Jose, CA",
        type: "Full-time",
        salary: "$45K",
        period: "Monthly",
        description: "Develop and deploy machine learning models for real-world applications.",
        skills: ["TensorFlow", "PyTorch", "MLOps"],
        posted: "1 day ago",
        applicants: 201,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
        featured: true,
        bookmarked: true
    },
    {
        id: 11,
        title: "Digital Marketing Manager",
        company: "BrandBoost",
        location: "Miami, FL",
        type: "Full-time",
        salary: "$22K",
        period: "Monthly",
        description: "Lead digital marketing strategies and campaigns across multiple channels.",
        skills: ["SEO", "Google Ads", "Social Media"],
        posted: "6 days ago",
        applicants: 76,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174876.png",
        featured: false,
        bookmarked: false
    },
    {
        id: 12,
        title: "Content Writer",
        company: "ContentCo",
        location: "Remote",
        type: "Part-time",
        salary: "$12K",
        period: "Monthly",
        description: "Create engaging content for blogs, websites, and marketing materials.",
        skills: ["Creative Writing", "SEO Writing", "WordPress"],
        posted: "5 days ago",
        applicants: 143,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        featured: false,
        bookmarked: false
    },
    {
        id: 13,
        title: "Business Analyst",
        company: "CorpSolutions",
        location: "Chicago, IL",
        type: "Full-time",
        salary: "$26K",
        period: "Monthly",
        description: "Analyze business processes and recommend improvements for efficiency.",
        skills: ["SQL", "Tableau", "Business Intelligence"],
        posted: "1 week ago",
        applicants: 88,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174848.png",
        featured: false,
        bookmarked: true
    },
    {
        id: 14,
        title: "Graphic Designer",
        company: "DesignStudio",
        location: "Portland, OR",
        type: "Full-time",
        salary: "$18K",
        period: "Monthly",
        description: "Create visual concepts and designs for print and digital media.",
        skills: ["Photoshop", "Illustrator", "InDesign"],
        posted: "2 days ago",
        applicants: 67,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968853.png",
        featured: true,
        bookmarked: false
    },
    {
        id: 15,
        title: "Project Manager",
        company: "AgileWorks",
        location: "Denver, CO",
        type: "Full-time",
        salary: "$30K",
        period: "Monthly",
        description: "Manage cross-functional teams and deliver projects on time and budget.",
        skills: ["Agile", "Scrum", "Jira"],
        posted: "3 days ago",
        applicants: 112,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174879.png",
        featured: false,
        bookmarked: false
    },
    {
        id: 16,
        title: "Backend Developer",
        company: "ServerTech",
        location: "Remote",
        type: "Full-time",
        salary: "$33K",
        period: "Monthly",
        description: "Build robust and scalable server-side applications and APIs.",
        skills: ["Python", "Django", "Redis"],
        posted: "4 days ago",
        applicants: 95,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111285.png",
        featured: false,
        bookmarked: true
    }
];

const jobCategories = [
    { name: "Marketing", icon: FaChartLine, count: "58 Jobs Available", color: "bg-gradient-to-br from-pink-500 to-rose-500" },
    { name: "Development", icon: FaCode, count: "48 Jobs Available", color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
    { name: "UI/UX Design", icon: FaPalette, count: "78 Jobs Available", color: "bg-gradient-to-br from-purple-500 to-indigo-500" },
    { name: "Human Research", icon: FaUsers, count: "120 Jobs Available", color: "bg-gradient-to-br from-green-500 to-emerald-500" },
    { name: "Security", icon: FaShieldAlt, count: "50 Jobs Available", color: "bg-gradient-to-br from-red-500 to-orange-500" },
    { name: "Business", icon: FaBriefcase, count: "31 Jobs Available", color: "bg-gradient-to-br from-amber-500 to-yellow-500" },
    { name: "Management", icon: FaUsers, count: "52 Jobs Available", color: "bg-gradient-to-br from-teal-500 to-cyan-500" },
    { name: "Finance", icon: FaDollarSign, count: "80 Jobs Available", color: "bg-gradient-to-br from-indigo-500 to-purple-500" }
];

export default function JobsPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showBookmarked, setShowBookmarked] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const filteredJobs = trendingJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLocation = locationFilter === "" || job.location.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesBookmark = !showBookmarked || job.bookmarked;

        // Category filtering
        let matchesCategory = true;
        if (selectedCategory !== "All") {
            // Map job titles to categories for demo purposes
            const jobCategoryMap: {[key: string]: string} = {
                "Senior UI Designer": "UI/UX Design",
                "Product Designer": "UI/UX Design",
                "Marketing Officer": "Marketing",
                "Frontend Developer": "Development",
                "Data Scientist": "Development",
                "DevOps Engineer": "Development"
            };
            matchesCategory = jobCategoryMap[job.title] === selectedCategory;
        }

        return matchesSearch && matchesLocation && matchesBookmark && matchesCategory;
    });

    return (
        <DashboardLayout
            sidebarActive="Jobs"
            topbarTitle="Find Your Dream Job"
            theme={theme}
            setTheme={setTheme}
        >
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className={`text-4xl font-bold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>
                        Get The Right Job You Deserve
                    </h1>
                    <p className={`text-lg ${
                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                        145,672 jobs listed from Your dream jobs is waiting.
                    </p>
                </div>

                {/* Search Section */}
                <div className={`p-6 rounded-xl border transition-all duration-300 ${
                    theme === 'light'
                        ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                        : 'bg-white/5 border-white/10 backdrop-blur-sm'
                }`}>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>Job title or keyword</label>
                            <div className="relative">
                                <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="e.g. UI Designer, Developer"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all duration-200 ${
                                        theme === 'light'
                                            ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500'
                                            : 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:ring-[#13ff8c] focus:border-[#13ff8c]'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className={`block text-sm font-medium mb-2 ${
                                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}>Location</label>
                            <div className="relative">
                                <FaMapMarkerAlt className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="New York, USA"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all duration-200 ${
                                        theme === 'light'
                                            ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500'
                                            : 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:ring-[#13ff8c] focus:border-[#13ff8c]'
                                    }`}
                                />
                            </div>
                        </div>

                        <button className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 hover:scale-105 ${
                            theme === 'light'
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400 shadow-lg hover:shadow-xl'
                                : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b] focus:ring-[#13ff8c] shadow-lg hover:shadow-[0_0_20px_rgba(19,255,140,0.3)]'
                        }`}>
                            Search
                        </button>
                    </div>
                </div>

                {/* Trending Jobs */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>Trending Jobs</h2>
                        <button className={`text-sm font-medium transition-colors ${
                            theme === 'light'
                                ? 'text-emerald-600 hover:text-emerald-700'
                                : 'text-[#13ff8c] hover:text-[#19fb9b]'
                        }`}>
                            See All Jobs
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.slice(0, 3).map((job) => (
                            <div
                                key={job.id}
                                className={`relative p-6 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                                    theme === 'light'
                                        ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-xl'
                                        : 'bg-white/5 border-white/10 hover:border-[#13ff8c]/50 hover:bg-white/10'
                                } ${job.featured ? (theme === 'light' ? 'ring-2 ring-emerald-200' : 'ring-2 ring-[#13ff8c]/30') : ''}`}
                            >
                                {job.featured && (
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                                        theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                                    }`}>
                                        <span className="text-xs">⭐</span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/20">
                                            <img src={job.companyLogo} alt={job.company} className="w-8 h-8 object-contain" />
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${
                                                theme === 'light' ? 'text-gray-900' : 'text-white'
                                            }`}>{job.title}</h3>
                                            <p className={`text-sm ${
                                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                            }`}>{job.company}</p>
                                        </div>
                                    </div>

                                    <button className={`p-2 rounded-lg transition-colors ${
                                        job.bookmarked
                                            ? theme === 'light'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                                            : theme === 'light'
                                                ? 'bg-gray-100 text-gray-400 hover:text-gray-600'
                                                : 'bg-white/10 text-gray-400 hover:text-white'
                                    }`}>
                                        <FaBookmark className="text-sm" />
                                    </button>
                                </div>

                                <p className={`text-sm mb-4 ${
                                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}>{job.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                theme === 'light'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-white/10 text-gray-300'
                                            }`}
                                        >
                      {skill}
                    </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <div className={`flex items-center gap-1 ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        <FaMapMarkerAlt />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        <FaClock />
                                        <span>{job.type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                    <span className={`text-lg font-bold ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                    }`}>{job.salary}</span>
                                        <span className={`text-sm ${
                                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                        }`}>/{job.period}</span>
                                    </div>

                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                            theme === 'light'
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                                        }`}
                                    >
                                        View Job
                                    </Link>
                                </div>

                                <div className={`mt-3 text-xs flex items-center justify-between ${
                                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                    <span>{job.posted}</span>
                                    <span>{job.applicants} applicants</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* One Platform Many Solutions */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>One Platform Many Solutions</h2>
                        <button className={`text-sm font-medium transition-colors ${
                            theme === 'light'
                                ? 'text-emerald-600 hover:text-emerald-700'
                                : 'text-[#13ff8c] hover:text-[#19fb9b]'
                        }`}>
                            See All Platform
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {jobCategories.map((category, index) => {
                            const IconComponent = category.icon;
                            const isHighlighted = index === 2; // UI/UX Design highlighted

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`group relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] text-left ${
                                        isHighlighted
                                            ? theme === 'light'
                                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg'
                                                : 'bg-[#13ff8c] border-[#13ff8c] text-black shadow-[0_0_15px_rgba(19,255,140,0.3)]'
                                            : theme === 'light'
                                                ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-900'
                                                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-white'
                                    }`}
                                >
                                    {/* Arrow for highlighted category */}
                                    {isHighlighted && (
                                        <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-y-[8px] border-y-transparent ${
                                            theme === 'light' ? 'border-l-emerald-600' : 'border-l-[#13ff8c]'
                                        }`}></div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                            isHighlighted
                                                ? 'bg-white/20'
                                                : theme === 'light'
                                                    ? 'bg-gray-100 group-hover:bg-gray-200'
                                                    : 'bg-white/10 group-hover:bg-white/20'
                                        }`}>
                                            <IconComponent className={`text-base ${
                                                isHighlighted
                                                    ? theme === 'light' ? 'text-white' : 'text-black'
                                                    : theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                                            }`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-semibold text-sm leading-tight ${
                                                isHighlighted
                                                    ? theme === 'light' ? 'text-white' : 'text-black'
                                                    : theme === 'light' ? 'text-gray-900' : 'text-white'
                                            }`}>
                                                {category.name}
                                            </h3>

                                            <p className={`text-xs mt-1 ${
                                                isHighlighted
                                                    ? theme === 'light' ? 'text-white/80' : 'text-black/70'
                                                    : theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                                {category.count}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Featured Job Circulars */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}>Featured Job Circulars</h2>
                        <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            theme === 'light'
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                        }`}>
                            Find More Jobs
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingJobs.map((job) => (
                            <div
                                key={job.id}
                                className={`relative p-6 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                                    theme === 'light'
                                        ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-xl'
                                        : 'bg-white/5 border-white/10 hover:border-[#13ff8c]/50 hover:bg-white/10'
                                } ${job.featured ? (theme === 'light' ? 'ring-2 ring-emerald-200' : 'ring-2 ring-[#13ff8c]/30') : ''}`}
                            >
                                {job.featured && (
                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                                        theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                                    }`}>
                                        <span className="text-xs">⭐</span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/20">
                                            <img src={job.companyLogo} alt={job.company} className="w-8 h-8 object-contain" />
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${
                                                theme === 'light' ? 'text-gray-900' : 'text-white'
                                            }`}>{job.title}</h3>
                                            <p className={`text-sm ${
                                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                            }`}>{job.company}</p>
                                        </div>
                                    </div>

                                    <button className={`p-2 rounded-lg transition-colors ${
                                        job.bookmarked
                                            ? theme === 'light'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                                            : theme === 'light'
                                                ? 'bg-gray-100 text-gray-400 hover:text-gray-600'
                                                : 'bg-white/10 text-gray-400 hover:text-white'
                                    }`}>
                                        <FaBookmark className="text-sm" />
                                    </button>
                                </div>

                                <p className={`text-sm mb-4 ${
                                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}>{job.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                theme === 'light'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-white/10 text-gray-300'
                                            }`}
                                        >
                      {skill}
                    </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-sm mb-4">
                                    <div className={`flex items-center gap-1 ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        <FaMapMarkerAlt />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}>
                                        <FaClock />
                                        <span>{job.type}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                    <span className={`text-lg font-bold ${
                        theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                    }`}>{job.salary}</span>
                                        <span className={`text-sm ${
                                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                        }`}>/{job.period}</span>
                                    </div>

                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                                            theme === 'light'
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                                        }`}
                                    >
                                        View Job
                                    </Link>
                                </div>

                                <div className={`mt-3 text-xs flex items-center justify-between ${
                                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                    <span>{job.posted}</span>
                                    <span>{job.applicants} applicants</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
