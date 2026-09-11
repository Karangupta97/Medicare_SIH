import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Heart,
  Shield,
  Activity,
  Droplets,
  AlertTriangle,
  Phone,
  User,
  Calendar,
  Clock,
  Eye,
  Download,
  ChevronRight,
  Pill,
  Stethoscope,
  Thermometer,
  Scale,
  Ruler,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import useFamilyVaultStore from "../../store/Patient/familyVaultStore";

const FamilyVaultMemberDetail = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const {
    vault,
    isHead,
    memberReports,
    memberMedicalInfo,
    memberEmergency,
    isLoading,
    fetchVault,
    fetchMemberReports,
    fetchMemberMedicalInfo,
    fetchMemberEmergency,
  } = useFamilyVaultStore();

  const [activeTab, setActiveTab] = useState("reports");
  const [member, setMember] = useState(null);

  // Find member info from vault
  useEffect(() => {
    const loadData = async () => {
      if (!vault) {
        try {
          await fetchVault();
        } catch {
          navigate("/dashboard/family-vault");
          return;
        }
      }
    };
    loadData();
  }, [vault, fetchVault, navigate]);

  useEffect(() => {
    if (vault?.members) {
      const found = vault.members.find(
        (m) => (m.userId?._id || m.userId) === memberId
      );
      setMember(found);
    }
  }, [vault, memberId]);

  // Fetch tab data
  useEffect(() => {
    if (!memberId || !isHead) return;
    if (activeTab === "reports") fetchMemberReports(memberId).catch(() => {});
    if (activeTab === "medical") fetchMemberMedicalInfo(memberId).catch(() => {});
    if (activeTab === "emergency") fetchMemberEmergency(memberId).catch(() => {});
  }, [activeTab, memberId, isHead, fetchMemberReports, fetchMemberMedicalInfo, fetchMemberEmergency]);

  const memberUser = member?.userId || {};
  const memberName = `${memberUser.name || ""} ${memberUser.lastname || ""}`.trim() || "Member";

  const tabs = [
    { id: "reports", label: "Reports", icon: FileText },
    { id: "medical", label: "Medical Info", icon: Heart },
    { id: "emergency", label: "Emergency", icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Helmet>
        <title>{memberName} — Family Vault | Medicare</title>
      </Helmet>

      {/* Back + Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/dashboard/family-vault")}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white shadow-lg">
            {memberUser.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{memberName}</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              {member?.relationship && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 capitalize">
                  {member.relationship}
                </span>
              )}
              {memberUser.bloodGroup && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center space-x-1">
                  <Droplets className="w-3 h-3" />
                  <span>{memberUser.bloodGroup}</span>
                </span>
              )}
              {memberUser.umid && (
                <span className="text-xs text-gray-400">UMID: {memberUser.umid}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-2xl">
        {tabs.map((tab) => {
          // Check permissions
          const hasPermission =
            (tab.id === "reports" && member?.permissions?.canViewReports) ||
            (tab.id === "medical" && member?.permissions?.canViewMedicalInfo) ||
            (tab.id === "emergency" && member?.permissions?.canViewEmergencyFolder);

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!hasPermission && isHead) {
                  toast.error(`No permission to view ${tab.label}. Update permissions in Members tab.`);
                  return;
                }
                setActiveTab(tab.id);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-violet-700 shadow-md"
                  : hasPermission
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {!hasPermission && <span className="text-xs">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* ─── REPORTS TAB ─────────────────────────────────── */}
      {activeTab === "reports" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : memberReports?.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{memberReports.length} Reports</p>
              </div>
              <div className="divide-y divide-gray-50">
                {memberReports.map((r) => (
                  <div key={r._id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.originalFilename}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-gray-500">{r.category}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{r.reportType}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No reports found for this member</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── MEDICAL INFO TAB ────────────────────────────── */}
      {activeTab === "medical" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : memberMedicalInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <InfoCard title="Basic Information" icon={User} color="blue">
                <InfoRow label="Height" value={memberMedicalInfo.height} />
                <InfoRow label="Weight" value={memberMedicalInfo.weight} />
                <InfoRow label="Blood Pressure" value={memberMedicalInfo.bloodPressure} />
                <InfoRow label="Heart Rate" value={memberMedicalInfo.heartRate} />
                <InfoRow label="Body Temperature" value={memberMedicalInfo.bodyTemperature} />
                <InfoRow label="O₂ Saturation" value={memberMedicalInfo.oxygenSaturation} />
              </InfoCard>

              {/* Allergies & Conditions */}
              <InfoCard title="Allergies & Conditions" icon={AlertTriangle} color="orange">
                {memberMedicalInfo.allergies?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-orange-600 mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {memberMedicalInfo.allergies.map((a, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {memberMedicalInfo.chronicConditions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-1">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {memberMedicalInfo.chronicConditions.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!memberMedicalInfo.allergies?.length && !memberMedicalInfo.chronicConditions?.length && (
                  <p className="text-xs text-gray-400">No allergies or conditions recorded</p>
                )}
              </InfoCard>

              {/* Lifestyle */}
              <InfoCard title="Lifestyle" icon={Activity} color="green">
                <InfoRow label="Smoking" value={memberMedicalInfo.smokingStatus} />
                <InfoRow label="Alcohol" value={memberMedicalInfo.alcoholConsumption} />
                <InfoRow label="Exercise" value={memberMedicalInfo.exerciseFrequency} />
                <InfoRow label="Stress Level" value={memberMedicalInfo.stressLevel} />
                <InfoRow label="Sleep Patterns" value={memberMedicalInfo.sleepPatterns} />
              </InfoCard>

              {/* Emergency Contact */}
              <InfoCard title="Emergency Contact" icon={Phone} color="red">
                <InfoRow label="Contact Name" value={memberMedicalInfo.emergencyContact} />
                <InfoRow label="Phone" value={memberMedicalInfo.emergencyContactPhone} />
                <InfoRow label="Primary Physician" value={memberMedicalInfo.primaryPhysician} />
                <InfoRow label="Physician Phone" value={memberMedicalInfo.primaryPhysicianPhone} />
              </InfoCard>

              {/* Medical History */}
              <InfoCard title="Medical History" icon={Stethoscope} color="purple">
                <InfoRow label="Current Medications" value={memberMedicalInfo.currentMedications} />
                <InfoRow label="Previous Surgeries" value={memberMedicalInfo.previousSurgeries} />
                <InfoRow label="Family History" value={memberMedicalInfo.familyMedicalHistory} />
                <InfoRow label="Last Physical Exam" value={memberMedicalInfo.lastPhysicalExam ? new Date(memberMedicalInfo.lastPhysicalExam).toLocaleDateString() : null} />
                <InfoRow label="Last Blood Work" value={memberMedicalInfo.lastBloodWork ? new Date(memberMedicalInfo.lastBloodWork).toLocaleDateString() : null} />
              </InfoCard>

              {/* Insurance */}
              <InfoCard title="Insurance" icon={Shield} color="teal">
                <InfoRow label="Provider" value={memberMedicalInfo.insuranceProvider} />
                <InfoRow label="Policy Number" value={memberMedicalInfo.insurancePolicyNumber} />
              </InfoCard>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No medical information available</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── EMERGENCY TAB ────────────────────────────────── */}
      {activeTab === "emergency" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : memberEmergency ? (
            <div className="space-y-4">
              {/* Emergency Info */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 p-5">
                <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Emergency Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memberEmergency.user?.bloodGroup && (
                    <div className="bg-white rounded-xl p-3 border border-red-100">
                      <p className="text-xs text-gray-500">Blood Group</p>
                      <p className="text-lg font-bold text-red-600 flex items-center space-x-1">
                        <Droplets className="w-4 h-4" />
                        <span>{memberEmergency.user.bloodGroup}</span>
                      </p>
                    </div>
                  )}
                  {memberEmergency.medical?.emergencyContact && (
                    <div className="bg-white rounded-xl p-3 border border-red-100">
                      <p className="text-xs text-gray-500">Emergency Contact</p>
                      <p className="text-sm font-medium text-gray-900">{memberEmergency.medical.emergencyContact}</p>
                      {memberEmergency.medical.emergencyContactPhone && (
                        <p className="text-xs text-gray-500">{memberEmergency.medical.emergencyContactPhone}</p>
                      )}
                    </div>
                  )}
                </div>
                {memberEmergency.medical?.allergies?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-orange-700 mb-1">Allergies</p>
                    <div className="flex flex-wrap gap-1">
                      {memberEmergency.medical.allergies.map((a, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {memberEmergency.medical?.chronicConditions?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {memberEmergency.medical.chronicConditions.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Reports */}
              {memberEmergency.reports?.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Emergency Reports ({memberEmergency.reports.length})</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {memberEmergency.reports.map((r) => (
                      <div key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{r.originalFilename}</p>
                            <p className="text-xs text-gray-500">{r.category} • {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {r.fileUrl && (
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">View</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl">
                  <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No emergency reports</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No emergency data available</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ─── Helper Components ───────────────────────────────────────

const InfoCard = ({ title, icon: Icon, color, children }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center space-x-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className={`w-7 h-7 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="px-5 py-3 space-y-2">{children}</div>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 capitalize">{value}</span>
    </div>
  );
};

export default FamilyVaultMemberDetail;
