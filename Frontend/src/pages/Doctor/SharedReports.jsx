import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiFileText,
  FiClock,
  FiEye,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiRefreshCw,
  FiExternalLink,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useDoctorStore } from "../../store/doctorStore";

const NOTE_TYPES = [
  { value: "general", label: "General", icon: "💬" },
  { value: "comment", label: "Comment", icon: "📝" },
  { value: "medication", label: "Medication", icon: "💊" },
  { value: "prescription", label: "Prescription", icon: "📋" },
];

const DoctorSharedReports = () => {
  const {
    sharedReports,
    sharedReportsLoading,
    fetchSharedReports,
    viewSharedReport,
    addNoteToShare,
  } = useDoctorStore();

  const [expandedShare, setExpandedShare] = useState(null);
  const [reportViewer, setReportViewer] = useState({ show: false, report: null, share: null });
  const [noteForm, setNoteForm] = useState({ shareId: null, text: "", type: "general" });
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    fetchSharedReports();
  }, [fetchSharedReports]);

  const handleViewReport = async (share, reportId) => {
    const result = await viewSharedReport(share._id, reportId);
    if (result && result.success) {
      setReportViewer({
        show: true,
        report: result.report,
        share: result.share,
      });
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.text.trim() || !noteForm.shareId) return;
    setSubmittingNote(true);
    await addNoteToShare(noteForm.shareId, {
      text: noteForm.text,
      type: noteForm.type,
    });
    setNoteForm({ shareId: null, text: "", type: "general" });
    setSubmittingNote(false);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 42, height: 42, background: "rgba(99,102,241,0.1)" }}
          >
            <FiShield style={{ color: "#6366f1", fontSize: "1.2rem" }} />
          </div>
          <div className="flex-1">
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Shared Reports
            </h1>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 500 }}>
              Reports shared with you by patients
            </p>
          </div>
          <button
            onClick={() => fetchSharedReports()}
            className="p-2.5 rounded-xl"
            style={{ background: "#f1f5f9" }}
            title="Refresh"
          >
            <FiRefreshCw
              style={{ color: "#64748b", fontSize: "0.9rem" }}
              className={sharedReportsLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Loading */}
      {sharedReportsLoading && sharedReports.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div
            className="animate-spin rounded-full"
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e2e8f0",
              borderTopColor: "#6366f1",
            }}
          />
        </div>
      )}

      {/* Empty State */}
      {!sharedReportsLoading && sharedReports.length === 0 && (
        <div className="text-center py-16">
          <div
            className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
            style={{ width: 64, height: 64, background: "rgba(99,102,241,0.08)" }}
          >
            <FiShield style={{ color: "#6366f1", fontSize: "1.5rem" }} />
          </div>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
            No shared reports
          </p>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            When patients share their reports with you, they will appear here.
          </p>
        </div>
      )}

      {/* Share Cards */}
      <div className="space-y-4">
        {sharedReports.map((share) => {
          const isExpanded = expandedShare === share._id;
          const sharedAt = new Date(share.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const expiresAt = share.expiresAt
            ? new Date(share.expiresAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "No expiry";

          return (
            <div
              key={share._id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: "#fff",
                border: "1.5px solid #e8edf5",
                boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer"
                onClick={() => setExpandedShare(isExpanded ? null : share._id)}
              >
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 48, height: 48, background: "rgba(16,185,129,0.08)" }}
                >
                  <FiUser style={{ color: "#10b981", fontSize: "1.2rem" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#0f172a" }}>
                    {share.patientName}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                    >
                      <FiFileText size={11} />
                      {share.reportIds?.length || 0} report(s)
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                    >
                      <FiCalendar size={11} />
                      {sharedAt}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                    >
                      <FiClock size={11} />
                      {expiresAt}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <FiChevronUp style={{ color: "#94a3b8" }} />
                ) : (
                  <FiChevronDown style={{ color: "#94a3b8" }} />
                )}
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                  {/* Reports List */}
                  <div className="px-4 sm:px-5 py-4">
                    <p
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Shared Reports
                    </p>
                    <div className="space-y-2">
                      {share.reportIds?.map((report) => {
                        const rid = typeof report === "object" ? report._id : report;
                        const name =
                          typeof report === "object"
                            ? report.originalFilename
                            : "Report";
                        const category =
                          typeof report === "object" ? report.category : "";

                        return (
                          <div
                            key={rid}
                            className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer"
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e8edf5",
                            }}
                            onClick={() => handleViewReport(share, rid)}
                          >
                            <div
                              className="flex items-center justify-center rounded-lg flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                background: "rgba(99,102,241,0.08)",
                              }}
                            >
                              <FiFileText
                                style={{ color: "#6366f1", fontSize: "0.9rem" }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="truncate"
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 600,
                                  color: "#1e293b",
                                }}
                              >
                                {name}
                              </p>
                              {category && (
                                <p
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "#94a3b8",
                                    fontWeight: 500,
                                  }}
                                >
                                  {category}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <FiEye style={{ color: "#6366f1", fontSize: "0.85rem" }} />
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  color: "#6366f1",
                                  fontWeight: 600,
                                }}
                              >
                                View
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="px-4 sm:px-5 pb-4">
                    <p
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: 8,
                      }}
                    >
                      Notes & Feedback
                    </p>

                    {/* Existing Notes */}
                    {share.notes && share.notes.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {share.notes.map((note, i) => (
                          <div
                            key={note._id || i}
                            className="p-3 rounded-xl"
                            style={{
                              background: "rgba(99,102,241,0.04)",
                              border: "1px solid rgba(99,102,241,0.1)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FiMessageSquare
                                style={{ color: "#6366f1", fontSize: "0.75rem" }}
                              />
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: 600,
                                  background: "rgba(99,102,241,0.1)",
                                  color: "#6366f1",
                                }}
                              >
                                {note.type}
                              </span>
                              <span
                                className="ml-auto"
                                style={{ fontSize: "0.68rem", color: "#94a3b8" }}
                              >
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "0.82rem",
                                color: "#1e293b",
                                fontWeight: 500,
                              }}
                            >
                              {note.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Note Form */}
                    {noteForm.shareId === share._id ? (
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          {NOTE_TYPES.map((nt) => (
                            <button
                              key={nt.value}
                              onClick={() =>
                                setNoteForm((prev) => ({ ...prev, type: nt.value }))
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={{
                                background:
                                  noteForm.type === nt.value
                                    ? "rgba(99,102,241,0.1)"
                                    : "#f1f5f9",
                                color:
                                  noteForm.type === nt.value
                                    ? "#6366f1"
                                    : "#64748b",
                                border:
                                  noteForm.type === nt.value
                                    ? "1px solid rgba(99,102,241,0.2)"
                                    : "1px solid #e2e8f0",
                              }}
                            >
                              {nt.icon} {nt.label}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={noteForm.text}
                          onChange={(e) =>
                            setNoteForm((prev) => ({ ...prev, text: e.target.value }))
                          }
                          placeholder="Add your feedback, medication suggestion, or note..."
                          className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                          rows={3}
                          style={{
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            outline: "none",
                          }}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              setNoteForm({ shareId: null, text: "", type: "general" })
                            }
                            className="px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ background: "#f1f5f9", color: "#64748b" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddNote}
                            disabled={submittingNote || !noteForm.text.trim()}
                            className="px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                            style={{
                              background:
                                submittingNote || !noteForm.text.trim()
                                  ? "#e2e8f0"
                                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              color:
                                submittingNote || !noteForm.text.trim()
                                  ? "#94a3b8"
                                  : "#fff",
                            }}
                          >
                            <FiSend size={13} />
                            {submittingNote ? "Sending..." : "Add Note"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setNoteForm({ shareId: share._id, text: "", type: "general" })
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all w-full justify-center"
                        style={{
                          background: "rgba(99,102,241,0.06)",
                          color: "#6366f1",
                          border: "1.5px dashed rgba(99,102,241,0.2)",
                        }}
                      >
                        <FiMessageSquare size={14} />
                        Add Note / Feedback
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report Viewer Modal */}
      {reportViewer.show && reportViewer.report && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "#fff",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #252A61 100%)",
              }}
            >
              <div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  {reportViewer.report.originalFilename}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  Shared by {reportViewer.share?.patientName} •{" "}
                  {reportViewer.report.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={reportViewer.report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <FiExternalLink
                    style={{ color: "#fff", fontSize: "0.9rem" }}
                  />
                </a>
                <button
                  onClick={() =>
                    setReportViewer({ show: false, report: null, share: null })
                  }
                  className="p-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <FiX style={{ color: "#fff", fontSize: "1rem" }} />
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div
              className="flex-1 overflow-auto"
              style={{ minHeight: 0, background: "#f8fafc" }}
            >
              {reportViewer.report.contentType?.includes("image") ? (
                <div className="flex items-center justify-center p-4">
                  <img
                    src={reportViewer.report.fileUrl}
                    alt={reportViewer.report.originalFilename}
                    className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : reportViewer.report.contentType === "application/pdf" ? (
                <iframe
                  src={reportViewer.report.fileUrl}
                  className="w-full"
                  style={{ minHeight: "70vh", border: "none" }}
                  title={reportViewer.report.originalFilename}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <FiFileText
                    style={{ color: "#94a3b8", fontSize: "3rem", marginBottom: 16 }}
                  />
                  <p style={{ fontSize: "0.92rem", color: "#64748b", fontWeight: 500 }}>
                    Preview not available for this file type
                  </p>
                  <a
                    href={reportViewer.report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                    }}
                  >
                    <FiExternalLink size={14} />
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>

            {/* Report Info Footer */}
            <div
              className="px-6 py-3 flex items-center gap-4 flex-shrink-0 flex-wrap"
              style={{ borderTop: "1px solid #e8edf5", background: "#fafbfc" }}
            >
              {reportViewer.report.description && (
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {reportViewer.report.description}
                </span>
              )}
              <span className="ml-auto" style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                {new Date(reportViewer.report.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSharedReports;
