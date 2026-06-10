"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  FaReact, FaNodeJs, FaPython, FaJava, FaDocker, FaAws, FaPhp,
  FaGitAlt, FaLinux, FaHtml5, FaCss3Alt, FaSpinner
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import {
  SiNextdotjs, SiTypescript, SiTailwindcss, SiJavascript,
  SiPostgresql, SiMongodb, SiRedis, SiGraphql, SiPrisma,
  SiFirebase, SiSupabase, SiVercel, SiNetlify,
  SiSpring, SiDjango, SiFlask, SiFastapi, SiExpress, SiNestjs,
  SiKubernetes, SiGo, SiRust, SiKotlin, SiSwift, SiDart, SiFlutter,
  SiVuedotjs, SiSvelte, SiGatsby, SiAngular,
  SiMysql, SiSqlite, SiElasticsearch,
  SiNginx, SiWebpack, SiVite, SiEslint, SiPrettier, SiJest, SiCypress,
  SiRedux, SiBootstrap, SiSass, SiMui, SiStorybook,
  SiGithub, SiGitlab,
  SiRabbitmq, SiApachekafka,
  SiExpo, SiOpenai,
} from "react-icons/si";
import { projectApi } from "../lib/project-service";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview"),
  { ssr: false }
);

export type ProjectOverviewProps = {
  project: {
    shortDescription: string;
    longDescription: string;
    techStack: string[];
  };
  theme?: 'light' | 'dark';
  projectId?: string | number;
  onRefresh?: () => void | Promise<void>;
};

