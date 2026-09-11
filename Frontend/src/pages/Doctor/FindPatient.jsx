import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiClipboard, FiFileText, FiFile, FiEye, FiUser, FiAlertCircle, FiCalendar, FiPhone, FiMail, FiMapPin, FiFilter, FiPlus, FiX, FiInfo, FiTrash2, FiChevronRight, FiChevronUp, FiChevronDown, FiClock, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import handlogo from "../../assets/Logo/logo.png";
import axios from "axios";
import DoctorDashboardLayout from "../../components/Doctor/DoctorDashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import DigitalPrescription from "../../components/Hospital/DigitalPrescription";
import { useDoctorStore } from "../../store/doctorStore";

// ─── Utility ─────────────────────────────────────────────────────────────────
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// ─── Patient Info ────────────────────────────────────────────────────────────
const PatientInfo = ({ patient, setPrescriptions, reports, setReports }) => {
  const [imgError, setImgError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [showAllergies, setShowAllergies] = useState(false);

  useEffect(() => {
    if (patient?.photoURL) {
      setImgError(false);
      setImgSrc(patient.photoURL.includes('?') ? patient.photoURL : `${patient.photoURL}?t=${Date.now()}`);
    } else {
      setImgSrc(null);
    }
  }, [patient?.photoURL]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6">
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-indigo-50/30"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 rounded-bl-full opacity-20 transform -rotate-12"></div>
        <div className="relative pt-8 px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-1 shadow-xl">
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                  {imgSrc && !imgError ? (
                    <img src={imgSrc} alt={`${patient.name} ${patient.lastname}`} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                  ) : (
                    <FiUser className="w-12 h-12 text-blue-600" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{patient.name} {patient.lastname}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>UMID: {patient.umid}
                  </span>
                  {patient.bloodType && (
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">Blood: {patient.bloodType}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <DigitalPrescription patient={patient} onPrescriptionSaved={(prescription) => {
                const newReport = { _id: prescription._id, category: 'prescription', originalFilename: `Prescription - ${new Date().toLocaleDateString()}`, description: prescription.diagnosis || 'Digital Prescription', doctor: prescription.doctor || 'Current Doctor', createdAt: prescription.createdAt, fileUrl: `/apidigital-prescriptions/${prescription._id}` };
                setReports([newReport, ...reports]);
                setPrescriptions(prev => [prescription, ...prev]);
                toast.success("Prescription saved successfully");
              }} customTrigger={
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                  <FiPlus className="w-4 h-4" /><span>Write Prescription</span>
                </button>
              } />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-6">
        {[
          { icon: FiCalendar, label: 'Date of Birth', value: patient.dob || 'Not provided', extra: patient.dob ? `${calculateAge(patient.dob)} years old` : null },
          { icon: FiPhone, label: 'Phone Number', value: patient.phone || 'Not provided' },
          { icon: FiMail, label: 'Email', value: patient.email || 'Not provided' },
          { icon: FiMapPin, label: 'Address', value: patient.address ? `${patient.address}${patient.city ? `, ${patient.city}` : ''}` : 'Not provided' },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg flex items-start gap-3 transition-all duration-200 hover:shadow-md">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className="font-medium text-gray-900 break-all">{item.value}</p>
              {item.extra && <p className="text-xs text-gray-500 mt-1">{item.extra}</p>}
            </div>
          </div>
        ))}
      </div>
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-linear-to-r from-red-50 to-rose-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-red-800 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-red-600" /> Allergies
              </h3>
              <button onClick={() => setShowAllergies(!showAllergies)} className="text-red-700 hover:text-red-900">
                {showAllergies ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
              </button>
            </div>
            {(showAllergies || patient.allergies.length < 5) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {patient.allergies.map((allergy, index) => (
                  <span key={index} className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">{allergy}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Report Card ─────────────────────────────────────────────────────────────
const ReportCard = ({ report, onView, onRefreshUrl }) => {
  const [isUrlExpired, setIsUrlExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getCategoryInfo = (category) => {
    const map = {
      medical: { icon: <FiFileText className="w-6 h-6 text-green-600" />, badge: 'bg-green-100 text-green-800', hover: 'group-hover:bg-green-100/50' },
      lab: { icon: <FiClipboard className="w-6 h-6 text-purple-600" />, badge: 'bg-purple-100 text-purple-800', hover: 'group-hover:bg-purple-100/50' },
      prescription: { icon: <FiFile className="w-6 h-6 text-blue-600" />, badge: 'bg-blue-100 text-blue-800', hover: 'group-hover:bg-blue-100/50' },
    };
    return map[category] || { icon: <FiFile className="w-6 h-6 text-gray-600" />, badge: 'bg-gray-100 text-gray-800', hover: 'group-hover:bg-gray-100/80' };
  };

  const formatDate = (d) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
  const categoryInfo = getCategoryInfo(report.category);

  const handleRefreshUrl = async (silent = false) => {
    setIsRefreshing(true);
    try {
      const refreshedUrl = await onRefreshUrl(report._id, silent);
      if (refreshedUrl) { report.fileUrl = refreshedUrl; setIsUrlExpired(false); if (!silent) toast.success("URL refreshed"); }
    } catch { if (!silent) toast.error("Failed to refresh URL"); }
    finally { setIsRefreshing(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 ${isHovered ? 'transform scale-[1.02] shadow-md' : ''}`}
      onClick={() => { onView(report); if (!isUrlExpired && report.fileUrl) window.open(report.fileUrl, '_blank'); }}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">{categoryInfo.icon}</div>
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.badge}`}>{report.category?.charAt(0).toUpperCase() + report.category?.slice(1)}</span>
          {report.createdAt && <p className="text-xs text-gray-500 mt-0.5">{formatDate(report.createdAt)}</p>}
        </div>
      </div>
      <div className={`p-4 transition-colors duration-300 ${categoryInfo.hover}`}>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{report.originalFilename || 'Unnamed File'}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description || 'No description'}</p>
        {report.doctor && <div className="flex items-center mb-4"><FiUser className="w-3 h-3 text-blue-600 mr-2" /><span className="text-sm text-gray-700">Dr. {report.doctor}</span></div>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <button className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50"><FiEye className="w-4 h-4" /> View</button>
          {isUrlExpired ? (
            <button onClick={(e) => { e.stopPropagation(); handleRefreshUrl(false); }} disabled={isRefreshing} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100">
              {isRefreshing ? 'Refreshing...' : 'Refresh URL'}
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); window.open(report.fileUrl, '_blank'); }} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium hover:bg-white"><FiDownload className="w-4 h-4" /> Download</button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Prescription Card ───────────────────────────────────────────────────────
const PrescriptionCard = ({ prescription }) => {
  const [showAllMeds, setShowAllMeds] = useState(false);
  const formatDate = (d) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border bg-blue-50 border-blue-100 transition-all duration-300 hover:shadow-lg group">
      <div className="flex items-center p-4 border-b border-blue-100">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3"><FiFileText className="w-6 h-6 text-blue-600" /></div>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Digital Prescription</span>
          {prescription.createdAt && <p className="text-xs text-gray-500 mt-0.5">{formatDate(prescription.createdAt)}</p>}
        </div>
      </div>
      <div className="p-4 group-hover:bg-blue-100/50 transition-colors">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{prescription.diagnosis || 'Medical Prescription'}</h3>
        {prescription.medications?.length > 0 && (
          <ul className="text-sm text-gray-600 pl-5 list-disc mb-3">
            {prescription.medications.slice(0, showAllMeds ? prescription.medications.length : 3).map((med, idx) => (
              <li key={idx}><span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency}</li>
            ))}
          </ul>
        )}
        {prescription.medications?.length > 3 && (
          <button onClick={() => setShowAllMeds(!showAllMeds)} className="text-xs text-blue-600 hover:text-blue-800 ml-5">
            {showAllMeds ? 'Show less' : `Show all ${prescription.medications.length} medications`}
          </button>
        )}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100">
          <button onClick={() => window.location.href = `/digital-prescriptions/${prescription._id}`} className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium bg-white border border-gray-200 shadow-sm hover:bg-gray-50">
            <FiEye className="w-4 h-4" /> View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DoctorFindPatient = () => {
  const { doctor } = useDoctorStore();
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('doctorLastPatientSearch') || "");
  const [isSearching, setIsSearching] = useState(false);
  const [patient, setPatient] = useState(() => { const s = localStorage.getItem('doctorCurrentPatient'); return s ? JSON.parse(s) : null; });
  const [reports, setReports] = useState(() => { const s = localStorage.getItem('doctorCurrentPatientReports'); return s ? JSON.parse(s) : []; });
  const [prescriptions, setPrescriptions] = useState(() => { const s = localStorage.getItem('doctorCurrentPatientPrescriptions'); return s ? JSON.parse(s) : []; });
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('reports');
  const [recentSearches, setRecentSearches] = useState(() => { const s = localStorage.getItem('doctorRecentPatientSearches'); return s ? JSON.parse(s) : []; });
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(9);
  const [reportFilter, setReportFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateFilter, setDateFilter] = useState('all');
  const abortControllerRef = useRef(null);
  const patientCache = useRef(new Map());
  const reportCache = useRef(new Map());

  const isValidUMID = (umid) => /^[A-Z]{2}\d{5}[A-Z]{2}$/.test(umid);

  // Persist data
  useEffect(() => { if (recentSearches.length > 0) localStorage.setItem('doctorRecentPatientSearches', JSON.stringify(recentSearches)); }, [recentSearches]);
  useEffect(() => { if (patient) { localStorage.setItem('doctorCurrentPatient', JSON.stringify(patient)); localStorage.setItem('doctorLastPatientSearch', searchQuery); } }, [patient, searchQuery]);

  // Auto-refresh on mount
  useEffect(() => {
    if (patient?._id) fetchReportsAndPrescriptions(patient._id, true);
  }, [patient?._id]);

  const fetchReportsAndPrescriptions = async (patientId, forceRefresh = false) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    if (forceRefresh) setIsRefreshing(true);

    try {
      setIsLoadingReports(true);
      setIsLoadingPrescriptions(true);

      // Use doctor API endpoints (same as hospital for now)
      const reportsRes = await axios.get(`/api/hospital/patient/${patientId}/reports`, { signal });
      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports || []);
        localStorage.setItem('doctorCurrentPatientReports', JSON.stringify(reportsRes.data.reports || []));
        reportCache.current.set(patientId, reportsRes.data.reports || []);
      }
      setIsLoadingReports(false);

      const prescRes = await axios.get(`/api/hospital/digital-prescriptions/patient/${patientId}`, { signal });
      if (prescRes.data.success) {
        setPrescriptions(prescRes.data.prescriptions || []);
        localStorage.setItem('doctorCurrentPatientPrescriptions', JSON.stringify(prescRes.data.prescriptions || []));
      }
      setIsLoadingPrescriptions(false);
    } catch (err) {
      if (!axios.isCancel(err)) { toast.error("Failed to load patient data"); setReports([]); setPrescriptions([]); }
    } finally { setIsLoadingReports(false); setIsLoadingPrescriptions(false); setIsRefreshing(false); }
  };

  const refreshPatientData = async () => {
    if (!patient?._id) return;
    const tid = toast.loading("Refreshing...");
    try { await fetchReportsAndPrescriptions(patient._id, true); toast.success("Refreshed!", { id: tid }); }
    catch { toast.error("Failed to refresh", { id: tid }); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) { toast.error("Please enter a valid UMID"); return; }
    if (!isValidUMID(trimmed)) { toast.error("Invalid UMID format. Format: AB12345XY"); setError("Invalid UMID format"); return; }
    
    setIsSearching(true); setError(null); setPatient(null); setReports([]); setPrescriptions([]);
    try {
      const res = await axios.get(`/api/hospital/patient/${trimmed}`);
      if (res.data.success) {
        const p = res.data.patient;
        setPatient(p);
        patientCache.current.set(trimmed, p);
        if (!recentSearches.some(s => s.umid === trimmed)) {
          setRecentSearches([{ umid: trimmed, name: `${p.name} ${p.lastname}`, timestamp: new Date().toISOString() }, ...recentSearches].slice(0, 5));
        }
        await fetchReportsAndPrescriptions(p._id);
        toast.success(`Found: ${p.name} ${p.lastname}`);
      }
    } catch (err) { setError(err.response?.data?.message || "Patient not found"); toast.error(err.response?.data?.message || "Patient not found"); }
    finally { setIsSearching(false); setCurrentPage(1); setReportFilter(''); setSortOrder('newest'); setDateFilter('all'); }
  };

  const handleRefreshReportUrl = async (reportId, silent = false) => {
    try {
      const res = await axios.get(`/api/hospital/reports/${reportId}/refresh-url`);
      if (res.data.success) {
        const updated = reports.map(r => r._id === reportId ? { ...r, fileUrl: res.data.fileUrl } : r);
        setReports(updated);
        localStorage.setItem('doctorCurrentPatientReports', JSON.stringify(updated));
        if (!silent) toast.success("URL refreshed");
        return res.data.fileUrl;
      }
    } catch { if (!silent) toast.error("Failed to refresh URL"); return null; }
  };

  // Filtering & pagination
  const getFilteredReports = () => {
    let filtered = [...reports];
    if (reportFilter) filtered = filtered.filter(r => r.category === reportFilter);
    if (dateFilter !== 'all') {
      const now = new Date(); const fd = new Date();
      if (dateFilter === 'last-month') fd.setMonth(now.getMonth() - 1);
      else if (dateFilter === 'last-year') fd.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter(r => new Date(r.createdAt) >= fd);
    }
    filtered.sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt));
    return filtered;
  };
  const filteredReports = getFilteredReports();
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const currentReports = filteredReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);

  const handleUMIDInput = (e) => { let v = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); setSearchQuery(v.substring(0, 9)); };

  return (
    <DoctorDashboardLayout pageTitle="Find Patient">
      <div className="max-w-[1600px] mx-auto">
        {/* Refresh indicator */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-5 right-5 z-50 bg-white rounded-lg shadow-lg border border-blue-100 p-3 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Refreshing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Patient Lookup</h1>
            <p className="text-gray-500">Find and access patient medical records using their UMID</p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="p-6 pb-4 relative">
            <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-indigo-50/30"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FiSearch className="w-5 h-5 text-white" />
                </div>
                Find Patient by UMID
              </h2>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="text" className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 shadow-sm" placeholder="Enter patient UMID (e.g., AB12345XY)" value={searchQuery} onChange={handleUMIDInput} maxLength={9} />
                  {searchQuery && <button type="button" onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><FiX className="h-5 w-5" /></button>}
                </div>
                <button type="submit" disabled={isSearching} className={`px-6 py-3.5 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all ${isSearching ? 'bg-blue-400 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}>
                  {isSearching ? <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Searching...</> : <><FiSearch className="w-4 h-4" />Search Patient</>}
                </button>
              </form>
              <div className="mt-3 flex items-center">
                <FiInfo className="h-3 w-3 text-blue-600 mr-2" />
                <p className="text-xs text-gray-500">Format: AB12345XY (2 letters + 5 digits + 2 letters)</p>
              </div>
            </div>
          </div>
          {recentSearches.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><FiClock className="w-4 h-4" /> Recent Searches</h3>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem('doctorRecentPatientSearches'); toast.success("History cleared"); }} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"><FiTrash2 className="w-3 h-3" /> Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s, i) => (
                  <button key={i} onClick={() => { setSearchQuery(s.umid); handleSearch({ preventDefault: () => {} }); }} className="group relative inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-50 shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-1.5"><FiUser className="w-3 h-3 text-white" /></div>
                    <span className="truncate max-w-[150px] font-medium">{s.name}</span>
                    <span className="text-xs text-gray-500 ml-1.5 hidden sm:inline">({s.umid})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div><h3 className="font-medium text-red-800">Patient not found</h3><p className="text-red-700 text-sm mt-1">{error}</p></div>
          </motion.div>
        )}

        {/* Patient Info */}
        {patient && <PatientInfo patient={patient} setPrescriptions={setPrescriptions} reports={reports} setReports={setReports} />}

        {/* Reports & Prescriptions */}
        {patient && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
            <div className="flex border-b border-gray-200 mb-6">
              {['reports', 'prescriptions'].map(section => (
                <button key={section} onClick={() => setActiveSection(section)} className={`px-6 py-3 font-medium text-sm relative ${activeSection === section ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <span className="flex items-center gap-2">
                    {section === 'reports' ? <FiFileText className="w-4 h-4" /> : <FiClipboard className="w-4 h-4" />}
                    {section === 'reports' ? 'Medical Reports' : 'Digital Prescriptions'}
                    {(section === 'reports' ? filteredReports.length : prescriptions.length) > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{section === 'reports' ? filteredReports.length : prescriptions.length}</span>
                    )}
                  </span>
                  {activeSection === section && <motion.div layoutId="doctorTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              ))}
              <div className="ml-auto flex items-center">
                <button onClick={refreshPatientData} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            {activeSection === 'reports' && reports.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-6">
                <select value={reportFilter} onChange={e => { setReportFilter(e.target.value); setCurrentPage(1); }} className="text-sm rounded-lg border-gray-200 py-2 px-3 bg-white shadow-sm">
                  <option value="">All Categories</option>
                  <option value="medical">Medical</option><option value="lab">Lab Results</option><option value="prescription">Prescriptions</option>
                </select>
                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }} className="text-sm rounded-lg border-gray-200 py-2 px-3 bg-white shadow-sm">
                  <option value="all">All Time</option><option value="last-month">Last Month</option><option value="last-year">Last Year</option>
                </select>
                <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }} className="text-sm rounded-lg border-gray-200 py-2 px-3 bg-white shadow-sm">
                  <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
                </select>
              </div>
            )}

            {/* Loading */}
            {((isLoadingReports && activeSection === 'reports') || (isLoadingPrescriptions && activeSection === 'prescriptions')) && (
              <div className="flex justify-center my-12"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
            )}

            {/* Content */}
            {!isLoadingReports && !isLoadingPrescriptions && (
              (activeSection === 'reports' && filteredReports.length === 0) || (activeSection === 'prescriptions' && prescriptions.length === 0)
            ) ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                <FiClipboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{activeSection === 'reports' ? 'No Reports Found' : 'No Prescriptions Found'}</h3>
                <p className="text-gray-500">No {activeSection} available for this patient.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSection === 'reports' && !isLoadingReports && currentReports.map(r => <ReportCard key={r._id} report={r} onView={() => {}} onRefreshUrl={handleRefreshReportUrl} />)}
                {activeSection === 'prescriptions' && !isLoadingPrescriptions && prescriptions.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
              </div>
            )}

            {/* Pagination */}
            {activeSection === 'reports' && totalPages > 1 && (
              <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>Previous</button>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>Next</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!patient && !error && !isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 rounded-xl p-10 text-center border border-gray-100 mt-10">
            <img src={handlogo} alt="Medicare Logo" className="w-20 h-20 mx-auto mb-6 opacity-80" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Search for a Patient</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Enter a patient's UMID in the search box above to access their medical records and reports.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 w-full">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><FiUser className="w-5 h-5 text-blue-600" /></div>
                <div className="text-left"><h4 className="font-medium text-gray-900">Patient Records</h4><p className="text-sm text-gray-500">Access medical history</p></div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 w-full">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><FiFileText className="w-5 h-5 text-green-600" /></div>
                <div className="text-left"><h4 className="font-medium text-gray-900">Medical Reports</h4><p className="text-sm text-gray-500">View test results & notes</p></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorFindPatient;
