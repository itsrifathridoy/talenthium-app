"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { GlassCard } from "../../../components/GlassCard";
import { FaStar, FaCalendar, FaClock, FaCheck, FaHeart, FaShare } from 'react-icons/fa';
import { useState, useEffect } from "react";

// Mock mentor detail data
const mentorDetails = {
  id: 1,
  name: 'Sarah Chen',
  title: 'Senior Software Engineer',
  company: 'Google',
  avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  rating: 4.9,
  reviewCount: 127,
  expertise: ['React', 'TypeScript', 'System Design', 'Frontend Architecture', 'Performance Optimization'],
  price: 80,
  badge: 'Top Mentor',
  badgeColor: 'bg-yellow-400',
  experience: '8+ years',
  sessions: 256,
  responseTime: '< 2 hours',
  languages: ['English', 'Mandarin'],
  timezone: 'PST (UTC-8)',
  availability: 'Available',
  bio: 'Passionate about helping developers grow their frontend and system design skills. I have over 8 years of experience building scalable web applications at top tech companies.',
  longDescription: `I\'m a Senior Software Engineer at Google with extensive experience in frontend development, system design, and team leadership. My passion lies in helping developers advance their careers and build better software.

Over the years, I\'ve worked on large-scale applications serving millions of users, led cross-functional teams, and mentored dozens of engineers. I believe in a hands-on approach to learning and focus on practical skills that will make an immediate impact on your career.

My mentoring style is collaborative and tailored to each individual\'s goals. Whether you\'re looking to improve your coding skills, prepare for technical interviews, or advance into leadership roles, I\'m here to guide you every step of the way.`,
  achievements: [
    'Led frontend architecture for Google Search mobile app',
    'Mentored 50+ engineers to senior roles',
    'Speaker at React Conf 2023',
    'Published 15+ technical articles',
    'Contributed to React core team'
  ],
  sessionTypes: [
    {
      type: 'Code Review',
      duration: 30,
      price: 60,
      description: 'Get your code reviewed by an expert'
    },
    {
      type: 'Technical Interview Prep',
      duration: 60,
      price: 80,
      description: 'Practice coding interviews and system design'
    },
    {
      type: 'Career Guidance',
      duration: 45,
      price: 70,
      description: 'Discuss career paths and growth strategies'
    },
    {
      type: 'Project Consultation',
      duration: 90,
      price: 120,
      description: 'Deep dive into your project architecture'
    }
  ],
  reviews: [
    {
      id: 1,
      author: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
      rating: 5,
      date: '2 weeks ago',
      content: 'Sarah is an amazing mentor! She helped me land a job at a top tech company. Her system design insights are invaluable.',
      helpful: 12
    },
    {
      id: 2,
      author: 'Maria Garcia',
      avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
      rating: 5,
      date: '1 month ago',
      content: 'Excellent mentor with deep technical knowledge. The code review sessions were incredibly helpful for improving my React skills.',
      helpful: 8
    },
    {
      id: 3,
      author: 'David Kim',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      rating: 4,
      date: '6 weeks ago',
      content: 'Great experience! Sarah is patient and explains complex concepts clearly. Highly recommend for anyone looking to advance their frontend skills.',
      helpful: 15
    }
  ]
};

export default function MentorDetailPage() {
  const params = useParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedSessionType, setSelectedSessionType] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const mentor = mentorDetails; // In real app, fetch based on params.mentorId

  return (
    <DashboardLayout
      sidebarActive="Mentorship"
      topbarTitle={`${mentor.name} - Mentor Profile`}
      theme={theme}
      setTheme={setTheme}
    >
      <div className="min-h-screen p-6">
        {/* Hero Section */}
        <GlassCard className="relative overflow-hidden mb-8">
          <div 
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${mentor.coverImage})` }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="relative p-6 -mt-16">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className={`absolute -top-2 -right-2 px-3 py-1 ${mentor.badgeColor} text-white text-sm font-bold rounded-full shadow-lg`}>
                  {mentor.badge}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className={`text-3xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mentor.name}
                    </h1>
                    <p className={`text-lg ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {mentor.title} at {mentor.company}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-500" size={18} />
                          <span className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {mentor.rating}
                          </span>
                        </div>
                        <span className={`${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          ({mentor.reviewCount} reviews)
                        </span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        mentor.availability === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {mentor.availability}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`p-3 rounded-full transition-colors ${
                        isFavorited
                          ? 'bg-red-100 text-red-600'
                          : theme === 'dark'
                            ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaHeart size={18} />
                    </button>
                    <button
                      className={`p-3 rounded-full transition-colors ${
                        theme === 'dark'
                          ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaShare size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
                    }`}>
                      ${mentor.price}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      per hour
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mentor.sessions}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      sessions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mentor.experience}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      experience
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {mentor.responseTime}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      response time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <GlassCard className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                About
              </h2>
              <p className={`text-base leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {mentor.longDescription}
              </p>
            </GlassCard>

            {/* Expertise */}
            <GlassCard className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {mentor.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-4 py-2 rounded-full font-medium ${
                      theme === 'dark' 
                        ? 'bg-[#13ff8c]/20 text-[#13ff8c] border border-[#13ff8c]/30' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Achievements
              </h2>
              <div className="space-y-3">
                {mentor.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FaCheck className="text-emerald-500 flex-shrink-0" />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Reviews */}
            <GlassCard className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Reviews ({mentor.reviewCount})
              </h2>
              <div className="space-y-6">
                {mentorDetails.reviews.map((review) => (
                  <div key={review.id} className={`border-b pb-6 last:border-b-0 ${
                    theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {review.author}
                          </h4>
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                size={14}
                              />
                            ))}
                          </div>
                        </div>
                        <p className={`mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {review.content}
                        </p>
                        <button className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
                        }`}>
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Session */}
            <GlassCard className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Book a Session
              </h3>
              
              <div className="space-y-4">
                {mentor.sessionTypes.map((session, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSessionType(index)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedSessionType === index
                        ? theme === 'dark'
                          ? 'border-[#13ff8c] bg-[#13ff8c]/10'
                          : 'border-emerald-500 bg-emerald-50'
                        : theme === 'dark'
                          ? 'border-white/20 hover:border-white/40'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {session.type}
                        </h4>
                        <span className={`font-bold ${
                          theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
                        }`}>
                          ${session.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock size={14} className={
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        } />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {session.duration} minutes
                        </span>
                      </div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {session.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                className={`w-full mt-6 px-6 py-3 ${
                  theme === 'dark' 
                    ? 'bg-[#13ff8c]/90 text-black hover:bg-[#13ff8c]' 
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                } rounded-lg font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-2`}
              >
                <FaCalendar size={16} />
                Book Session
              </button>
            </GlassCard>

            {/* Mentor Info */}
            <GlassCard className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Mentor Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mentor.languages.map((lang, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded ${
                          theme === 'dark' 
                            ? 'bg-white/10 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Timezone
                  </label>
                  <p className={`mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {mentor.timezone}
                  </p>
                </div>
                
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Response Time
                  </label>
                  <p className={`mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {mentor.responseTime}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