const techIcons: Record<string, React.ReactNode> = {
  // Frontend frameworks
  "React":          <FaReact className="text-cyan-400" />,
  "Next.js":        <SiNextdotjs className="text-white" />,
  "Vue.js":         <SiVuedotjs className="text-emerald-400" />,
  "Angular":        <SiAngular className="text-red-500" />,
  "Svelte":         <SiSvelte className="text-orange-500" />,
  "Gatsby":         <SiGatsby className="text-purple-500" />,

  // Languages
  "TypeScript":     <SiTypescript className="text-blue-400" />,
  "JavaScript":     <SiJavascript className="text-yellow-400" />,
  "Python":         <FaPython className="text-yellow-300" />,
  "Java":           <FaJava className="text-red-400" />,
  "Go":             <SiGo className="text-cyan-300" />,
  "Rust":           <SiRust className="text-orange-400" />,
  "Kotlin":         <SiKotlin className="text-purple-400" />,
  "Swift":          <SiSwift className="text-orange-400" />,
  "Dart":           <SiDart className="text-cyan-400" />,
  "PHP":            <FaPhp className="text-indigo-400" />,
  "HTML":           <FaHtml5 className="text-orange-500" />,
  "CSS":            <FaCss3Alt className="text-blue-500" />,

  // Mobile
  "Flutter":        <SiFlutter className="text-cyan-400" />,
  "React Native":   <FaReact className="text-cyan-400" />,
  "Expo":           <SiExpo className="text-white" />,

  // Styling
  "TailwindCSS":    <SiTailwindcss className="text-teal-300" />,
  "SASS":           <SiSass className="text-pink-400" />,
  "Bootstrap":      <SiBootstrap className="text-purple-500" />,
  "MUI":            <SiMui className="text-blue-400" />,

  // Backend frameworks
  "Node.js":        <FaNodeJs className="text-green-500" />,
  "Express":        <SiExpress className="text-gray-300" />,
  "NestJS":         <SiNestjs className="text-red-400" />,
  "Fastify":        <SiNestjs className="text-gray-300" />,
  "Spring":         <SiSpring className="text-green-500" />,
  "Django":         <SiDjango className="text-green-700" />,
  "Flask":          <SiFlask className="text-gray-300" />,
  "FastAPI":        <SiFastapi className="text-emerald-400" />,

  // Databases
  "PostgreSQL":     <SiPostgresql className="text-blue-400" />,
  "MySQL":          <SiMysql className="text-blue-500" />,
  "SQLite":         <SiSqlite className="text-blue-300" />,
  "MongoDB":        <SiMongodb className="text-green-500" />,
  "Redis":          <SiRedis className="text-red-500" />,
  "Elasticsearch":  <SiElasticsearch className="text-yellow-400" />,
  "Firebase":       <SiFirebase className="text-yellow-500" />,
  "Supabase":       <SiSupabase className="text-emerald-400" />,
  "Prisma":         <SiPrisma className="text-teal-300" />,

  // APIs & state
  "GraphQL":        <SiGraphql className="text-pink-500" />,
  "Redux":          <SiRedux className="text-purple-400" />,
  "React Router":   <FaReact className="text-red-400" />,
  "OpenAI":         <SiOpenai className="text-emerald-400" />,

  // DevOps & Cloud
  "Docker":         <FaDocker className="text-blue-400" />,
  "Kubernetes":     <SiKubernetes className="text-blue-500" />,
  "AWS":            <FaAws className="text-yellow-500" />,
  "Google Cloud":   <SiKubernetes className="text-blue-400" />,
  "Azure":          <SiKubernetes className="text-blue-600" />,
  "Vercel":         <SiVercel className="text-white" />,
  "Netlify":        <SiNetlify className="text-teal-400" />,
  "Nginx":          <SiNginx className="text-green-500" />,
  "Linux":          <FaLinux className="text-yellow-300" />,

  // Messaging
  "RabbitMQ":       <SiRabbitmq className="text-orange-500" />,
  "Kafka":          <SiApachekafka className="text-white" />,

  // Build & Quality
  "Webpack":        <SiWebpack className="text-blue-400" />,
  "Vite":           <SiVite className="text-purple-400" />,
  "ESLint":         <SiEslint className="text-purple-500" />,
  "Prettier":       <SiPrettier className="text-pink-400" />,
  "Jest":           <SiJest className="text-red-400" />,
  "Cypress":        <SiCypress className="text-green-400" />,
  "Storybook":      <SiStorybook className="text-pink-500" />,

  // VCS
  "Git":            <FaGitAlt className="text-orange-500" />,
  "GitHub":         <SiGithub className="text-white" />,
  "GitLab":         <SiGitlab className="text-orange-400" />,
};

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  project,
  theme = 'dark',
  projectId,
  onRefresh,
}) => {
  const dark = theme === 'dark';
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!projectId || generating) return;
    setGenerating(true);
    setGenMessage(null);
    try {
      await projectApi.post(`/api/projects/${projectId}/generate-tech-stack`);
      setGenMessage("Analyzing repository… refreshing in 8s");
      setTimeout(async () => {
        await onRefresh?.();
        setGenerating(false);
        setGenMessage(null);
      }, 8000);
    } catch {
      setGenMessage("Failed to start generation. Try again.");
      setGenerating(false);
    }
  };

  const hasTechStack = project.techStack && project.techStack.length > 0;

  return (
    <div className={`${
      dark
        ? 'bg-gradient-to-br from-[#1a2a22]/80 to-[#0a1813]/80 border-white/10'
        : 'bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-200 shadow-xl'
    } backdrop-blur-md border rounded-2xl p-6 shadow-lg flex flex-col gap-6`}>
      <div>
        <p className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {project.shortDescription}
        </p>
      </div>

      <div className="markdown-body" data-color-mode={theme}>
        <MarkdownPreview
          source={project.longDescription}
          style={{
            backgroundColor: 'transparent',
            color: dark ? 'rgba(255, 255, 255, 0.9)' : '#374151',
            padding: 0
          }}
        />
      </div>

      {/* Tech Stack section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-semibold ${dark ? 'text-white/60' : 'text-gray-500'}`}>
            Tech Stack
          </span>
          {projectId && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                dark
                  ? 'bg-[#13ff8c]/10 border-[#13ff8c]/30 text-[#13ff8c] hover:bg-[#13ff8c]/20 disabled:opacity-50'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50'
              }`}
            >
              {generating
                ? <FaSpinner className="animate-spin" />
                : <HiSparkles />
              }
              {generating ? 'Analyzing…' : hasTechStack ? 'Regenerate' : 'Generate'}
            </button>
          )}
        </div>

        {hasTechStack ? (
          <div className="flex flex-wrap gap-3">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#13ff8c]/10 border border-[#13ff8c]/30 text-[#13ff8c] font-semibold text-sm"
              >
                {techIcons[tech] ?? null}
                {tech}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            {generating ? 'AI is analyzing the repository…' : 'No tech stack detected yet.'}
          </p>
        )}

        {genMessage && (
          <p className={`mt-2 text-xs ${dark ? 'text-[#13ff8c]/70' : 'text-emerald-600'}`}>
            {genMessage}
          </p>
        )}
      </div>
    </div>
  );
};
