import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  FiShield,
  FiDatabase,
  FiUsers,
  FiHeart,
  FiActivity,
  FiFileText,
  FiPhone,
  FiCalendar,
  FiMonitor,
  FiCamera,
  FiUpload,
  FiDownload,
  FiClock,
  FiGlobe,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiSmartphone,
  FiWifi,
  FiBell,
  FiSettings
} from 'react-icons/fi'
import { useAuthStore } from '../store/Patient/authStore'

// Services data
const mainServices = [
  {
    id: 1,
    title: "Medical Records Management",
    description: "Securely store, organize, and manage all your medical records in one centralized location with easy access anytime, anywhere.",
    icon: FiDatabase,
    features: [
      "Secure cloud storage",
      "Easy file organization",
      "Quick search functionality",
      "Automatic backup"
    ],
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    id: 2,
    title: "Health Monitoring",
    description: "Track your vital signs, symptoms, and health metrics with our advanced monitoring tools and get personalized insights.",
    icon: FiActivity,
    features: [
      "Real-time health tracking",
      "Vital signs monitoring",
      "Symptom logging",
      "Health trend analysis"
    ],
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600"
  },
  {
    id: 3,
    title: "Doctor Consultation",
    description: "Connect with certified healthcare professionals for virtual consultations and get expert medical advice from home.",
    icon: FiUsers,
    features: [
      "Video consultations",
      "Chat with doctors",
      "Prescription management",
      "Follow-up appointments"
    ],
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  },
  {
    id: 4,
    title: "Report Analysis",
    description: "Get AI-powered analysis of your medical reports with easy-to-understand insights and recommendations.",
    icon: FiFileText,
    features: [
      "AI-powered analysis",
      "Detailed insights",
      "Trend identification",
      "Recommendation system"
    ],
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600"
  },
  {
    id: 5,
    title: "Emergency Services",
    description: "24/7 emergency support with quick access to your medical history for healthcare providers during critical situations.",
    icon: FiPhone,
    features: [
      "24/7 availability",
      "Emergency contacts",
      "Medical alert system",
      "Quick medical history access"
    ],
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600"
  },
  {
    id: 6,
    title: "Appointment Booking",
    description: "Easily schedule appointments with healthcare providers, manage your calendar, and receive automated reminders.",
    icon: FiCalendar,
    features: [
      "Easy scheduling",
      "Calendar integration",
      "Automated reminders",
      "Provider availability"
    ],
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  }
]

// Additional features
const additionalFeatures = [
  {
    title: "Mobile App Access",
    description: "Access all features on the go with our mobile applications",
    icon: FiSmartphone
  },
  {
    title: "Real-time Sync",
    description: "Your data syncs across all devices in real-time",
    icon: FiWifi
  },
  {
    title: "Smart Notifications",
    description: "Get intelligent alerts for medication, appointments, and health metrics",
    icon: FiBell
  },
  {
    title: "Data Security",
    description: "Bank-level encryption ensures your medical data is always protected",
    icon: FiLock
  },
  {
    title: "Customizable Dashboard",
    description: "Personalize your healthcare dashboard to focus on what matters most",
    icon: FiSettings
  },
  {
    title: "Global Access",
    description: "Access your medical records from anywhere in the world",
    icon: FiGlobe
  }
]

// Process steps
const processSteps = [
  {
    step: "01",
    title: "Sign Up",
    description: "Create your secure Medicare account in minutes"
  },
  {
    step: "02",
    title: "Upload Records",
    description: "Add your existing medical records and reports"
  },
  {
    step: "03",
    title: "Connect Devices",
    description: "Sync your health monitoring devices"
  },
  {
    step: "04",
    title: "Start Monitoring",
    description: "Track your health and get personalized insights"
  }
]

const Service2 = () => {
  const { user, logout } = useAuthStore()
  const [selectedService, setSelectedService] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-center w-full bg-white dark:bg-gray-900">
        <Navbar user={user} onLogout={logout} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#252A61] to-[#1a1f4a] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Healthcare{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Services
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive digital healthcare solutions designed to revolutionize how you manage your health and medical records
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started Today <FiArrowRight />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-white/10"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Core Services
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our comprehensive suite of healthcare services designed to provide you with complete control over your medical journey
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {mainServices.map((service) => {
              const IconComponent = service.icon
              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                >
                  <div className={`${service.bgColor} dark:bg-gray-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                    <IconComponent className={`text-2xl ${service.textColor} dark:text-gray-300`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {service.description}
                  </p>

                  <AnimatePresence>
                    {selectedService === service.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                          <ul className="space-y-2">
                            {service.features.map((feature, index) => (
                              <motion.li
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                              >
                                <FiCheckCircle className={`text-sm ${service.textColor}`} />
                                {feature}
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-sm font-semibold ${service.textColor}`}>
                      Learn More
                    </span>
                    <FiArrowRight className={`${service.textColor} transition-transform duration-300 ${selectedService === service.id ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Additional Features
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Enhanced capabilities that make Medicare the most comprehensive healthcare platform
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[#252A61] to-[#1a1f4a] flex items-center justify-center mb-4 transition-transform duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                    <IconComponent className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Get started with Medicare in four simple steps
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center relative"
              >
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#252A61] to-transparent z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#252A61] to-[#1a1f4a] rounded-full flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#252A61] to-[#1a1f4a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust Medicare for their healthcare management needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-[#252A61] hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Your Free Trial <FiArrowRight />
              </Link>
              <Link
                to="/demo"
                className="border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:bg-white/10"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Service2