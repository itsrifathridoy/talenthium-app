"use client";
"use client";
import * as React from "react";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import { GlassCard } from "../../../components/GlassCard";
import { FaHeart, FaSearch, FaFilter, FaChevronDown, FaStar } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import Link from 'next/link';

// Mock mentor data
const mentors = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'Senior Frontend Engineer',
    company: 'Google',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 4.9,
    reviews: 127,
    expertise: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
    price: 80,
    badge: 'Top Mentor',
    badgeColor: 'bg-yellow-400',
    experience: '8+ years',
    sessions: 256,
    bio: 'Passionate about helping developers master modern frontend technologies and system design.',
    availability: 'Available',
    responseTime: '< 2 hours',
    category: 'Frontend'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    title: 'Senior Backend Engineer',
    company: 'Microsoft',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 4.8,
    reviews: 89,
    expertise: ['Node.js', 'Python', 'AWS', 'Microservices'],
    price: 95,
    badge: 'Highest Rated',
    badgeColor: 'bg-emerald-400',
    experience: '10+ years',
    sessions: 178,
    bio: 'Backend expert focused on scalable architecture and cloud-native solutions.',
    availability: 'Available',
    responseTime: '< 1 hour',
    category: 'Backend'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    title: 'Principal Product Designer',
    company: 'Figma',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    rating: 4.9,
    reviews: 156,
    expertise: ['UI/UX Design', 'Design Systems', 'Figma', 'User Research'],
    price: 75,
    badge: 'Best Pick',
    badgeColor: 'bg-purple-400',
    experience: '7+ years',
    sessions: 203,
    bio: 'Design leader helping create intuitive and beautiful user experiences for developers.',
    availability: 'Busy',
    responseTime: '< 4 hours',
    category: 'Design'
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'Senior Data Scientist',
    company: 'Netflix',
    avatar: 'https://randomuser.me/api/portraits/men/39.jpg',
    rating: 4.7,
    reviews: 94,
    expertise: ['Machine Learning', 'Python', 'TensorFlow', 'Data Engineering'],
    price: 120,
    badge: 'Top Mentor',
    badgeColor: 'bg-blue-400',
    experience: '12+ years',
    sessions: 145,
    bio: 'ML expert passionate about data-driven solutions and AI implementation.',
    availability: 'Available',
    responseTime: '< 3 hours',
    category: 'Data Science'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    title: 'VP of Engineering',
    company: 'Stripe',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
    rating: 4.9,
    reviews: 201,
    expertise: ['Engineering Leadership', 'Team Scaling', 'Architecture', 'Mentoring'],
    price: 150,
    badge: 'Highest Rated',
    badgeColor: 'bg-red-400',
    experience: '15+ years',
    sessions: 312,
    bio: 'Engineering leader focused on building high-performing engineering teams.',
    availability: 'Available',
    responseTime: '< 1 hour',
    category: 'Product'
  },
  {
    id: 6,
    name: 'Alex Thompson',
    title: 'Blockchain Developer',
    company: 'Coinbase',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: 4.6,
    reviews: 73,
    expertise: ['Solidity', 'Web3', 'DeFi', 'Smart Contracts'],
    price: 110,
    badge: 'Best Pick',
    badgeColor: 'bg-orange-400',
    experience: '6+ years',
    sessions: 98,
    bio: 'Web3 pioneer helping developers enter the blockchain and DeFi space.',
    availability: 'Available',
    responseTime: '< 2 hours',
    category: 'Blockchain'
  },
  {
    id: 7,
    name: 'Gabriella Han',
    title: 'DevOps Engineer',
    company: 'Meta',
    avatar: 'https://randomuser.me/api/portraits/women/35.jpg',
    rating: 4.8,
    reviews: 112,
    expertise: ['Kubernetes', 'Docker', 'CI/CD', 'AWS'],
    price: 90,
    badge: 'Featured',
    badgeColor: 'bg-teal-400',
    experience: '9+ years',
    sessions: 189,
    bio: 'Expert in cloud infrastructure and automated deployment pipelines.',
    availability: 'Available',
    responseTime: '< 3 hours',
    category: 'DevOps'
  },
  {
    id: 8,
    name: 'Koves Ahmed',
    title: 'Mobile Engineer',
    company: 'Uber',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
    rating: 4.7,
    reviews: 87,
    expertise: ['React Native', 'Flutter', 'iOS', 'Android'],
    price: 85,
    badge: 'Rising Star',
    badgeColor: 'bg-pink-400',
    experience: '6+ years',
    sessions: 134,
    bio: 'Specialized in cross-platform mobile development and performance optimization.',
    availability: 'Available',
    responseTime: '< 2 hours',
    category: 'Mobile'
  }
];

