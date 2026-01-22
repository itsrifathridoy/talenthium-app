"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { GlassCard } from "../../components/GlassCard";
import { FaPlus, FaFilter, FaChevronDown, FaCheck } from 'react-icons/fa';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
import Link from "next/link";
import { getAllProjects, getMyProjects, checkProjectCreationCapability } from "../../lib/project-service";
import { useAuth } from "@/lib/auth-context";

interface Project {
    id: number;
    name: string;
    tagline: string;
    shortDescription: string;
    detailedDescription: string;
    liveLink: string | null;
    gitLink: string;
    privacy: string;
    ownerId: number;
}

const mockProjects = [
    {
        icon: <span className='font-bold text-2xl text-black'>S</span>,
        iconBg: 'bg-yellow-400',
        title: 'Sports Interactive',
        link: 'https://sportsinteractive.com',
        description: 'Web resource which contains all about transfers in the world of sports.',
        progress: 94,
        deadline: '2 days left',
        deadlineColor: 'bg-red-100/80 text-red-500',
        avatars: [
            'https://randomuser.me/api/portraits/men/32.jpg',
            'https://randomuser.me/api/portraits/men/33.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>D</span>,
        iconBg: 'bg-[#13ff8c]',
        title: 'Dev Portfolio',
        link: 'https://devportfolio.com',
        description: 'Personal developer portfolio and project showcase.',
        progress: 76,
        deadline: '5 days left',
        deadlineColor: 'bg-yellow-100/80 text-yellow-600',
        avatars: [
            'https://randomuser.me/api/portraits/women/44.jpg',
            'https://randomuser.me/api/portraits/men/45.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>M</span>,
        iconBg: 'bg-blue-400',
        title: 'Mentor Connect',
        link: 'https://mentorconnect.com',
        description: 'Platform to connect with mentors and mentees.',
        progress: 58,
        deadline: '1 week left',
        deadlineColor: 'bg-green-100/80 text-green-600',
        avatars: [
            'https://randomuser.me/api/portraits/men/46.jpg',
            'https://randomuser.me/api/portraits/women/47.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>M</span>,
        iconBg: 'bg-blue-400',
        title: 'Mentor Connect',
        link: 'https://mentorconnect.com',
        description: 'Platform to connect with mentors and mentees.',
        progress: 58,
        deadline: '1 week left',
        deadlineColor: 'bg-green-100/80 text-green-600',
        avatars: [
            'https://randomuser.me/api/portraits/men/46.jpg',
            'https://randomuser.me/api/portraits/women/47.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>M</span>,
        iconBg: 'bg-blue-400',
        title: 'Mentor Connect',
        link: 'https://mentorconnect.com',
        description: 'Platform to connect with mentors and mentees.',
        progress: 58,
        deadline: '1 week left',
        deadlineColor: 'bg-green-100/80 text-green-600',
        avatars: [
            'https://randomuser.me/api/portraits/men/46.jpg',
            'https://randomuser.me/api/portraits/women/47.jpg',
        ],
    },
];
const contributedProjects = [
    {
        icon: <span className='font-bold text-2xl text-black'>A</span>,
        iconBg: 'bg-pink-400',
        title: 'AI Collaboration',
        link: 'https://aicollab.com',
        description: 'Contributed to an open source AI project.',
        progress: 80,
        deadline: '3 days left',
        deadlineColor: 'bg-blue-100/80 text-blue-500',
        avatars: [
            'https://randomuser.me/api/portraits/men/50.jpg',
            'https://randomuser.me/api/portraits/women/51.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>O</span>,
        iconBg: 'bg-green-400',
        title: 'Open Source Docs',
        link: 'https://opensource-docs.com',
        description: 'Helped write documentation for a major open source project.',
        progress: 60,
        deadline: '1 week left',
        deadlineColor: 'bg-green-100/80 text-green-600',
        avatars: [
            'https://randomuser.me/api/portraits/men/52.jpg',
            'https://randomuser.me/api/portraits/women/53.jpg',
        ],
    },
    {
        icon: <span className='font-bold text-2xl text-white'>H</span>,
        iconBg: 'bg-purple-400',
        title: 'Hackathon Project',
        link: 'https://hackathon.com',
        description: 'Built a hackathon project as a contributor.',
        progress: 95,
        deadline: 'Completed',
        deadlineColor: 'bg-gray-100/80 text-gray-600',
        avatars: [
            'https://randomuser.me/api/portraits/men/54.jpg',
            'https://randomuser.me/api/portraits/women/55.jpg',
        ],
    },
];

export default function ProjectsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [tab, setTab] = useState<'my' | 'contributed'>('my');
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [contributedProjects, setContributedProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [capabilityLoading, setCapabilityLoading] = useState(true);
    const [hasGithubAccess, setHasGithubAccess] = useState(false);

    // Check capability first
    useEffect(() => {
        const checkCapability = async () => {
            if (!user?.userID) {
                setCapabilityLoading(false);
                return;
            }

            try {
                const response = await checkProjectCreationCapability();
                setHasGithubAccess(response.data.canCreateProject);
            } catch (err: any) {
                console.error('Failed to check capability:', err);
                setHasGithubAccess(false);
            } finally {
                setCapabilityLoading(false);
            }
        };

        checkCapability();
    }, [user?.userID]);

    // Fetch projects on mount and when tab changes
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (tab === 'my') {
                    const response = await getMyProjects();
                    const list = Array.isArray(response.data) ? response.data : [];
                    setProjects(list);
                } else {
                    // For contributed projects, we'll use all projects for now
                    // In the future, this should be a separate endpoint
                    const response = await getAllProjects();
                    const list = Array.isArray(response.data) ? response.data : [];
                    setContributedProjects(list);
                }
            } catch (err: any) {
                console.error('Failed to fetch projects:', err);
                setError(err.response?.data?.message || 'Failed to load projects');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [tab]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Close filter modal on Escape key
    useEffect(() => {
        if (!filterOpen) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setFilterOpen(false);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filterOpen]);
    // Open filter modal on 'f' key (when not in input/textarea and not already open)
    useEffect(() => {
        function handleFKey(e: KeyboardEvent) {
            if (
                e.key.toLowerCase() === 'f' &&
                !filterOpen &&
                document.activeElement &&
                ['input', 'textarea'].indexOf(document.activeElement.tagName.toLowerCase()) === -1
            ) {
                setFilterOpen(true);
            }
        }
        window.addEventListener('keydown', handleFKey);
        return () => window.removeEventListener('keydown', handleFKey);
    }, [filterOpen]);
    // Placeholder filter state (not functional yet)
    const [filter, setFilter] = useState({
        search: '',
        techStack: 'any',
        tags: 'any',
        status: 'any',
        visibility: 'any',
        sortBy: 'latest',
        // My Projects
        deployment: 'any',
        openRoles: '',
        mentorship: '',
        githubSync: '',
        // Contributed
        role: 'any',
        contribution: 'any',
        owner: '',
    });
    // Add a mapping from value to label for each dropdown
    const techStackOptions = [
        { value: 'any', label: 'Any' },
        { value: 'react', label: 'React' },
        { value: 'node', label: 'Node.js' },
        { value: 'python', label: 'Python' },
        { value: 'nextjs', label: 'Next.js' },
        { value: 'typescript', label: 'TypeScript' },
    ];
    const tagsOptions = [
        { value: 'any', label: 'Any' },
        { value: 'ai', label: 'AI' },
        { value: 'web', label: 'Web' },
        { value: 'opensource', label: 'Open Source' },
        { value: 'hackathon', label: 'Hackathon' },
    ];
    const statusOptions = [
        { value: 'any', label: 'Any' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
        { value: 'draft', label: 'Draft' },
    ];
    const visibilityOptions = [
        { value: 'any', label: 'Any' },
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
    ];
    const sortByOptions = [
        { value: 'latest', label: 'Latest Updated' },
        { value: 'created', label: 'Date Created' },
        { value: 'viewed', label: 'Most Viewed' },
        { value: 'contributed', label: 'Most Contributed' },
    ];
    const deploymentOptions = [
        { value: 'any', label: 'Any' },
        { value: 'live', label: 'Live' },
        { value: 'notdeployed', label: 'Not Deployed' },
    ];
    const roleOptions = [
        { value: 'any', label: 'Any' },
        { value: 'contributor', label: 'Contributor' },
        { value: 'reviewer', label: 'Reviewer' },
        { value: 'maintainer', label: 'Maintainer' },
    ];
    const contributionOptions = [
        { value: 'any', label: 'Any' },
        { value: 'commits', label: 'Commits > X' },
        { value: 'issues', label: 'Issues Solved' },
        { value: 'prs', label: 'Pull Requests Merged' },
    ];
    return (
        <DashboardLayout
            sidebarActive="Projects"
            topbarTitle="Projects"
            theme={theme}
            setTheme={setTheme}
        >
            {capabilityLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className={theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-500'}
                    >
                        <FiLoader size={48} />
                    </motion.div>
                </div>
            ) : !hasGithubAccess ? (
                <div className="p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className={`relative overflow-hidden rounded-2xl p-12 ${
                            theme === 'dark'
                                ? 'bg-gradient-to-br from-slate-800/90 via-slate-800/50 to-slate-900/90 border border-white/10'
                                : 'bg-gradient-to-br from-white via-emerald-50/30 to-white border border-emerald-200/50 shadow-xl'
                        } backdrop-blur-sm`}>
                            {/* Decorative elements */}
                            <div className={`absolute top-0 right-0 w-64 h-64 ${
                                theme === 'dark' 
                                    ? 'bg-[#13ff8c]/5' 
                                    : 'bg-emerald-500/5'
                            } rounded-full blur-3xl -z-10`}></div>
                            <div className={`absolute bottom-0 left-0 w-64 h-64 ${
                                theme === 'dark' 
                                    ? 'bg-blue-500/5' 
                                    : 'bg-blue-500/5'
                            } rounded-full blur-3xl -z-10`}></div>

                            {/* Icon */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="flex justify-center mb-8"
                            >
                                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-br from-[#13ff8c]/20 to-blue-500/20 border-2 border-[#13ff8c]/30'
                                        : 'bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30'
                                }`}>
                                    <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'}`} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <div className={`absolute inset-0 rounded-full animate-pulse ${
                                        theme === 'dark' ? 'bg-[#13ff8c]/20' : 'bg-emerald-500/20'
                                    }`}></div>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`text-4xl font-bold text-center mb-4 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                            >
                                Connect Your GitHub
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`text-center text-lg mb-10 ${
                                    theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                                }`}
                            >
                                Link your GitHub account to unlock powerful project management features
                            </motion.p>

                            {/* Features Grid */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                            >
                                {[
                                    { icon: '🚀', title: 'Auto-sync Projects', desc: 'Sync repositories instantly' },
                                    { icon: '📊', title: 'Track Commits', desc: 'Monitor contributions live' },
                                    { icon: '👥', title: 'Team Insights', desc: 'Collaborate efficiently' }
                                ].map((feature, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl text-center ${
                                        theme === 'dark'
                                            ? 'bg-white/5 border border-white/10'
                                            : 'bg-white border border-emerald-100'
                                    }`}>
                                        <div className="text-3xl mb-2">{feature.icon}</div>
                                        <h3 className={`font-semibold mb-1 ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{feature.title}</h3>
                                        <p className={`text-sm ${
                                            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                                        }`}>{feature.desc}</p>
                                    </div>
                                ))}
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <a
                                    href="/settings/github"
                                    className={`inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-r from-[#13ff8c] to-[#0ea574] text-black shadow-[0_0_30px_rgba(19,255,140,0.3)] hover:shadow-[0_0_40px_rgba(19,255,140,0.5)]'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    Link GitHub Account
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                            </motion.div>

                            {/* Help text */}
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className={`text-center text-sm mt-6 ${
                                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                                }`}
                            >
                                Secure OAuth connection • Takes less than 30 seconds
                            </motion.p>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <>
            {/* Tabs, Search, and Add Project button in one row */}
            <div className="sticky top-0 z-20 flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className={`flex items-center gap-2 border ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/90 border-gray-300 shadow-sm'} rounded-full p-1 shadow-lg backdrop-blur-[6px]`}>
                    <button
                        className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
                        } ${
                            tab === 'my'
                                ? theme === 'dark'
                                    ? 'bg-[#13ff8c]/90 text-black shadow-[0_0_12px_2px_rgba(19,255,140,0.25)]'
                                    : 'bg-emerald-500 text-white shadow-[0_0_12px_2px_rgba(16,185,129,0.3)]'
                                : theme === 'dark'
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-gray-700 hover:bg-black/10'
                        }`}
                        onClick={() => setTab('my')}
                        type="button"
                    >
                        My Projects
                    </button>
                    <button
                        className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
                        } ${
                            tab === 'contributed'
                                ? theme === 'dark'
                                    ? 'bg-[#13ff8c]/90 text-black shadow-[0_0_12px_2px_rgba(19,255,140,0.25)]'
                                    : 'bg-emerald-500 text-white shadow-[0_0_12px_2px_rgba(16,185,129,0.3)]'
                                : theme === 'dark'
                                    ? 'text-white hover:bg-white/10'
                                    : 'text-gray-700 hover:bg-black/10'
                        }`}
                        onClick={() => setTab('contributed')}
                        type="button"
                    >
                        Contributed Projects
                    </button>
                </div>
                <div className="flex-1 flex justify-center min-w-[180px] max-w-xl">
                    <input
                        type="search"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`px-5 py-3 rounded-lg border ${
                            theme === 'dark'
                                ? 'bg-white/10 border-white/10 text-white placeholder-gray-400'
                                : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm'
                        } outline-none focus:ring-2 ${
                            theme === 'dark' ? 'focus:ring-[#13ff8c] focus:border-[#13ff8c]' : 'focus:ring-emerald-500 focus:border-emerald-500'
                        } backdrop-blur-[6px] shadow-inner max-w-sm min-w-[120px] w-full`}
                    />
                    <button
                        className={`flex items-center gap-2 ml-4 px-4 py-2 rounded-lg border ${
                            theme === 'dark'
                                ? 'bg-white/10 border-white/20 text-[#13ff8c] hover:shadow-[0_0_12px_2px_rgba(19,255,140,0.25)] hover:border-[#13ff8c] hover:text-[#19fb9b]'
                                : 'bg-white/90 border-gray-300 text-emerald-600 hover:shadow-[0_0_12px_2px_rgba(16,185,129,0.3)] hover:border-emerald-500 hover:text-emerald-700 shadow-sm'
                        } font-semibold text-sm shadow-lg backdrop-blur-[4px] transition-all duration-200 focus:outline-none focus:ring-2 ${
                            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
                        } hover:scale-105`}
                        type="button"
                        onClick={() => setFilterOpen(true)}
                    >
                        <FaFilter className="text-base" />
                        <span>Filter</span>
                    </button>
                </div>
                <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                            ? 'bg-white/10 border-white/20 text-[#13ff8c] hover:shadow-[0_0_12px_2px_rgba(19,255,140,0.25)] hover:border-[#13ff8c] hover:text-[#19fb9b]'
                            : 'bg-white/90 border-gray-300 text-emerald-600 hover:shadow-[0_0_12px_2px_rgba(16,185,129,0.3)] hover:border-emerald-500 hover:text-emerald-700 shadow-sm'
                    } font-semibold text-sm shadow-lg backdrop-blur-[6px] transition-all duration-200 focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
                    } hover:scale-105`}
                    type="button"
                    onClick={() => router.push('/projects/create')}
                >
                    <FaPlus className="text-base" />
                    <span>Add Project</span>
                </button>
            </div>
            {/* Filter projects by search term */}
            {(() => {
                const allProjects = tab === 'my' ? projects : contributedProjects;
                
                // Transform API data to match display format
                const displayProjects = (Array.isArray(allProjects) ? allProjects : []).map((p: Project) => ({
                    id: p.id,
                    icon: <span className='font-bold text-2xl text-white'>{p.name.charAt(0).toUpperCase()}</span>,
                    iconBg: `bg-${['blue', 'green', 'purple', 'yellow', 'pink', 'red'][p.id % 6]}-400`,
                    title: p.name,
                    link: p.liveLink || p.gitLink,
                    description: p.shortDescription,
                    tagline: p.tagline,
                    gitLink: p.gitLink,
                    privacy: p.privacy,
                }));
                
                const filtered = displayProjects.filter(p =>
                    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.tagline?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                return (
                    <AnimatePresence mode="wait" initial={false}>
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full flex justify-center items-center py-20"
                            >
                                <div className={`text-lg ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                                    Loading projects...
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full flex justify-center items-center py-20"
                            >
                                <div className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                                    {error}
                                </div>
                            </motion.div>
                        ) : (
                        <motion.div
                            key={tab + '-' + searchTerm}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {filtered.length > 0 ? (
                                filtered.map((project, i) => (
                                    <Link key={project.id} href={`/projects/${project.id}`} className="w-full">
                                        <GlassCard
                                            key={i}
                                            theme={theme}
                                            className={`flex-1 min-w-[220px] max-w-[300px] ${
                                                theme === 'dark'
                                                    ? 'bg-white/10 border-white/10'
                                                    : 'bg-white/95 border-gray-300 shadow-xl backdrop-blur-sm'
                                            } rounded-2xl border flex flex-col p-5 shadow-inner transition hover:scale-105 ${
                                                theme === 'dark' ? 'hover:shadow-xl' : 'hover:shadow-2xl hover:border-emerald-300'
                                            } relative`}
                                        >
                                            {/* Logo/Icon */}
                                            <div className={`absolute -top-5 left-5 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${project.iconBg}`}>{project.icon}</div>
                                            {/* Project Title & Link */}
                                            <div className="mt-8 mb-1 flex flex-col gap-1">
                                                <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.title}</span>
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className={`${
                                                    theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
                                                } text-xs underline break-all hover:${theme === 'dark' ? 'text-[#19fb9b]' : 'text-emerald-700'}`}>
                                                    {project.link.replace('https://','')}
                                                </a>
                                            </div>
                                            {/* Description */}
                                            <div className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</div>
                                            {/* Privacy Badge */}
                                            <div className="mt-auto flex items-center justify-between">
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    project.privacy === 'PUBLIC'
                                                        ? theme === 'dark' 
                                                            ? 'bg-green-500/20 text-green-400' 
                                                            : 'bg-green-100 text-green-700'
                                                        : theme === 'dark'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {project.privacy}
                                                </span>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                ))
                            ) : (
                                <motion.div
                                    key="no-results"
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -24 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0.2, 0.2, 1] }}
                                    className="col-span-full flex flex-col items-center justify-center py-24"
                                >
                                    <div className="rounded-2xl px-10 py-16 flex flex-col items-center gap-6 max-w-lg w-full">
                          <span className={`text-7xl md:text-8xl ${
                              theme === 'dark'
                                  ? 'drop-shadow-[0_2px_16px_rgba(19,255,140,0.25)]'
                                  : 'drop-shadow-[0_2px_16px_rgba(16,185,129,0.25)]'
                          }`}>📁</span>
                                        <span className={`text-2xl md:text-3xl font-extrabold drop-shadow-lg ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>No projects found</span>
                                        <span className={`text-base md:text-lg text-center max-w-md ${
                                            theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                        }`}>
                            {searchTerm
                                ? <>Your search <span className={`font-semibold ${
                                    theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
                                }`}>"{searchTerm}"</span> did not match any projects. Please try again.</>
                                : <>No projects to display. Try creating a new project!</>
                            }
                          </span>
                                        <div className="flex gap-4 mt-2">
                                            <button
                                                className={`px-5 py-2 rounded-lg ${
                                                    theme === 'dark'
                                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                } font-semibold shadow transition`}
                                                onClick={() => setSearchTerm('')}
                                                type="button"
                                            >
                                                Clear search
                                            </button>
                                            <button
                                                className={`px-5 py-2 rounded-lg ${
                                                    theme === 'dark'
                                                        ? 'bg-[#13ff8c] text-black hover:bg-[#19fb9b]'
                                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                } font-semibold shadow-lg transition`}
                                                onClick={() => router.push('/projects/create')}
                                                type="button"
                                            >
                                                + New project
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                        )}
                    </AnimatePresence>
                );
            })()}

            <AnimatePresence>
                {filterOpen && (
                    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={false} animate="open" exit="closed">
                        {/* Overlay */}
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setFilterOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div
                            className={`relative w-full max-w-xs h-full ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-[#1a2a22]/90 to-[#0a1813]/90 border-l border-white/10'
                                    : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-l border-gray-300'
                            } shadow-2xl p-8 flex flex-col gap-6 z-50`}
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 40, duration: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filter Projects</h2>
                                <button
                                    className={`text-xl font-bold transition ${
                                        theme === 'dark'
                                            ? 'text-[#13ff8c] hover:text-[#19fb9b]'
                                            : 'text-emerald-600 hover:text-emerald-700'
                                    }`}
                                    onClick={() => setFilterOpen(false)}
                                    aria-label="Close filter"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                                {/* Common Filters */}
                                <label className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Search</label>
                                <input
                                    type="text"
                                    placeholder="Project name or keyword"
                                    className={`px-4 py-2 rounded-lg ${
                                        theme === 'dark'
                                            ? 'bg-white/10 border-white/20 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:ring-2 ${
                                        theme === 'dark' ? 'focus:ring-[#13ff8c] focus:border-[#13ff8c]' : 'focus:ring-emerald-500 focus:border-emerald-500'
                                    } backdrop-blur-[4px] shadow-inner text-sm`}
                                    value={filter.search}
                                    onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                                />
                                <label className="text-white font-semibold text-sm mb-2">Tech Stack</label>
                                <Select.Root value={filter.techStack} onValueChange={(value: string) => setFilter(f => ({ ...f, techStack: value }))}>
                                    <Select.Trigger
                                        className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                        aria-label="Tech Stack"
                                    >
                                        <Select.Value placeholder="Any">
                                            {techStackOptions.find(o => o.value === filter.techStack)?.label}
                                        </Select.Value>
                                        <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                        <Select.Group>
                                            <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Tech Stack</Select.Label>
                                            <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Any</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="react" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>React</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="node" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Node.js</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="python" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Python</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="nextjs" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Next.js</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="typescript" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>TypeScript</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                                <label className="text-white font-semibold text-sm mb-2">Tags</label>
                                <Select.Root value={filter.tags} onValueChange={(value: string) => setFilter(f => ({ ...f, tags: value }))}>
                                    <Select.Trigger
                                        className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                        aria-label="Tags"
                                    >
                                        <Select.Value placeholder="Any">
                                            {tagsOptions.find(o => o.value === filter.tags)?.label}
                                        </Select.Value>
                                        <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                        <Select.Group>
                                            <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Tags</Select.Label>
                                            <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Any</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="ai" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>AI</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="web" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Web</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="opensource" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Open Source</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="hackathon" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Hackathon</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                                <label className="text-white font-semibold text-sm mb-2">Project Status</label>
                                <Select.Root value={filter.status} onValueChange={(value: string) => setFilter(f => ({ ...f, status: value }))}>
                                    <Select.Trigger
                                        className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                        aria-label="Project Status"
                                    >
                                        <Select.Value placeholder="Any">
                                            {statusOptions.find(o => o.value === filter.status)?.label}
                                        </Select.Value>
                                        <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                        <Select.Group>
                                            <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Project Status</Select.Label>
                                            <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Any</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="active" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Active</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="archived" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Archived</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="draft" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Draft</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                                <label className="text-white font-semibold text-sm mb-2">Visibility</label>
                                <Select.Root value={filter.visibility} onValueChange={(value: string) => setFilter(f => ({ ...f, visibility: value }))}>
                                    <Select.Trigger
                                        className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                        aria-label="Visibility"
                                    >
                                        <Select.Value placeholder="Any">
                                            {visibilityOptions.find(o => o.value === filter.visibility)?.label}
                                        </Select.Value>
                                        <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                        <Select.Group>
                                            <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Visibility</Select.Label>
                                            <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Any</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="public" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Public</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="private" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Private</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                                <label className="text-white font-semibold text-sm mb-2">Sort By</label>
                                <Select.Root value={filter.sortBy} onValueChange={(value: string) => setFilter(f => ({ ...f, sortBy: value }))}>
                                    <Select.Trigger
                                        className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                        aria-label="Sort By"
                                    >
                                        <Select.Value placeholder="Latest Updated">
                                            {sortByOptions.find(o => o.value === filter.sortBy)?.label}
                                        </Select.Value>
                                        <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                    </Select.Trigger>
                                    <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                        <Select.Group>
                                            <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Sort By</Select.Label>
                                            <Select.Item value="latest" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Latest Updated</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="created" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Date Created</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="viewed" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Most Viewed</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="contributed" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                <span>Most Contributed</span>
                                                <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>
                                {/* My Projects Tab Filters */}
                                {tab === 'my' && (
                                    <>
                                        <div className="border-t border-white/10 my-2" />
                                        <label className="text-white font-semibold text-sm mb-2">Deployment Status</label>
                                        <Select.Root value={filter.deployment} onValueChange={(value: string) => setFilter(f => ({ ...f, deployment: value }))}>
                                            <Select.Trigger
                                                className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                                aria-label="Deployment Status"
                                            >
                                                <Select.Value placeholder="Any">
                                                    {deploymentOptions.find(o => o.value === filter.deployment)?.label}
                                                </Select.Value>
                                                <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                            </Select.Trigger>
                                            <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                                <Select.Group>
                                                    <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Deployment Status</Select.Label>
                                                    <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Any</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="live" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Live</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="notdeployed" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Not Deployed</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                </Select.Group>
                                            </Select.Content>
                                        </Select.Root>
                                    </>
                                )}
                                {/* Contributed Projects Tab Filters */}
                                {tab === 'contributed' && (
                                    <>
                                        <div className="border-t border-white/10 my-2" />
                                        <label className="text-white font-semibold text-sm mb-2">Role</label>
                                        <Select.Root value={filter.role} onValueChange={(value: string) => setFilter(f => ({ ...f, role: value }))}>
                                            <Select.Trigger
                                                className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                                aria-label="Role"
                                            >
                                                <Select.Value placeholder="Any">
                                                    {roleOptions.find(o => o.value === filter.role)?.label}
                                                </Select.Value>
                                                <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                            </Select.Trigger>
                                            <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                                <Select.Group>
                                                    <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Role</Select.Label>
                                                    <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Any</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="contributor" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Contributor</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="reviewer" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Reviewer</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="maintainer" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Maintainer</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                </Select.Group>
                                            </Select.Content>
                                        </Select.Root>
                                        <label className="text-white font-semibold text-sm mb-2">Your Contribution</label>
                                        <Select.Root value={filter.contribution} onValueChange={(value: string) => setFilter(f => ({ ...f, contribution: value }))}>
                                            <Select.Trigger
                                                className="w-full px-6 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white flex items-center justify-between focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[6px] shadow text-sm transition-all duration-200 hover:bg-white/20 hover:text-[#13ff8c] mb-4"
                                                aria-label="Your Contribution"
                                            >
                                                <Select.Value placeholder="Any">
                                                    {contributionOptions.find(o => o.value === filter.contribution)?.label}
                                                </Select.Value>
                                                <Select.Icon asChild><FaChevronDown className="text-[#13ff8c] text-lg ml-2" /></Select.Icon>
                                            </Select.Trigger>
                                            <Select.Content position="popper" className="z-50 rounded-xl bg-[#0a1813]/90 border border-white/10 shadow-xl backdrop-blur-[8px] text-white mt-2 py-3">
                                                <Select.Group>
                                                    <Select.Label className="px-4 py-1 text-xs text-[#13ff8c] uppercase tracking-wider">Your Contribution</Select.Label>
                                                    <Select.Item value="any" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Any</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="commits" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Commits &gt; X</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="issues" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Issues Solved</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                    <Select.Item value="prs" className="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#13ff8c]/20 data-[state=checked]:bg-[#13ff8c]/30">
                                                        <span>Pull Requests Merged</span>
                                                        <Select.ItemIndicator><FaCheck className="text-[#13ff8c] ml-auto" /></Select.ItemIndicator>
                                                    </Select.Item>
                                                </Select.Group>
                                            </Select.Content>
                                        </Select.Root>
                                        <label className="text-white font-semibold text-sm mt-2">Owner</label>
                                        <input
                                            type="text"
                                            placeholder="Project owner name"
                                            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#13ff8c] focus:border-[#13ff8c] backdrop-blur-[4px] shadow-inner text-sm"
                                        />
                                    </>
                                )}
                            </div>
                            <button
                                className={`mt-8 px-6 py-3 rounded-full ${
                                    theme === 'dark'
                                        ? 'bg-[#13ff8c]/90 text-black hover:bg-[#19fb9b]'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                } font-bold text-lg shadow-lg transition-all duration-200`}
                                onClick={() => setFilterOpen(false)}
                            >
                                Apply Filters
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            </>
            )}
        </DashboardLayout>
    );
}