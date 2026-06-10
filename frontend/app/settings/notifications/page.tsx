"use client";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

interface Toggle {
  id: string;
  label: string;
  desc: string;
  value: boolean;
}

const DEFAULTS: Toggle[] = [
  { id: "job_alerts",       label: "Job Alerts",            desc: "New jobs matching your skills",              value: true  },
  { id: "interview_remind", label: "Interview Reminders",   desc: "Reminders 24h and 1h before interviews",    value: true  },
  { id: "mentor_msg",       label: "Mentor Messages",       desc: "New messages from your mentors",             value: true  },
  { id: "project_updates",  label: "Project Updates",       desc: "Activity on projects you collaborate on",   value: false },
  { id: "community",        label: "Community",             desc: "Replies and mentions in community posts",   value: false },
  { id: "weekly_digest",    label: "Weekly Digest",         desc: "Summary of your activity every Monday",     value: true  },
];

export default function NotificationsSettingsPage() {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "dark";
  });

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const [toggles, setToggles] = useState<Toggle[]>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  const flip = (id: string) =>
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, value: !t.value } : t)));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const card = theme === "dark"
    ? "bg-[#0d1f17] border border-[#13ff8c]/20"
    : "bg-white border border-emerald-100 shadow-sm";
  const text = theme === "dark" ? "text-white" : "text-slate-800";
  const sub = theme === "dark" ? "text-slate-400" : "text-slate-500";

  return (
    <DashboardLayout sidebarActive="Profile" theme={theme} setTheme={setTheme} topbarTitle="Notification Settings">
      <div className="max-w-2xl flex flex-col gap-6">

        <div className={`rounded-2xl p-6 flex flex-col gap-4 ${card}`}>
          <h2 className={`text-xl font-bold ${text}`}>Notification Preferences</h2>
          <p className={`text-sm ${sub}`}>Choose what you want to be notified about.</p>
        </div>

        <div className={`rounded-2xl flex flex-col divide-y ${
          theme === "dark" ? "divide-[#13ff8c]/10" : "divide-emerald-100"
        } ${card}`}>
          {toggles.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-6 py-5">
              <div>
                <p className={`font-medium ${text}`}>{t.label}</p>
                <p className={`text-sm ${sub}`}>{t.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={t.value}
                onClick={() => flip(t.id)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  t.value
                    ? theme === "dark" ? "bg-[#13ff8c]" : "bg-emerald-500"
                    : theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  t.value ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className={`self-start flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
            saved
              ? theme === "dark" ? "bg-[#13ff8c]/20 text-[#13ff8c]" : "bg-emerald-100 text-emerald-700"
              : theme === "dark"
                ? "bg-gradient-to-r from-[#13ff8c] to-[#0ea574] text-black hover:shadow-[0_0_20px_rgba(19,255,140,0.3)]"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg"
          }`}
        >
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </DashboardLayout>
  );
}
