import {
  Code2, Database, Palette, Cloud, Smartphone, BarChart2,
  Globe, Shield, Cpu, Terminal, BookOpen, Layers, GitBranch,
  Zap, Server, Package, Brain, FlaskConical, LineChart, Monitor
} from "lucide-react";

// Map course title keywords → { icon, gradient, iconColor }
const COURSE_STYLES = [
  { keywords: ["react", "next", "vue", "angular", "frontend"],
    icon: Code2, gradient: "from-cyan-400 to-blue-600", iconColor: "text-white" },

  { keywords: ["spring", "java", "backend", "microservice", "api"],
    icon: Server, gradient: "from-green-400 to-emerald-700", iconColor: "text-white" },

  { keywords: ["python", "django", "flask"],
    icon: Terminal, gradient: "from-yellow-400 to-orange-500", iconColor: "text-white" },

  { keywords: ["machine learning", "ml", "ai", "tensorflow", "deep learning", "neural"],
    icon: Brain, gradient: "from-violet-500 to-purple-700", iconColor: "text-white" },

  { keywords: ["data science", "pandas", "numpy", "analytics", "visualization"],
    icon: LineChart, gradient: "from-pink-400 to-rose-600", iconColor: "text-white" },

  { keywords: ["sql", "postgres", "database", "mysql", "mongodb"],
    icon: Database, gradient: "from-indigo-400 to-blue-700", iconColor: "text-white" },

  { keywords: ["dsa", "algorithm", "data structure", "crack", "interview"],
    icon: Zap, gradient: "from-amber-400 to-orange-600", iconColor: "text-white" },

  { keywords: ["javascript", "typescript", "node", "mern", "express"],
    icon: Globe, gradient: "from-yellow-300 to-yellow-600", iconColor: "text-gray-900" },

  { keywords: ["aws", "cloud", "azure", "gcp", "devops", "kubernetes", "docker"],
    icon: Cloud, gradient: "from-sky-400 to-blue-700", iconColor: "text-white" },

  { keywords: ["design", "figma", "ui", "ux", "css", "tailwind"],
    icon: Palette, gradient: "from-fuchsia-400 to-pink-600", iconColor: "text-white" },

  { keywords: ["flutter", "dart", "mobile", "android", "ios", "react native"],
    icon: Smartphone, gradient: "from-teal-400 to-cyan-700", iconColor: "text-white" },

  { keywords: ["security", "ethical", "hacking", "cybersecurity"],
    icon: Shield, gradient: "from-red-400 to-rose-700", iconColor: "text-white" },

  { keywords: ["git", "github", "version control"],
    icon: GitBranch, gradient: "from-gray-500 to-gray-800", iconColor: "text-white" },

  { keywords: ["linux", "unix", "bash", "shell"],
    icon: Terminal, gradient: "from-gray-700 to-gray-900", iconColor: "text-green-400" },

  { keywords: ["blockchain", "web3", "solidity", "crypto"],
    icon: Layers, gradient: "from-blue-500 to-indigo-700", iconColor: "text-white" },

  { keywords: ["business", "management", "marketing", "entrepreneurship"],
    icon: BarChart2, gradient: "from-emerald-400 to-teal-600", iconColor: "text-white" },
];

const DEFAULT_STYLE = {
  icon: BookOpen,
  gradient: "from-primary-400 to-primary-700",
  iconColor: "text-white",
};

function getCourseStyle(title = "", category = "") {
  const combined = (title + " " + category).toLowerCase();
  return COURSE_STYLES.find((s) => s.keywords.some((k) => combined.includes(k))) ?? DEFAULT_STYLE;
}

