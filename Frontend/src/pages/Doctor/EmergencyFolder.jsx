import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiUser,
  FiX,
  FiInfo,
  FiAlertCircle,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiFile,
  FiClipboard,
  FiEye,
  FiDownload,
  FiShield,
  FiHeart,
  FiActivity,
  FiClock,
  FiAlertTriangle,
  FiLock,
  FiUnlock,
  FiChevronRight,
} from "react-icons/fi";
import DoctorDashboardLayout from "../../components/Doctor/DoctorDashboardLayout";
import { useDoctorStore } from "../../store/doctorStore";

// ─── Utility ─────────────────────────────────────────────────────────────────
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatDate = (d) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(d))
    : "—";

// ─── Report Card ─────────────────────────────────────────────────────────────
const EmergencyReportCard = ({ report }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryInfo = (category) => {
    const map = {
      medical: {
        icon: <FiFileText className="w-6 h-6 text-red-500" />,
        badge: "bg-red-100 text-red-800",
        glow: "group-hover:shadow-red-200/50",
      },
      lab: {
        icon: <FiClipboard className="w-6 h-6 text-amber-600" />,
        badge: "bg-amber-100 text-amber-800",
        glow: "group-hover:shadow-amber-200/50",
      },
      prescription: {
        icon: <FiFile className="w-6 h-6 text-blue-600" />,
        badge: "bg-blue-100 text-blue-800",
        glow: "group-hover:shadow-blue-200/50",
      },
    };
    return (
      map[category] || {
        icon: <FiFile className="w-6 h-6 text-gray-600" />,
        badge: "bg-gray-100 text-gray-800",
        glow: "",
      }
    );
  };

  const categoryInfo = getCategoryInfo(report.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group ${
        isHovered
          ? "border-red-200 shadow-lg shadow-red-100/40 scale-[1.01]"
          : "border-gray-200 shadow-sm"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Emergency Badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
          <FiShield className="w-2.5 h-2.5" />
          Emergency
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100 bg-gradient-to-r from-red-50/30 to-white">
        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 mr-3">
          {categoryInfo.icon}
        </div>
        <div className="flex-1 min-w-0 mr-16">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${categoryInfo.badge}`}
          >
            {report.category?.charAt(0).toUpperCase() +
              report.category?.slice(1)}
          </span>
          {report.createdAt && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {formatDate(report.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-base text-gray-900 mb-1.5 line-clamp-2 leading-snug">
          {report.originalFilename || "Untitled Report"}
        </h3>
        {report.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {report.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {report.fileUrl ? (
            <>
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold bg-red-600 text-white shadow-md shadow-red-600/25 hover:bg-red-700 active:bg-red-800 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <FiEye className="w-4 h-4" /> View Document
              </a>
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload className="w-4 h-4 text-gray-600" />
              </a>
            </>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-500">
              <FiLock className="w-4 h-4" /> Unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DoctorEmergencyFolder = () => {
  const { doctor } = useDoctorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const pendingUmidRef = useRef(null);

  const rawApiUrl = import.meta.env.VITE_API_URL;
  const API_URL =
    rawApiUrl && rawApiUrl !== "undefined"
      ? rawApiUrl
      : "https://medicare-backend-vl01.onrender.com";

  const isValidUMID = (umid) => /^[A-Z]{2}\d{5}[A-Z]{2}$/.test(umid);

  const handleUMIDInput = (e) => {
    let v = e.target.value
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "");
    setSearchQuery(v.substring(0, 9));
  };

  const fetchEmergencyFolder = useCallback(
    async (umid) => {
      setIsSearching(true);
      setError(null);
      setEmergencyData(null);
      try {
        const res = await axios.get(
          `${API_URL}/api/doctor/emergency/${umid}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          setEmergencyData(res.data.data);
          toast.success(
            `Emergency folder loaded for ${res.data.data.patient.name} ${res.data.data.patient.lastname}`
          );
        }
      } catch (err) {
        const msg =
          err.response?.data?.message || "Failed to access emergency folder";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsSearching(false);
      }
    },
    [API_URL]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      toast.error("Please enter a valid UMID");
      return;
    }
    if (!isValidUMID(trimmed)) {
      toast.error("Invalid UMID format. Format: AB12345XY");
      setError("Invalid UMID format. Expected: AB12345XY");
      return;
    }
    pendingUmidRef.current = trimmed;
    setShowConfirmModal(true);
  };

  const confirmEmergencyAccess = () => {
    setShowConfirmModal(false);
    setConfirmed(true);
    if (pendingUmidRef.current) {
      fetchEmergencyFolder(pendingUmidRef.current);
    }
  };

  const cancelAccess = () => {
    setShowConfirmModal(false);
    pendingUmidRef.current = null;
  };

  const patient = emergencyData?.patient;
  const medical = emergencyData?.medical;
  const reports = emergencyData?.reports || [];
  const accessInfo = emergencyData?.accessInfo;

  const bloodGroup = patient?.bloodGroup?.trim() || null;
  const patientName = [patient?.name, patient?.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const age = calculateAge(patient?.dob);

  return (
    <DoctorDashboardLayout pageTitle="Emergency Folder Access">
      <div className="max-w-[1600px] mx-auto">
        {/* ── Emergency Confirmation Modal ── */}
        <AnimatePresence>
          {showConfirmModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100]"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                }}
                onClick={cancelAccess}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-0 z-[101] flex items-center justify-center px-4"
              >
                <div
                  className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: "white" }}
                >
                  {/* Modal Header */}
                  <div
                    className="p-6 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc2626, #b91c1c)",
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                      <FiAlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Emergency Access Confirmation
                    </h2>
                    <p className="text-red-100 text-sm">
                      This action will be logged and audited
                    </p>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        You are about to access the private{" "}
                        <strong>Emergency Folder</strong> of patient with UMID{" "}
                        <span className="font-mono font-bold text-red-700">
                          {pendingUmidRef.current}
                        </span>
                        .
                      </p>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        This access is{" "}
                        <strong>only authorized for medical emergencies</strong>.
                        Your identity, access time, and actions will be recorded
                        for compliance.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Accessing Doctor
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Dr. {doctor?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {doctor?.doctorId || "N/A"} •{" "}
                        {new Date().toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelAccess}
                        className="flex-1 py-3 rounded-xl font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmEmergencyAccess}
                        className="flex-1 py-3 rounded-xl font-semibold text-white transition-all text-sm flex items-center justify-center gap-2"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626, #b91c1c)",
                          boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
                        }}
                      >
                        <FiUnlock className="w-4 h-4" />
                        Confirm Emergency Access
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
              }}
            >
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Emergency Folder Access
              </h1>
              <p className="text-gray-500">
                Access patient emergency data in critical situations. All access
                is logged and audited.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Privacy Notice ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl overflow-hidden border border-red-200/80"
          style={{
            background:
              "linear-gradient(135deg, #fef2f2, #fff1f2, #fef2f2)",
          }}
        >
          <div className="flex gap-4 p-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
              }}
            >
              <FiLock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Private Medical Records — Emergency Access Only
              </h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Patient medical reports are{" "}
                <strong className="text-gray-800">private by default</strong>.
                Only reports explicitly added to the{" "}
                <strong className="text-gray-800">Emergency Folder</strong> by
                the patient are visible here. All access is logged with your
                identity and timestamp.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden"
        >
          <div className="p-6 relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(254,226,226,0.3), rgba(255,255,255,0.5))",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
                  }}
                >
                  <FiSearch className="w-5 h-5 text-white" />
                </div>
                Search Patient by UMID
              </h2>
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 shadow-sm text-base font-mono tracking-wider"
                    placeholder="Enter patient UMID (e.g., AB12345XY)"
                    value={searchQuery}
                    onChange={handleUMIDInput}
                    maxLength={9}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3.5 rounded-xl font-semibold text-white shadow-md flex items-center justify-center gap-2 transition-all text-sm"
                  style={{
                    background: isSearching
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #dc2626, #b91c1c)",
                    boxShadow: isSearching
                      ? "none"
                      : "0 4px 16px rgba(220,38,38,0.3)",
                    cursor: isSearching ? "not-allowed" : "pointer",
                  }}
                >
                  {isSearching ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Accessing...
                    </>
                  ) : (
                    <>
                      <FiShield className="w-4 h-4" />
                      Emergency Access
                    </>
                  )}
                </button>
              </form>
              <div className="mt-3 flex items-center">
                <FiInfo className="h-3 w-3 text-red-500 mr-2" />
                <p className="text-xs text-gray-500">
                  Format: AB12345XY (2 letters + 5 digits + 2 letters). Only
                  emergency-marked reports will be shown.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Error ── */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-start gap-3"
          >
            <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Access Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* ── Emergency Data ── */}
        {emergencyData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Access Info Banner */}
            {accessInfo && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3">
                <FiClock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800">
                    Emergency Access Logged
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Accessed by Dr. {accessInfo.accessedBy} (ID:{" "}
                    {accessInfo.doctorId}) at{" "}
                    {new Date(accessInfo.accessedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Patient Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6">
              <div className="relative">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(254,226,226,0.3), rgba(255,255,255,0.8))",
                  }}
                />
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-100 rounded-bl-full opacity-20 transform -rotate-12" />
                <div className="relative pt-6 px-6 pb-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #dc2626, #b91c1c)",
                        boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
                      }}
                    >
                      <FiUser className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {patientName || "Unknown Patient"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full" />
                          UMID: {patient?.umid}
                        </span>
                        {bloodGroup && (
                          <span
                            className="text-sm font-bold px-4 py-1.5 rounded-full text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #dc2626, #b91c1c)",
                            }}
                          >
                            {bloodGroup}
                          </span>
                        )}
                        {patient?.gender && (
                          <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full capitalize">
                            {patient.gender}
                          </span>
                        )}
                        {age !== null && (
                          <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                            {age} years old
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-6 pb-6">
                {[
                  {
                    icon: FiCalendar,
                    label: "Date of Birth",
                    value: patient?.dob
                      ? formatDate(patient.dob)
                      : "Not available",
                    color: "#dc2626",
                    bg: "#fef2f2",
                  },
                  {
                    icon: FiPhone,
                    label: "Phone",
                    value: patient?.phone || "Not available",
                    color: "#059669",
                    bg: "#ecfdf5",
                  },
                  {
                    icon: FiHeart,
                    label: "Blood Group",
                    value: bloodGroup || "Not set",
                    color: "#e11d48",
                    bg: "#fff1f2",
                  },
                  {
                    icon: FiActivity,
                    label: "Chronic Conditions",
                    value:
                      medical?.chronicConditions?.length > 0
                        ? medical.chronicConditions.join(", ")
                        : "None listed",
                    color: "#7c3aed",
                    bg: "#f5f3ff",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl flex items-start gap-3 transition-all duration-200 hover:shadow-md border border-gray-100"
                    style={{ background: item.bg }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 font-medium mb-0.5">
                        {item.label}
                      </p>
                      <p className="font-semibold text-gray-900 text-sm leading-snug break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Allergies */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FiAlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Allergies
                    </h3>
                    <p className="text-xs text-gray-500">
                      Known allergic reactions
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  {medical?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {medical.allergies.map((a, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-900"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 font-medium">
                      No allergies listed
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <FiPhone className="w-4.5 h-4.5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Emergency Contact
                    </h3>
                    <p className="text-xs text-gray-500">
                      Primary emergency contact
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                        Name
                      </p>
                      <p className="text-base font-bold text-gray-900">
                        {medical?.emergencyContact?.trim() || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
                        Phone
                      </p>
                      {medical?.emergencyContactPhone ? (
                        <a
                          href={`tel:${medical.emergencyContactPhone.replace(/\s/g, "")}`}
                          className="text-base font-bold text-red-600 hover:text-red-700 flex items-center gap-2"
                        >
                          <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FiPhone className="w-4 h-4" />
                          </span>
                          {medical.emergencyContactPhone}
                        </a>
                      ) : (
                        <p className="text-base font-medium text-gray-400">
                          No number
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              {medical?.currentMedications && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FiFileText className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        Current Medications
                      </h3>
                      <p className="text-xs text-gray-500">
                        Active prescriptions
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-800 leading-relaxed">
                      {medical.currentMedications}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Reports Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc2626, #b91c1c)",
                      boxShadow: "0 4px 12px rgba(220,38,38,0.25)",
                    }}
                  >
                    <FiShield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Emergency Reports
                    </h2>
                    <p className="text-sm text-gray-500">
                      {reports.length === 0
                        ? "No reports shared in emergency folder"
                        : `${reports.length} ${
                            reports.length === 1 ? "document" : "documents"
                          } available`}
                    </p>
                  </div>
                </div>
              </div>

              {reports.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <FiLock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Emergency Reports
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    The patient has not added any reports to their Emergency
                    Folder. All medical reports remain private.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {reports.map((r) => (
                    <EmergencyReportCard key={r._id} report={r} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Empty State ── */}
        {!emergencyData && !error && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm mt-4"
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                border: "1px solid #fecaca",
              }}
            >
              <FiShield className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Emergency Folder Access
            </h3>
            <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">
              Enter a patient's UMID to access their emergency medical data.
              Only reports the patient has explicitly added to their Emergency
              Folder will be visible. All other medical reports remain{" "}
              <strong className="text-gray-700">private and inaccessible</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                {
                  icon: FiLock,
                  title: "Private by Default",
                  desc: "All patient reports are private",
                  color: "#dc2626",
                  bg: "#fef2f2",
                },
                {
                  icon: FiShield,
                  title: "Emergency Only",
                  desc: "Access only emergency-shared data",
                  color: "#ea580c",
                  bg: "#fff7ed",
                },
                {
                  icon: FiClock,
                  title: "Fully Audited",
                  desc: "Every access is logged & tracked",
                  color: "#7c3aed",
                  bg: "#f5f3ff",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-gray-100 text-left transition-all hover:shadow-md"
                  style={{ background: item.bg }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DoctorDashboardLayout>
  );
};

export default DoctorEmergencyFolder;
