import React, { useState } from 'react';
import DoctorDashboardLayout from '../../components/Doctor/DoctorDashboardLayout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiUsers, FiSearch, FiFilter, FiChevronRight, FiPhone,
  FiMail, FiCalendar, FiActivity, FiPlus,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

const mockPatients = [
  { id: 1, name: 'Rahul Sharma', umid: 'AB12345XY', age: 34, gender: 'Male', lastVisit: '2026-03-20', condition: 'Hypertension', status: 'active', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Patel', umid: 'CD67890AB', age: 28, gender: 'Female', lastVisit: '2026-03-18', condition: 'Diabetes Type 2', status: 'active', phone: '+91 87654 32109' },
  { id: 3, name: 'Amit Kumar', umid: 'EF11111GH', age: 45, gender: 'Male', lastVisit: '2026-03-15', condition: 'Cardiac Arrhythmia', status: 'critical', phone: '+91 76543 21098' },
  { id: 4, name: 'Sneha Gupta', umid: 'IJ22222KL', age: 31, gender: 'Female', lastVisit: '2026-03-12', condition: 'Thyroid Disorder', status: 'active', phone: '+91 65432 10987' },
  { id: 5, name: 'Vikram Singh', umid: 'MN33333OP', age: 52, gender: 'Male', lastVisit: '2026-03-10', condition: 'Chronic Back Pain', status: 'follow-up', phone: '+91 54321 09876' },
  { id: 6, name: 'Meera Joshi', umid: 'QR44444ST', age: 39, gender: 'Female', lastVisit: '2026-03-08', condition: 'Allergic Rhinitis', status: 'active', phone: '+91 43210 98765' },
];

const statusStyles = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)', label: 'Active' },
  critical: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
  'follow-up': { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'Follow-up' },
};

const DoctorPatients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockPatients.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.umid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: 'Total Patients', value: mockPatients.length, icon: FiUsers, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Active', value: mockPatients.filter(p => p.status === 'active').length, icon: FiActivity, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Critical', value: mockPatients.filter(p => p.status === 'critical').length, icon: FiActivity, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Follow-up', value: mockPatients.filter(p => p.status === 'follow-up').length, icon: FiCalendar, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <DoctorDashboardLayout pageTitle="My Patients">
      <Helmet><title>Patients | Doctor Dashboard - Medicare</title></Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} variants={fadeUp} custom={i}
                className="rounded-2xl p-4 sm:p-5" style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="rounded-xl flex items-center justify-center" style={{ width: 42, height: 42, background: s.bg }}>
                    <Icon style={{ color: s.color, fontSize: '1.15rem' }} />
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>{s.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8', fontSize: '0.9rem' }} />
              <input type="text" placeholder="Search by name or UMID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border-0 text-sm" style={{ background: '#f1f5f9', width: 260, fontSize: '0.85rem', fontWeight: 500 }} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: '#f1f5f9' }}>
              <FiFilter style={{ color: '#64748b', fontSize: '0.85rem' }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent border-0 text-sm" style={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                <option value="all">All Status</option><option value="active">Active</option><option value="critical">Critical</option><option value="follow-up">Follow-up</option>
              </select>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <FiPlus style={{ fontSize: '0.9rem' }} /> Add Patient
          </button>
        </div>

        {/* Patient Table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5" style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf5' }}>
            {['Patient', 'UMID', 'Condition', 'Last Visit', 'Status', ''].map((h, i) => (
              <div key={h} className={`${i === 0 ? 'col-span-3' : i === 5 ? 'col-span-1' : 'col-span-2'}`}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 px-6">
              <FiUsers style={{ fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 700, color: '#334155', fontSize: '1.05rem' }}>No patients found</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((patient, i) => {
              const sc = statusStyles[patient.status];
              return (
                <motion.div key={patient.id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Patient Name */}
                  <div className="lg:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${(i * 60) % 360}, 70%, 95%)` }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: `hsl(${(i * 60) % 360}, 60%, 40%)` }}>{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{patient.name}</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>{patient.age}y • {patient.gender}</p>
                    </div>
                  </div>
                  {/* UMID */}
                  <p className="lg:col-span-2" style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', fontFamily: 'monospace' }}>{patient.umid}</p>
                  {/* Condition */}
                  <p className="lg:col-span-2" style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{patient.condition}</p>
                  {/* Last Visit */}
                  <p className="lg:col-span-2" style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>{new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  {/* Status */}
                  <div className="lg:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontSize: '0.72rem', fontWeight: 600 }}>{sc.label}</span>
                  </div>
                  {/* Action */}
                  <div className="lg:col-span-1 flex justify-end">
                    <button className="p-2 rounded-lg transition-colors" style={{ background: '#f8fafc' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                      <FiChevronRight style={{ color: '#94a3b8', fontSize: '1rem' }} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        <div style={{ height: '2rem' }} />
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorPatients;
