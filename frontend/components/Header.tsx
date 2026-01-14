import React from "react";
import { FaBell, FaEnvelope, FaUserCircle } from "react-icons/fa";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-2xl rounded-2xl mx-5 my-4 flex items-center h-16 px-6">
      <div className="flex w-full items-center gap-4">
        <img src="/icon-dark.svg" alt="Logo" className="w-8 h-8" />
        <form className="flex-1 ml-6">
          <input
            type="search"
            placeholder="Press ⌘ K to search..."
            className="pl-8 w-full sm:w-[300px] md:w-[200px] lg:w-[500px] bg-white/20 border border-white/20 rounded-lg focus:outline-none text-gray-800 placeholder-gray-500"
          />
        </form>
        <button className="rounded-full bg-transparent hover:bg-white/20 p-2 transition">
          <FaEnvelope className="w-6 h-6 text-current" />
        </button>
        <button className="rounded-full bg-transparent hover:bg-white/20 p-2 transition">
          <FaBell className="w-6 h-6 text-current" />
        </button>
        <button className="rounded-full bg-transparent hover:bg-white/20 p-2 transition">
          <FaUserCircle className="w-7 h-7 text-current" />
        </button>
      </div>
    </header>
  );
} 