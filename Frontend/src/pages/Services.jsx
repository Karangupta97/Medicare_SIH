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
  FiSettings,
  FiStar,
  FiZap
} from 'react-icons/fi'
import { useAuthStore } from '../store/Patient/authStore'

// ─── Data ────────────────────────────────────────────────────────────────────

const mainServices = [
  {
    id: 1,
    title: 'Medical Records Management',
    description:
      'Securely store, organise, and manage all your medical records in one centralised location with instant access from any device.',
    icon: FiDatabase,
    features: ['Secure cloud storage', 'Smart file organisation', 'Lightning-fast search', 'Automatic backup'],
    gradient: 'from-sky-500 to-blue-600',
    softBg: 'rgba(14,165,233,0.10)',
    accent: '#0ea5e9',
    tag: 'Most Popular'
  },
  {
    id: 2,
    title: 'Health Monitoring',
    description:
      'Track your vital signs, symptoms, and health metrics with advanced monitoring tools and receive personalised insights powered by AI.',
    icon: FiActivity,
    features: ['Real-time health tracking', 'Vital signs monitoring', 'Symptom logging', 'Trend analysis'],
    gradient: 'from-emerald-500 to-teal-600',
    softBg: 'rgba(16,185,129,0.10)',
    accent: '#10b981',
    tag: null
  },
  {
    id: 3,
    title: 'Doctor Consultation',
    description:
      'Connect with certified healthcare professionals for virtual consultations and receive expert medical advice without leaving home.',
    icon: FiUsers,
    features: ['HD video consultations', 'Chat with doctors', 'Prescription management', 'Follow-up scheduling'],
    gradient: 'from-violet-500 to-purple-600',
    softBg: 'rgba(139,92,246,0.10)',
    accent: '#8b5cf6',
    tag: null
  },
  {
    id: 4,
    title: 'Report Analysis',
    description:
      'Get AI-powered analysis of your medical reports with easy-to-understand insights, trend identification, and smart recommendations.',
    icon: FiFileText,
    features: ['AI-powered analysis', 'Detailed insights', 'Trend identification', 'Recommendation engine'],
    gradient: 'from-orange-500 to-amber-500',
    softBg: 'rgba(249,115,22,0.10)',
    accent: '#f97316',
    tag: 'AI Powered'
  },
  {
    id: 5,
    title: 'Emergency Services',
    description:
      '24/7 emergency support with instant access to your medical history for healthcare providers during life-critical situations.',
    icon: FiPhone,
    features: ['24/7 availability', 'Emergency contacts', 'Medical alert system', 'Instant history access'],
    gradient: 'from-rose-500 to-red-600',
    softBg: 'rgba(244,63,94,0.10)',
    accent: '#f43f5e',
    tag: '24 / 7'
  },
  {
    id: 6,
    title: 'Appointment Booking',
    description:
      'Effortlessly schedule appointments with healthcare providers, manage your calendar, and receive smart automated reminders.',
    icon: FiCalendar,
    features: ['Easy scheduling', 'Calendar sync', 'Automated reminders', 'Provider availability'],
    gradient: 'from-indigo-500 to-blue-600',
    softBg: 'rgba(99,102,241,0.10)',
    accent: '#6366f1',
    tag: null
  }
]

const additionalFeatures = [
  { title: 'Mobile App Access', description: 'Access all features on the go with our sleek mobile applications', icon: FiSmartphone },
  { title: 'Real-time Sync', description: 'Your data syncs across all devices instantly in real-time', icon: FiWifi },
  { title: 'Smart Notifications', description: 'Intelligent alerts for medication, appointments, and health metrics', icon: FiBell },
  { title: 'Bank-level Security', description: 'Military-grade encryption ensures your medical data is always safe', icon: FiLock },
  { title: 'Custom Dashboard', description: 'Personalise your healthcare hub to focus on what matters most to you', icon: FiSettings },
  { title: 'Global Access', description: 'Access your medical records from anywhere in the world, anytime', icon: FiGlobe }
]

const processSteps = [
  { step: '01', title: 'Sign Up', description: 'Create your secure Medicare account in minutes', icon: FiShield },
  { step: '02', title: 'Upload Records', description: 'Add your existing medical records and reports', icon: FiUpload },
  { step: '03', title: 'Connect Devices', description: 'Sync your health monitoring devices seamlessly', icon: FiSmartphone },
  { step: '04', title: 'Start Monitoring', description: 'Track your health and get personalised insights', icon: FiActivity }
]

