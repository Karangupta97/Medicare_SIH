import React, { useState } from 'react';
import DoctorDashboardLayout from '../../components/Doctor/DoctorDashboardLayout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiFileText, FiSearch, FiFilter, FiDownload, FiEye,
  FiCalendar, FiUser, FiClipboard, FiFolder,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

const mockRecords = [
  { id: 1, patient: 'Rahul Sharma', type: 'Lab Report', title: 'Complete Blood Count', date: '2026-03-20', category: 'lab' },
  { id: 2, patient: 'Priya Patel', type: 'Prescription', title: 'Diabetes Medication', date: '2026-03-19', category: 'prescription' },
  { id: 3, patient: 'Amit Kumar', type: 'Imaging', title: 'Chest X-Ray Report', date: '2026-03-18', category: 'imaging' },
  { id: 4, patient: 'Sneha Gupta', type: 'Lab Report', title: 'Thyroid Function Test', date: '2026-03-17', category: 'lab' },
  { id: 5, patient: 'Vikram Singh', type: 'Clinical Note', title: 'Follow-up Consultation', date: '2026-03-16', category: 'clinical' },
  { id: 6, patient: 'Meera Joshi', type: 'Prescription', title: 'Allergy Medication', date: '2026-03-15', category: 'prescription' },
  { id: 7, patient: 'Rahul Sharma', type: 'Imaging', title: 'ECG Report', date: '2026-03-14', category: 'imaging' },
  { id: 8, patient: 'Priya Patel', type: 'Lab Report', title: 'HbA1c Test', date: '2026-03-13', category: 'lab' },
];

const catStyles = {
  lab: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6', icon: FiClipboard },
  prescription: { bg: 'rgba(14,165,233,0.1)', text: '#0ea5e9', icon: FiFileText },
  imaging: { bg: 'rgba(249,115,22,0.1)', text: '#f97316', icon: FiFolder },
  clinical: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', icon: FiFileText },
};

const DoctorMedicalRecords = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = mockRecords.filter(r => {
    const matchSearch = !searchQuery || r.patient.toLowerCase().includes(searchQuery.toLowerCase()) || r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = catFilter === 'all' || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const stats = [
    { label: 'Total Records', value: mockRecords.length, icon: FiFileText, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Lab Reports', value: mockRecords.filter(r => r.category === 'lab').length, icon: FiClipboard, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Prescriptions', value: mockRecords.filter(r => r.category === 'prescription').length, icon: FiFileText, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Imaging', value: mockRecords.filter(r => r.category === 'imaging').length, icon: FiFolder, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  ];

  return (
    <DoctorDashboardLayout pageTitle="Medical Records">
      <Helmet><title>Medical Records | Doctor Dashboard - Medicare</title></Helmet>

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
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8', fontSize: '0.9rem' }} />
              <input type="text" placeholder="Search records..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border-0 text-sm" style={{ background: '#f1f5f9', width: 240, fontSize: '0.85rem', fontWeight: 500 }} />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: '#f1f5f9' }}>
              <FiFilter style={{ color: '#64748b', fontSize: '0.85rem' }} />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-transparent border-0 text-sm" style={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                <option value="all">All Types</option><option value="lab">Lab Reports</option><option value="prescription">Prescriptions</option><option value="imaging">Imaging</option><option value="clinical">Clinical Notes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Grid */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <FiFileText style={{ fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 700, color: '#334155' }}>No records found</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map((record, i) => {
              const cs = catStyles[record.category];
              const Icon = cs.icon;
              return (
                <motion.div key={record.id} variants={fadeUp} custom={i}
                  whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(15,23,42,0.1)' }}
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                  style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center justify-center rounded-xl" style={{ width: 42, height: 42, background: cs.bg }}>
                        <Icon style={{ color: cs.text, fontSize: '1.15rem' }} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: cs.bg, color: cs.text, fontSize: '0.72rem', fontWeight: 600 }}>{record.type}</span>
                    </div>
                    <h4 style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{record.title}</h4>
                    <div className="flex items-center gap-1.5 mb-3">
                      <FiUser style={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                      <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>{record.patient}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-4">
                      <FiCalendar style={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                        <FiEye style={{ fontSize: '0.8rem' }} /> View
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: cs.bg, color: cs.text, fontSize: '0.8rem', fontWeight: 600 }}>
                        <FiDownload style={{ fontSize: '0.8rem' }} /> Download
                      </button>
                    </div>
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

export default DoctorMedicalRecords;
