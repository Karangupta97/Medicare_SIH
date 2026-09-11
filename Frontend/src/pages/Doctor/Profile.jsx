import React, { useState, useEffect } from 'react';
import { useDoctorStore } from '../../store/doctorStore';
import DoctorDashboardLayout from '../../components/Doctor/DoctorDashboardLayout';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiUser, FiMail, FiPhone, FiAward, FiBookOpen, FiBriefcase,
  FiMapPin, FiActivity, FiShield, FiClock, FiEdit3, FiCamera,
  FiCheckCircle, FiCalendar, FiHash,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] } }),
};

const DoctorProfile = () => {
  const { doctor, getDoctorProfile } = useDoctorStore();

  useEffect(() => { getDoctorProfile(); }, [getDoctorProfile]);

  const avatarUrl = doctor?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.fullName || 'Doctor')}&background=6366f1&color=fff&bold=true&size=256`;

  const infoSections = [
    {
      title: 'Personal Information',
      icon: FiUser,
      color: '#6366f1',
      items: [
        { label: 'Full Name', value: doctor?.fullName, icon: FiUser },
        { label: 'Email Address', value: doctor?.email, icon: FiMail },
        { label: 'Phone Number', value: doctor?.phone, icon: FiPhone },
      ],
    },
    {
      title: 'Professional Details',
      icon: FiAward,
      color: '#0ea5e9',
      items: [
        { label: 'Doctor ID', value: doctor?.doctorId, icon: FiHash },
        { label: 'Specialization', value: doctor?.specialization, icon: FiActivity },
        { label: 'Experience', value: doctor?.experience ? `${doctor.experience} years` : null, icon: FiClock },
        { label: 'Registration No.', value: doctor?.medicalRegistrationNumber, icon: FiBookOpen },
        { label: 'Medical Council', value: doctor?.councilName, icon: FiBriefcase },
        { label: 'State', value: doctor?.state, icon: FiMapPin },
      ],
    },
    {
      title: 'Account Details',
      icon: FiShield,
      color: '#10b981',
      items: [
        { label: 'Member Since', value: doctor?.createdAt ? new Date(doctor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null, icon: FiCalendar },
        { label: 'Last Login', value: doctor?.lastLogin ? new Date(doctor.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null, icon: FiClock },
      ],
    },
  ];

  return (
    <DoctorDashboardLayout pageTitle="Profile Settings">
      <Helmet>
        <title>Profile | Doctor Dashboard - Medicare</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #252A61 75%, #1e3a5f 100%)' }}
        >
          <div className="absolute pointer-events-none" style={{ top: '-30%', right: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="absolute pointer-events-none" style={{ bottom: '-20%', left: '-5%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 lg:p-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="rounded-2xl overflow-hidden" style={{ width: 120, height: 120, border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                <img src={avatarUrl} alt={doctor?.fullName} className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
                <FiCamera style={{ color: '#fff', fontSize: '0.9rem' }} />
              </button>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Dr. {doctor?.fullName || 'Doctor'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>
                {doctor?.specialization || 'General Physician'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                {doctor?.doctorId && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <FiAward style={{ color: '#facc15', fontSize: '0.8rem' }} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>ID: {doctor.doctorId}</span>
                  </div>
                )}
                {doctor?.medicalRegistrationNumber && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <FiBookOpen style={{ color: '#67e8f9', fontSize: '0.8rem' }} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600 }}>Reg: {doctor.medicalRegistrationNumber}</span>
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <FiCheckCircle style={{ color: '#34d399', fontSize: '0.8rem' }} />
                  <span style={{ color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 600 }}>Verified</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <FiEdit3 style={{ fontSize: '0.9rem' }} />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Info Sections */}
        {infoSections.map((section, si) => (
          <motion.div key={section.title} variants={fadeUp} initial="hidden" animate="visible" custom={si + 1}
            className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1.5px solid #e8edf5', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
            <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: `${section.color}15` }}>
                <section.icon style={{ color: section.color, fontSize: '1.05rem' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{section.title}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}
                    className="flex items-start gap-3 p-5"
                    style={{ borderBottom: '1px solid #f8fafc', borderRight: '1px solid #f8fafc' }}>
                    <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 36, height: 36, background: '#f1f5f9' }}>
                      <Icon style={{ color: '#64748b', fontSize: '0.95rem' }} />
                    </div>
                    <div className="min-w-0">
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</p>
                      <p className="truncate" style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600, marginTop: '0.15rem' }}>
                        {item.value || 'N/A'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        <div style={{ height: '2rem' }} />
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorProfile;
