"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaFolder, FaBuilding, FaTools, FaEdit, FaArrowRight, FaClock } from "react-icons/fa";
import { SiReact, SiTypescript, SiNodedotjs, SiPostgresql, SiDocker, SiFigma } from "react-icons/si";

export default function SoftwareEngineerPortfolio() {
  const [activeNav, setActiveNav] = useState("home");

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-full px-8 py-6 flex justify-center gap-16">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveNav("home")}
            className={`text-2xl transition-colors ${activeNav === "home" ? "text-orange-500" : "text-gray-500 hover:text-white"}`}
          >
            <FaHome />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveNav("projects")}
            className={`text-2xl transition-colors ${activeNav === "projects" ? "text-orange-500" : "text-gray-500 hover:text-white"}`}
          >
            <FaFolder />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveNav("experience")}
            className={`text-2xl transition-colors ${activeNav === "experience" ? "text-orange-500" : "text-gray-500 hover:text-white"}`}
          >
            <FaBuilding />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveNav("tools")}
            className={`text-2xl transition-colors ${activeNav === "tools" ? "text-orange-500" : "text-gray-500 hover:text-white"}`}
          >
            <FaTools />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setActiveNav("blog")}
            className={`text-2xl transition-colors ${activeNav === "blog" ? "text-orange-500" : "text-gray-500 hover:text-white"}`}
          >
            <FaEdit />
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Profile Card - Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl p-8 text-black shadow-xl">
              {/* Decorative Circle */}
              <div className="absolute -top-8 -left-8 w-32 h-32 border-4 border-orange-500 rounded-full opacity-40"></div>

              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full aspect-square rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-7xl font-bold mb-6 relative overflow-hidden"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AA
                </motion.div>
              </motion.div>

              {/* Name */}
              <h3 className="text-2xl font-bold mb-1">Aabad Ahmed</h3>
              <p className="text-gray-600 text-sm mb-6">A Software Engineer who has developed countless innovative solutions</p>

              {/* Divider with icon */}
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-orange-500 text-lg"
                >
                  <FaClock />
                </motion.div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>
          </motion.div>

          {/* Hero Content - Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-7xl font-bold text-white leading-tight"
              >
                SOFTWARE
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl md:text-7xl font-bold text-gray-700 leading-tight"
              >
                ENGINEER
              </motion.h2>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-base leading-relaxed max-w-md"
            >
              Passionate about creating intuitive and engaging user experiences. Specialize in transforming ideas into beautifully crafted products.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 py-8 border-t border-b border-gray-700"
            >
              <div>
                <div className="text-4xl font-bold text-white">+12</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mt-2">Years of<br/>Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">+46</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mt-2">Projects<br/>Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">+20</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider mt-2">Worldwide<br/>Clients</div>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4 flex-wrap"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Use Template for Free
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-3 rounded-lg font-semibold transition-all"
              >
                More Templates
              </motion.button>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg"
            >
              <span className="text-lg">🎨</span>
              <span className="text-sm text-gray-300">Made in Framer</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-3">
              Recent<span className="text-gray-700"> Projects</span>
            </h2>
          </motion.div>

          <div className="space-y-6 mt-12">
            {/* Project 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-2">Dynamic Animation Motion Design</h3>
                <p className="text-white/90 mb-4">Interactive design system with smooth transitions</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Framer</span>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">React.js</span>
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">TypeScript</span>
                </div>
              </div>
            </motion.div>

            {/* Project 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-lime-400 to-green-500 rounded-3xl p-8 text-black cursor-pointer group relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-2">E-Commerce Platform</h3>
                <p className="text-black/80 mb-4">Full-stack e-commerce with real-time inventory</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm bg-black/20 px-3 py-1 rounded-full text-black">Figma</span>
                  <span className="text-sm bg-black/20 px-3 py-1 rounded-full text-black">WordPress</span>
                  <span className="text-sm bg-black/20 px-3 py-1 rounded-full text-black">React.js</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { name: "NopnAI", desc: "AI-powered analytics tool" },
              { name: "Qamas", desc: "Real-time collaboration platform" },
              { name: "Fosaeth", desc: "Community learning hub" }
            ].map((project, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all group cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 group-hover:from-orange-900/20 transition-all flex items-center justify-center">
                  <FaArrowRight className="text-gray-700 group-hover:text-orange-500 text-2xl transition-colors" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-white text-sm mb-1">{project.name}</h4>
                  <p className="text-xs text-gray-500">{project.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 px-6 md:px-12 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-12">
              12 Years<span className="text-gray-700"> Experience</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { company: "PixelForge Studios", role: "Senior Software Engineer", period: "2020 - Present", desc: "Leading frontend architecture and team mentorship" },
              { company: "BlurWave Innovators", role: "Software Engineer", period: "2018 - 2020", desc: "Full-stack development for scalable applications" },
              { company: "TrendCraft Solutions", role: "Junior Engineer", period: "2016 - 2018", desc: "Started career building web applications" }
            ].map((exp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{exp.company}</h3>
                    <p className="text-orange-400 font-semibold text-sm">{exp.role}</p>
                  </div>
                  <span className="text-gray-500 text-sm">{exp.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{exp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-12">
              Premium<span className="text-gray-700"> Tools</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Framer", icon: SiFigma },
              { name: "Figma", icon: SiFigma },
              { name: "React", icon: SiReact },
              { name: "TypeScript", icon: SiTypescript },
              { name: "Node.js", icon: SiNodedotjs },
              { name: "PostgreSQL", icon: SiPostgresql }
            ].map((tool, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/10 border border-white/20 rounded-lg p-6 text-center hover:border-orange-500 transition-all group cursor-pointer"
              >
                <tool.icon className="text-4xl text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-white">{tool.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 px-6 md:px-12 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-12">
              Design<span className="text-gray-700"> Thoughts</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { title: "Building a Navigation Component", excerpt: "Best practices for creating accessible and performant navigation" },
              { title: "Create a Landing Page That Performs Great", excerpt: "Performance optimization tips for modern web applications" },
              { title: "How to Create an Effective Design Portfolio", excerpt: "Showcase your work like a pro designer" }
            ].map((article, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-orange-500/50 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-400">{article.excerpt}</p>
                  </div>
                  <motion.div whileHover={{ x: 5 }} className="flex-shrink-0 ml-4">
                    <FaArrowRight className="text-orange-500 text-lg" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Let's<span className="text-gray-700"> Work Together</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Have a project in mind? Let's collaborate and create something amazing together.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-lg font-bold transition-all inline-block"
          >
            Get In Touch
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-600 text-sm">
        <p>© 2026 Aabad Ahmed. All rights reserved.</p>
      </footer>
    </div>
  );
}
