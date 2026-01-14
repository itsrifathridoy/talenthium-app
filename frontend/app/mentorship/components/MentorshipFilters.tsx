import React from 'react';
import { FaFilter, FaChevronDown } from 'react-icons/fa';

interface MentorshipFiltersProps {
  theme: 'light' | 'dark';
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function MentorshipFilters({
  theme,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}: MentorshipFiltersProps) {
  const categories = [
    'all',
    'frontend',
    'backend',
    'fullstack',
    'mobile',
    'devops',
    'design',
    'data-science',
    'machine-learning',
    'product-management',
    'leadership'
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'budget', label: 'Under $50' },
    { value: 'medium', label: '$50 - $100' },
    { value: 'premium', label: 'Above $100' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'experience', label: 'Most Experience' }
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Category Filter */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`appearance-none px-4 py-2 pr-8 border rounded-lg ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 ${
            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
          }`}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={12} />
      </div>

      {/* Price Range Filter */}
      <div className="relative">
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className={`appearance-none px-4 py-2 pr-8 border rounded-lg ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 ${
            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
          }`}
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={12} />
      </div>

      {/* Sort By */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`appearance-none px-4 py-2 pr-8 border rounded-lg ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 ${
            theme === 'dark' ? 'focus:ring-[#13ff8c]' : 'focus:ring-emerald-500'
          }`}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" size={12} />
      </div>
    </div>
  );
}
