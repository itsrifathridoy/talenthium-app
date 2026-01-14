"use client";
import * as React from "react";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { GlassCard } from "../../components/GlassCard";
import { FaPlus, FaFilter, FaChevronDown, FaCheck, FaStar, FaGraduationCap, FaHeart, FaUsers } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock mentor data
const exploreMentors = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 4.9,
    reviews: 127,
    expertise: ['React', 'TypeScript', 'System Design'],
    price: 80,
    badge: 'Top Mentor',
    badgeColor: 'bg-yellow-400',
    experience: '8+ years',
    sessions: 256,
    bio: 'Passionate about helping developers grow their frontend and system design skills.',
    availability: 'Available',
    responseTime: '< 2 hours'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'Tech Lead',
    company: 'Microsoft',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.8,
    reviews: 89,
    expertise: ['Node.js', 'AWS', 'DevOps'],
    price: 95,
    badge: 'Highest Rated',
    badgeColor: 'bg-emerald-400',
    experience: '10+ years',
    sessions: 178,
    bio: 'Backend expert focused on scalable architecture and cloud technologies.',
    availability: 'Available',
    responseTime: '< 1 hour'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    title: 'Principal Designer',
    company: 'Figma',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    rating: 4.9,
    reviews: 156,
    expertise: ['UI/UX Design', 'Design Systems', 'Prototyping'],
    price: 75,
    badge: 'Best Pick',
    badgeColor: 'bg-purple-400',
    experience: '7+ years',
    sessions: 203,
    bio: 'Design leader helping create intuitive and beautiful user experiences.',
    availability: 'Busy',
    responseTime: '< 4 hours'
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'Data Science Manager',
    company: 'Netflix',
    avatar: 'https://randomuser.me/api/portraits/men/39.jpg',
    rating: 4.7,
    reviews: 94,
    expertise: ['Machine Learning', 'Python', 'Data Analytics'],
    price: 120,
    badge: 'Top Mentor',
    badgeColor: 'bg-blue-400',
    experience: '12+ years',
    sessions: 145,
    bio: 'ML expert passionate about data-driven solutions and mentoring.',
    availability: 'Available',
    responseTime: '< 3 hours'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    title: 'VP of Engineering',
    company: 'Stripe',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
    rating: 4.9,
    reviews: 201,
    expertise: ['Leadership', 'Engineering Management', 'Scaling Teams'],
    price: 150,
    badge: 'Highest Rated',
    badgeColor: 'bg-red-400',
    experience: '15+ years',
    sessions: 312,
    bio: 'Engineering leader focused on building high-performing teams.',
    availability: 'Available',
    responseTime: '< 1 hour'
  },
  {
    id: 6,
    name: 'Alex Thompson',
    title: 'Blockchain Developer',
    company: 'Coinbase',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: 4.6,
    reviews: 73,
    expertise: ['Blockchain', 'Solidity', 'Web3'],
    price: 110,
    badge: 'Best Pick',
    badgeColor: 'bg-orange-400',
    experience: '6+ years',
    sessions: 98,
    bio: 'Web3 pioneer helping developers enter the blockchain space.',
    availability: 'Available',
    responseTime: '< 2 hours'
  }
];

const myMentors = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 4.9,
    expertise: ['React', 'TypeScript', 'System Design'],
    nextSession: '2024-09-05 14:00',
    sessionsCompleted: 8,
    status: 'Active',
    progress: 75,
    lastMessage: 'Great progress on the React project! Looking forward to our next session.',
    messageTime: '2 hours ago'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'Tech Lead',
    company: 'Microsoft',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.8,
    expertise: ['Node.js', 'AWS', 'DevOps'],
    nextSession: '2024-09-07 10:00',
    sessionsCompleted: 12,
    status: 'Active',
    progress: 85,
    lastMessage: 'The deployment architecture looks solid. Let\'s review the monitoring setup.',
    messageTime: '1 day ago'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    title: 'Principal Designer',
    company: 'Figma',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    rating: 4.9,
    expertise: ['UI/UX Design', 'Design Systems'],
    nextSession: null,
    sessionsCompleted: 5,
    status: 'Completed',
    progress: 100,
    lastMessage: 'Congratulations on completing the design system! You\'ve made excellent progress.',
    messageTime: '1 week ago'
  }
];

