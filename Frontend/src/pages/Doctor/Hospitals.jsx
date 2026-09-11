import React from 'react';
import DoctorDashboardLayout from '../../components/Doctor/DoctorDashboardLayout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiMapPin, FiPhone, FiMail, FiGlobe, FiClock, FiUsers,
  FiChevronRight, FiStar, FiNavigation,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
};

const mockHospitals = [
  { id: 1, name: 'Medicare City Hospital', address: 'Sector 15, Gurugram, Haryana', phone: '+91 124 456 7890', email: 'admin@medicarecity.com', rating: 4.8, beds: 350, departments: ['Cardiology', 'Orthopedics', 'Neurology'], status: 'primary', timing: '24/7', distance: '2.3 km' },
  { id: 2, name: 'Apollo Health Center', address: 'MG Road, New Delhi', phone: '+91 11 2345 6789', email: 'info@apollohealth.com', rating: 4.6, beds: 500, departments: ['General Medicine', 'Pediatrics', 'Surgery'], status: 'affiliated', timing: '24/7', distance: '5.1 km' },
  { id: 3, name: 'Fortis Medical Institute', address: 'Vasant Kunj, New Delhi', phone: '+91 11 3456 7890', email: 'contact@fortismed.com', rating: 4.7, beds: 400, departments: ['ENT', 'Dermatology', 'Oncology'], status: 'affiliated', timing: '8AM - 10PM', distance: '8.4 km' },
  { id: 4, name: 'Max Super Speciality', address: 'Saket, New Delhi', phone: '+91 11 4567 8901', email: 'info@maxhealth.com', rating: 4.9, beds: 600, departments: ['Cardiology', 'Transplant', 'Oncology'], status: 'visiting', timing: '24/7', distance: '12.0 km' },
];

const statusStyles = {
  primary: { bg: 'rgba(99,102,241,0.1)', text: '#6366f1', border: 'rgba(99,102,241,0.2)', label: 'Primary' },
  affiliated: { bg: 'rgba(16,185,129,0.1)', text: '#10b981', border: 'rgba(16,185,129,0.2)', label: 'Affiliated' },
  visiting: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'Visiting' },
};

const DoctorHospitals = () => {
  const stats = [
    { label: 'Total Hospitals', value: mockHospitals.length, icon: FiMapPin, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Primary', value: mockHospitals.filter(h => h.status === 'primary').length, icon: FiStar, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Affiliated', value: mockHospitals.filter(h => h.status === 'affiliated').length, icon: FiMapPin, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Beds', value: mockHospitals.reduce((a, h) => a + h.beds, 0), icon: FiUsers, color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  ];

  return (
    <DoctorDashboardLayout pageTitle="Affiliated Hospitals">
      <Helmet><title>Hospitals | Doctor Dashboard - Medicare</title></Helmet>

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

        {/* Hospital Cards */}
        <motion.div initial="hidden" animate="visible" className="space-y-4">
          {mockHospitals.map((hospital, i) => {
            const sc = statusStyles[hospital.status];
            return (
              <motion.div key={hospital.id} variants={fadeUp} custom={i}
                whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(15,23,42,0.08)' }}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', boxShadow: '0 4px 16px rgba(15,23,42,0.2)' }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>{hospital.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{hospital.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <FiMapPin style={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                          <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>{hospital.address}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, fontSize: '0.72rem', fontWeight: 600 }}>{sc.label}</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>
                            <FiStar style={{ fontSize: '0.7rem' }} /> {hospital.rating}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                            <FiNavigation style={{ fontSize: '0.7rem' }} /> {hospital.distance}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all self-start"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
                      View Details <FiChevronRight style={{ fontSize: '0.85rem' }} />
                    </button>
                  </div>

                  {/* Contact & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        <FiPhone style={{ color: '#64748b', fontSize: '0.85rem' }} />
                      </div>
                      <span style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 500 }}>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        <FiClock style={{ color: '#64748b', fontSize: '0.85rem' }} />
                      </div>
                      <span style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 500 }}>{hospital.timing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        <FiUsers style={{ color: '#64748b', fontSize: '0.85rem' }} />
                      </div>
                      <span style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 500 }}>{hospital.beds} beds</span>
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hospital.departments.map(dept => (
                      <span key={dept} className="px-2.5 py-1 rounded-lg" style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #e8edf5' }}>{dept}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div style={{ height: '2rem' }} />
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorHospitals;