const categories = [
  { name: 'All', icon: '🏠', count: 257 },
  { name: 'Frontend', icon: '⚛️', count: 89 },
  { name: 'Backend', icon: '⚙️', count: 67 },
  { name: 'Mobile', icon: '📱', count: 45 },
  { name: 'DevOps', icon: '🚀', count: 34 },
  { name: 'Data Science', icon: '📊', count: 28 },
  { name: 'AI/ML', icon: '🤖', count: 32 },
  { name: 'Blockchain', icon: '⛓️', count: 19 },
  { name: 'Cybersecurity', icon: '🔐', count: 23 },
  { name: 'Cloud', icon: '☁️', count: 41 },
  { name: 'Product', icon: '💡', count: 52 },
  { name: 'Design', icon: '🎨', count: 38 }
];

export default function ExploreMentorsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition();
    
    const handleResize = () => {
      checkScrollPosition();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check scroll position to enable/disable arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions for category navigation
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Calculate width for 2 categories (roughly 300px)
      const scrollAmount = scrollContainerRef.current.offsetWidth / 3;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300); // Check after animation
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Calculate width for 2 categories (roughly 300px)
      const scrollAmount = scrollContainerRef.current.offsetWidth / 3;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300); // Check after animation
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== document.body) return; // Only when not focused on inputs
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollLeft();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollRight();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filter mentors
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      mentor.expertise.some(skill => {
        const skillLower = skill.toLowerCase();
        const categoryLower = selectedCategory.toLowerCase();
        return skillLower.includes(categoryLower) || 
               (categoryLower === 'frontend' && (skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular'))) ||
               (categoryLower === 'backend' && (skillLower.includes('node') || skillLower.includes('python') || skillLower.includes('java'))) ||
               (categoryLower === 'mobile' && (skillLower.includes('ios') || skillLower.includes('android') || skillLower.includes('flutter'))) ||
               (categoryLower === 'devops' && (skillLower.includes('aws') || skillLower.includes('docker') || skillLower.includes('kubernetes'))) ||
               (categoryLower === 'data science' && (skillLower.includes('data') || skillLower.includes('analytics') || skillLower.includes('python'))) ||
               (categoryLower === 'ai/ml' && (skillLower.includes('machine learning') || skillLower.includes('ai') || skillLower.includes('tensorflow'))) ||
               (categoryLower === 'blockchain' && (skillLower.includes('blockchain') || skillLower.includes('solidity') || skillLower.includes('web3'))) ||
               (categoryLower === 'cloud' && (skillLower.includes('aws') || skillLower.includes('azure') || skillLower.includes('gcp'))) ||
               (categoryLower === 'design' && (skillLower.includes('ui') || skillLower.includes('ux') || skillLower.includes('design')))
      });
    
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout
      sidebarActive="Mentorship"
      topbarTitle="Explore Mentors"
      theme={theme}
      setTheme={setTheme}
    >
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen p-6">
        {/* Header with Categories */}
        <div className="mb-8">
          {/* Category Navigation */}
          <div className="relative mb-6">
            <div className="flex items-center gap-3">
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                title="Scroll left (←)"
                className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 border-2 ${
                  !canScrollLeft
                    ? theme === 'dark'
                      ? 'bg-gray-800/30 border-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-700/70 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                      : 'bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                } backdrop-blur-sm shadow-lg ${canScrollLeft ? 'hover:shadow-xl hover:scale-105 active:scale-95' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable Categories Container */}
              <div className="flex-1 relative overflow-hidden">
                <div 
                  ref={scrollContainerRef}
                  className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth w-full max-w-full lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl"
                  onScroll={checkScrollPosition}
                >
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`group flex items-center gap-2 whitespace-nowrap px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 border-2 flex-shrink-0 ${
                        selectedCategory === category.name
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-[#064e3b] via-[#022c22] to-[#065f46] text-white border-[#10b981] shadow-lg shadow-emerald-400/40'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                          : theme === 'dark'
                            ? 'bg-gradient-to-br from-[#052e16]/70 via-[#022c22]/70 to-[#01251a]/70 text-gray-200 hover:bg-emerald-900/60 border border-[#064e3b]/50 hover:border-[#10b981]/60 backdrop-blur-md shadow-emerald-400/20'
                            : 'bg-white/80 text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md'
                      } backdrop-blur-sm`}
                      style={{ minWidth: '160px' }} // Fixed minimum width for consistent sizing
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-semibold">{category.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold transition-colors duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-white/20 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Gradient overlays for scroll indication */}
                {theme !== 'dark' && (
                  <>
                    <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 rounded-lg"></div>
                    <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 rounded-lg"></div>
                  </>
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                title="Scroll right (→)"
                className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 border-2 ${
                  !canScrollRight
                    ? theme === 'dark'
                      ? 'bg-gray-800/30 border-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100/50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-700/70 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
                      : 'bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                } backdrop-blur-sm shadow-lg ${canScrollRight ? 'hover:shadow-xl hover:scale-105 active:scale-95' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              We found {filteredMentors.length} Profiles.
            </h2>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } text-sm`} />
                <input
                  type="search"
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm`}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-lg transition-colors duration-200`}
              >
                <FaFilter size={14} />
                Filters
                <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Mentor Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <MentorProfileCard mentor={mentor} theme={theme} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No mentors found
            </h3>
            <p className={`${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Try adjusting your search or category filters
            </p>
          </div>
        )}

      
      </div>
    </DashboardLayout>
  );
}

