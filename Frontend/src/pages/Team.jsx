import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/Patient/authStore";
import Footer from "../components/Footer";

import {
  FiLinkedin,
  FiGithub,
  FiMail,
  FiInstagram,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiCode,
  FiHeart,
  FiStar,
  FiUsers,
  FiTarget,
  FiZap,
  FiEye,
  FiTrendingUp,
  FiShield,
  FiGlobe,
  FiActivity,
  FiDatabase,
  FiServer,
  FiCloud,
} from "react-icons/fi";
import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiExpress,
  SiTailwindcss,
  SiJavascript,
  SiTypescript,
  SiDocker,
  SiGit,
  SiSocketdotio,
  SiRedis,
  SiJsonwebtokens,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import SelfImage from "../assets/Self.jpg";

const Team = () => {
  const { user, logout } = useAuthStore();
  const { scrollY } = useScroll();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeMetric, setActiveMetric] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Parallax effects
  const yParallax = useTransform(scrollY, [0, 500], [0, -150]);
  const opacityParallax = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-cycle through metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced team members data
  const teamMembers = [
    {
      id: 1,
      name: "Karan Gupta",
      role: "Founder & CEO",
      title: "Full Stack Developer",
      location: "India",
      joinDate: "2024",
      bio: "Passionate about healthcare technology and committed to creating innovative solutions that improve patient care and medical record management. Specialized in building secure, scalable, and user-friendly healthcare applications with a focus on accessibility and user experience.",
      detailedBio:
        "With over 3 years of experience in full-stack development, Karan has led multiple healthcare technology projects focusing on patient data security and accessibility. His vision for Medicare stems from personal experiences with fragmented healthcare systems and the need for unified, patient-controlled medical records.",
      skills: [
        {
          name: "JavaScript",
          icon: SiJavascript,
          color: "#F7DF1E",
          level: 95,
          experience: "3s+ Years",
        },
        {
          name: "React",
          icon: SiReact,
          color: "#61DAFB",
          level: 95,
          experience: "3+ Years",
        },
        {
          name: "Node.js",
          icon: SiNodedotjs,
          color: "#339933",
          level: 90,
          experience: "3+ Years",
        },
        {
          name: "MongoDB",
          icon: SiMongodb,
          color: "#47A248",
          level: 85,
          experience: "2+ Years",
        },
        {
          name: "Express",
          icon: SiExpress,
          color: "#000000",
          level: 88,
          experience: "3+ Years",
        },
        {
          name: "AWS",
          icon: FaAws,
          color: "#FF9900",
          level: 80,
          experience: "2+ Years",
        },
        {
          name: "Docker",
          icon: SiDocker,
          color: "#2496ED",
          level: 75,
          experience: "1+ Years",
        },
        {
          name: "Git",
          icon: SiGit,
          color: "#F05032",
          level: 92,
          experience: "6+ Months",
        },
      ],
      achievements: [
        "🏆 Led development of 5+ healthcare applications",
        "🔐 Implemented HIPAA-compliant data security",
        "⚡ Reduced patient data retrieval time by 80%",
        "☁️ Certified AWS Solutions Architect",
        "🚀 Built real-time notification system serving 1000+ users",
        "💡 Pioneered QR-based medical record sharing",
      ],
      image: SelfImage,
      socialLinks: {
        linkedin: "https://www.linkedin.com/in/karan-gupta-14a0a4260",
        github: "https://github.com/Karangupta97",
        email: "karangupta3319@gmail.com",
        instagram: "https://www.instagram.com/karangupta.19/",
      },
      stats: {
        projects: 15,
        experience: "3+ Years",
        contributions: 1200,
        reviews: 4.9,
      },
      metrics: [
        {
          label: "Projects Completed",
          value: "15+",
          icon: FiCode,
          color: "blue",
        },
        {
          label: "Years Experience",
          value: "3+",
          icon: FiCalendar,
          color: "green",
        },
        {
          label: "Git Contributions",
          value: "1.2K+",
          icon: FiActivity,
          color: "purple",
        },
        { label: "User Rating", value: "4.9/5", icon: FiStar, color: "yellow" },
      ],
    },
  ];

  // Schema markup for the team page
  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Medicare",
    description:
      "The innovative minds behind Medicare's mission to revolutionize healthcare management",
    url: "https://medicares.in/team",
    employee: teamMembers.map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
      image: member.image,
      sameAs: [
        member.socialLinks.linkedin,
        member.socialLinks.github,
        member.socialLinks.instagram,
      ],
    })),
  };

  // Future team sections - currently shown as "Coming Soon"
  const teamSections = [
    {
      title: "Development Team",
      description:
        "Our talented developers work on creating and maintaining the Medicare platform, ensuring it remains secure, efficient, and user-friendly.",
      comingSoon: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#252A61]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      title: "Medical Advisors",
      description:
        "Experienced healthcare professionals who provide guidance on medical best practices and ensure our platform meets the needs of patients and providers.",
      comingSoon: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#252A61]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      title: "Customer Support",
      description:
        "Dedicated specialists who help users navigate the Medicare platform and resolve any issues they might encounter.",
      comingSoon: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-[#252A61]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
  ];

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Team</title>
        <meta
          name="description"
          content="Meet the innovative minds behind Medicare's mission to revolutionize healthcare management. Our team is dedicated to creating secure, scalable healthcare solutions."
        />
        <meta
          name="keywords"
          content="Medicare team, healthcare technology, medical records management, healthcare innovation, digital health platform"
        />

        {/* Open Graph tags */}
        <meta
          property="og:title"
          content="Meet Our Team | Medicare - Healthcare Management Platform"
        />
        <meta
          property="og:description"
          content="Meet the innovative minds behind Medicare's mission to revolutionize healthcare management. Our team is dedicated to creating secure, scalable healthcare solutions."
        />
        <meta property="og:image" content="/medicares-team.jpg" />
        <meta property="og:url" content="https://medicares.in/team" />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Meet Our Team | Medicare" />
        <meta
          name="twitter:description"
          content="Meet the innovative minds behind Medicare's mission to revolutionize healthcare management."
        />
        <meta name="twitter:image" content="/medicare-team.jpg" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://medicares.in/team" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(teamSchema)}</script>
      </Helmet>

      {/* Centered Navbar */}
      <div className="flex justify-center w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="w-full px-4 max-w-[1700px] mx-auto">
          <Navbar user={user} onLogout={logout} />
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero section with enhanced animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mt-2 mb-12"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 bg[#252A61]/10 to-[#6236FF]/10 blur-3xl rounded-full"
              />
              <div className="relative">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                  Meet The{" "}
                  <span className="bg-linear-to-r from-[#252A61] to-[#6236FF] bg-clip-text text-transparent">
                    Team
                  </span>
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
                >
                  The innovative minds behind Medicare's mission to
                  revolutionize healthcare management through cutting-edge
                  technology
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced founder section with interactive elements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-3xl transition-all duration-500">
              <div className="relative bg-linear-to-br from-[#252A61]/5 to-[#6236FF]/5 dark:from-[#252A61]/10 dark:to-[#6236FF]/10">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="lg:flex lg:items-center lg:gap-12">
                    {/* Enhanced Profile Image Section */}
                    <div className="lg:w-1/3 flex justify-center mb-8 lg:mb-0">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="relative group cursor-pointer"
                        onClick={() => setShowImageModal(true)}
                      >
                        <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#252A61] to-[#6236FF] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                        <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-2xl">
                          <img
                            src={SelfImage}
                            alt="Karan Gupta"
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-[#252A61]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {/* Click to expand indicator */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                              <FiEye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Floating status indicator */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                          className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center"
                        >
                          <FiZap className="w-4 h-4 text-white" />
                        </motion.div>
                      </motion.div>
                    </div>

                    {/* Enhanced Content Section */}
                    <div className="lg:w-2/3">
                      <div className="space-y-6">
                        {/* Header with enhanced styling */}
                        <div className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                          >
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                              Karan Gupta
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="px-4 py-2 rounded-full bg-[#252A61] text-white text-sm font-semibold shadow-lg"
                              >
                                Founder & CEO of Medicare
                              </motion.span>
                              <span className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">
                                Full Stack Developer
                              </span>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                <FiMapPin className="w-4 h-4" />
                                <span>India</span>
                              </div>
                            </div>
                          </motion.div>

                          {/* Interactive metrics */}
                          {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                          >
                            {teamMembers[0].metrics.map((metric, index) => (
                              <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                                className={`p-4 rounded-xl bg-linear-to-br ${
                                  activeMetric === index
                                    ? `from-${metric.color}-50 to-${metric.color}-100 dark:from-${metric.color}-900/30 dark:to-${metric.color}-800/30 ring-2 ring-${metric.color}-500/50`
                                    : 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
                                } transition-all duration-500 cursor-pointer hover:scale-105`}
                                onClick={() => setActiveMetric(index)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <metric.icon className={`w-5 h-5 ${
                                    activeMetric === index 
                                      ? `text-${metric.color}-600 dark:text-${metric.color}-400` 
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`} />
                                  {activeMetric === index && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2 h-2 bg-green-500 rounded-full"
                                    />
                                  )}
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                  {metric.value}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {metric.label}
                                </div>
                              </motion.div>
                            ))}
                          </motion.div> */}
                        </div>

                        {/* Enhanced Bio */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                          className="bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-600"
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {teamMembers[0].bio}
                            </p>
                          </div>
                        </motion.div>

                        {/* Enhanced Tech Stack with interactive skill details */}
                        {/* 
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiCode className="w-5 h-5 text-[#252A61]" />
                            Tech Stack & Skills
                          </h3>
                          <div className="flex justify-center items-center gap-4 overflow-x-auto scrollbar-hide py-2 px-2">
                            {teamMembers[0].skills.map((skill, index) => (
                              <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.4,
                                  delay: 0.7 + index * 0.05,
                                }}
                                whileHover={{ scale: 1.1, y: -5 }}
                                onClick={() =>
                                  setSelectedSkill(
                                    selectedSkill === skill.name
                                      ? null
                                      : skill.name
                                  )
                                }
                                className="group relative flex flex-col items-center cursor-pointer shrink-0 min-w-[70px]"
                              >
                                <div
                                  className={`p-3 rounded-xl transition-all duration-300 ${
                                    selectedSkill === skill.name
                                      ? "bg-white dark:bg-gray-700 shadow-lg ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800"
                                      : "bg-gray-50 dark:bg-gray-700/50 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:shadow-md"
                                  }`}
                                  style={{
                                    ringColor:
                                      selectedSkill === skill.name
                                        ? skill.color
                                        : "transparent",
                                  }}
                                >
                                  <skill.icon
                                    className="w-6 h-6 transition-colors duration-300"
                                    style={{ color: skill.color }}
                                  />
                                </div>
                                <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                  {skill.name}
                                </span>

                                <div className="mt-1 w-8 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.level}%` }}
                                    transition={{
                                      duration: 1,
                                      delay: 0.8 + index * 0.1,
                                    }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: skill.color }}
                                  />
                                </div>

                                <AnimatePresence>
                                  {selectedSkill === skill.name && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        y: 10,
                                        scale: 0.9,
                                      }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                      className="absolute top-full mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-10 min-w-[150px]"
                                    >
                                      <div className="text-xs">
                                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                          {skill.name}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-1">
                                          Level: {skill.level}%
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Experience: {skill.experience}
                                        </div>
                                      </div>
                                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-600" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        */}

                        {/* Enhanced Achievements */}
                        {/* <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.7 }}
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiAward className="w-5 h-5 text-[#252A61]" />
                            Key Achievements
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {teamMembers[0].achievements.map((achievement, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer group"
                              >
                                <div className="w-2 h-2 bg-linear-to-r from-[#252A61] to-[#6236FF] rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                                  {achievement}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div> */}

                        {/* Enhanced Social Links */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          className="pt-6 border-t border-gray-200 dark:border-gray-600"
                        >
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiGlobe className="w-5 h-5 text-[#252A61]" />
                            Connect With Me
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <motion.a
                              href={teamMembers[0].socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-[#0A66C2] transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                              <FiLinkedin className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium relative z-10">
                                LinkedIn
                              </span>
                            </motion.a>

                            <motion.a
                              href={teamMembers[0].socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gray-800 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                              <FiGithub className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium relative z-10">
                                GitHub
                              </span>
                            </motion.a>

                            <motion.a
                              href="https://mail.google.com/mail/?view=cm&fs=1&to=karangupta3319@gmail.com&su=Regarding%20Medicare%20Platform&body=Hello%20Karan,%0A%0AI%20am%20reaching%20out%20regarding%20the%20Medicare%20platform.%0A%0ABest%20regards,"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-red-600 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                              <FiMail className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium relative z-10">
                                Email
                              </span>
                            </motion.a>

                            <motion.a
                              href={teamMembers[0].socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 text-pink-600 hover:text-white transition-all duration-300 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-500 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                              <FiInstagram className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                              <span className="text-sm font-medium relative z-10">
                                Instagram
                              </span>
                            </motion.a>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Key Features Section with interactive hover effects */}
          <div className="bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-900/50 border-t border-gray-200 dark:border-gray-700 py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="absolute inset-0 bg-linear-to-r from-[#252A61]/5 to-[#6236FF]/5 blur-3xl rounded-full"
                  />
                  <div className="relative">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                      <span className="bg-linear-to-r from-[#252A61] to-[#6236FF] bg-clip-text text-transparent">
                        Key Features
                      </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                      Medicare combines advanced technology with user-centered
                      design to revolutionize healthcare record management and
                      accessibility.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Features Grid with better animations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                {/* Feature 1 - QR-Based Medical Records */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("qr")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-150"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                      QR-Based Medical Records
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Access your complete medical history instantly through a
                      secure, personalized QR code. Share with healthcare
                      providers for immediate access to your health information.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Instant Access
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Secure Sharing
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          QR Technology
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150"
                      >
                        Learn how QR codes work
                        <motion.svg
                          animate={{ x: hoveredFeature === "qr" ? 8 : 0 }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2 - Hospital Dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("hospital")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-150"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-150">
                      Hospital Management
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Specialized dashboard for hospitals to manage patient
                      records, appointments, and treatment plans. Track patient
                      history and generate comprehensive medical reports.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Patient Management
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Report Generation
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150"
                      >
                        View hospital dashboard
                        <motion.svg
                          animate={{ x: hoveredFeature === "hospital" ? 8 : 0 }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3 - User-Controlled Access */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("access")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <FiShield className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-150" />
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-150">
                      User-Controlled Access
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Full control over who can access your medical records.
                      Grant and revoke access permissions for healthcare
                      providers with detailed access logs for complete
                      transparency.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                          Permission Controls
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                          Access Logs
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                          Privacy
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-150"
                      >
                        Manage access permissions
                        <motion.svg
                          animate={{ x: hoveredFeature === "access" ? 8 : 0 }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                {/* Feature 4 - Real-time Notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("notifications")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <FiActivity className="h-8 w-8 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-150" />
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-150">
                      Real-time Notifications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Receive instant alerts for new reports, appointments, and
                      record access events. Stay informed about your healthcare
                      journey with customizable notification preferences.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                          Instant Alerts
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                          Customizable
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                          Socket.io
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                      >
                        Configure notifications
                        <motion.svg
                          animate={{
                            x: hoveredFeature === "notifications" ? 8 : 0,
                          }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 5 - Secure File Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("upload")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <FiCloud className="h-8 w-8 text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-150" />
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-150">
                      Secure File Upload
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Easily upload medical reports, prescriptions, and test
                      results. All files are encrypted and securely stored in
                      AWS S3 with strict access controls and security measures.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                          End-to-End Encryption
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                          AWS S3
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-150"
                      >
                        Upload medical documents
                        <motion.svg
                          animate={{ x: hoveredFeature === "upload" ? 8 : 0 }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Feature 6 - Role-Based Access */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { duration: 0.15, ease: "easeOut" }
                  }}
                  onHoverStart={() => setHoveredFeature("roles")}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-3xl transition-all duration-150 p-8 border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="relative rounded-2xl w-16 h-16 flex items-center justify-center bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 mb-8 group-hover:scale-125 group-hover:rotate-6 transition-all duration-150"
                  >
                    <FiUsers className="h-8 w-8 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-150" />
                  </motion.div>

                  <div className="relative grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                      Role-Based Access Control
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 grow leading-relaxed">
                      Tailored interfaces for patients, hospitals, medical
                      professionals, and administrators. Each role has specific
                      permissions and capabilities designed for their needs.
                    </p>

                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          User Roles
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Custom Dashboards
                        </span>
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Permission Levels
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-150"
                      >
                        Explore role features
                        <motion.svg
                          animate={{ x: hoveredFeature === "roles" ? 8 : 0 }}
                          transition={{ duration: 0.15 }}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature Comparison - ENHANCED UI/UX */}
              <div className="mt-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-8 bg-linear-to-r from-[#252A61]/10 to-[#6236FF]/10 dark:from-[#252A61]/20 dark:to-[#6236FF]/20">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                      How Medicare Compares
                    </h3>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                      See how Medicare stands out against traditional health
                      record systems
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                          <th className="px-8 py-6 font-semibold text-gray-900 dark:text-white text-lg">
                            Features
                          </th>
                          <th className="px-8 py-6 font-semibold text-[#252A61] dark:text-[#8B6FFF] text-lg">
                            Medicare
                          </th>
                          <th className="px-8 py-6 font-semibold text-gray-700 dark:text-gray-300 text-lg">
                            Traditional EMR
                          </th>
                          <th className="px-8 py-6 font-semibold text-gray-700 dark:text-gray-300 text-lg">
                            Paper Records
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          viewport={{ once: true }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors duration-200"
                        >
                          <td className="px-8 py-6 font-medium text-gray-900 dark:text-white">
                            Patient Access
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600 dark:text-green-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Instant & Mobile
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                Limited Access
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-600 dark:text-red-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                In-Person Only
                              </span>
                            </div>
                          </td>
                        </motion.tr>

                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          viewport={{ once: true }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors duration-200"
                        >
                          <td className="px-8 py-6 font-medium text-gray-900 dark:text-white">
                            Data Security
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600 dark:text-green-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                End-to-End Encryption
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                Basic Encryption
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-600 dark:text-red-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                Physical Security Only
                              </span>
                            </div>
                          </td>
                        </motion.tr>

                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors duration-200"
                        >
                          <td className="px-8 py-6 font-medium text-gray-900 dark:text-white">
                            Sharing Capability
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600 dark:text-green-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                One-click QR Sharing
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                Complex Permissions
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-600 dark:text-red-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                Physical Copy Only
                              </span>
                            </div>
                          </td>
                        </motion.tr>

                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          viewport={{ once: true }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors duration-200"
                        >
                          <td className="px-8 py-6 font-medium text-gray-900 dark:text-white">
                            Real-time Updates
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-600 dark:text-green-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                Instant Notifications
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                Delayed Updates
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-red-600 dark:text-red-400"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                Manual Updates Only
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-600 dark:text-green-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Best Option
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-yellow-600 dark:text-yellow-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Limited Features
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-600 dark:text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Not Recommended
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={SelfImage}
                  alt="Karan Gupta - Full Size"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                {/* Image caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white text-xl font-bold mb-1">Karan Gupta</h3>
                  <p className="text-white/80 text-sm">Founder & CEO of Medicare, Full Stack Developer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </main>
  );
};

export default Team;
