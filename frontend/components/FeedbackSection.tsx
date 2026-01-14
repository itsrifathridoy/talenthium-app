import React from "react";
import { FaStar } from "react-icons/fa";

const mentorComments = [
  { name: "Mentor Mike", avatar: "https://randomuser.me/api/portraits/men/55.jpg", comment: "Great project structure and clean code!" },
];
const peerFeedback = [
  { name: "Alice Lee", avatar: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5, comment: "Loved collaborating on this!" },
  { name: "John Smith", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4, comment: "Well documented and easy to contribute." },
];

export const FeedbackSection: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => (
  <div className={`${
    theme === 'dark' 
      ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10' 
      : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
  } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Community Feedback</h2>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-[#13ff8c] mb-2">Mentor Comments</h3>
      {mentorComments.map((m, i) => (
        <div key={i} className="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/10 mb-2">
          <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border-2 border-[#13ff8c]" />
          <span className="text-white font-semibold">{m.name}</span>
          <span className="text-white/80">{m.comment}</span>
        </div>
      ))}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-[#13ff8c] mb-2">Peer Feedback</h3>
      {peerFeedback.map((p, i) => (
        <div key={i} className="flex items-center gap-3 bg-black/30 rounded-lg p-4 border border-white/10 mb-2">
          <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border-2 border-white" />
          <span className="text-white font-semibold">{p.name}</span>
          <span className="flex items-center gap-1 text-yellow-400">
            {[...Array(p.rating)].map((_, j) => <FaStar key={j} />)}
          </span>
          <span className="text-white/80">{p.comment}</span>
        </div>
      ))}
    </div>
  </div>
); 