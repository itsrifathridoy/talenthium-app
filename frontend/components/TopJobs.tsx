import React, { useState } from 'react'
import { GlassCard } from './GlassCard'
import { FaCalendarAlt, FaTasks, FaUser, FaShareAlt, FaLink } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export const TopJobs = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const jobs = [
        {
          logo: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
          company: 'Twitter',
          title: 'Senior Business Systems Analyst',
          badges: ['Grant', 'New'],
          meta: [
            { icon: <FaUser />, label: 'Work from anywhere' },
            { icon: <FaCalendarAlt />, label: 'Work anytime' },
            { icon: <FaTasks />, label: '40 hrs/week' },
          ],
          skills: ['Javascript', 'Java', 'HTML'],
          salary: '$90K',
          matchAvatars: [
            'https://randomuser.me/api/portraits/men/32.jpg',
            'https://randomuser.me/api/portraits/women/44.jpg',
          ],
          posted: '45 minutes ago',
      duration: '6 months',
      dates: 'Jan 23 – Aug 14, 2022',
      description: `The chief responsibility is to put Data Science into production with enterprise capabilities (performance, scale, security). Define and develop the program and architecture for data collection, modeling, metrics creation, data validation, model training, and reporting of intelligence. Maecenas faucibus mollis interdum. Maecenas sed diam eget risus sed diam varius sed blandit...`,
      shareLink: 'btrust.us/joblink',
      shareNote: 'Grants are not eligible for BTRST referral bonuses at this time.'
        },
        {
          logo: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
          company: 'Google',
          title: 'Frontend Engineer',
          badges: ['Remote'],
          meta: [
            { icon: <FaUser />, label: 'Remote' },
            { icon: <FaCalendarAlt />, label: 'Full time' },
            { icon: <FaTasks />, label: '35 hrs/week' },
          ],
          skills: ['React', 'Typescript', 'CSS'],
          salary: '$120K',
          matchAvatars: [
            'https://randomuser.me/api/portraits/men/45.jpg',
            'https://randomuser.me/api/portraits/women/47.jpg',
          ],
          posted: '2 hours ago',
      duration: '12 months',
      dates: 'Feb 1 – Feb 1, 2023',
      description: `You will build and maintain scalable frontend applications. Collaborate with cross-functional teams to deliver high-quality products.`,
      shareLink: 'btrust.us/joblink2',
      shareNote: 'Grants are not eligible for BTRST referral bonuses at this time.'
    },
  ];
  const [expanded, setExpanded] = useState(Array(jobs.length).fill(false));

  const toggleExpand = (idx: number) => {
    setExpanded(expanded => expanded.map((v, i) => i === idx ? !v : v));
  };

  return (
    <GlassCard className="flex-1 flex flex-col" theme={theme}>
      <div className={`font-semibold text-lg mb-2 ${
        theme === 'dark' ? 'text-white' : 'text-slate-800'
      }`}>Top Jobs picks for you</div>
      <div className="flex flex-col gap-5">
        {jobs.map((job, i) => (
          <div key={i} className={`rounded-xl p-5 border shadow-inner relative transition-all duration-300 flex flex-col gap-0 ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/80 border-blue-300/50'
          }`}>
            {/* Main Row: Logo, Info, Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
          {/* Logo */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-white/20">
            <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
          </div>
          {/* Main Info */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {job.badges.map((b, idx) => (
                <span key={idx} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b==='Grant'?'bg-red-100 text-red-500':b==='New'?'bg-pink-100 text-pink-500':'bg-gray-100 text-gray-600'}`}>{b}</span>
              ))}
            </div>
            <div className={`font-bold text-lg truncate ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>{job.title}</div>
            <div className={`text-sm mb-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-slate-600'
            }`}>{job.company}</div>
            <div className={`flex flex-wrap gap-3 text-xs mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
            }`}>
              {job.meta.map((m, idx) => (
                <span key={idx} className="flex items-center gap-1"><span className={
                  theme === 'dark' ? 'text-[#13ff8c]' : 'text-blue-700'
                }>{m.icon}</span>{m.label}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {job.skills.map((s, idx) => (
                <span key={idx} className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  theme === 'dark' 
                    ? 'bg-[#13ff8c]/10 text-[#13ff8c]' 
                    : 'bg-blue-100/70 text-blue-800'
                }`}>{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
              }`}>You match!</span>
              <div className="flex -space-x-2">
                {job.matchAvatars.map((src, idx) => (
                  <img key={idx} src={src} alt="match" className="w-6 h-6 rounded-full border-2 border-white" />
                ))}
              </div>
            </div>
            <div className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-slate-500'
            }`}>Posted {job.posted}</div>
          </div>
              {/* Salary & Actions (always visible, right-aligned) */}
              <div className="flex flex-col items-end gap-2 ml-auto min-w-[120px]">
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>{job.salary}</span>
            <button className={`px-5 py-2 rounded-full font-semibold text-sm shadow transition ${
              theme === 'dark' 
                ? 'bg-black text-white hover:bg-[#13ff8c] hover:text-black' 
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}>View job</button>
                <button
                  className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-lg backdrop-blur-[4px] transition-all duration-200 focus:outline-none hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-[#1a2a22]/70 via-[#13ff8c]/10 to-[#0a1813]/70 border-[#13ff8c]/30 text-[#13ff8c] focus:ring-2 focus:ring-[#13ff8c] hover:shadow-[0_0_12px_2px_rgba(19,255,140,0.25)] hover:border-[#13ff8c] hover:text-[#19fb9b]'
                      : 'bg-gradient-to-r from-white/80 via-blue-50/80 to-white/80 border-blue-400/50 text-blue-800 focus:ring-2 focus:ring-blue-600 hover:shadow-[0_0_12px_2px_rgba(37,99,235,0.3)] hover:border-blue-600 hover:text-blue-900'
                  }`}
                  onClick={() => toggleExpand(i)}
                  aria-expanded={expanded[i]}
                  aria-controls={`job-details-${i}`}
                >
                  <span>{expanded[i] ? 'Collapse details' : 'Expand details'}</span>
                  <svg
                    className={`w-5 h-5 ml-1 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(19,255,140,0.25)] ${expanded[i] ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Expandable Section with framer-motion, always below main row */}
            <AnimatePresence initial={false}>
              {expanded[i] && (
                <motion.div
                  key="expand"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0.2, 0.2, 1] }}
                  className="overflow-hidden"
                  aria-hidden={!expanded[i]}
                >
                  <div className="mt-6 flex flex-col md:flex-row gap-6">
                    {/* Left: Details */}
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <span className="flex items-center gap-1"><FaUser className="text-[#13ff8c]" /> {job.meta[0]?.label}</span>
                          <span className="flex items-center gap-1"><FaCalendarAlt className="text-[#13ff8c]" /> {job.meta[1]?.label}</span>
                          <span className="flex items-center gap-1"><FaTasks className="text-[#13ff8c]" /> {job.meta[2]?.label}</span>
                          <span className="flex items-center gap-1">{job.duration}</span>
                          <span className="flex items-center gap-1">{job.dates}</span>
                        </div>
                        <div className="text-xs text-gray-400">{job.posted}</div>
                      </div>
                      <div className="mb-2 font-semibold text-gray-700 dark:text-white">What you’ll be working on</div>
                      <div className="text-gray-400 text-sm mb-4">{job.description}</div>
                      <button className="px-5 py-2 rounded-full bg-black text-white font-semibold text-sm shadow hover:bg-[#13ff8c] hover:text-black transition w-fit">View job</button>
                    </div>
                    {/* Right: Share box */}
                    <div className="flex flex-col gap-3 bg-yellow-50/60 dark:bg-yellow-100/10 border border-yellow-200/40 dark:border-yellow-100/20 rounded-xl p-5 min-w-[260px] max-w-[320px] shadow-inner">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-yellow-200 font-semibold mb-2">
                        <FaShareAlt className="text-lg" /> Share this job
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-white/10 border border-dashed border-yellow-300/40 dark:border-yellow-100/20 rounded-lg px-3 py-2">
                        <FaLink className="text-gray-400" />
                        <span className="text-xs text-gray-700 dark:text-yellow-100 font-mono truncate">{job.shareLink}</span>
                        <button className="ml-auto px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs font-semibold text-gray-700 dark:text-yellow-100 border border-gray-200/40 dark:border-yellow-100/20">Copy link</button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-yellow-200 mt-2">{job.shareNote}</div>
                    </div>
          </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      ))}
    </div>
  </GlassCard>
  )
}
