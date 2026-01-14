"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '../../../components/layouts/DashboardLayout';
import { FaBookmark, FaShare, FaMapMarkerAlt, FaClock, FaBuilding, FaUsers, FaCalendarAlt, FaDownload, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Mock job data (same as in the main jobs page)
const jobsData = [
    {
        id: 1,
        title: "UI/UX Designer",
        company: "Pixelz Studio",
        location: "Yogyakarta, Indonesia",
        type: "Fulltime",
        remote: "Remote",
        experience: "2-4 Years",
        salary: "$20K",
        period: "Monthly",
        description: "As an UI/UX Designer on Pixelz Studio, you'll focus on design user-friendly on several platform (web, mobile, dashboard, etc) to our users needs. Your innovative solution will enhance the user experience on several platform. Join us and let's making impact on user engagement at Pixelz Studio.",
        skills: ["Figma", "Adobe XD", "Prototyping"],
        posted: "2 days ago",
        applicants: 45,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111432.png",
        featured: true,
        bookmarked: false,
        qualification: [
            "At least 2-4 years of relevant experience in product design or related roles.",
            "Knowledge of design validation, either through quantitative or qualitative research.",
            "Have good knowledge using Figma and Figma",
            "Experience with analytics tools to gather data from users."
        ],
        responsibility: [
            "Create design and user journey on every features and product/business units across multiples devices (Web+App)",
            "Identifying design problems through user journey and devising elegant solutions",
            "Develop low and hi fidelity designs, user experience flow, & prototype, translate it into highly-polished visual composites following style and brand guidelines.",
            "Brainstorm and works together with Design Lead, UX Engineers, and PMs to execute a design sprint on specific story or task"
        ],
        attachments: [
            {
                name: "Jobs_Requirement.pdf",
                type: "requirement"
            },
            {
                name: "Company_Benefit.pdf",
                type: "benefit"
            }
        ]
    },
    {
        id: 2,
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        type: "Fulltime",
        remote: "Remote",
        experience: "3-5 Years",
        salary: "$35K",
        period: "Monthly",
        description: "Join our frontend team to build cutting-edge web applications using React and modern technologies. You'll work closely with designers and backend engineers to create exceptional user experiences.",
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        posted: "1 day ago",
        applicants: 89,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/732/732221.png",
        featured: true,
        bookmarked: true,
        qualification: [
            "3-5 years of experience with React and modern JavaScript",
            "Strong understanding of TypeScript and component-based architecture",
            "Experience with state management libraries (Redux, Zustand)",
            "Knowledge of testing frameworks (Jest, React Testing Library)"
        ],
        responsibility: [
            "Develop and maintain high-quality React applications",
            "Collaborate with UX/UI designers to implement pixel-perfect designs",
            "Write clean, maintainable, and well-documented code",
            "Participate in code reviews and technical discussions"
        ],
        attachments: [
            {
                name: "Technical_Requirements.pdf",
                type: "requirement"
            }
        ]
    }
];

// Similar jobs data
const similarJobs = [
    {
        id: 3,
        title: "Lead UI Designer",
        company: "DesignCo",
        location: "Jakarta, Indonesia",
        type: "Fulltime",
        workType: "Onsite",
        experience: "3-5 Years",
        salary: "$28K",
        period: "Monthly",
        posted: "2 day ago",
        applicants: 521,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968853.png"
    },
    {
        id: 4,
        title: "Sr. UX Designer",
        company: "GreyArt",
        location: "Jakarta, Indonesia",
        type: "Fulltime",
        workType: "Onsite",
        experience: "3-5 Years",
        salary: "$25K",
        period: "Monthly",
        posted: "2 day ago",
        applicants: 210,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174857.png"
    },
    {
        id: 5,
        title: "Jr UI Designer",
        company: "OKO",
        location: "Jakarta, Indonesia",
        type: "Fulltime",
        workType: "Onsite",
        experience: "1-3 Years",
        salary: "$15K",
        period: "Monthly",
        posted: "an hour ago",
        applicants: 120,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/174/174883.png"
    }
];

// Other jobs from same company
const otherCompanyJobs = [
    {
        id: 6,
        title: "UI Designer",
        company: "Pixelz Studio",
        location: "Yogyakarta, Indonesia",
        type: "Internship",
        workType: "Onsite",
        experience: "Fresh Graduate",
        salary: "$8K",
        period: "Monthly",
        posted: "a day ago",
        applicants: 35,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111432.png"
    },
    {
        id: 7,
        title: "Frontend Developer",
        company: "Pixelz Studio",
        location: "Yogyakarta, Indonesia",
        type: "Full Time",
        workType: "Onsite",
        experience: "1-3 Years",
        salary: "$18K",
        period: "Monthly",
        posted: "a day ago",
        applicants: 35,
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111432.png"
    }
];

export default function JobDetailsPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const params = useParams();
    const jobId = params && params.id ? parseInt(params.id as string) : NaN;
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
            if (savedTheme) return savedTheme;
        }
        return "light";
    });
    const [isBookmarked, setIsBookmarked] = useState(false);

    // No need for useEffect to set theme from localStorage; handled in useState initializer

    const job = jobsData.find(j => j.id === jobId);

    // Hydration guard: don't render until client is mounted and theme is correct
    if (!mounted) return null;

    if (!job) {
        return (
            <DashboardLayout
                sidebarActive="Jobs"
                topbarTitle="Job Not Found"
                theme={theme}
                setTheme={setTheme}
            >
                <div className="text-center py-12">
                    <h1 className={`text-2xl font-bold mb-4 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                    }`}>Job Not Found</h1>
                    <Link href="/jobs" className={`text-sm font-medium transition-colors ${
                        theme === 'light'
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-[#13ff8c] hover:text-[#19fb9b]'
                    }`}>
                        ← Back to Jobs
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return (
        <DashboardLayout
            sidebarActive="Jobs"
            topbarTitle="Job Details"
            theme={theme}
            setTheme={setTheme}
        >
            <div className="space-y-6">
                {/* Back Button */}
                <Link href="/jobs" className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                    theme === 'light'
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-[#13ff8c] hover:text-[#19fb9b]'
                }`}>
                    <FaArrowLeft className="text-xs" />
                    Back to Jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <div className={`p-6 rounded-xl border transition-all duration-300 ${
                            theme === 'light'
                                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 backdrop-blur-sm'
                        }`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-white/20 shadow-lg">
                                        <img src={job.companyLogo} alt={job.company} className="w-12 h-12 object-contain" />
                                    </div>
                                    <div>
                                        <h1 className={`text-2xl font-bold mb-2 ${
                                            theme === 'light' ? 'text-gray-900' : 'text-white'
                                        }`}>{job.title}</h1>
                                        <p className={`text-lg font-medium mb-2 ${
                                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                        }`}>{job.company}</p>
                                        <div className="mb-3">
                      <span className={`text-2xl font-bold ${
                          theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                      }`}>{job.salary}</span>
                                            <span className={`text-lg ${
                                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                            }`}>/{job.period}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        <FaMapMarkerAlt className={theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'} />
                          {job.location}
                      </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                                            }`}>{job.type}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
                                            }`}>{job.remote}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                                            }`}>{job.experience}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={toggleBookmark}
                                        className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                                            isBookmarked || job.bookmarked
                                                ? theme === 'light'
                                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                                    : 'bg-[#13ff8c]/20 border-[#13ff8c] text-[#13ff8c]'
                                                : theme === 'light'
                                                    ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                    >
                                        <FaBookmark />
                                    </button>
                                    <button className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                                        theme === 'light'
                                            ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}>
                                        <FaShare />
                                    </button>
                                </div>
                            </div>

                            <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                theme === 'light'
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                            }`}>
                                Apply Now
                            </button>
                        </div>

                        {/* Job Description */}
                        <div className={`p-6 rounded-xl border ${
                            theme === 'light'
                                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 backdrop-blur-sm'
                        }`}>
                            <div className="space-y-6">
                                {/* About this role */}
                                <div>
                                    <h2 className={`text-xl font-bold mb-4 ${
                                        theme === 'light' ? 'text-gray-900' : 'text-white'
                                    }`}>About this role</h2>
                                    <p className={`leading-relaxed ${
                                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                    }`}>{job.description}</p>
                                </div>

                                {/* Qualification */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${
                                        theme === 'light' ? 'text-gray-900' : 'text-white'
                                    }`}>Qualification</h3>
                                    <ul className="space-y-2">
                                        {job.qualification.map((item, index) => (
                                            <li key={index} className={`flex items-start gap-3 ${
                                                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                    theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                                                }`}></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Responsibility */}
                                <div>
                                    <h3 className={`text-lg font-semibold mb-3 ${
                                        theme === 'light' ? 'text-gray-900' : 'text-white'
                                    }`}>Responsibility</h3>
                                    <ul className="space-y-2">
                                        {job.responsibility.map((item, index) => (
                                            <li key={index} className={`flex items-start gap-3 ${
                                                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                                    theme === 'light' ? 'bg-emerald-500' : 'bg-[#13ff8c]'
                                                }`}></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className={`p-6 rounded-xl border ${
                            theme === 'light'
                                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 backdrop-blur-sm'
                        }`}>
                            <h2 className={`text-xl font-bold mb-4 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>Attachment</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {job.attachments.map((attachment, index) => (
                                    <div key={index} className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                                        theme === 'light'
                                            ? 'bg-gray-50 border-gray-200 hover:border-emerald-300'
                                            : 'bg-white/5 border-white/10 hover:border-[#13ff8c]/50'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                theme === 'light' ? 'bg-red-100' : 'bg-red-500/20'
                                            }`}>
                                                <FaDownload className={`text-sm ${
                                                    theme === 'light' ? 'text-red-600' : 'text-red-400'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${
                                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                                }`}>{attachment.name}</p>
                                                <p className={`text-xs ${
                                                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                                }`}>PDF Document</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Similar Jobs */}
                        <div className={`p-6 rounded-xl border ${
                            theme === 'light'
                                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 backdrop-blur-sm'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>Similar Jobs</h3>
                            <div className="space-y-4">
                                {similarJobs.map((similarJob) => (
                                    <Link
                                        key={similarJob.id}
                                        href={`/jobs/${similarJob.id}`}
                                        className={`block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                                            theme === 'light'
                                                ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                                                : 'bg-white/5 border-white/10 hover:border-[#13ff8c]/50 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/20">
                                                <img src={similarJob.companyLogo} alt={similarJob.company} className="w-6 h-6 object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold text-sm mb-1 ${
                                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                                }`}>{similarJob.title}</h4>
                                                <p className={`text-xs mb-2 ${
                                                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                                }`}>{similarJob.company} • {similarJob.location}</p>
                                                <div className="mb-2">
                          <span className={`text-sm font-bold ${
                              theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                          }`}>{similarJob.salary}</span>
                                                    <span className={`text-xs ${
                                                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>/{similarJob.period}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                          }`}>{similarJob.type}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>{similarJob.workType}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                                                    }`}>{similarJob.experience}</span>
                                                </div>
                                                <p className={`text-xs ${
                                                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                                }`}>{similarJob.posted} • {similarJob.applicants} Applicants</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Other Jobs From Company */}
                        <div className={`p-6 rounded-xl border ${
                            theme === 'light'
                                ? 'bg-white/90 border-gray-200/50 shadow-lg backdrop-blur-sm'
                                : 'bg-white/5 border-white/10 backdrop-blur-sm'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${
                                theme === 'light' ? 'text-gray-900' : 'text-white'
                            }`}>Other Jobs From {job.company}</h3>
                            <div className="space-y-4">
                                {otherCompanyJobs.map((companyJob) => (
                                    <Link
                                        key={companyJob.id}
                                        href={`/jobs/${companyJob.id}`}
                                        className={`block p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                                            theme === 'light'
                                                ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                                                : 'bg-white/5 border-white/10 hover:border-[#13ff8c]/50 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/20">
                                                <img src={companyJob.companyLogo} alt={companyJob.company} className="w-6 h-6 object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold text-sm mb-1 ${
                                                    theme === 'light' ? 'text-gray-900' : 'text-white'
                                                }`}>{companyJob.title}</h4>
                                                <p className={`text-xs mb-2 ${
                                                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                                }`}>{companyJob.company} • {companyJob.location}</p>
                                                <div className="mb-2">
                          <span className={`text-sm font-bold ${
                              theme === 'light' ? 'text-emerald-600' : 'text-[#13ff8c]'
                          }`}>{companyJob.salary}</span>
                                                    <span className={`text-xs ${
                                                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>/{companyJob.period}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#13ff8c]/20 text-[#13ff8c]'
                          }`}>{companyJob.type}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400'
                                                    }`}>{companyJob.workType}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        theme === 'light' ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400'
                                                    }`}>{companyJob.experience}</span>
                                                </div>
                                                <p className={`text-xs ${
                                                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                                                }`}>{companyJob.posted} • {companyJob.applicants} Applicants</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
