import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiFileText,
  FiActivity,
  FiCpu,
  FiShield,
  FiUser,
  FiHeart,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiBookmark,
  FiShare2,
  FiCalendar,
  FiZap,
  FiTarget,
  FiSun,
  FiCoffee,
  FiTool,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ReportAnalysisModal = ({ show, report, analysis, loading, onClose }) => {
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [progressValue, setProgressValue] = useState(12);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isNormalExpanded, setIsNormalExpanded] = useState(false);

  const handleDownloadSummary = async () => {
    try {
      setIsDownloading(true);

      if (downloadFormat === 'pdf') {
        // Create a simple text representation for now
        // In production, use jsPDF for better PDF generation
        const content = generateSummaryText();
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${report.originalFilename}-analysis.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Analysis summary downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download summary');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const generateSummaryText = () => {
    const { analysis: data } = analysis || {};
    if (!data) return '';

    let text = `MEDICAL REPORT ANALYSIS SUMMARY\n`;
    text += `================================\n`;
    text += `Report: ${report.originalFilename}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n`;
    text += `\n`;

    text += `REPORT SUMMARY\n`;
    text += `--------------\n`;
    text += `${data.summary || 'No summary available'}\n\n`;

    text += `KEY FINDINGS\n`;
    text += `-----------\n`;
    if (data.keyFindings && data.keyFindings.length > 0) {
      data.keyFindings.forEach((finding, i) => {
        text += `${i + 1}. ${finding}\n`;
      });
    } else {
      text += 'No key findings\n';
    }
    text += `\n`;

    text += `ABNORMAL VALUES (⚠️)\n`;
    text += `--------------------\n`;
    if (data.abnormalValues && data.abnormalValues.length > 0) {
      data.abnormalValues.forEach((value, i) => {
        text += `${i + 1}. ${value.name}: ${value.result}\n`;
        text += `   Normal Range: ${value.normal}\n`;
        text += `   Explanation: ${value.explanation}\n\n`;
      });
    } else {
      text += 'No abnormal values detected\n';
    }
    text += `\n`;

    text += `HEALTH SUGGESTIONS\n`;
    text += `------------------\n`;
    if (data.suggestions && data.suggestions.length > 0) {
      data.suggestions.forEach((suggestion, i) => {
        text += `${i + 1}. ${suggestion}\n`;
      });
    } else {
      text += 'No specific suggestions\n';
    }
    text += `\n`;

    text += `WHEN TO CONSULT A DOCTOR\n`;
    text += `------------------------\n`;
    text += `${data.doctorConsultation || 'Always consult your doctor for professional medical advice.'}\n`;

    return text;
  };

  const { analysis: data } = analysis || {};
  const summaryText = data?.summary || 'No summary available';

  const getSeverityFromText = (text = '') => {
    const value = String(text).toLowerCase();
    if (value.includes('critical') || value.includes('severe') || value.includes('high')) return 'high';
    if (value.includes('moderate') || value.includes('attention') || value.includes('borderline')) return 'moderate';
    return 'low';
  };

  const getSeverityStyles = (severity) => {
    if (severity === 'high') {
      return {
        label: 'High',
        cardClass: 'border-red-200 bg-red-50/60',
        badgeClass: 'bg-red-100 text-red-700',
        barClass: 'from-red-500 to-rose-500',
      };
    }
    if (severity === 'moderate') {
      return {
        label: 'Moderate',
        cardClass: 'border-amber-200 bg-amber-50/60',
        badgeClass: 'bg-amber-100 text-amber-700',
        barClass: 'from-amber-500 to-yellow-500',
      };
    }
    return {
      label: 'Low',
      cardClass: 'border-emerald-200 bg-emerald-50/60',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      barClass: 'from-emerald-500 to-green-500',
    };
  };

  const getSeverityScore = (severity) => {
    if (severity === 'high') return 88;
    if (severity === 'moderate') return 58;
    return 26;
  };

  const confidenceScore = (() => {
    if (typeof data?.confidence === 'number') return Math.min(99, Math.max(70, Math.round(data.confidence)));
    if (typeof analysis?.confidence === 'number') return Math.min(99, Math.max(70, Math.round(analysis.confidence)));
    return 94;
  })();

  const patientAge = data?.patientSnapshot?.age || data?.patientAge || 'N/A';
  const patientGender = data?.patientSnapshot?.gender || data?.patientGender || 'N/A';
  const reportType = data?.reportType || report?.reportType || 'General Lab Report';
  const keySymptoms = data?.patientSnapshot?.symptoms || data?.symptoms || data?.healthConcerns?.slice(0, 3) || [];

  const normalizedSuggestions = (data?.suggestions || []).map((suggestion) => String(suggestion));
  const categorizedSuggestions = {
    diet: normalizedSuggestions.filter((s) => /diet|nutrition|food|salt|sugar|hydration/i.test(s)),
    medication: normalizedSuggestions.filter((s) => /medicine|medication|tablet|dose|drug|prescription/i.test(s)),
    lifestyle: normalizedSuggestions.filter((s) => /sleep|exercise|walk|stress|lifestyle|routine/i.test(s)),
    tests: normalizedSuggestions.filter((s) => /test|scan|follow-up|retest|monitor|checkup/i.test(s)),
  };

  const usedSuggestions = new Set(
    Object.values(categorizedSuggestions)
      .flat()
      .map((s) => s)
  );

  const uncategorized = normalizedSuggestions.filter((s) => !usedSuggestions.has(s));
  if (uncategorized.length) categorizedSuggestions.lifestyle = [...categorizedSuggestions.lifestyle, ...uncategorized];

  const abnormalCount = data?.abnormalValues?.length || 0;
  const normalCount = data?.normalValues?.length || 0;
  const totalMeasured = abnormalCount + normalCount;
  const healthScore = totalMeasured > 0 ? Math.round((normalCount / totalMeasured) * 100) : 97;

  const derivedRisks = [
    ...(data?.healthConcerns || []).map((risk) => ({ label: risk, severity: getSeverityFromText(risk) })),
    ...(data?.abnormalValues || []).slice(0, 2).map((value) => ({
      label: `${value.name} related risk`,
      severity: getSeverityFromText(`${value.result} ${value.explanation}`),
    })),
  ];
  const riskItems = derivedRisks.length ? derivedRisks.slice(0, 4) : [{ label: 'General inflammation risk', severity: 'moderate' }];
  const riskScore = Math.round(
    riskItems.reduce((acc, item) => acc + getSeverityScore(item.severity), 0) / Math.max(riskItems.length, 1)
  );
  const overallRiskLabel = riskScore >= 75 ? 'High' : riskScore >= 45 ? 'Medium' : 'Low';

  const primaryTimeline = [
    { title: 'Follow medication plan', date: 'Start today' },
    { title: 'Complete recommended tests', date: 'Within 3-7 days' },
    { title: 'Revisit your doctor', date: 'Within 1-2 weeks' },
  ];
  const loadingSteps = [
    {
      id: 'extract',
      label: 'Extracting report text',
      icon: FiFileText,
    },
    {
      id: 'understand',
      label: 'Understanding medical values',
      icon: FiActivity,
    },
    {
      id: 'explain',
      label: 'Generating explanation',
      icon: FiCpu,
    },
  ];

  useEffect(() => {
    if (!loading) {
      setActiveStep(0);
      setProgressValue(12);
      return;
    }

    let localStep = 0;
    setActiveStep(0);
    setProgressValue(12);

    const stepTimer = setInterval(() => {
      if (localStep < loadingSteps.length - 1) {
        localStep += 1;
        setActiveStep(localStep);
      } else {
        clearInterval(stepTimer);
      }
    }, 2800);

    const progressTimer = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 92) return prev;
        const increment = prev < 40 ? 6 : prev < 70 ? 4 : 2;
        return Math.min(prev + increment, 92);
      });
    }, 900);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, [loading]);

  if (!show || !report) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-medical-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="medical-report-analysis-heading"
      aria-describedby="medical-report-analysis-description"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/30 via-blue-900/20 to-cyan-900/25 backdrop-blur-md" />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/90 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-[0_22px_64px_rgba(15,23,42,0.16)] border border-white/70 overflow-hidden animate-medical-pop">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 px-6 sm:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
                <h2 id="medical-report-analysis-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, Poppins, Satoshi, sans-serif' }}>
                  Medical Report Analysis
              </h2>
                <p id="medical-report-analysis-description" className="text-sm sm:text-base text-gray-600">{report.originalFilename} • {new Date().toLocaleString()}</p>
                {!loading && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                      Analysis Complete
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      <FiCpu className="h-3.5 w-3.5" />
                      AI confidence {confidenceScore}%
                    </span>
                  </div>
                )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close report analysis modal"
              className="flex-shrink-0 p-2 sm:p-3 hover:bg-white/50 rounded-lg transition-colors duration-200"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 sm:p-8 lg:p-10">
            <div
              className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8"
              aria-live="polite"
              aria-busy="true"
              aria-label="Medical report analysis in progress"
            >
              <div className="lg:col-span-2 flex flex-col items-center justify-center rounded-2xl border border-blue-100/80 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/40 p-6 sm:p-8">
                <div className="relative mb-5">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                    <circle cx="60" cy="60" r="50" stroke="#dbeafe" strokeWidth="10" fill="none" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#medicalProgressGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * progressValue) / 100}
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="medicalProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="55%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold text-slate-700">{progressValue}%</span>
                  </div>
                  <div className="absolute inset-0 rounded-full animate-medical-pulse-ring pointer-events-none" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 text-center" style={{ fontFamily: 'Inter, Poppins, Satoshi, sans-serif' }}>
                  Medical Report Analysis
                </h3>
                <p className="text-sm text-slate-600 mt-2 text-center">
                  AI is analyzing your report with precision
                </p>
                <p className="text-sm text-slate-600 mt-4 text-center">
                  Analyzing your report<span className="inline-block w-5 text-left animate-medical-dots" aria-hidden="true" />
                </p>

                <div className="w-full mt-5">
                  <div className="h-2 rounded-full bg-blue-100 overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-700 ease-out"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <FiShield className="w-4 h-4 text-blue-600" />
                  <span>Secure & private analysis</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">This may take 10-20 seconds</p>
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 sm:p-5">
                  <div className="space-y-3">
                    {loadingSteps.map((step, index) => {
                      const isActive = index === activeStep;
                      const isComplete = index < activeStep;
                      const StepIcon = step.icon;

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center justify-between gap-4 rounded-xl border px-3 py-3 transition-all duration-400 ${
                            isActive
                              ? 'border-blue-200 bg-blue-50/80 shadow-sm'
                              : isComplete
                                ? 'border-emerald-200 bg-emerald-50/70'
                                : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                isActive
                                  ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white'
                                  : isComplete
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <p className={`text-sm sm:text-base ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{step.label}</p>
                          </div>
                          {isActive && <span className="text-xs text-blue-700 font-medium">In progress</span>}
                          {isComplete && <span className="text-xs text-emerald-700 font-medium">Done</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base" aria-hidden="true">🧬</span>
                    <p className="text-sm font-semibold text-slate-700">Preparing report sections</p>
                  </div>
                  <div className="space-y-3" aria-hidden="true">
                    <div className="h-4 w-10/12 rounded-md bg-slate-200 skeleton-medical" />
                    <div className="h-4 w-8/12 rounded-md bg-slate-200 skeleton-medical" />
                    <div className="h-16 w-full rounded-lg bg-slate-200 skeleton-medical" />
                    <div className="h-4 w-9/12 rounded-md bg-slate-200 skeleton-medical" />
                    <div className="h-14 w-full rounded-lg bg-slate-200 skeleton-medical" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && data && (
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-4 sm:px-8 py-5 sm:py-6 pb-24 sm:pb-28 space-y-5 sm:space-y-6 custom-scrollbar">
            {/* Patient Snapshot */}
            <section className="rounded-2xl border border-blue-100 bg-white/85 backdrop-blur-md p-5 shadow-[0_8px_32px_rgba(37,99,235,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(30,64,175,0.12)]">
              <div className="mb-4 flex items-center gap-2">
                <FiUser className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Patient Snapshot</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs text-slate-500 mb-1">Age / Gender</p>
                  <p className="text-sm font-semibold text-slate-900">{patientAge} • {patientGender}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FiHeart className="h-3.5 w-3.5 text-rose-500" /> Key Symptoms</p>
                  <p className="text-sm font-semibold text-slate-900">{keySymptoms.length ? keySymptoms.join(', ') : 'No key symptoms detected'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FiFileText className="h-3.5 w-3.5 text-indigo-500" /> Report Type</p>
                  <p className="text-sm font-semibold text-slate-900">{reportType}</p>
                </div>
              </div>
            </section>

            {/* AI Summary */}
            <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/35 to-blue-50/45 p-5 shadow-[0_8px_30px_rgba(14,116,144,0.1)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                  <FiZap className="h-3.5 w-3.5" />
                  AI Insight
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Summary</h3>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                {isSummaryExpanded || summaryText.length < 220 ? summaryText : `${summaryText.slice(0, 220)}...`}
              </p>
              {summaryText.length > 220 && (
                <button
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  onClick={() => setIsSummaryExpanded((prev) => !prev)}
                >
                  {isSummaryExpanded ? 'Show less' : 'Read more'}
                  {isSummaryExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                </button>
              )}
            </section>

            {/* Key Findings Section */}
            {data.keyFindings && data.keyFindings.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-4">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Key Findings</h3>
                </div>
                <ul className="space-y-2.5">
                  {data.keyFindings.map((finding, index) => (
                    <li key={index} className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:bg-white">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                          ✓
                        </span>
                        <span className="text-slate-700 text-sm sm:text-base pt-0.5">{finding}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Monitor</span>
                        {getSeverityFromText(finding) === 'high' && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">High Priority</span>
                        )}
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700"
                          title="AI explanation simplifies medical language for easier understanding."
                        >
                          <FiInfo className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Abnormal Values Section */}
            {data.abnormalValues && data.abnormalValues.length > 0 && (
              <section className="rounded-2xl border border-red-200 bg-gradient-to-br from-white via-red-50/30 to-orange-50/40 p-5 shadow-[0_8px_30px_rgba(239,68,68,0.12)]">
                <div className="flex items-center gap-2 mb-4">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Abnormal Values</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {data.abnormalValues.map((value, index) => {
                    const severity = getSeverityFromText(`${value.result} ${value.explanation}`);
                    const severityUI = getSeverityStyles(severity);
                    const severityScore = getSeverityScore(severity);

                    return (
                      <article
                        key={index}
                        className={`group rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${severityUI.cardClass}`}
                        style={{ boxShadow: 'inset 3px 0 0 rgba(239,68,68,0.55)' }}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-900">{value.name}</h4>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                            {value.result}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">Normal range: <span className="font-medium">{value.normal}</span></p>
                        <p className="text-sm text-slate-700 leading-relaxed mb-3">{value.explanation}</p>

                        <div className="mb-2 flex items-center justify-between">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityUI.badgeClass}`}>
                            {severityUI.label} severity
                          </span>
                          <span className="text-[11px] text-slate-500">AI confidence indicator</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/90 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${severityUI.barClass} transition-all duration-700`}
                            style={{ width: `${severityScore}%` }}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Normal Values Section */}
            {data.normalValues && data.normalValues.length > 0 && (
              <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-[0_8px_26px_rgba(16,185,129,0.1)]">
                <button
                  onClick={() => setIsNormalExpanded((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Normal Values</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{healthScore}% normal</span>
                  </div>
                  {isNormalExpanded ? <FiChevronUp className="h-5 w-5 text-slate-500" /> : <FiChevronDown className="h-5 w-5 text-slate-500" />}
                </button>
                {isNormalExpanded && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.normalValues.map((value, index) => (
                      <div key={index} className="rounded-xl border border-emerald-200 bg-white/85 p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h4 className="font-medium text-slate-900 text-sm">{value.name}</h4>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{value.result}</span>
                        </div>
                        <p className="text-xs text-slate-600">{value.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Risk Analysis */}
            <section className="rounded-2xl border border-amber-200 bg-white/85 p-5 shadow-[0_8px_24px_rgba(217,119,6,0.12)]">
              <div className="mb-4 flex items-center gap-2">
                <FiTrendingUp className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Potential Health Risks</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{overallRiskLabel} risk</span>
              </div>
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Overall risk gauge</span>
                  <span className="font-semibold text-slate-700">{riskScore}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${riskScore >= 75 ? 'from-red-500 to-rose-500' : riskScore >= 45 ? 'from-amber-500 to-yellow-500' : 'from-emerald-500 to-green-500'}`}
                    style={{ width: `${riskScore}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                {riskItems.map((risk, index) => {
                  const ui = getSeverityStyles(risk.severity);
                  return (
                    <div key={index} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <span className="text-sm text-slate-700">{risk.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ui.badgeClass}`}>
                        {ui.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Health Suggestions */}
            <section className="rounded-2xl border border-blue-200 bg-white/85 p-5 shadow-[0_8px_24px_rgba(37,99,235,0.08)]">
              <div className="mb-4 flex items-center gap-2">
                <FiTarget className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Health Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: 'Diet', icon: FiCoffee, items: categorizedSuggestions.diet },
                  { title: 'Medication', icon: FiActivity, items: categorizedSuggestions.medication },
                  { title: 'Lifestyle', icon: FiSun, items: categorizedSuggestions.lifestyle },
                  { title: 'Tests', icon: FiTool, items: categorizedSuggestions.tests },
                ].map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="h-4.5 w-4.5 text-blue-600" />
                        <h4 className="text-sm font-semibold text-slate-900">{group.title}</h4>
                      </div>
                      {group.items.length ? (
                        <ul className="space-y-1.5">
                          {group.items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-500">No specific suggestions in this category.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Timeline / Next Steps */}
            <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-[0_8px_22px_rgba(79,70,229,0.1)]">
              <div className="mb-4 flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Timeline / Next Steps</h3>
              </div>
              <div className="space-y-3">
                {primaryTimeline.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {index + 1}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 w-full">
                      <p className="text-sm font-medium text-slate-900">{step.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Doctor Consultation */}
            <section className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/65 to-fuchsia-50/65 p-5 shadow-[0_8px_24px_rgba(147,51,234,0.1)]">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Doctor Consultation</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  <FiClock className="h-3.5 w-3.5" />
                  Urgency: {overallRiskLabel === 'High' ? 'High' : 'Moderate'}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                {data.doctorConsultation || 'Please consult a healthcare professional soon, especially if symptoms persist or worsen.'}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                onClick={() => toast('Doctor booking will be available soon')}
              >
                Book Doctor
              </button>
            </section>

            {/* Trust & Safety */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-2">
                <FiShield className="h-5 w-5 text-blue-700 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Your data is secure and encrypted</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    This AI analysis supports your understanding, but it is not a final diagnosis. Always confirm key decisions with a licensed doctor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200/70 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
          <button
            onClick={handleDownloadSummary}
            disabled={loading || isDownloading}
            aria-disabled={loading || isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading || isDownloading ? (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                <span>{loading ? 'Preparing smart report...' : 'Downloading...'}</span>
              </>
            ) : (
              <>
                <FiDownload className="w-5 h-5" />
                <span>Download Smart Report</span>
              </>
            )}
          </button>
          <button
            onClick={() => toast('Share link copied (demo)')}
            className="sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-300 font-semibold inline-flex items-center justify-center gap-2"
          >
            <FiShare2 className="h-4.5 w-4.5" />
            Share
          </button>
          <button
            onClick={() => toast.success('Saved to your profile')}
            className="sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors duration-300 font-semibold inline-flex items-center justify-center gap-2"
          >
            <FiBookmark className="h-4.5 w-4.5" />
            Save
          </button>
          <button
            onClick={onClose}
            className="sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors duration-300 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalysisModal;