const stats = [
  { value: '50K+', label: 'Active Patients', icon: FiUsers },
  { value: '98%', label: 'Satisfaction Rate', icon: FiStar },
  { value: '24/7', label: 'Support Available', icon: FiClock },
  { value: '256-bit', label: 'Encryption', icon: FiLock }
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
}

// ─── Component ────────────────────────────────────────────────────────────────

const Services = () => {
  const { user, logout } = useAuthStore()
  const [selectedService, setSelectedService] = useState(null)

  return (
    <div className="min-h-screen" style={{ background: '#f8fafd', fontFamily: "'Inter', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Navbar ── */}
      <div className="flex justify-center w-full bg-white shadow-sm sticky top-0 z-50">
        <Navbar user={user} onLogout={logout} />
      </div>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #252A61 75%, #1e3a5f 100%)',
          minHeight: 'clamp(480px, 80vh, 700px)'
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'clamp(240px, 50vw, 600px)',
            height: 'clamp(240px, 50vw, 600px)',
            top: '-20%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 'clamp(200px, 40vw, 500px)',
            height: 'clamp(200px, 40vw, 500px)',
            bottom: '-15%',
            left: '-8%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"
          style={{ paddingTop: 'clamp(64px, 10vw, 120px)', paddingBottom: 'clamp(64px, 10vw, 120px)' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <FiZap style={{ color: '#facc15', fontSize: '0.85rem' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              COMPREHENSIVE HEALTHCARE PLATFORM
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.75rem)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem'
            }}
          >
            Healthcare Services{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
              maxWidth: '640px',
              lineHeight: 1.7,
              marginBottom: '2.5rem'
            }}
          >
            Comprehensive digital healthcare solutions designed to revolutionise how you manage your health, records, and medical journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 w-full justify-center"
            style={{ maxWidth: '420px', margin: '0 auto' }}
          >
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                padding: '0.875rem 2rem',
                fontSize: '0.95rem',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                flex: 1
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Get Started Free <FiArrowRight />
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center font-semibold rounded-xl transition-all duration-300"
              style={{
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.85)',
                padding: '0.875rem 2rem',
                fontSize: '0.95rem',
                backdropFilter: 'blur(8px)',
                background: 'rgba(255,255,255,0.06)',
                flex: 1
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              Contact Us
            </Link>
          </motion.div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#f8fafd" />
        </svg>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e8edf5' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="flex flex-col items-center text-center gap-1 p-4 rounded-2xl"
                  style={{ background: '#f8fafd' }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl mb-2"
                    style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#252A61,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}
                  >
                    <Icon style={{ color: '#fff', fontSize: '1.1rem' }} />
                  </div>
                  <span style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#252A61', lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</span>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Core Services ── */}
      <section style={{ background: '#f8fafd', paddingTop: 'clamp(48px, 8vw, 96px)', paddingBottom: 'clamp(48px, 8vw, 96px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-700 tracking-widest mb-4"
              style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              CORE SERVICES
            </motion.span>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}
            >
              Everything You Need
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ color: '#64748b', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}
            >
              Our comprehensive suite of healthcare services gives you complete control over your medical journey.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mainServices.map((service) => {
              const Icon = service.icon
              const isOpen = selectedService === service.id
              return (
                <motion.div
                  key={service.id}
                  variants={scaleIn}
                  whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(15,23,42,0.12)' }}
                  onClick={() => setSelectedService(isOpen ? null : service.id)}
                  className="rounded-2xl overflow-hidden cursor-pointer relative"
                  style={{
                    background: '#fff',
                    border: isOpen ? `1.5px solid ${service.accent}` : '1.5px solid #e8edf5',
                    boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                    transition: 'border 0.2s'
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg,var(--tw-gradient-from),var(--tw-gradient-to))` }}
                    className={`bg-gradient-to-r ${service.gradient}`}
                  />

                  {service.tag && (
                    <div
                      className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: service.softBg, color: service.accent, border: `1px solid ${service.accent}30` }}
                    >
                      {service.tag}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center rounded-2xl mb-5"
                      style={{ width: 56, height: 56, background: service.softBg }}
                    >
                      <Icon style={{ fontSize: '1.5rem', color: service.accent }} />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                      {service.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                      {service.description}
                    </p>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          key="features"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            className="rounded-xl p-4 mb-4"
                            style={{ background: service.softBg, border: `1px solid ${service.accent}20` }}
                          >
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: service.accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.625rem' }}>
                              Key Features
                            </p>
                            <ul className="space-y-2">
                              {service.features.map((feat, fi) => (
                                <motion.li
                                  key={fi}
                                  initial={{ x: -12, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: fi * 0.07 }}
                                  className="flex items-center gap-2"
                                  style={{ fontSize: '0.85rem', color: '#334155' }}
                                >
                                  <FiCheckCircle style={{ color: service.accent, flexShrink: 0, fontSize: '0.95rem' }} />
                                  {feat}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: service.accent }}>
                        {isOpen ? 'Hide Details' : 'View Details'}
                      </span>
                      <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
                        <FiArrowRight style={{ color: service.accent, fontSize: '1rem' }} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Additional Features ── */}
      <section style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#252A61 50%,#1e3a5f 100%)', paddingTop: 'clamp(48px,8vw,96px)', paddingBottom: 'clamp(48px,8vw,96px)' }} className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute pointer-events-none" style={{ top: '-10%', left: '60%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full text-xs font-700 tracking-widest mb-4"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.15)' }}>
              PLATFORM CAPABILITIES
            </motion.span>
            <motion.h2 variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Built for Modern Healthcare
            </motion.h2>
            <motion.p variants={fadeUp}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.95rem,2vw,1.1rem)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Powerful capabilities that make Medicare the most comprehensive digital health platform available.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {additionalFeatures.map((feat, i) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl p-6 flex gap-4 items-start"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(16px)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                >
                  <div className="flex-shrink-0 flex items-center justify-center rounded-xl"
                    style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                    <Icon style={{ color: '#fff', fontSize: '1.2rem' }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{feat.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.83rem', lineHeight: 1.6 }}>{feat.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: '#fff', paddingTop: 'clamp(48px,8vw,96px)', paddingBottom: 'clamp(48px,8vw,96px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 rounded-full text-xs font-700 tracking-widest mb-4"
              style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', fontWeight: 700, letterSpacing: '0.08em' }}>
              HOW IT WORKS
            </motion.span>
            <motion.h2 variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Get Started in 4 Steps
            </motion.h2>
            <motion.p variants={fadeUp}
              style={{ color: '#64748b', fontSize: 'clamp(0.95rem,2vw,1.1rem)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              From sign-up to fully monitoring your health — it only takes a few minutes.
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connector line (desktop only) */}
            <div className="absolute hidden lg:block" style={{ top: 44, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#f472b6)', borderRadius: 2, opacity: 0.3 }} />

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {processSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className="relative flex items-center justify-center rounded-full mb-5"
                      style={{
                        width: 88,
                        height: 88,
                        background: 'linear-gradient(135deg,#252A61,#6366f1)',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                      }}
                    >
                      <Icon style={{ color: '#fff', fontSize: '1.6rem' }} />
                      <div
                        className="absolute flex items-center justify-center rounded-full"
                        style={{
                          width: 26,
                          height: 26,
                          background: '#f472b6',
                          bottom: -4,
                          right: -4,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(244,114,182,0.4)'
                        }}
                      >
                        {step.step}
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>{step.title}</h3>
                    <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6, maxWidth: 180 }}>{step.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#252A61 75%,#1e3a5f 100%)',
          paddingTop: 'clamp(64px,10vw,112px)',
          paddingBottom: 'clamp(64px,10vw,112px)'
        }}
      >
        <div className="absolute pointer-events-none" style={{ top: '-20%', right: '-5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(139,92,246,0.25) 0%,transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-20%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(14,165,233,0.2) 0%,transparent 70%)', filter: 'blur(60px)' }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <FiHeart style={{ color: '#f472b6', fontSize: '0.85rem' }} />
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.07em' }}>
              TRUSTED BY 50,000+ PATIENTS
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.75rem,5vw,3rem)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1rem'
            }}
          >
            Ready to Transform Your{' '}
            <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Healthcare Experience?
            </span>
          </h2>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.95rem,2vw,1.1rem)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Join thousands of users who trust Medicare for their healthcare management needs. Start your free trial today — no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ maxWidth: 420, margin: '0 auto' }}>
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300"
              style={{
                background: '#fff',
                color: '#252A61',
                padding: '0.9rem 2rem',
                fontSize: '0.95rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                flex: 1,
                fontWeight: 700
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Start Free Trial <FiArrowRight />
            </Link>
            <Link
              to="/demo"
              className="flex items-center justify-center font-semibold rounded-xl transition-all duration-300"
              style={{
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.85)',
                padding: '0.9rem 2rem',
                fontSize: '0.95rem',
                background: 'rgba(255,255,255,0.06)',
                flex: 1
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

export default Services