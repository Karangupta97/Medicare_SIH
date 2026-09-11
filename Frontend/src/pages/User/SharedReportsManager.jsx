import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiClock,
  FiUser,
  FiFileText,
  FiXCircle,
  FiEye,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiCheck,
  FiRefreshCw,
  FiCalendar,
  FiActivity,
  FiLock,
  FiShare2,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";

/* ───────── constants ───────── */
const STATUS_CONFIG = {
  active: {
    bg: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))",
    border: "rgba(16,185,129,0.2)",
    color: "#059669",
    label: "Active",
    icon: FiCheck,
    dot: "#10b981",
  },
  revoked: {
    bg: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))",
    border: "rgba(239,68,68,0.2)",
    color: "#dc2626",
    label: "Revoked",
    icon: FiXCircle,
    dot: "#ef4444",
  },
  expired: {
    bg: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.04))",
    border: "rgba(245,158,11,0.2)",
    color: "#d97706",
    label: "Expired",
    icon: FiClock,
    dot: "#f59e0b",
  },
};

const FILTERS = ["all", "active", "revoked", "expired"];

/* ───────── animation variants ───────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.25 } },
};

/* ───────── helpers ───────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const getDuration = (dur) => {
  const map = { "24h": "24 Hours", "7d": "7 Days", "30d": "30 Days", indefinite: "No Expiry" };
  return map[dur] || dur || "—";
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  SharedReportsManager                                             */
/* ═══════════════════════════════════════════════════════════════════ */
const SharedReportsManager = () => {
  const { token, isAuthenticated } = useAuthStore();
  const { sharedReports, sharedReportsLoading, fetchMyShares, revokeShare, fetchShareAccessLog } =
    usePatientStore();
  const navigate = useNavigate();

  const [expandedShare, setExpandedShare] = useState(null);
  const [accessLogs, setAccessLogs] = useState({});
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedShareIds, setSelectedShareIds] = useState([]);
  const [bulkRevoking, setBulkRevoking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchMyShares(token);
  }, [isAuthenticated, token, fetchMyShares, navigate]);

  /* toggle expand + lazy-load access log */
  const handleToggleExpand = async (shareId) => {
    if (expandedShare === shareId) {
      setExpandedShare(null);
      return;
    }
    setExpandedShare(shareId);
    if (!accessLogs[shareId]) {
      const result = await fetchShareAccessLog(token, shareId);
      if (result?.success) setAccessLogs((p) => ({ ...p, [shareId]: result.accessLog }));
    }
  };

  const handleRevoke = async (shareId) => {
    setRevoking(true);
    try {
      await revokeShare(token, shareId);
      toast.success("Access revoked successfully");
      setRevokeConfirm(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke access");
    } finally {
      setRevoking(false);
    }
  };

  /* derived data */
  const counts = useMemo(
    () => ({
      all: sharedReports.length,
      active: sharedReports.filter((s) => s.status === "active").length,
      revoked: sharedReports.filter((s) => s.status === "revoked").length,
      expired: sharedReports.filter((s) => s.status === "expired").length,
    }),
    [sharedReports]
  );

  const filteredShares = useMemo(
    () => (filter === "all" ? sharedReports : sharedReports.filter((s) => s.status === filter)),
    [sharedReports, filter]
  );

  const filteredShareIds = useMemo(() => filteredShares.map((s) => s._id), [filteredShares]);
  const selectedActiveShareIds = useMemo(() => {
    if (selectedShareIds.length === 0) return [];
    const byId = new Map(sharedReports.map((s) => [s._id, s]));
    return selectedShareIds.filter((id) => byId.get(id)?.status === "active");
  }, [selectedShareIds, sharedReports]);

  const isAllFilteredSelected =
    filteredShareIds.length > 0 && filteredShareIds.every((id) => selectedShareIds.includes(id));

  const toggleShareSelection = (shareId) => {
    setSelectedShareIds((prev) => (prev.includes(shareId) ? prev.filter((id) => id !== shareId) : [...prev, shareId]));
  };

  const handleSelectAllInView = () => {
    setSelectedShareIds((prev) => {
      const prevSet = new Set(prev);
      const allSelected = filteredShareIds.every((id) => prevSet.has(id));
      if (allSelected) {
        filteredShareIds.forEach((id) => prevSet.delete(id));
      } else {
        filteredShareIds.forEach((id) => prevSet.add(id));
      }
      return Array.from(prevSet);
    });
  };

  const handleBulkRevoke = async () => {
    const idsToRevoke = selectedActiveShareIds;
    if (idsToRevoke.length === 0) {
      toast.error("Only Active shares can be revoked");
      return;
    }

    setBulkRevoking(true);
    try {
      let success = 0;
      let failed = 0;
      for (const shareId of idsToRevoke) {
        try {
          await revokeShare(token, shareId);
          success += 1;
        } catch (e) {
          failed += 1;
        }
      }

      if (success > 0) toast.success(`Revoked access for ${success} selected share(s).`);
      if (failed > 0) toast.error(`Failed to revoke ${failed} share(s).`);
    } finally {
      setBulkRevoking(false);
      setSelectedShareIds([]);
      setExpandedShare(null);
      setRevokeConfirm(null);
    }
  };

  useEffect(() => {
    if (selectedShareIds.length === 0) return;
    const valid = new Set(sharedReports.map((s) => s._id));
    setSelectedShareIds((prev) => {
      const filtered = prev.filter((id) => valid.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [sharedReports, selectedShareIds.length]);

  /* ─── render ─── */
  return (
    <div className="min-h-screen bg-slate-100 pb-10 sm:pb-14">
      <div className="mx-auto w-full max-w-lg px-4 pt-4 sm:max-w-2xl sm:px-5 sm:pt-6 md:max-w-3xl md:px-6 md:pt-8 lg:max-w-5xl lg:px-8 xl:max-w-6xl 2xl:max-w-7xl">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center justify-center rounded-2xl"
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
              }}
            >
              <FiShield style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{ color: "#0f172a", letterSpacing: "-0.025em" }}
              >
                Shared Reports
              </h1>
              <p className="text-xs sm:text-sm font-medium" style={{ color: "#94a3b8" }}>
                Manage report access granted to doctors
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchMyShares(token)}
            disabled={sharedReportsLoading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
              color: "#475569",
              border: "1px solid #e2e8f0",
            }}
          >
            <FiRefreshCw
              className={`text-sm ${sharedReportsLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* ── Bulk Actions Bar ── */}
      {selectedShareIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-5 sm:mb-6"
        >
          <div
            className="rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
              border: "1px solid rgba(99,102,241,0.12)",
              boxShadow: "0 1px 6px rgba(15,23,42,0.04)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-extrabold" style={{ color: "#1e293b" }}>
                {selectedShareIds.length} selected
              </p>
              <p className="text-xs sm:text-sm font-medium mt-0.5" style={{ color: "#94a3b8" }}>
                {selectedActiveShareIds.length} active share(s) can be revoked
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleSelectAllInView}
                disabled={filteredShareIds.length === 0}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  color: "#6366f1",
                  border: "1px solid rgba(99,102,241,0.15)",
                  opacity: filteredShareIds.length === 0 ? 0.6 : 1,
                  cursor: filteredShareIds.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {isAllFilteredSelected ? "Deselect (filtered)" : "Select (filtered)"}
              </button>

              <button
                onClick={() => setSelectedShareIds([])}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300"
                style={{
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                }}
              >
                Clear
              </button>

              <button
                onClick={handleBulkRevoke}
                disabled={bulkRevoking || selectedActiveShareIds.length === 0}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300"
                style={{
                  background:
                    bulkRevoking || selectedActiveShareIds.length === 0
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #ef4444, #dc2626)",
                  color:
                    bulkRevoking || selectedActiveShareIds.length === 0 ? "#94a3b8" : "#fff",
                  border:
                    bulkRevoking || selectedActiveShareIds.length === 0
                      ? "1px solid transparent"
                      : "1px solid rgba(239,68,68,0.18)",
                  boxShadow: bulkRevoking || selectedActiveShareIds.length === 0 ? "none" : "0 4px 16px rgba(239,68,68,0.18)",
                  cursor: bulkRevoking || selectedActiveShareIds.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {bulkRevoking ? "Revoking…" : "Revoke Selected"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8"
      >
        {[
          { label: "Total Shares", value: counts.all, icon: FiShare2, color: "#6366f1", bg: "rgba(99,102,241,0.06)" },
          { label: "Active", value: counts.active, icon: FiCheck, color: "#10b981", bg: "rgba(16,185,129,0.06)" },
          { label: "Revoked", value: counts.revoked, icon: FiLock, color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
          { label: "Expired", value: counts.expired, icon: FiClock, color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-3.5 sm:p-4 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "#fff",
              border: "1.5px solid #f1f5f9",
              boxShadow: "0 1px 4px rgba(15,23,42,0.03)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-xl w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon style={{ color: stat.color, fontSize: "1rem" }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-extrabold" style={{ color: "#0f172a" }}>
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs font-medium truncate" style={{ color: "#94a3b8" }}>
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Filter Tabs ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 scrollbar-none"
      >
        {FILTERS.map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300"
              style={{
                background: isActive ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#fff",
                color: isActive ? "#fff" : "#64748b",
                border: isActive ? "none" : "1.5px solid #e8edf5",
                boxShadow: isActive ? "0 4px 16px rgba(99,102,241,0.3)" : "0 1px 3px rgba(15,23,42,0.04)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span
                className="ml-1.5 opacity-75"
                style={{ fontSize: "0.7rem" }}
              >
                {counts[f]}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Loading Spinner ── */}
      {sharedReportsLoading && filteredShares.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="animate-spin rounded-full mb-4"
            style={{
              width: 44,
              height: 44,
              border: "3px solid #e2e8f0",
              borderTopColor: "#6366f1",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            Loading shared reports…
          </p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!sharedReportsLoading && filteredShares.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 sm:py-20"
        >
          <div
            className="flex items-center justify-center rounded-3xl mb-5"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))",
            }}
          >
            <FiShield style={{ color: "#6366f1", fontSize: "1.8rem" }} />
          </div>
          <p className="text-base sm:text-lg font-bold mb-1" style={{ color: "#1e293b" }}>
            {filter === "all" ? "No shared reports yet" : `No ${filter} shares`}
          </p>
          <p className="text-xs sm:text-sm max-w-xs text-center" style={{ color: "#94a3b8" }}>
            {filter === "all"
              ? "Share your medical reports securely with a doctor from the Reports page."
              : "Try a different filter to view your report shares."}
          </p>
          {filter === "all" && (
            <button
              onClick={() => navigate("/dashboard/reports")}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              Go to Reports <FiArrowRight />
            </button>
          )}
        </motion.div>
      )}

      {/* ── Share Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 sm:space-y-4"
      >
        {filteredShares.map((share) => {
          const st = STATUS_CONFIG[share.status] || STATUS_CONFIG.active;
          const StatusIcon = st.icon;
          const isExpanded = expandedShare === share._id;
          const logs = accessLogs[share._id] || share.accessLog || [];

          return (
            <motion.div
              key={share._id}
              variants={cardVariants}
              layout
              className="rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300"
              style={{
                background: "#fff",
                border: "1.5px solid #edf0f7",
                boxShadow: isExpanded
                  ? "0 8px 32px rgba(99,102,241,0.08)"
                  : "0 2px 8px rgba(15,23,42,0.03)",
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 cursor-pointer select-none group"
                onClick={() => handleToggleExpand(share._id)}
              >
                {/* Share selection checkbox */}
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedShareIds.includes(share._id) ? "rgba(99,102,241,0.12)" : "#f8fafc",
                    border: selectedShareIds.includes(share._id)
                      ? "1.5px solid rgba(99,102,241,0.35)"
                      : "1.5px solid #e8edf5",
                  }}
                  title="Select share"
                >
                  <input
                    type="checkbox"
                    checked={selectedShareIds.includes(share._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleShareSelection(share._id)}
                    className="sr-only"
                  />
                  {selectedShareIds.includes(share._id) ? (
                    <FiCheck size={16} style={{ color: "#6366f1" }} />
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: "#e2e8f0", display: "block" }} />
                  )}
                </label>

                {/* Doctor Avatar */}
                <div
                  className="flex items-center justify-center rounded-xl sm:rounded-2xl flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 transition-all group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.15)",
                  }}
                >
                  <span className="text-white font-bold text-base sm:text-lg">
                    {(share.doctorName || "D")[0]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm sm:text-base truncate" style={{ color: "#0f172a" }}>
                      Dr. {share.doctorName}
                    </p>
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0"
                      style={{
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      <StatusIcon size={10} />
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: "#94a3b8" }}>
                      <FiFileText size={10} />
                      {share.reportIds?.length || 0} report(s)
                    </span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: "#94a3b8" }}>
                      <FiCalendar size={10} />
                      {fmtDate(share.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-xs" style={{ color: "#94a3b8" }}>
                      <FiEye size={10} />
                      {share.accessLog?.length || 0} view(s)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  {share.status === "active" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRevokeConfirm(share._id);
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.12)",
                      }}
                    >
                      <FiXCircle size={12} />
                      Revoke
                    </button>
                  )}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all group-hover:bg-gray-50"
                  >
                    {isExpanded ? (
                      <FiChevronUp size={16} style={{ color: "#94a3b8" }} />
                    ) : (
                      <FiChevronDown size={16} style={{ color: "#94a3b8" }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Revoke */}
              {share.status === "active" && !isExpanded && (
                <div className="sm:hidden px-3.5 pb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevokeConfirm(share._id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.12)",
                    }}
                  >
                    <FiXCircle size={12} />
                    Revoke Access
                  </button>
                </div>
              )}

              {/* ── Expanded Details ── */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    variants={expandVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ borderTop: "1px solid #f1f5f9" }}>
                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3.5 sm:p-5">
                        {[
                          { label: "Doctor ID", value: share.doctorId, mono: true },
                          { label: "Duration", value: getDuration(share.accessDuration) },
                          { label: "Expires", value: share.expiresAt ? fmtDate(share.expiresAt) : "No expiry" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl p-3"
                            style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}
                          >
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                              style={{ color: "#94a3b8" }}
                            >
                              {item.label}
                            </p>
                            <p
                              className="text-sm font-semibold truncate"
                              style={{
                                color: "#1e293b",
                                fontFamily: item.mono ? "'JetBrains Mono', monospace" : "inherit",
                              }}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shared Reports */}
                      <div className="px-3.5 sm:px-5 pb-3">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
                          Shared Reports
                        </p>
                        <div className="space-y-1.5">
                          {share.reportIds?.map((report) => (
                            <div
                              key={report._id || report}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:bg-indigo-50/50"
                              style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}
                            >
                              <div
                                className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                                style={{ background: "rgba(99,102,241,0.08)" }}
                              >
                                <FiFileText style={{ color: "#6366f1", fontSize: "0.75rem" }} />
                              </div>
                              <span
                                className="text-xs sm:text-sm font-medium truncate"
                                style={{ color: "#1e293b" }}
                              >
                                {report.originalFilename || "Report"}
                              </span>
                              {report.category && (
                                <span
                                  className="ml-auto text-[10px] sm:text-xs px-2 py-0.5 rounded-lg font-bold flex-shrink-0"
                                  style={{
                                    background: "rgba(99,102,241,0.06)",
                                    color: "#6366f1",
                                  }}
                                >
                                  {report.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Access Log */}
                      <div className="px-3.5 sm:px-5 pb-3">
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
                          <FiActivity size={12} className="inline mr-1" />
                          Access Log
                        </p>
                        {logs.length === 0 ? (
                          <p
                            className="text-center py-5 rounded-xl text-xs font-medium"
                            style={{ background: "#f8fafc", color: "#94a3b8", border: "1px dashed #e2e8f0" }}
                          >
                            No access recorded yet
                          </p>
                        ) : (
                          <div className="space-y-1 max-h-44 overflow-y-auto rounded-xl pr-1">
                            {logs.map((log, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                                style={{ background: "#f8fafc" }}
                              >
                                <div
                                  className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                                  style={{
                                    background:
                                      log.action === "viewed"
                                        ? "rgba(16,185,129,0.08)"
                                        : "rgba(99,102,241,0.08)",
                                  }}
                                >
                                  {log.action === "viewed" ? (
                                    <FiEye size={11} style={{ color: "#10b981" }} />
                                  ) : (
                                    <FiMessageSquare size={11} style={{ color: "#6366f1" }} />
                                  )}
                                </div>
                                <span className="text-xs font-medium flex-1" style={{ color: "#475569" }}>
                                  {log.action === "viewed" ? "Viewed report" : "Added note"}
                                </span>
                                <span className="text-[10px] font-medium flex-shrink-0" style={{ color: "#94a3b8" }}>
                                  {fmtDateTime(log.accessedAt)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Doctor Notes */}
                      {share.notes?.length > 0 && (
                        <div className="px-3.5 sm:px-5 pb-4">
                          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#94a3b8" }}>
                            <FiMessageSquare size={12} className="inline mr-1" />
                            Doctor Feedback
                          </p>
                          <div className="space-y-2">
                            {share.notes.map((note, i) => (
                              <div
                                key={note._id || i}
                                className="p-3 rounded-xl"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.03))",
                                  border: "1px solid rgba(99,102,241,0.08)",
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                    style={{
                                      background: "rgba(99,102,241,0.08)",
                                      color: "#6366f1",
                                    }}
                                  >
                                    {note.type}
                                  </span>
                                  <span className="ml-auto text-[10px] font-medium" style={{ color: "#94a3b8" }}>
                                    {fmtDateTime(note.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium" style={{ color: "#1e293b" }}>
                                  {note.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mobile Revoke in expanded */}
                      {share.status === "active" && (
                        <div className="sm:hidden px-3.5 pb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevokeConfirm(share._id);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: "rgba(239,68,68,0.06)",
                              color: "#ef4444",
                              border: "1px solid rgba(239,68,68,0.12)",
                            }}
                          >
                            <FiXCircle size={13} />
                            Revoke Doctor Access
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Revoke Confirmation Bar ── */}
              <AnimatePresence>
                {revokeConfirm === share._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-3"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239,68,68,0.04), rgba(239,68,68,0.02))",
                        borderTop: "1px solid rgba(239,68,68,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <FiAlertCircle style={{ color: "#ef4444", flexShrink: 0 }} />
                        <p className="text-xs sm:text-sm font-semibold" style={{ color: "#ef4444" }}>
                          Revoke Dr. {share.doctorName}'s access to {share.reportIds?.length} report(s)?
                        </p>
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevokeConfirm(null);
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: "#f1f5f9", color: "#64748b" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(share._id);
                          }}
                          disabled={revoking}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: revoking ? "#e2e8f0" : "#ef4444",
                            color: revoking ? "#94a3b8" : "#fff",
                            boxShadow: revoking ? "none" : "0 2px 8px rgba(239,68,68,0.25)",
                          }}
                        >
                          {revoking ? "Revoking…" : "Confirm"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    </div>
  );
};

export default SharedReportsManager;
