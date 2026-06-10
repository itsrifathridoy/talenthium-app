"use client";
import React from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { ProjectWorkingOn } from "../../components/ProjectWorkingOn";
import { TopJobs } from "../../components/TopJobs";

export default function DashboardPage() {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
        }
        return 'dark';
    });

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
        try { localStorage.setItem('theme', theme); } catch {}
    }, [theme]);

    return (
        <DashboardLayout
            sidebarActive="Dashboard"
            theme={theme}
            setTheme={setTheme}
        >
            <ProjectWorkingOn theme={theme} />
            <TopJobs theme={theme} />
        </DashboardLayout>
    );
}