export default function MentorshipPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize tab from query parameters
  const [tab, setTab] = useState<'explore' | 'my' | 'home'>(() => {
    const tabParam = searchParams?.get('tab') as 'explore' | 'my' | 'home';
    return ['explore', 'my', 'home'].includes(tabParam) ? tabParam : 'home';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Update tab when URL search params change
  useEffect(() => {
    const tabParam = searchParams?.get('tab') as 'explore' | 'my' | 'home';
    if (['explore', 'my', 'home'].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const updateTab = (newTab: 'explore' | 'my' | 'home') => {
    setTab(newTab);
    
    const currentParams = new URLSearchParams(searchParams?.toString() || '');
    if (newTab === 'home') {
      currentParams.delete('tab');
    } else {
      currentParams.set('tab', newTab);
    }
    
    const newUrl = currentParams.toString() ? `?${currentParams.toString()}` : '';
    router.replace(`/mentorship${newUrl}`, { scroll: false });
  };

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Filter mentors based on search and filters
  const filteredMentors = exploreMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      mentor.expertise.some(skill => skill.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'budget' && mentor.price <= 50) ||
      (priceRange === 'medium' && mentor.price > 50 && mentor.price <= 100) ||
      (priceRange === 'premium' && mentor.price > 100);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort mentors
  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      default:
        return 0;
    }
  });

  // Get category sections for explore tab
  const getHighestRated = () => sortedMentors.filter(m => m.badge === 'Highest Rated').slice(0, 3);
  const getTopMentors = () => sortedMentors.filter(m => m.badge === 'Top Mentor').slice(0, 3);
  const getBestPicks = () => sortedMentors.filter(m => m.badge === 'Best Pick').slice(0, 3);

  return (
    <DashboardLayout
      sidebarActive="Mentorship"
      topbarTitle="Mentorship"
      theme={theme}
      setTheme={setTheme}
    >
      <div className="">
        {/* Hero Section with Floating Avatars */}
        <div className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
          {/* Floating Mentor Avatars */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-20 left-20"
            >
              <img
                src="https://randomuser.me/api/portraits/women/32.jpg"
                alt="Mentor"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Top Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute top-32 right-32"
            >
              <img
                src="https://randomuser.me/api/portraits/women/28.jpg"
                alt="Mentor"
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Left Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute left-12 top-1/2 transform -translate-y-1/2"
            >
              <img
                src="https://randomuser.me/api/portraits/men/45.jpg"
                alt="Mentor"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Right Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute right-16 top-1/3"
            >
              <img
                src="https://randomuser.me/api/portraits/men/39.jpg"
                alt="Mentor"
                className="w-18 h-18 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Bottom Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="absolute bottom-32 left-1/8"
            >
              <img
                src="https://randomuser.me/api/portraits/women/41.jpg"
                alt="Mentor"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Bottom Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute bottom-20 right-1/8"
            >
              <img
                src="https://randomuser.me/api/portraits/men/52.jpg"
                alt="Mentor"
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            </motion.div>

            {/* Additional Floating Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="absolute top-40 left-1/3 w-3 h-3 bg-emerald-400 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="absolute bottom-40 right-1/3 w-2 h-2 bg-blue-400 rounded-full"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.9 }}
              className="absolute top-1/2 right-1/4 w-4 h-4 bg-yellow-400 rounded-full"
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-5xl md:text-6xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Everyone needs a{' '}
              <span className="text-emerald-500">Mentor</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <button
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors duration-200 shadow-lg"
              >
                Become a Mentor!
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-xl mb-12 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Search amazing individuals around the globe, find a mentor, expand
              <br />
              your network, and learn from incredible people!
            </motion.p>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="search"
                    placeholder="Search Mentor & Mentees"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-6 py-4 border-2 ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                    } rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-lg text-lg`}
                  />
                </div>
                <Link href="/mentorship/explore">
                  <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors duration-200 shadow-lg"
                  >
                    SEARCH
                  </button>
                </Link>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Tip: Search by skills, interest, location, name etc
              </p>
            </motion.div>

            {/* Browse All Mentors Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-6 flex justify-center"
            >
              <Link
                href="/mentorship/explore"
                className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'text-white hover:text-emerald-400' : 'text-gray-900 hover:text-emerald-600'
                } font-semibold text-lg transition-colors duration-200`}
              >
                Browse all Mentors
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Tabs Section - Only show when browsing */}
        <AnimatePresence>
          {(tab === 'explore' || tab === 'my') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="px-6 pb-6"
            >
              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className={`flex items-center gap-2 border ${
                  theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/90 border-gray-300 shadow-sm'
                } rounded-full p-1 shadow-lg backdrop-blur-[6px]`}>
                  <button
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                      theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
                    } ${
                      tab === 'explore' 
                        ? theme === 'dark' 
                          ? 'bg-[#13ff8c]/90 text-black shadow-[0_0_12px_2px_rgba(19,255,140,0.25)]' 
                          : 'bg-emerald-500 text-white shadow-[0_0_12px_2px_rgba(16,185,129,0.3)]'
                        : theme === 'dark'
                          ? 'text-white hover:bg-white/10'
                          : 'text-gray-700 hover:bg-black/10'
                    }`}
                    onClick={() => updateTab('explore')}
                    type="button"
                  >
                    Explore Mentors
                  </button>
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
                    onClick={() => updateTab('my')}
                    type="button"
                  >
                    My Mentors
                  </button>
                </div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {tab === 'explore' ? (
                  <ExploreContent 
                    key="explore"
                    mentors={sortedMentors}
                    highestRated={getHighestRated()}
                    topMentors={getTopMentors()}
                    bestPicks={getBestPicks()}
                    theme={theme}
                  />
                ) : (
                  <MyMentorsContent 
                    key="my"
                    mentors={myMentors}
                    theme={theme}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// Explore Mentors Content Component
function ExploreContent({ 
  mentors, 
  highestRated, 
  topMentors, 
  bestPicks, 
  theme 
}: { 
  mentors: any[], 
  highestRated: any[], 
  topMentors: any[], 
  bestPicks: any[], 
  theme: 'light' | 'dark' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Highest Rated Mentors */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <FaStar className="text-yellow-500" size={20} />
          <h2 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Highest Rated Mentors
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highestRated.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} theme={theme} />
          ))}
        </div>
      </section>

      {/* Top Mentors */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <FaGraduationCap className="text-blue-500" size={20} />
          <h2 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Top Mentors
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} theme={theme} />
          ))}
        </div>
      </section>

      {/* Best Picks For You */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <FaHeart className="text-purple-500" size={20} />
          <h2 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Best Picks For You
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestPicks.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} theme={theme} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}

// My Mentors Content Component
function MyMentorsContent({ 
  mentors, 
  theme 
}: { 
  mentors: any[], 
  theme: 'light' | 'dark' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentors.map((mentor) => (
          <MyMentorCard key={mentor.id} mentor={mentor} theme={theme} />
        ))}
      </div>
    </motion.div>
  );
}

// Mentor Card Component for Explore
function MentorCard({ mentor, theme }: { mentor: any, theme: 'light' | 'dark' }) {
  return (
    <Link href={`/mentorship/${mentor.id}`}>
      <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className={`absolute -top-1 -right-1 px-2 py-1 ${mentor.badgeColor} text-white text-xs font-bold rounded-full`}>
            {mentor.badge}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {mentor.name}
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {mentor.title} at {mentor.company}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" size={14} />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {mentor.rating}
              </span>
            </div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ({mentor.reviews} reviews)
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${
            theme === 'dark' ? 'text-[#13ff8c]' : 'text-emerald-600'
          }`}>
            ${mentor.price}/hour
          </div>
          <div className={`text-xs ${
            mentor.availability === 'Available' ? 'text-green-500' : 'text-yellow-500'
          }`}>
            {mentor.availability}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        } mb-3`}>
          {mentor.bio}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.expertise.map((skill: string, index: number) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded-full ${
                theme === 'dark' 
                  ? 'bg-white/10 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {mentor.experience} experience
          </span>
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {mentor.sessions} sessions
          </span>
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Responds {mentor.responseTime}
          </span>
        </div>
      </div>
      
      <button
        className={`w-full mt-4 px-4 py-2 ${
          theme === 'dark' 
            ? 'bg-[#13ff8c]/90 text-black hover:bg-[#13ff8c]' 
            : 'bg-emerald-500 text-white hover:bg-emerald-600'
        } rounded-lg font-semibold transition-colors duration-200`}
      >
        Book Session
      </button>
    </GlassCard>
    </Link>
  );
}

// My Mentor Card Component
function MyMentorCard({ mentor, theme }: { mentor: any, theme: 'light' | 'dark' }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {mentor.name}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              mentor.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {mentor.status}
            </span>
          </div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {mentor.title} at {mentor.company}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" size={14} />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {mentor.rating}
              </span>
            </div>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {mentor.sessionsCompleted} sessions completed
            </span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Learning Progress
          </span>
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {mentor.progress}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${
          theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
        }`}>
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${mentor.progress}%` }}
          />
        </div>
      </div>
      
      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.expertise.map((skill: string, index: number) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded-full ${
              theme === 'dark' 
                ? 'bg-white/10 text-gray-300' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {skill}
          </span>
        ))}
      </div>
      
      {/* Last Message */}
      <div className={`p-3 rounded-lg mb-4 ${
        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          "{mentor.lastMessage}"
        </p>
        <p className={`text-xs mt-1 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {mentor.messageTime}
        </p>
      </div>
      
      {/* Next Session or Actions */}
      <div className="flex gap-2">
        {mentor.nextSession ? (
          <button
            className={`flex-1 px-4 py-2 ${
              theme === 'dark' 
                ? 'bg-[#13ff8c]/90 text-black hover:bg-[#13ff8c]' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            } rounded-lg font-semibold transition-colors duration-200`}
          >
            Next Session: {new Date(mentor.nextSession).toLocaleDateString()}
          </button>
        ) : (
          <button
            className={`flex-1 px-4 py-2 ${
              theme === 'dark' 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-lg font-semibold transition-colors duration-200`}
          >
            Book New Session
          </button>
        )}
        <button
          className={`px-4 py-2 ${
            theme === 'dark' 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } rounded-lg transition-colors duration-200`}
        >
          Message
        </button>
      </div>
    </GlassCard>
  );
}
