"use client";

import { FaGithub, FaEnvelope, FaExternalLinkAlt, FaStar, FaArrowRight } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

export default function SoftwareDeveloperPortfolio() {
  const portfolioData = {
    name: "Chandrakant Sharma",
    greeting: "Hey there, I'm-",
    title: "Software Engineer",
    subtitle: "A passionate developer who loves crafting innovative solution.",
    specialization: "Currently specializing in Next.js",
    badge: "Full Stack Developer",
    email: "chandrakant@example.com",
    github: "https://github.com/chandrakant",
    twitter: "https://twitter.com/chandrakant",
    
    aboutTitle: "About Me",
    aboutText: "I'm Chandrakant Sharma, a seasoned developer with 6+ years of hands-on experience in computer science and web development. I love programming in Javascript and Python and have a comprehensive knowledge of HTML, CSS, JavaScript. In a collaborative environment, I am a creative and effective communicator. I love learning and exploring new technologies.",
    aboutExtra: "When I'm not coding, I prefer spending time with my friends, watching movies, or getting into sports.",
    
    articles: [
      {
        title: "Unlock Your Coding Speed: Master Vim Shortcuts",
        date: "July 13, 2025 • 5 min read",
        link: "#"
      },
      {
        title: "My Skills and Experience in Coding",
        date: "November 13, 2025 • 4 min read",
        link: "#"
      }
    ],
    
    projects: [
      {
        name: "Modern Decentralized Application",
        description: "Your ultimate marketplace for blockchain creators",
        image: "MDA",
        tags: ["Featured"],
        link: "#"
      },
      {
        name: "Cryptway",
        description: "Cryptway is a comprehensive platform that provides real-time cryptocurrency news and in-depth token analysis.",
        image: "CRY",
        tags: ["Recent", "Blockchain"],
        link: "#"
      },
      {
        name: "LearnU",
        description: "Successfully built together a team of four in developing a Dynamic Learning App",
        image: "LRN",
        tags: ["React", "NodeJS", "MongoDB"],
        link: "#"
      },
      {
        name: "Shoes Site",
        description: "Your curated marketplace for the freshest sneakers.",
        image: "SHO",
        tags: ["React", "Tailwind", "Firebase"],
        link: "#"
      },
    ],

    experience: [
      {
        role: "Senior Full Stack Developer",
        company: "TechCorp Inc.",
        period: "2022 - Present",
        summary: "Leading microservices-based products serving 1M+ users with React and Node.js.",
      },
      {
        role: "Software Engineer",
        company: "StartupXYZ",
        period: "2019 - 2022",
        summary: "Built responsive web apps and improved performance by 40% across the stack.",
      },
    ],

    education: [
      {
        degree: "B.S. Computer Science & Engineering",
        school: "United International University",
        period: "2022 – Present",
        detail: "CGPA: 3.82/4.00",
      },
      {
        degree: "Higher Secondary (Science)",
        school: "Dhaka Cantonment Girls' Public School & College",
        period: "2020",
        detail: "GPA: 5.00/5.00",
      },
    ],
    
    testimonials: [
      {
        name: "Kristian Fullerson",
        text: "Chandrakant has hands on approach and takes their time with products after launching. Their thought great ideas to fix problems I was encountering."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">{portfolioData.name.split(" ")[0][0]}</div>
          <nav className="hidden md:flex gap-12 text-sm">
            <a href="#" className="text-gray-300 hover:text-white transition">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Projects</a>
            <a href="#" className="text-gray-300 hover:text-white transition">Blog</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-emerald-400 text-lg">{portfolioData.greeting}</p>
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">{portfolioData.name}</h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl text-gray-300">{portfolioData.title}. {portfolioData.subtitle}</p>
              <div className="flex gap-4">
                <span className="inline-block px-4 py-2 border border-emerald-400/30 rounded-full text-sm text-emerald-400">
                  📍 {portfolioData.specialization}
                </span>
                <span className="inline-block px-4 py-2 border border-emerald-400/30 rounded-full text-sm text-emerald-400">
                  🔥 {portfolioData.badge}
                </span>
              </div>
            </div>

            <div className="flex gap-6 pt-4">
              <a href={`https://twitter.com/${portfolioData.twitter}`} className="p-3 rounded-full border border-white/20 hover:border-emerald-400 hover:bg-emerald-400/10 transition">
                <FaX className="text-lg" />
              </a>
              <a href={portfolioData.github} className="p-3 rounded-full border border-white/20 hover:border-emerald-400 hover:bg-emerald-400/10 transition">
                <FaGithub className="text-lg" />
              </a>
              <a href={`mailto:${portfolioData.email}`} className="p-3 rounded-full border border-white/20 hover:border-emerald-400 hover:bg-emerald-400/10 transition">
                <FaEnvelope className="text-lg" />
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full blur-2xl"></div>
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-400/30 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Work Experience</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioData.experience.map((exp, idx) => (
              <div key={idx} className="p-6 border border-white/10 rounded-xl hover:border-emerald-400/50 transition">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <p className="text-sm text-emerald-400">{exp.period}</p>
                    <h3 className="text-xl font-semibold">{exp.role}</h3>
                    <p className="text-gray-400 text-sm">{exp.company}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{exp.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-12">{portfolioData.aboutTitle}</h2>
            <div className="space-y-6 text-gray-300">
              <p className="leading-relaxed">{portfolioData.aboutText}</p>
              <p className="leading-relaxed">{portfolioData.aboutExtra}</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="p-6 border border-white/10 rounded-xl hover:border-emerald-400/50 transition">
              <h3 className="text-xl font-semibold mb-2">Languages</h3>
              <p className="text-gray-400 text-sm">JavaScript, Python, Java, C#, TypeScript, React, Node.js</p>
            </div>
            <div className="p-6 border border-white/10 rounded-xl hover:border-emerald-400/50 transition">
              <h3 className="text-xl font-semibold mb-2">Skills</h3>
              <p className="text-gray-400 text-sm">Full Stack Development, Open Source and AI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Education</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {portfolioData.education.map((edu, idx) => (
              <div key={idx} className="p-6 border border-white/10 rounded-xl hover:border-emerald-400/50 transition">
                <p className="text-sm text-emerald-400 mb-2">{edu.period}</p>
                <h3 className="text-xl font-semibold mb-1">{edu.degree}</h3>
                <p className="text-gray-300 mb-2">{edu.school}</p>
                <p className="text-gray-400 text-sm">{edu.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold">Showcasing some of my creative works.</h2>
            <p className="text-gray-400 mt-4">Here are some projects I've worked on</p>
            <a href="#" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 transition flex items-center gap-2">
              View all projects <FaArrowRight className="text-sm" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {portfolioData.projects.map((project, idx) => (
              <div key={idx} className="group border border-white/10 rounded-xl overflow-hidden hover:border-emerald-400/50 transition">
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl font-bold text-gray-700 group-hover:scale-110 transition">{project.image}</div>
                  <a href={project.link} className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-emerald-400 transition opacity-0 group-hover:opacity-100">
                    <FaExternalLinkAlt className="text-sm" />
                  </a>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold">Latest Article.</h2>
            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition text-sm">View all articles →</a>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {portfolioData.articles.map((article, idx) => (
              <a key={idx} href={article.link} className="group space-y-4 p-6 border border-white/10 rounded-xl hover:border-emerald-400/50 hover:bg-emerald-400/5 transition cursor-pointer">
                <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition">{article.title}</h3>
                <p className="text-gray-500 text-sm">{article.date}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Wall of Love</h2>
          <p className="text-center text-gray-400 mb-12">Real people. Real results.</p>

          <div className="max-w-2xl mx-auto">
            {portfolioData.testimonials.map((testimonial, idx) => (
              <div key={idx} className="text-center space-y-6 p-8 border border-white/10 rounded-xl">
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-emerald-400" size={16} />
                  ))}
                </div>
                <p className="text-lg text-gray-300 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Keep In Touch.</h2>
          <p className="text-gray-400 mb-12">Contact Me if you're free to chat over</p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <a href={`mailto:${portfolioData.email}`} className="px-6 py-3 border border-white/20 rounded-full hover:border-emerald-400 hover:bg-emerald-400/10 transition flex items-center gap-2">
              <FaEnvelope className="text-emerald-400" /> Email
            </a>
            <a href={portfolioData.github} className="px-6 py-3 border border-white/20 rounded-full hover:border-emerald-400 hover:bg-emerald-400/10 transition flex items-center gap-2">
              <FaGithub className="text-emerald-400" /> GitHub
            </a>
            <a href={portfolioData.twitter} className="px-6 py-3 border border-white/20 rounded-full hover:border-emerald-400 hover:bg-emerald-400/10 transition flex items-center gap-2">
              <FaX className="text-emerald-400" /> X
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>Designed and Developed by Chandrakant Sharma. Built with Next.</p>
      </footer>
    </div>
  );
}
