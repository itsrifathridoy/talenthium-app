"use client";
// CountdownTimer component
type CountdownTimerProps = { date: string; time: string; theme: string };
function CountdownTimer({ date, time, theme }: CountdownTimerProps) {
    const timeLeft = useCountdown(date, time);
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
            theme === "light"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-[#13ff8c]/10 text-[#13ff8c] border border-[#13ff8c]/40"
        }`}>
            <FaClock className={theme === "light" ? "text-emerald-500" : "text-[#13ff8c]"} />
            <span>Starts in {timeLeft}</span>
        </div>
    );
}
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// Countdown hook
function useCountdown(targetDate: string, targetTime: string) {
    const [timeLeft, setTimeLeft] = useState<string>("");
    useEffect(() => {
        if (!targetDate || !targetTime) return;
        function getTimeLeft() {
            const [hour, minute] = targetTime.split(":");
            const ampm = targetTime.toLowerCase().includes("pm") ? 12 : 0;
            const date = new Date(targetDate + "T" + (parseInt(hour) + ampm) + ":" + minute.replace(/[^0-9]/g, "") + ":00");
            const now = new Date();
            const diff = date.getTime() - now.getTime();
            if (diff <= 0) return "00:00:00";
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        setTimeLeft(getTimeLeft());
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate, targetTime]);
    return timeLeft;
}
import { FaCalendarAlt, FaClock, FaUserTie, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {DashboardLayout} from "@/components/layouts/DashboardLayout";

const mockInterviews = [
    // Ongoing
    {
        id: 1,
        company: "TechCorp",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111432.png",
        jobTitle: "Frontend Developer",
        title: "Frontend Developer Interview",
        date: "2025-09-05",
        time: "10:00 AM",
        status: "Ongoing",
        round: "Preliminary",
        description: "Technical interview for Frontend Developer position. Focus on React, TypeScript, and UI/UX best practices.",
    },
    {
        id: 5,
        company: "Cloudify",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        jobTitle: "DevOps Engineer",
        title: "DevOps Engineer Interview",
        date: "2025-09-06",
        time: "4:00 PM",
        status: "Ongoing",
        round: "Technical",
        description: "Interview focused on CI/CD pipelines, cloud infrastructure, and automation tools.",
    },
    // Upcoming
    {
        id: 6,
        company: "DataWiz",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968702.png",
        jobTitle: "Data Scientist",
        title: "Data Scientist Interview",
        date: "2025-09-12",
        time: "9:00 AM",
        status: "Accepted",
        round: "Final",
        description: "Final round for Data Scientist role. Focus on ML, statistics, and data visualization.",
    },
    {
        id: 7,
        company: "Appify",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968700.png",
        jobTitle: "Mobile Developer",
        title: "Mobile Developer Interview",
        date: "2025-09-15",
        time: "2:30 PM",
        status: "Not Attended",
        round: "Preliminary",
        description: "Interview for Mobile Developer position. Focus on React Native and mobile UI/UX.",
    },
    {
        id: 4,
        company: "QA Solutions",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968853.png",
        jobTitle: "QA Engineer",
        title: "QA Engineer Interview",
        date: "2025-08-20",
        time: "3:00 PM",
        status: "Accepted",
        round: "Preliminary",
        description: "QA interview covering automation, test strategies, and bug tracking.",
    },
    {
        id: 3,
        company: "WebCraft",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968672.png",
        jobTitle: "Full Stack Developer",
        title: "Full Stack Developer Interview",
        date: "2025-09-10",
        time: "11:30 AM",
        status: "Not Attended",
        round: "AI Interview",
        description: "Full stack interview with focus on integration, deployment, and cloud solutions.",
    },
    // Past
    {
        id: 2,
        company: "ServerTech",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/2111/2111285.png",
        jobTitle: "Backend Developer",
        title: "Backend Developer Interview",
        date: "2025-08-28",
        time: "2:00 PM",
        status: "Rejected",
        round: "Technical Interview",
        description: "Backend interview covering Node.js, API design, and database management.",
    },
    {
        id: 8,
        company: "Designify",
        companyLogo: "https://cdn-icons-png.flaticon.com/512/5968/5968703.png",
        jobTitle: "UI/UX Designer",
        title: "UI/UX Designer Interview",
        date: "2025-08-18",
        time: "1:00 PM",
        status: "Rejected",
        round: "Portfolio Review",
        description: "Portfolio review and design challenge for UI/UX Designer role.",
    },
];

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InterviewsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const validTabs = ['ongoing', 'upcoming', 'past'];
    const getInitialTab = () => {
        const tabParam = searchParams!.get('tab');
        if (tabParam && validTabs.includes(tabParam)) {
            return tabParam as 'ongoing' | 'upcoming' | 'past';
        }
        return 'ongoing';
    };

    const [selectedId, setSelectedId] = useState<number | null>(mockInterviews[0].id);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [tab, setTab] = useState<'ongoing' | 'upcoming' | 'past'>(getInitialTab());

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (savedTheme) setTheme(savedTheme);
    }, []);

    // Sync tab state with query param
    useEffect(() => {
        const tabParam = searchParams!.get('tab');
        if (tabParam && validTabs.includes(tabParam)) {
            if (tab !== tabParam) setTab(tabParam as 'ongoing' | 'upcoming' | 'past');
        } else if (!tabParam && tab !== 'ongoing') {
            setTab('ongoing');
        }
    }, [searchParams, tab]);

    const ongoing = mockInterviews.filter((i) => i.status === "Ongoing");
    const upcoming = mockInterviews.filter((i) => i.status === "Accepted" || i.status === "Not Attended");
    const past = mockInterviews.filter((i) => i.status === "Rejected");
    const interviewsByTab = tab === 'ongoing' ? ongoing : tab === 'upcoming' ? upcoming : past;
    const selected = mockInterviews.find((i) => i.id === selectedId);

    // Tab change handler updates query param
    const changeTab = (tabId: 'ongoing' | 'upcoming' | 'past') => {
        setTab(tabId);
        router.push(`/interviews?tab=${tabId}`);
    };

    return (
        <DashboardLayout
            sidebarActive="Interviews"
            topbarTitle="Interview Schedule"
            theme={theme}
            setTheme={setTheme}
        >
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b mb-8 pb-2">
                <button
                    className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        tab === 'ongoing'
                            ? theme === 'dark'
                                ? 'bg-[#13ff8c]/90 text-black shadow'
                                : 'bg-emerald-500 text-white shadow'
                            : theme === 'dark'
                                ? 'text-white hover:bg-white/10'
                                : 'text-gray-700 hover:bg-black/10'
                    }`}
                    onClick={() => changeTab('ongoing')}
                >
                    Ongoing Interviews
                </button>
                <button
                    className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        tab === 'upcoming'
                            ? theme === 'dark'
                                ? 'bg-[#13ff8c]/90 text-black shadow'
                                : 'bg-emerald-500 text-white shadow'
                            : theme === 'dark'
                                ? 'text-white hover:bg-white/10'
                                : 'text-gray-700 hover:bg-black/10'
                    }`}
                    onClick={() => changeTab('upcoming')}
                >
                    Upcoming Interviews
                </button>
                <button
                    className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                        tab === 'past'
                            ? theme === 'dark'
                                ? 'bg-[#13ff8c]/90 text-black shadow'
                                : 'bg-emerald-500 text-white shadow'
                            : theme === 'dark'
                                ? 'text-white hover:bg-white/10'
                                : 'text-gray-700 hover:bg-black/10'
                    }`}
                    onClick={() => changeTab('past')}
                >
                    Past Interviews
                </button>
            </div>
            <div className={`flex flex-col md:flex-row gap-8 min-h-[80vh] transition-all duration-300 ${
                theme === "light"
                    ? "bg-white/90 text-gray-900"
                    : "bg-[#10151c] text-white"
            }`}>
                {/* Interview List */}
                <div className="md:w-1/2 w-full">
                    <ul className="space-y-3">
                        {interviewsByTab.length === 0 ? (
                            <li className="p-8 text-center text-gray-400">No interviews found.</li>
                        ) : (
                            interviewsByTab.map((interview) => (
                                <li
                                    key={interview.id}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-xl flex items-center gap-4 relative ${
                                        selectedId === interview.id
                                            ? theme === "light"
                                                ? "border-emerald-500 bg-emerald-50"
                                                : "border-[#13ff8c] bg-[#13ff8c]/10"
                                            : theme === "light"
                                                ? "border-gray-200 bg-white"
                                                : "border-white/10 bg-white/5"
                                    }`}
                                    onClick={() => setSelectedId(interview.id)}
                                >
                                    {/* Round badge */}
                                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${
                                        theme === "light"
                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                            : "bg-[#13ff8c]/20 text-[#13ff8c] border border-[#13ff8c]/40"
                                    }`}>
                    {interview.round}
                  </span>
                                    <img src={interview.companyLogo} alt={interview.company} className="w-12 h-12 rounded-full border shadow-sm bg-white" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">{interview.jobTitle}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-sm">
                                            <span>{formatDate(interview.date)}</span>
                                            <span className={`flex items-center gap-1 font-medium ${theme === "light" ? "text-emerald-600" : "text-[#13ff8c]"}`}>
                        {interview.company}
                      </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                {/* Interview Details */}
                <div className="md:w-1/2 w-full">
                    {selected ? (
                        <div className={`p-8 rounded-2xl border shadow-lg transition-all duration-300 flex flex-col items-center gap-6 ${
                            theme === "light"
                                ? "bg-white border-gray-200"
                                : "bg-[#181f2a] border-white/10"
                        }`}>
                            <div className="flex flex-col items-center w-full mb-2">
                                <div className="flex items-center gap-4 w-full justify-center">
                                    <img src={selected!.companyLogo} alt={selected!.company} className="w-16 h-16 rounded-full border-2 border-emerald-400 shadow-lg bg-white" />
                                    <div className="flex flex-col items-start">
                                        <span className={`text-lg font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>{selected!.company}</span>
                                        <span className={`text-base font-medium ${theme === "light" ? "text-emerald-600" : "text-[#13ff8c]"}`}>{selected!.jobTitle}</span>
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold mt-4 flex items-center gap-2 ${theme === "light" ? "text-emerald-600" : "text-[#13ff8c]"}`}>
                                    {selected!.status === "Accepted" ? (
                                        <FaCheckCircle className={theme === "light" ? "text-emerald-500" : "text-[#13ff8c]"} />
                                    ) : selected!.status === "Rejected" ? (
                                        <FaTimesCircle className={theme === "light" ? "text-red-500" : "text-red-400"} />
                                    ) : selected!.status === "Not Attended" ? (
                                        <FaUserTie className={theme === "light" ? "text-yellow-500" : "text-yellow-400"} />
                                    ) : (
                                        <FaClock className={theme === "light" ? "text-gray-400" : "text-gray-500"} />
                                    )}
                                    {selected!.title}
                                </h3>
                            </div>
                            <div className={`mb-2 text-lg font-semibold ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>{selected!.company}</div>
                            {/* Modern horizontal info row with icons */}
                            <div className={`flex flex-wrap items-center justify-center gap-6 w-full mb-4 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                                <div className={`flex flex-col items-center px-4 py-2 rounded-xl shadow-sm ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}>
                                    <FaCalendarAlt className={theme === "light" ? "text-emerald-500 mb-1" : "text-[#13ff8c] mb-1"} size={22} />
                                    <span className="text-xs font-semibold">Date</span>
                                    <span className="text-sm font-medium mt-1">{formatDate(selected!.date)}</span>
                                </div>
                                <div className={`flex flex-col items-center px-4 py-2 rounded-xl shadow-sm ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}>
                                    <FaClock className={theme === "light" ? "text-emerald-500 mb-1" : "text-[#13ff8c] mb-1"} size={22} />
                                    <span className="text-xs font-semibold">Time</span>
                                    <span className="text-sm font-medium mt-1">{selected!.time}</span>
                                </div>
                                <div className={`flex flex-col items-center px-4 py-2 rounded-xl shadow-sm ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}>
                                    {/* Status icon according to value */}
                                    {selected!.status === "Accepted" ? (
                                        <FaCheckCircle className={theme === "light" ? "text-emerald-500 mb-1" : "text-[#13ff8c] mb-1"} size={22} />
                                    ) : selected!.status === "Rejected" ? (
                                        <FaTimesCircle className={theme === "light" ? "text-red-500 mb-1" : "text-red-400 mb-1"} size={22} />
                                    ) : selected!.status === "Not Attended" ? (
                                        <FaUserTie className={theme === "light" ? "text-yellow-500 mb-1" : "text-yellow-400 mb-1"} size={22} />
                                    ) : (
                                        <FaClock className={theme === "light" ? "text-gray-400 mb-1" : "text-gray-500 mb-1"} size={22} />
                                    )}
                                    <span className="text-xs font-semibold">Status</span>
                                    <span className={`text-sm font-medium mt-1 ${selected!.status === "Accepted" ? (theme === "light" ? "text-emerald-600" : "text-[#13ff8c]") : selected!.status === "Rejected" ? (theme === "light" ? "text-red-500" : "text-red-400") : selected!.status === "Not Attended" ? (theme === "light" ? "text-yellow-500" : "text-yellow-400") : ""}`}>{selected!.status.charAt(0).toUpperCase() + selected!.status.slice(1)}</span>
                                </div>
                                <div className={`flex flex-col items-center px-4 py-2 rounded-xl shadow-sm ${theme === "light" ? "bg-gray-50" : "bg-white/5"}`}>
                                    {/* Use FaUserTie for round icon, or customize per round type if desired */}
                                    <FaUserTie className={theme === "light" ? "text-emerald-500 mb-1" : "text-[#13ff8c] mb-1"} size={22} />
                                    <span className="text-xs font-semibold">Round</span>
                                    <span className="text-sm font-medium mt-1">{selected!.round}</span>
                                </div>
                            </div>
                            <div className={theme === "light" ? "text-gray-800" : "text-gray-200"}>
                                <span className="font-semibold">Description:</span>
                                <p className="mt-2 text-center">{selected!.description}</p>
                            </div>
                            {/* Countdown for upcoming interviews, buttons for others */}
                            {(selected!.status === "Accepted" || selected!.status === "Not Attended") ? (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <CountdownTimer date={selected!.date} time={selected!.time} theme={theme} />
                                </div>
                            ) : selected!.status === "Ongoing" ? (
                                <button
                                    className={`mt-4 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 hover:scale-105 shadow-lg ${
                                        theme === "light"
                                            ? "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-400"
                                            : "bg-[#13ff8c] text-black hover:bg-[#19fb9b] focus:ring-[#13ff8c]"
                                    }`}
                                    onClick={() =>
                                        router.push(`/call`)
                                    }
                                >
                                    Join Interview
                                </button>
                            ) : (
                                <button
                                    className={`mt-4 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 hover:scale-105 shadow-lg ${
                                        theme === "light"
                                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                                            : "bg-white/10 text-gray-200 hover:bg-white/20 focus:ring-white/20"
                                    }`}
                                    onClick={() => alert("Viewing details...")}
                                >
                                    View Details
                                </button>
                            )}

                        </div>
                    ) : (
                        <div className={`p-8 rounded-2xl border shadow-lg flex items-center justify-center h-full ${
                            theme === "light"
                                ? "bg-white border-gray-200 text-gray-500"
                                : "bg-[#181f2a] border-white/10 text-gray-400"
                        }`}>
                            Select an interview to view details.
                        </div>
                    )}
                </div>
            </div>

        </DashboardLayout>
    );
}
