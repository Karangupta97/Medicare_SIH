import React, { useState, useEffect } from "react";
import {
  FiX,
  FiSearch,
  FiCheck,
  FiClock,
  FiShield,
  FiAlertTriangle,
  FiUser,
  FiFileText,
  FiSend,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";

const DURATION_OPTIONS = [
  { value: "24h", label: "24 Hours", icon: "⏱️" },
  { value: "7d", label: "7 Days", icon: "📅" },
  { value: "30d", label: "30 Days", icon: "🗓️" },
  { value: "custom", label: "Custom", icon: "✏️" },
  { value: "indefinite", label: "No Expiry", icon: "♾️" },
];

const ShareWithDoctorModal = ({ isOpen, onClose, reports = [], preSelectedReportIds = [] }) => {
  const { token } = useAuthStore();
  const { shareReportsWithDoctor, validateDoctorId } = usePatientStore();

  const [step, setStep] = useState(1); // 1: select reports, 2: enter doctor, 3: confirm
  const [selectedReports, setSelectedReports] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [validatingDoctor, setValidatingDoctor] = useState(false);
  const [doctorError, setDoctorError] = useState("");
  const [accessDuration, setAccessDuration] = useState("7d");
  const [customExpiry, setCustomExpiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(preSelectedReportIds.length > 0 ? 2 : 1);
      setSelectedReports(preSelectedReportIds);
      setDoctorId("");
      setDoctorInfo(null);
      setDoctorError("");
      setAccessDuration("7d");
      setCustomExpiry("");
      setSubmitting(false);
      setSearchFilter("");
    }
  }, [isOpen, preSelectedReportIds]);

  const toggleReport = (reportId) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const selectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map((r) => r._id));
    }
  };

  const handleValidateDoctor = async () => {
    if (!doctorId.trim()) {
      setDoctorError("Please enter a Doctor ID");
      return;
    }
    setValidatingDoctor(true);
    setDoctorError("");
    setDoctorInfo(null);

    const result = await validateDoctorId(token, doctorId.trim());
    setValidatingDoctor(false);

    if (result.success) {
      setDoctorInfo(result.doctor);
    } else {
      setDoctorError(result.message || "Doctor not found");
    }
  };

  const handleSubmit = async () => {
    if (selectedReports.length === 0) {
      toast.error("Please select at least one report");
      return;
    }
    if (!doctorInfo) {
      toast.error("Please validate the Doctor ID first");
      return;
    }

    setSubmitting(true);
    try {
      await shareReportsWithDoctor(token, {
        doctorId: doctorInfo.doctorId,
        reportIds: selectedReports,
        accessDuration,
        customExpiry: accessDuration === "custom" ? customExpiry : undefined,
      });
      toast.success(`Reports shared with Dr. ${doctorInfo.fullName}!`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share reports");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      !searchFilter ||
      r.originalFilename?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (!isOpen) return null;

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "#fff",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #252A61 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 42, height: 42, background: "rgba(255,255,255,0.12)" }}
            >
              <FiShield style={{ color: "#a5b4fc", fontSize: "1.2rem" }} />
            </div>
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Share Reports with Doctor
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", fontWeight: 500 }}>
                Step {step} of 3 — {step === 1 ? "Select Reports" : step === 2 ? "Enter Doctor ID" : "Confirm & Share"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <FiX style={{ color: "#fff", fontSize: "1.1rem" }} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 px-6 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className="flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  width: 26,
                  height: 26,
                  background: step >= s ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#e2e8f0",
                  color: step >= s ? "#fff" : "#94a3b8",
                  transition: "all 0.3s",
                }}
              >
                {step > s ? <FiCheck size={12} /> : s}
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: step >= s ? "#1e293b" : "#94a3b8",
                }}
              >
                {s === 1 ? "Reports" : s === 2 ? "Doctor" : "Confirm"}
              </span>
              {s < 3 && (
                <div
                  className="flex-1 h-px"
                  style={{ background: step > s ? "#6366f1" : "#e2e8f0" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ minHeight: 0 }}>
          {/* Step 1: Select Reports */}
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                  Select reports to share ({selectedReports.length} selected)
                </p>
                <button
                  onClick={selectAll}
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    color: "#6366f1",
                    fontWeight: 600,
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  {selectedReports.length === filteredReports.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#94a3b8", fontSize: "0.9rem" }}
                />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", outline: "none" }}
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredReports.map((report) => {
                  const isSelected = selectedReports.includes(report._id);
                  return (
                    <div
                      key={report._id}
                      onClick={() => toggleReport(report._id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isSelected ? "rgba(99,102,241,0.06)" : "#f8fafc",
                        border: isSelected
                          ? "1.5px solid rgba(99,102,241,0.3)"
                          : "1.5px solid #e8edf5",
                      }}
                    >
                      <div
                        className="flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{
                          width: 32,
                          height: 32,
                          background: isSelected ? "#6366f1" : "#e2e8f0",
                          transition: "all 0.2s",
                        }}
                      >
                        {isSelected ? (
                          <FiCheck style={{ color: "#fff", fontSize: "0.85rem" }} />
                        ) : (
                          <FiFileText style={{ color: "#94a3b8", fontSize: "0.85rem" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="truncate"
                          style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}
                        >
                          {report.originalFilename || "Untitled Report"}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
                          {report.category} •{" "}
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {filteredReports.length === 0 && (
                  <p
                    className="text-center py-8"
                    style={{ color: "#94a3b8", fontSize: "0.85rem" }}
                  >
                    No reports found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Enter Doctor ID */}
          {step === 2 && (
            <div>
              <p
                className="mb-4"
                style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}
              >
                Enter the Doctor's unique ID
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. DOC0013456"
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value.toUpperCase());
                    setDoctorInfo(null);
                    setDoctorError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleValidateDoctor()}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-mono"
                  style={{
                    background: "#f8fafc",
                    border: doctorError
                      ? "1.5px solid #ef4444"
                      : doctorInfo
                      ? "1.5px solid #10b981"
                      : "1.5px solid #e2e8f0",
                    outline: "none",
                    letterSpacing: "0.05em",
                  }}
                />
                <button
                  onClick={handleValidateDoctor}
                  disabled={validatingDoctor || !doctorId.trim()}
                  className="px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  style={{
                    background:
                      validatingDoctor || !doctorId.trim()
                        ? "#e2e8f0"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color:
                      validatingDoctor || !doctorId.trim() ? "#94a3b8" : "#fff",
                    cursor:
                      validatingDoctor || !doctorId.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {validatingDoctor ? (
                    <FiLoader className="animate-spin" size={14} />
                  ) : (
                    <FiSearch size={14} />
                  )}
                  Verify
                </button>
              </div>

              {doctorError && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-4"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <FiAlertTriangle style={{ color: "#ef4444", fontSize: "0.9rem", flexShrink: 0 }} />
                  <p style={{ color: "#ef4444", fontSize: "0.82rem", fontWeight: 500 }}>
                    {doctorError}
                  </p>
                </div>
              )}

              {doctorInfo && (
                <div
                  className="flex items-center gap-4 p-4 rounded-xl mb-4"
                  style={{
                    background: "rgba(16,185,129,0.05)",
                    border: "1.5px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 48, height: 48, background: "rgba(16,185,129,0.1)" }}
                  >
                    <FiUser style={{ color: "#10b981", fontSize: "1.2rem" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
                      Dr. {doctorInfo.fullName}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                      {doctorInfo.specialization || "General Physician"} • ID: {doctorInfo.doctorId}
                    </p>
                  </div>
                  <FiCheck
                    className="ml-auto flex-shrink-0"
                    style={{ color: "#10b981", fontSize: "1.2rem" }}
                  />
                </div>
              )}

              {/* Access Duration */}
              <p
                className="mb-3 mt-6"
                style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}
              >
                Access Duration
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAccessDuration(opt.value)}
                    className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                    style={{
                      background:
                        accessDuration === opt.value
                          ? "rgba(99,102,241,0.08)"
                          : "#f8fafc",
                      border:
                        accessDuration === opt.value
                          ? "1.5px solid rgba(99,102,241,0.3)"
                          : "1.5px solid #e8edf5",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{opt.icon}</span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color:
                          accessDuration === opt.value ? "#6366f1" : "#64748b",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>

              {accessDuration === "custom" && (
                <input
                  type="date"
                  min={getMinDate()}
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "#f8fafc",
                    border: "1.5px solid #e2e8f0",
                    outline: "none",
                  }}
                />
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              {/* Consent Box */}
              <div
                className="p-5 rounded-xl mb-5"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.06))",
                  border: "1.5px solid rgba(99,102,241,0.15)",
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <FiShield
                    style={{ color: "#6366f1", fontSize: "1.3rem", flexShrink: 0, marginTop: 2 }}
                  />
                  <div>
                    <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1e293b" }}>
                      Consent Confirmation
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 500, marginTop: 4 }}>
                      You are granting access to{" "}
                      <strong style={{ color: "#1e293b" }}>
                        Dr. {doctorInfo?.fullName}
                      </strong>{" "}
                      to view {selectedReports.length} selected report(s).
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FiFileText style={{ color: "#6366f1", fontSize: "0.85rem" }} />
                    <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                      <strong style={{ color: "#1e293b" }}>{selectedReports.length}</strong> report(s)
                      selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUser style={{ color: "#6366f1", fontSize: "0.85rem" }} />
                    <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                      Sharing with{" "}
                      <strong style={{ color: "#1e293b" }}>
                        Dr. {doctorInfo?.fullName}
                      </strong>{" "}
                      ({doctorInfo?.doctorId})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock style={{ color: "#6366f1", fontSize: "0.85rem" }} />
                    <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                      Access:{" "}
                      <strong style={{ color: "#1e293b" }}>
                        {DURATION_OPTIONS.find((d) => d.value === accessDuration)?.label}
                        {accessDuration === "custom" && customExpiry
                          ? ` (until ${new Date(customExpiry).toLocaleDateString()})`
                          : ""}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected reports preview */}
              <p
                className="mb-2"
                style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b" }}
              >
                Reports being shared:
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {reports
                  .filter((r) => selectedReports.includes(r._id))
                  .map((r) => (
                    <div
                      key={r._id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "#f8fafc" }}
                    >
                      <FiFileText style={{ color: "#6366f1", fontSize: "0.8rem", flexShrink: 0 }} />
                      <span
                        className="truncate"
                        style={{ fontSize: "0.78rem", color: "#1e293b", fontWeight: 500 }}
                      >
                        {r.originalFilename}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}
        >
          <button
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ color: "#64748b", background: "#f1f5f9" }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && selectedReports.length === 0) {
                  toast.error("Select at least one report");
                  return;
                }
                if (step === 2 && !doctorInfo) {
                  toast.error("Please verify the Doctor ID first");
                  return;
                }
                if (step === 2 && accessDuration === "custom" && !customExpiry) {
                  toast.error("Please select a custom expiry date");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              }}
            >
              Next
              <FiCheck size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: submitting
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: submitting ? "#94a3b8" : "#fff",
                boxShadow: submitting
                  ? "none"
                  : "0 4px 16px rgba(16,185,129,0.3)",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" size={14} />
                  Sharing...
                </>
              ) : (
                <>
                  <FiSend size={14} />
                  Confirm & Share
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareWithDoctorModal;