// Mentor Profile Card Component
function MentorProfileCard({ mentor, theme }: { mentor: any, theme: 'light' | 'dark' }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative group cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#052e16]/90 via-[#022c22]/90 to-[#01251a]/90 border border-[#064e3b]/60 hover:border-[#10b981]/60 backdrop-blur-3xl shadow-emerald-900/50' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/70 hover:border-gray-300/70 backdrop-blur-xl'
      } shadow-xl hover:shadow-2xl w-full max-w-[270px] mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Section with Avatar and Actions */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          {/* Avatar with online status */}
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-3 transition-all duration-300 ${
              isHovered ? 'border-emerald-400 shadow-lg shadow-emerald-400/25' : 'border-gray-300'
            }`}>
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Online status indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* GitHub/Portfolio link */}
            <button className={`p-2 rounded-xl transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 hover:text-white' 
                : 'bg-gray-100/80 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            
            {/* Like button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                  : theme === 'dark'
                    ? 'bg-gray-700/50 hover:bg-red-500 text-gray-300 hover:text-white'
                    : 'bg-gray-100/80 hover:bg-red-500 text-gray-600 hover:text-white'
              }`}
            >
              <FaHeart size={14} />
            </button>
          </div>
        </div>

        {/* Name and Title */}
        <div className="mb-3">
          <h3 className={`text-lg font-bold mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {mentor.name}
          </h3>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {mentor.title}
          </p>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {mentor.company} • {mentor.experience}
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {mentor.expertise.slice(0, 3).map((skill: string, index: number) => (
              <span
                key={index}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700/70 text-gray-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-400' 
                    : 'bg-gray-100 text-gray-700 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                } border border-transparent group-hover:border-emerald-500/30`}
              >
                {skill}
              </span>
            ))}
            {mentor.expertise.length > 3 && (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'
              }`}>
                +{mentor.expertise.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`px-6 py-4 border-t ${
        theme === 'dark' ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200/50 bg-gray-50/30'
      }`}>
        <div className="flex items-center justify-between mb-3">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-500" size={14} />
              <span className={`text-sm font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {mentor.rating}
              </span>
            </div>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ({mentor.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className={`text-lg font-bold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              ${mentor.price}
            </div>
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              /hour
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className={`flex items-center gap-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            {mentor.availability}
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {mentor.sessions} sessions
          </div>
          <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {mentor.responseTime}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/mentorship/${mentor.id}`}>
          <button className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white'
          } shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 active:scale-98`}>
            Book Session
          </button>
        </Link>
      </div>

      {/* Hover overlay for additional info */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl`}>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            "{mentor.bio.slice(0, 80)}..."
          </p>
        </div>
      </div>
    </div>
  );
}
