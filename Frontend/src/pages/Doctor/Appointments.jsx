import React, { useState } from 'react';
import DoctorDashboardLayout from '../../components/Doctor/DoctorDashboardLayout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiCalendar, FiClock, FiUser, FiPlus, FiChevronRight,
  FiVideo, FiMapPin, FiFilter, FiSearch, FiPhone,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

// Mock appointment data
const mockAppointments = [
  { id: 1, patient: 'Rahul Sharma', time: '09:00 AM', date: 'Today', type: 'In-Person', status: 'confirmed', reason: 'General Checkup', avatar: null },
  { id: 2, patient: 'Priya Patel', time: '10:30 AM', date: 'Today', type: 'Video Call', status: 'confirmed', reason: 'Follow-up', avatar: null },
  { id: 3, patient: 'Amit Kumar', time: '02:00 PM', date: 'Today', type: 'In-Person', status: 'pending', reason: 'Consultation', avatar: null },
  { id: 4, patient: 'Sneha Gupta', time: '04:00 PM', date: 'Today', type: 'Video Call', status: 'confirmed', reason: 'Lab Review', avatar: null },
  { id: 5, patient: 'Vikram Singh', time: '09:30 AM', date: 'Tomorrow', type: 'In-Person', status: 'pending', reason: 'Prescription Renewal', avatar: null },
  { id: 6, patient: 'Meera Joshi', time: '11:00 AM', date: 'Tomorrow', type: 'In-Person', status: 'confirmed', reason: 'Annual Physical', avatar: null },
];

const statusColors = {
  confirmed: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)', label: 'Confirmed' },
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'Pending' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'Cancelled' },
};

const DoctorAppointments = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const todayAppts = mockAppointments.filter(a => a.date === 'Today');
  const tomorrowAppts = mockAppointments.filter(a => a.date === 'Tomorrow');

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: FiCalendar, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Confirmed', value: mockAppointments.filter(a => a.status === 'confirmed').length, icon: FiClock, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Pending', value: mockAppointments.filter(a => a.status === 'pending').length, icon: FiClock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Video Calls', value: mockAppointments.filter(a => a.type === 'Video Call').length, icon: FiVideo, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  ];

  const AppointmentCard = ({ appt }) => {
    const sc = statusColors[appt.status];
    return (
      <motion.div variants={fadeUp} whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(15,23,42,0.1)' }}
        className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
        style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{appt.patient.charAt(0)}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{appt.patient}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>{appt.reason}</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontSize: '0.72rem', fontWeight: 600 }}>
              {sc.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FiClock style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
              <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>{appt.time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {appt.type === 'Video Call' ? <FiVideo style={{ color: '#0ea5e9', fontSize: '0.85rem' }} /> : <FiMapPin style={{ color: '#f97316', fontSize: '0.85rem' }} />}
              <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>{appt.type}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm"
              style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
              <FiPhone style={{ fontSize: '0.8rem' }} /> Contact
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
              View Details <FiChevronRight style={{ fontSize: '0.8rem' }} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DoctorDashboardLayout pageTitle="Appointments">
      <Helmet><title>Appointments | Doctor Dashboard - Medicare</title></Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={fadeUp} custom={i}
                className="rounded-2xl p-4 sm:p-5 cursor-default"
                style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center justify-center rounded-xl" style={{ width: 42, height: 42, background: s.bg }}>
                    <Icon style={{ color: s.color, fontSize: '1.15rem' }} />
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8', fontSize: '0.9rem' }} />
              <input type="text" placeholder="Search patients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border-0 text-sm" style={{ background: '#f1f5f9', width: 220, fontSize: '0.85rem', fontWeight: 500 }} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: '#f1f5f9' }}>
              <FiFilter style={{ color: '#64748b', fontSize: '0.85rem' }} />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-transparent border-0 text-sm" style={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                <option value="all">All</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <FiPlus style={{ fontSize: '0.9rem' }} /> New Appointment
          </button>
        </div>

        {/* Today's Appointments */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Today</h3>
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.72rem', fontWeight: 700 }}>{todayAppts.length}</span>
          </div>
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAppts.map((a, i) => <AppointmentCard key={a.id} appt={a} />)}
          </motion.div>
        </div>

        {/* Tomorrow */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Tomorrow</h3>
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontSize: '0.72rem', fontWeight: 700 }}>{tomorrowAppts.length}</span>
          </div>
          <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tomorrowAppts.map((a, i) => <AppointmentCard key={a.id} appt={a} />)}
          </motion.div>
        </div>

        <div style={{ height: '2rem' }} />
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorAppointments;
