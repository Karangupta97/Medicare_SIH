import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiArrowRight,
  FiCheck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiShield,
  FiAward,
  FiUsers,
  FiHeart,
  FiSmile,
  FiGlobe,
} from "react-icons/fi";
import { useAuthStore } from "../store/Patient/authStore";
import MedicareLogo from "../assets/Logo/Medicare logo.png";
import NurseImage from "../assets/nurse.png";

// Stats data
// const stats = [
//   { number: "500K+", label: "Active Users" },
//   { number: "1,200+", label: "Healthcare Partners" },
//   { number: "99.9%", label: "Uptime" },
//   { number: "24/7", label: "Support" },
// ];

// FAQ data
const faqs = [
  {
    question: "How secure is my medical data on Medicare?",
    answer: 
      "Medicare employs bank-level encryption to ensure your medical data is completely secure. We implement advanced security measures including end-to-end encryption, regular security audits, and strict access controls.",
  },
  {
    question: "Can I share my medical records with my doctor?",
    answer:
      "Yes, Medicare makes it easy to share your medical records with healthcare providers. You can grant temporary or permanent access to specific doctors or healthcare facilities, and revoke access at any time.",
  },
  {
    question: "Is Medicare available on mobile devices?",
    answer:
      "Medicare is fully responsive and works perfectly on any mobile device. We also offer dedicated mobile apps for iOS and Android that provide additional features like offline access and push notifications.",
  },
  {
    question: "How do I upload my existing medical reports?",
    answer:
      "You can easily upload your existing medical reports through our user-friendly interface. Simply navigate to the Upload section, select your files, add relevant details, and submit. We support various file formats including PDF, JPEG, and DICOM.",
  },
];

const About = () => {
  const { user, logout } = useAuthStore();
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-center w-full bg-white dark:bg-gray-900">
        <Navbar user={user} onLogout={logout} />
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-[#252A61]/5 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                Revolutionizing{" "}
                <span className="text-[#252A61] relative">
                  Healthcare
                  <span className="absolute bottom-0 left-0 w-full h-3 bg-[#252A61]/20 -z-10"></span>
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                At Medicare, we're on a mission to transform healthcare through
                technology, placing patients at the center of their medical
                journey with security, transparency, and ease of access.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 bg-[#252A61] text-white rounded-full text-lg font-medium hover:bg-[#3b3b98] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 flex items-center"
                >
                  Join Medicare
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-3.5 bg-white border-2 border-[#252A61] text-[#252A61] rounded-full text-lg font-medium hover:bg-[#252A61]/5 transition-all duration-300 flex items-center"
                >
                  Explore Features
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-300/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-300/20 rounded-full filter blur-3xl"></div>
              <img
                src={NurseImage}
                alt="Healthcare Professional"
                className="w-full h-auto object-cover rounded-2xl shadow-2xl relative z-10 transform -rotate-2"
              />
              <div className="absolute top-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-20 transform rotate-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Secure & Private
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-20 transform -rotate-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    24/7 Support
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#252A61] mb-2">
                  {stat.number}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our Mission & Vision
            </h2>
            <div className="w-24 h-1 bg-[#252A61] mx-auto mt-4 mb-6 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              We're committed to making healthcare more accessible, transparent,
              and patient-centered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-2 bg-blue-600"></div>
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center mx-auto mb-6">
                  <FiHeart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                  Our Mission
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  At Medicare, we're dedicated to revolutionizing healthcare
                  management by providing a seamless, secure, and user-friendly
                  platform for managing medical records and healthcare services.
                  We believe that everyone deserves access to efficient,
                  transparent healthcare information.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      icon: <FiUsers className="text-blue-500" />,
                      text: "Patient-centered approach in everything we do",
                    },
                    {
                      icon: <FiShield className="text-blue-500" />,
                      text: "Implementing the highest security standards for your data",
                    },
                    {
                      icon: <FiGlobe className="text-blue-500" />,
                      text: "Making healthcare accessible to everyone, everywhere",
                    },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mt-1 mr-3">{item.icon}</div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-2 bg-purple-600"></div>
              <div className="p-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center mx-auto mb-6">
                  <FiSmile className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                  Our Vision
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  We envision a future where healthcare information is easily
                  accessible, securely managed, and efficiently shared between
                  patients and healthcare providers, leading to better health
                  outcomes for all. Our platform aims to bridge the gap between
                  patients and healthcare providers, creating a unified
                  ecosystem where health information flows seamlessly.
                </p>
                <div className="relative p-6 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                    <FiAward className="text-purple-600 w-5 h-5" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "Our goal is to empower patients with their own health data
                    and make healthcare more transparent, accessible and
                    efficient for everyone."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-[#252A61] mx-auto mt-4 mb-6 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              The principles that guide everything we do at Medicare
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              {
                icon: <FiShield className="w-8 h-8 text-indigo-600" />,
                title: "Security",
                desc: "We prioritize the privacy and security of your medical data above all else.",
              },
              {
                icon: <FiAward className="w-8 h-8 text-blue-600" />,
                title: "Excellence",
                desc: "We strive for excellence in every aspect of our service and support.",
              },
              {
                icon: <FiUsers className="w-8 h-8 text-green-600" />,
                title: "Patient-Centric",
                desc: "Every feature we build is designed with patients' needs in mind.",
              },
              {
                icon: <FiHeart className="w-8 h-8 text-red-600" />,
                title: "Compassion",
                desc: "We approach healthcare with empathy and understanding for all users.",
              },
              {
                icon: <FiGlobe className="w-8 h-8 text-yellow-600" />,
                title: "Accessibility",
                desc: "Making healthcare data available to everyone, whenever they need it.",
              },
              {
                icon: <FiCheck className="w-8 h-8 text-teal-600" />,
                title: "Integrity",
                desc: "We maintain the highest ethical standards in everything we do.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center mb-4 shadow-sm">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <div className="w-24 h-1 bg-[#252A61] mx-auto mt-4 mb-6 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400">
              Common questions about Medicare and our services
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                  onClick={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-[#252A61] transform transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