// Tech logos as SVG (inline, no CDN needed)
const TECH_LOGOS = {
  react: (
    <svg viewBox="-11.5 -10.23 23 20.46" className="w-12 h-12 opacity-90">
      <circle r="2.05" fill="#61DAFB"/>
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2"/>
        <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
        <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
      </g>
    </svg>
  ),
  python: (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <path d="M24 3.5c-6.6 0-12 .9-12 4.5v3h12v1.5H8.5C5.5 12.5 3 15 3 21s2.5 8.5 5.5 8.5H12v-4c0-3 2.7-5.5 6-5.5h12c3.3 0 6-2.2 6-5V8c0-2.8-2.7-4.5-12-4.5zM18 8a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#3776AB"/>
      <path d="M24 44.5c6.6 0 12-.9 12-4.5v-3H24v-1.5h15.5c3 0 5.5-2.5 5.5-8.5s-2.5-8.5-5.5-8.5H36v4c0 3-2.7 5.5-6 5.5H18c-3.3 0-6 2.2-6 5v7c0 2.8 2.7 4.5 12 4.5zM30 40a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="#FFD43B"/>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 48 48" className="w-12 h-12">
      <path fill="#E65100" d="M18.1 23.2s-2 1.2-.7 1.6c1.2.4 4 .3 7.3 0 2.3-.2 4.5-.8 4.5-.8s-.5.2-1 .4c-4 1.5-11.8.8-9.6-.6.9-.6 0-1.1-.5-.6z"/>
      <path fill="#F57C00" d="M18.5 20.7s-2.2 1.6-.7 2c1.2.3 4.2.4 7.5.1 2.4-.2 4.8-.9 4.8-.9s-.5.2-1.1.5c-4.2 1.4-12.2.8-10-1 .9-.7 0-1.2-.5-.7z"/>
      <path fill="#E65100" d="M22.4 7S19 11 21.9 14.7c2.4 3.1 4.2 3.4 4.2 3.4s-3.8-3.4-1.4-7.3c.9-1.5 2.3-2.6-2.3-3.8z"/>
      <path fill="#FFA726" d="M25 29.5s1.5 1.2-.8 2.2c-3 1.1-12.5 1.4-15.1.1-1-.4.8-1 1.4-1.1.6-.2.9-.1.9-.1-.9-.6-6 1.3-2.6 1.9 9.3 1.5 17-1 16.2-3z"/>
      <path fill="#F57C00" d="M19 25.2s-4.3 1-1.5 1.4c1.2.2 3.5.2 5.6 0 1.8-.2 3.5-.5 3.5-.5s-.6.2-1 .4c-4.3 1.2-12.5.7-10.1-.6 1-.6 0-1 3.5-.7z"/>
      <path fill="#E65100" d="M31.8 30.7s1.1.9-1.2 1.6c-4.5 1.3-18.8 1.7-22.7.1-1.4-.6.8-1.4 1.7-1.5.9-.2 1.3-.1 1.3-.1-1.3-.9-8.6 1.8-3.7 2.6 13.3 2.2 24.3-1.3 24.6-2.7z"/>
      <path fill="#FFA726" d="M24 3S27.3 7 23.7 10.4c-2.9 2.7-2.7 4.2 0 6.4 2.8-2.7 4.8-5.1 3.7-7.3C26.3 7.3 25.2 6.3 24 3z"/>
    </svg>
  ),
};

function getTechLogo(title = "") {
  const t = title.toLowerCase();
  if (t.includes("react")) return TECH_LOGOS.react;
  if (t.includes("python")) return TECH_LOGOS.python;
  if (t.includes("spring") || t.includes("java")) return TECH_LOGOS.java;
  return null;
}

export default function CourseThumbnail({ title, category, className = "", size = "md" }) {
  const style = getCourseStyle(title, category);
  const Icon = style.icon;
  const logo = getTechLogo(title);
  const heights = { sm: "h-32", md: "h-40", lg: "h-52" };
  const iconSizes = { sm: 28, md: 36, lg: 48 };

  return (
    <div className={`bg-gradient-to-br ${style.gradient} ${heights[size]} flex items-center justify-center relative overflow-hidden ${className}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-4 w-20 h-20 rounded-full border-4 border-white" />
        <div className="absolute bottom-2 left-4 w-12 h-12 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full border-2 border-white opacity-50" />
      </div>

      {/* Icon or tech logo */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {logo ?? <Icon size={iconSizes[size]} className={`${style.iconColor} drop-shadow-lg`} />}
        <span className={`text-xs font-bold uppercase tracking-widest opacity-70 ${style.iconColor}`}>
          {category || "Course"}
        </span>
      </div>
    </div>
  );
}
