import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../store/doctorStore';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
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
  FiSearch,
  FiShield,
} from 'react-icons/fi';

// ─── Animation Variants ──────────────────────────────────────────────────────

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
  { label: 'Patients', icon: FiUsers, path: '/doctor/patients' },
  { label: 'Appointments', icon: FiCalendar, path: '/doctor/appointments' },
  { label: 'Medical Records', icon: FiFileText, path: '/doctor/medical-records' },
  { label: 'Affiliated Hospitals', icon: FiMapPin, path: '/doctor/hospitals' },
  { label: 'Profile Settings', icon: FiSettings, path: '/doctor/profile' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const DoctorDashboardLayout = ({ children, pageTitle }) => {
  const { isAuthenticated, doctor, getDoctorProfile, logoutDoctor, isLoading } = useDoctorStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      getDoctorProfile();
    }
  }, [isAuthenticated, getDoctorProfile]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
                    {pageTitle || 'Dashboard'}
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
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboardLayout;
