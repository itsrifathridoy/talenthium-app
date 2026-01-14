import React from 'react'
import { GlassCard } from './GlassCard'
import { FaChevronDown, FaProjectDiagram, FaUsers } from 'react-icons/fa'

export const ProjectWorkingOn = ({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  return (
    <GlassCard className="flex flex-col gap-4" theme={theme}>
    <div className="flex justify-between items-center mb-2">
      <div className={`font-semibold text-lg ${
        theme === 'dark' ? 'text-white' : 'text-slate-800'
      }`}>Projects you working on</div>
      <div className="flex gap-2">
        <button className={`p-1 rounded-full transition ${
          theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-700'
        }`}><FaChevronDown style={{ transform: 'rotate(90deg)' }} /></button>
        <button className={`p-1 rounded-full transition ${
          theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-700'
        }`}><FaChevronDown style={{ transform: 'rotate(-90deg)' }} /></button>
      </div>
    </div>
    <div className="flex gap-6">
      {[
        {
          icon: <span className='font-bold text-2xl text-black'>S</span>,
          iconBg: 'bg-yellow-400',
          title: 'Sports Interactive',
          link: 'https://sportsinteractive.com',
          description: 'Web resource which contains all about transfers in the world of sports',
          progress: 94,
          deadline: '2 days left',
          deadlineColor: 'bg-red-100/80 text-red-500',
          avatars: [
            'https://randomuser.me/api/portraits/men/32.jpg',
            'https://randomuser.me/api/portraits/men/33.jpg',
          ],
        },
        {
          icon: <FaProjectDiagram className='text-2xl text-white' />, 
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
          icon: <FaUsers className='text-2xl text-white' />, 
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
        
          
      ].map((project, i) => (
        <div key={i} className={`flex-1 min-w-[220px] max-w-[300px] rounded-2xl border flex flex-col p-5 shadow-inner transition hover:scale-105 hover:shadow-xl relative ${
          theme === 'dark' 
            ? 'bg-white/10 border-white/10' 
            : 'bg-white/80 border-emerald-200/50'
        }`}>
          {/* Logo/Icon */}
          <div className={`absolute -top-5 left-5 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${project.iconBg}`}>{project.icon}</div>
          {/* Project Title & Link */}
          <div className="mt-8 mb-1 flex flex-col gap-1">
            <span className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>{project.title}</span>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={`text-xs underline break-all ${
              theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
            }`}>{project.link.replace('https://','')}</a>
          </div>
          {/* Description */}
          <div className={`text-sm mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-slate-600'
          }`}>{project.description}</div>
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-white/10' : 'bg-slate-200/70'
            }`}>
              <div className={`h-1.5 rounded-full ${
                theme === 'dark' ? 'bg-[#13ff8c]' : 'bg-emerald-500'
              }`} style={{ width: `${project.progress}%` }}></div>
            </div>
            <span className={`text-xs font-bold ml-2 ${
              theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
            }`}>{project.progress}%</span>
          </div>
          {/* Footer: Deadline & Avatars */}
          <div className="flex items-center justify-between mt-2">
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${project.deadlineColor}`}>{project.deadline}</span>
            <div className="flex -space-x-2">
              {project.avatars.map((src, idx) => (
                <img key={idx} src={src} alt={`avatar${idx}`} className="w-7 h-7 rounded-full border-2 border-white" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </GlassCard>
  )
}
