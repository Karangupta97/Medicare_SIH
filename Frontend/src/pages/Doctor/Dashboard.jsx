import React, { useEffect, useState } from 'react';
import { useDoctorStore } from '../../store/doctorStore';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiCalendar,
  FiFileText,
  FiMapPin,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiSettings,
  FiArrowRight,
  FiActivity,
  FiClock,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiAward,
  FiBookOpen,
  FiGrid,
  FiBriefcase,
  FiSearch,
  FiShield,
} from 'react-icons/fi';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideIn = {
  hidden: { x: -280, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { x: -280, opacity: 0, transition: { duration: 0.25 } },
};

// ─── Sidebar Navigation Items ────────────────────────────────────────────────

const navItems = [
  { label: 'Dashboard', icon: FiHome, path: '/doctor/dashboard' },
  { label: 'Find Patient', icon: FiSearch, path: '/doctor/find-patient' },
  { label: 'Emergency Folder', icon: FiShield, path: '/doctor/emergency-folder' },
  { label: 'Shared Reports', icon: FiFileText, path: '/doctor/shared-reports' },
  { label: 'Patients', icon: FiUsers, path: '/doctor/patients' },
  { label: 'Appointments', icon: FiCalendar, path: '/doctor/appointments' },
  { label: 'Medical Records', icon: FiFileText, path: '/doctor/medical-records' },
  { label: 'Affiliated Hospitals', icon: FiMapPin, path: '/doctor/hospitals' },
  { label: 'Profile Settings', icon: FiSettings, path: '/doctor/profile' },
];

// ─── Stat Cards Data ─────────────────────────────────────────────────────────

const statCards = [
  {
    label: "Today's Patients",
    value: '—',
    sub: 'Check back soon',
    icon: FiUsers,
    gradient: 'linear-gradient(135deg, #6s366f1, #8b5cf6)',
    softBg: 'rgba(99,102,241,0.10)',
    accent: '#6366f1',
  },
  {
    label: 'Appointments',
    value: '—',
    sub: 'Upcoming',
    icon: FiCalendar,
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    softBg: 'rgba(14,165,233,0.10)',
    accent: '#0ea5e9',
  },
  {
    label: 'Medical Records',
    value: '—',
    sub: 'Total records',
    icon: FiFileText,
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    softBg: 'rgba(16,185,129,0.10)',
    accent: '#10b981',
  },
  {
    label: 'Hospitals',
    value: '—',
    sub: 'Affiliated',
    icon: FiMapPin,
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    softBg: 'rgba(249,115,22,0.10)',
    accent: '#f97316',
  },
];

// ─── Quick Actions ───────────────────────────────────────────────────────────

const quickActions = [
  {
    label: 'Find Patient',
    description: 'Search patients by UMID',
    icon: FiSearch,
    path: '/doctor/find-patient',
    gradient: 'from-cyan-500 to-blue-600',
    softBg: 'rgba(6,182,212,0.08)',
    accent: '#06b6d4',
  },
  {
    label: 'View Patients',
    description: 'See your patient list and records',
    icon: FiUsers,
    path: '/doctor/patients',
    gradient: 'from-indigo-500 to-violet-600',
    softBg: 'rgba(99,102,241,0.08)',
    accent: '#6366f1',
  },
  {
    label: 'Appointments',
    description: 'Schedule and manage appointments',
    icon: FiCalendar,
    path: '/doctor/appointments',
    gradient: 'from-sky-500 to-blue-600',
    softBg: 'rgba(14,165,233,0.08)',
    accent: '#0ea5e9',
  },
  {
    label: 'Medical Records',
    description: 'Browse and manage medical files',
    icon: FiFileText,
    path: '/doctor/medical-records',
    gradient: 'from-emerald-500 to-teal-600',
    softBg: 'rgba(16,185,129,0.08)',
    accent: '#10b981',
  },
  {
    label: 'Hospital Network',
    description: 'View affiliated hospitals',
    icon: FiMapPin,
    path: '/doctor/hospitals',
    gradient: 'from-orange-500 to-amber-500',
    softBg: 'rgba(249,115,22,0.08)',
    accent: '#f97316',
  },
  {
    label: 'My Profile',
    description: 'Update your profile details',
    icon: FiUser,
    path: '/doctor/profile',
    gradient: 'from-rose-500 to-pink-600',
    softBg: 'rgba(244,63,94,0.08)',
    accent: '#f43f5e',
  },
  {
    label: 'Activity Log',
    description: 'Review recent activity',
    icon: FiActivity,
    path: '/doctor/dashboard',
    gradient: 'from-violet-500 to-purple-600',
    softBg: 'rgba(139,92,246,0.08)',
    accent: '#8b5cf6',
  },
  {
    label: 'Shared Reports',
    description: 'View reports shared by patients',
    icon: FiShield,
    path: '/doctor/shared-reports',
    gradient: 'from-fuchsia-500 to-pink-600',
    softBg: 'rgba(217,70,239,0.08)',
    accent: '#d946ef',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const DoctorDashboard = () => {
  const { isAuthenticated, doctor, getDoctorProfile, logoutDoctor, isLoading } = useDoctorStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getDoctorProfile();
    }
  }, [isAuthenticated, getDoctorProfile]);

  const handleLogout = async () => {
    await logoutDoctor();
    navigate('/doctor/login');
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f8fafd 0%, #eef1ff 100%)' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 48,
            height: 48,
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" />;
  }

  const firstName = doctor?.fullName?.split(' ')[0] || 'Doctor';
  const avatarUrl =
    doctor?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.fullName || 'Doctor')}&background=6366f1&color=fff&bold=true&size=128`;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // ─── Account Info Items ──────────────────────────────────────────────────

  const infoItems = [
    { label: 'Doctor ID', value: doctor?.doctorId, icon: FiAward },
    { label: 'Full Name', value: doctor?.fullName, icon: FiUser },
    { label: 'Email', value: doctor?.email, icon: FiMail },
    { label: 'Phone', value: doctor?.phone, icon: FiPhone },
    { label: 'Registration No.', value: doctor?.medicalRegistrationNumber, icon: FiBookOpen },
    { label: 'Medical Council', value: doctor?.councilName, icon: FiBriefcase },
    { label: 'State', value: doctor?.state, icon: FiMapPin },
    { label: 'Specialization', value: doctor?.specialization, icon: FiActivity },
  ];

  // ─── Sidebar Content ────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #252A61 100%)' }}>
      {/* Sidebar Header */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: '2px solid rgba(255,255,255,0.2)' }}
        >
          <img src={avatarUrl} alt={doctor?.fullName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Dr. {firstName}
          </p>
          <p
            className="truncate"
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}
          >
            {doctor?.specialization || 'Physician'}
          </p>
        </div>
        {/* Close button on mobile */}
        <button
          className="lg:hidden p-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          onClick={() => setSidebarOpen(false)}
        >
          <FiX style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon style={{ fontSize: '1.1rem', flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{
            background: 'rgba(244,63,94,0.1)',
            color: '#fca5a5',
            fontWeight: 500,
            fontSize: '0.88rem',
            border: '1px solid rgba(244,63,94,0.15)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
        >
          <FiLogOut style={{ fontSize: '1.1rem' }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Doctor Dashboard | Medicare</title>
        <meta name="description" content="Medicare Doctor Dashboard — manage patients, appointments, and medical records." />
      </Helmet>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex" style={{ background: '#f8fafd', fontFamily: "'Inter', sans-serif" }}>
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block flex-shrink-0" style={{ width: 264 }}>
          <div className="fixed top-0 left-0 h-screen" style={{ width: 264, zIndex: 40 }}>
            <SidebarContent />
          </div>
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 lg:hidden"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}
              />
              <motion.div
                variants={slideIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-0 left-0 bottom-0 lg:hidden"
                style={{ width: 280, zIndex: 51 }}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Top Header Bar ── */}
          <header
            className="sticky top-0"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderBottom: '1px solid #e8edf5',
              zIndex: 30,
            }}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
              {/* Left: hamburger + page title */}
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 rounded-xl"
                  style={{ background: '#f1f5f9' }}
                  onClick={() => setSidebarOpen(true)}
                >
                  <FiMenu style={{ fontSize: '1.2rem', color: '#334155' }} />
                </button>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Dashboard
                  </h1>
                  <p className="hidden sm:block" style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                    {currentDate}
                  </p>
                </div>
              </div>

              {/* Right: profile + logout */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <img
                    src={avatarUrl}
                    alt={doctor?.fullName}
                    className="rounded-full object-cover"
                    style={{ width: 32, height: 32 }}
                  />
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                      Dr. {firstName}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                      {doctor?.specialization || 'Physician'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <FiLogOut style={{ fontSize: '0.9rem' }} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto">
            {/* ── Welcome Banner ── */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-6 lg:mb-8"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #252A61 75%, #1e3a5f 100%)',
                minHeight: 'clamp(160px, 25vw, 220px)',
              }}
            >
              {/* Decorative blobs */}
              <div className="absolute pointer-events-none" style={{ top: '-30%', right: '-5%', width: 'clamp(180px,40vw,400px)', height: 'clamp(180px,40vw,400px)', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
              <div className="absolute pointer-events-none" style={{ bottom: '-20%', left: '-5%', width: 'clamp(150px,30vw,300px)', height: 'clamp(150px,30vw,300px)', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />
              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 p-5 sm:p-7 lg:p-9">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      width: 'clamp(64px, 10vw, 88px)',
                      height: 'clamp(64px, 10vw, 88px)',
                      border: '3px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img src={avatarUrl} alt={doctor?.fullName} className="w-full h-full object-cover" />
                  </div>
                </motion.div>

                {/* Greeting */}
                <div className="text-center sm:text-left flex-1">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex items-center justify-center sm:justify-start gap-2 mb-1"
                  >
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {greeting.toUpperCase()},
                    </span>
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    style={{
                      fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    Dr. {doctor?.fullName || 'Doctor'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)', fontWeight: 500, marginTop: '0.25rem' }}
                  >
                    {doctor?.specialization || 'General Physician'} • {currentDate}
                  </motion.p>

                  {/* Badges */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3"
                  >
                    {doctor?.medicalRegistrationNumber && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <FiAward style={{ color: '#facc15', fontSize: '0.8rem' }} />
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Reg: {doctor.medicalRegistrationNumber}
                        </span>
                      </div>
                    )}
                    {doctor?.councilName && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <FiBriefcase style={{ color: '#67e8f9', fontSize: '0.8rem' }} />
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {doctor.councilName}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* ── Stats Cards ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 lg:mb-8"
            >
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(15,23,42,0.12)' }}
                    className="rounded-2xl overflow-hidden cursor-default"
                    style={{
                      background: '#fff',
                      border: '1.5px solid #e8edf5',
                      boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
                      transition: 'box-shadow 0.3s, transform 0.3s',
                    }}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="flex items-center justify-center rounded-xl"
                          style={{ width: 42, height: 42, background: card.softBg }}
                        >
                          <Icon style={{ color: card.accent, fontSize: '1.15rem' }} />
                        </div>
                        <div
                          className="rounded-lg px-2 py-0.5"
                          style={{ background: card.softBg }}
                        >
                          <FiActivity style={{ color: card.accent, fontSize: '0.75rem' }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {card.value}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>
                        {card.label}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                        {card.sub}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.section
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-6 lg:mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Quick Actions
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
                    Jump to frequently used features
                  </p>
                </div>
                <div
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}
                >
                  <FiGrid style={{ color: '#6366f1', fontSize: '0.75rem' }} />
                  <span style={{ color: '#6366f1', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    ACTIONS
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.div key={action.label} variants={scaleIn}>
                      <Link
                        to={action.path}
                        className="group flex items-start gap-4 p-4 sm:p-5 rounded-2xl transition-all duration-300"
                        style={{
                          background: '#fff',
                          border: '1.5px solid #e8edf5',
                          boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 16px 48px rgba(15,23,42,0.10)';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.borderColor = `${action.accent}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#e8edf5';
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-xl flex-shrink-0"
                          style={{ width: 48, height: 48, background: action.softBg }}
                        >
                          <Icon style={{ color: action.accent, fontSize: '1.3rem' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                              {action.label}
                            </h4>
                            <FiChevronRight
                              className="group-hover:translate-x-1 transition-transform duration-200"
                              style={{ color: '#cbd5e1', fontSize: '1rem' }}
                            />
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.15rem' }}>
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* ── Account Information ── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Account Information
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
                    Your registered details
                  </p>
                </div>
                <div
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}
                >
                  <FiUser style={{ color: '#10b981', fontSize: '0.75rem' }} />
                  <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    PROFILE
                  </span>
                </div>
              </div>

              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#fff',
                  border: '1.5px solid #e8edf5',
                  boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {infoItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-4 sm:p-5"
                        style={{
                          borderBottom: i < infoItems.length - (window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1) ? '1px solid #f1f5f9' : 'none',
                          borderRight: '1px solid #f1f5f9',
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ width: 36, height: 36, background: '#f1f5f9' }}
                        >
                          <Icon style={{ color: '#64748b', fontSize: '0.95rem' }} />
                        </div>
                        <div className="min-w-0">
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {item.label}
                          </p>
                          <p
                            className="truncate"
                            style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600, marginTop: '0.1rem' }}
                          >
                            {item.value || 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            {/* Bottom Spacer */}
            <div style={{ height: '2rem' }} />
          </main>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;