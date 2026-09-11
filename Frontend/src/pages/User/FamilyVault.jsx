import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  Heart,
  FileText,
  AlertTriangle,
  Activity,
  Trash2,
  Settings,
  Send,
  X,
  Check,
  ChevronRight,
  Clock,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  FolderOpen,
  ArrowUpCircle,
  RefreshCw,
  Search,
  MoreVertical,
  Clipboard,
  Phone,
  Droplets,
  AlertCircle,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import useFamilyVaultStore from "../../store/Patient/familyVaultStore";
import useAuthStore from "../../store/Patient/authStore";

// ─── Relationship Labels ─────────────────────────────────────
const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "child", label: "Child" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "dependent", label: "Dependent" },
  { value: "other", label: "Other" },
];

const getRelationshipLabel = (val) =>
  RELATIONSHIP_OPTIONS.find((r) => r.value === val)?.label || val;

const getRelationshipColor = (val) => {
  const colors = {
    spouse: "bg-pink-100 text-pink-700 border-pink-200",
    child: "bg-blue-100 text-blue-700 border-blue-200",
    parent: "bg-amber-100 text-amber-700 border-amber-200",
    sibling: "bg-green-100 text-green-700 border-green-200",
    dependent: "bg-purple-100 text-purple-700 border-purple-200",
    other: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return colors[val] || colors.other;
};

// ─── Member Avatar ───────────────────────────────────────────
const MemberAvatar = ({ member, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };
  const user = member?.userId || member;
  const name = user?.name || "?";
  const initial = name.charAt(0).toUpperCase();

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-md`}
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white shadow-md`}
    >
      {initial}
    </div>
  );
};

// ─── Create Vault Modal ──────────────────────────────────────
const CreateVaultModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a vault name");
      return;
    }
    setLoading(true);
    try {
      await onCreate(name.trim());
      toast.success("Family Vault created!");
      onClose();
    } catch {
      toast.error("Failed to create vault");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create Family Vault</h3>
              <p className="text-violet-200 text-sm">Manage your family's health together</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Vault Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gupta Family"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-gray-800 placeholder-gray-400"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 shadow-lg shadow-violet-200"
            >
              {loading ? "Creating…" : "Create Vault"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Invite Modal ────────────────────────────────────────────
const InviteModal = ({ isOpen, onClose, onInvite, onInviteSuccess }) => {
  const [umid, setUmid] = useState("");
  const [relationship, setRelationship] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!umid.trim()) return toast.error("Enter UMID");
    if (!relationship) return toast.error("Select relationship");
    setLoading(true);
    try {
      const res = await onInvite(umid.trim(), relationship);
      toast.success(res.message || "Invitation sent! Ask the member for the OTP.");
      const inviteId = res.data?.inviteId;
      setUmid("");
      setRelationship("");
      onClose();
      // Open OTP modal for head to enter the code
      if (inviteId && onInviteSuccess) {
        onInviteSuccess(inviteId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Invite Family Member</h3>
              <p className="text-emerald-200 text-sm">Send invite via Medicare ID</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Medicare ID (UMID)</label>
            <input
              type="text"
              value={umid}
              onChange={(e) => setUmid(e.target.value)}
              placeholder="Enter member's UMID"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Relationship</label>
            <div className="grid grid-cols-3 gap-2">
              {RELATIONSHIP_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRelationship(r.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    relationship === r.value
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              An OTP will be sent to the member's email. Ask them to share it with you to complete the process.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => { onClose(); setUmid(""); setRelationship(""); }}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={loading || !umid.trim() || !relationship}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium disabled:opacity-50 shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Sending…" : "Send Invite"}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── OTP Verify Modal ────────────────────────────────────────
const OtpVerifyModal = ({ isOpen, onClose, onVerify, inviteId }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);
    try {
      const res = await onVerify(inviteId, otp);
      toast.success(res.message || "Member added!");
      setOtp("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
          <h3 className="text-xl font-bold text-white">Enter Member's OTP</h3>
          <p className="text-violet-200 text-sm">Ask the member for the 6-digit code sent to their email</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-700">
              <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
              An OTP was sent to the member's email. Ask them to share it with you.
            </p>
          </div>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
          <div className="flex space-x-3">
            <button onClick={() => { onClose(); setOtp(""); }} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & Add Member"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Permission Toggle ──────────────────────────────────────
const PermissionToggle = ({ label, icon: Icon, enabled, onChange, compact = false }) => (
  <button
    onClick={onChange}
    className={`flex items-center space-x-2 px-3 py-2 rounded-xl border-2 transition-all ${
      enabled
        ? "border-green-300 bg-green-50 text-green-700"
        : "border-gray-200 bg-gray-50 text-gray-400"
    } ${compact ? "text-xs" : "text-sm"}`}
  >
    {enabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span className="font-medium">{label}</span>
  </button>
);

// ─── Upgrade Prompt ──────────────────────────────────────────
const UpgradePrompt = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-2xl mx-auto"
  >
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-12 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Crown className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Family Vault</h2>
            <p className="text-violet-200">Upgrade to Pro or Premium to unlock</p>
          </div>
        </div>
        <p className="text-violet-100 mb-6 leading-relaxed">
          Manage and monitor medical records for your entire family. Get shared health dashboards,
          emergency access, and smart health insights — all in one secure vault.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {[
            { plan: "Pro", price: "₹199/mo", members: "2 members", features: ["Basic report storage", "Viewing & manual sharing", "Emergency Folder access"] },
            { plan: "Premium", price: "₹499/mo", members: "6 members", features: ["Full health management", "Advanced sharing & insights", "Priority support"], highlight: true },
          ].map((p) => (
            <div key={p.plan} className={`rounded-2xl p-5 ${p.highlight ? "bg-white/20 ring-2 ring-yellow-300/50" : "bg-white/10"} backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold text-lg">{p.plan}</span>
                <span className="text-yellow-300 font-bold">{p.price}</span>
              </div>
              <span className="text-violet-200 text-sm">Up to {p.members}</span>
              <ul className="mt-3 space-y-1">
                {p.features.map((f, i) => (
                  <li key={i} className="text-violet-100 text-xs flex items-center space-x-1.5">
                    <Check className="w-3 h-3 text-green-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button className="w-full py-4 bg-white text-violet-700 rounded-2xl font-bold text-lg hover:bg-violet-50 transition-all shadow-xl flex items-center justify-center space-x-2">
          <ArrowUpCircle className="w-5 h-5" />
          <span>Upgrade Now</span>
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Member Card ─────────────────────────────────────────────
const MemberCard = ({ member, isHead, onRemove, onPermissionsChange, onView }) => {
  const [showActions, setShowActions] = useState(false);
  const user = member.userId || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <MemberAvatar member={member} size="md" />
            <div>
              <h4 className="font-semibold text-gray-900">
                {user.name} {user.lastname || ""}
              </h4>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getRelationshipColor(member.relationship)}`}>
                  {getRelationshipLabel(member.relationship)}
                </span>
                {user.bloodGroup && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center space-x-1">
                    <Droplets className="w-3 h-3" />
                    <span>{user.bloodGroup}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          {isHead && (
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 w-40">
                  <button onClick={() => { onView(member); setShowActions(false); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button onClick={() => { onRemove(user._id); setShowActions(false); }} className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permissions (head member only) */}
        {isHead && (
          <div className="mt-4 flex flex-wrap gap-2">
            <PermissionToggle
              label="Reports"
              icon={FileText}
              enabled={member.permissions?.canViewReports}
              onChange={() => onPermissionsChange(user._id, { ...member.permissions, canViewReports: !member.permissions?.canViewReports })}
              compact
            />
            <PermissionToggle
              label="Medical"
              icon={Heart}
              enabled={member.permissions?.canViewMedicalInfo}
              onChange={() => onPermissionsChange(user._id, { ...member.permissions, canViewMedicalInfo: !member.permissions?.canViewMedicalInfo })}
              compact
            />
            <PermissionToggle
              label="Emergency"
              icon={Shield}
              enabled={member.permissions?.canViewEmergencyFolder}
              onChange={() => onPermissionsChange(user._id, { ...member.permissions, canViewEmergencyFolder: !member.permissions?.canViewEmergencyFolder })}
              compact
            />
          </div>
        )}

        {/* View button */}
        <button
          onClick={() => onView(member)}
          className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-xl hover:from-violet-100 hover:to-purple-100 transition-all text-sm font-medium group-hover:shadow-md"
        >
          <span>View Health Records</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

const FamilyVault = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    vault, isHead, pendingInvites, myInvites, dashboard,
    familyEmergency, isLoading, error,
    fetchVault, createVault, deleteVault,
    inviteMember, verifyInviteOtp, removeMember,
    updateMemberPermissions, fetchFamilyDashboard,
    fetchFamilyEmergency, fetchMyInvites, clearError,
  } = useFamilyVaultStore();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Fetch vault + my pending invites on mount
  useEffect(() => {
    const load = async () => {
      try {
        await fetchVault();
      } catch {
        // No vault — check for pending invites
      }
      // Always fetch invites for the current user (they may have invites even without a vault)
      await fetchMyInvites();
      setInitialLoaded(true);
    };
    load();
  }, [fetchVault, fetchMyInvites]);

  // Fetch tab data
  useEffect(() => {
    if (!vault) return;
    if (activeTab === "dashboard") fetchFamilyDashboard().catch(() => {});
    if (activeTab === "emergency") fetchFamilyEmergency().catch(() => {});
  }, [activeTab, vault, fetchFamilyDashboard, fetchFamilyEmergency]);

  const handleRemoveMember = useCallback(async (memberId) => {
    if (!window.confirm("Remove this member from your Family Vault?")) return;
    try {
      await removeMember(memberId);
      toast.success("Member removed");
      fetchVault();
    } catch {
      toast.error("Failed to remove member");
    }
  }, [removeMember, fetchVault]);

  const handlePermissionsChange = useCallback(async (memberId, perms) => {
    try {
      await updateMemberPermissions(memberId, perms);
      toast.success("Permissions updated");
    } catch {
      toast.error("Failed to update permissions");
    }
  }, [updateMemberPermissions]);

  const handleViewMember = useCallback((member) => {
    const uid = member.userId?._id || member.userId;
    navigate(`/dashboard/family-vault/member/${uid}`);
  }, [navigate]);

  // Plan check — only relevant if user has no vault
  const hasPlan = user?.planType === "pro" || user?.planType === "premium";

  // ─── Loading state ─────────────────────────────────────────
  if (!initialLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading Family Vault…</p>
        </div>
      </div>
    );
  }

  // ─── If user is already part of a vault (as member or head), show it ──
  // This ensures members added by a Pro/Premium head never see the upgrade prompt

  // ─── No vault — upgrade prompt for free/basic users ────────
  if (!vault && !hasPlan) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Helmet><title>Family Vault | Medicare</title></Helmet>
        <UpgradePrompt />
      </div>
    );
  }

  // ─── No vault yet — creation prompt (user has plan but hasn't created vault) ──
  if (!vault) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <Helmet><title>Family Vault | Medicare</title></Helmet>

        {/* Create vault prompt */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-200">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Family Vault</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Securely manage and monitor medical records for up to {user.planType === "premium" ? 6 : 2} family members.
            View shared reports, track health trends, and access emergency info — all in one place.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-xl shadow-violet-200 hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Create Family Vault</span>
          </button>
        </motion.div>
        <CreateVaultModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={createVault} />
      </div>
    );
  }

  // ─── TABS ──────────────────────────────────────────────────
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "members", label: "Members", icon: Users },
    { id: "emergency", label: "Emergency", icon: Shield },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Helmet><title>Family Vault — {vault.name} | Medicare</title></Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vault.name}</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              {isHead && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Head Member</span>
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                {vault.planType?.toUpperCase()} • {vault.members?.length || 0}/{vault.maxMembers} members
              </span>
            </div>
          </div>
        </div>
        {isHead && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInviteModal(true)}
              disabled={vault.members?.length >= vault.maxMembers}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-violet-700 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD TAB ──────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {dashboard ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Members", value: (dashboard.members?.length || 0) + 1, icon: Users, color: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
                  { label: "Total Reports", value: dashboard.totalReports || 0, icon: FileText, color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
                  { label: "Plan", value: dashboard.vault?.planType?.toUpperCase(), icon: Crown, color: "from-amber-500 to-yellow-500", bg: "bg-amber-50" },
                  { label: "Max Members", value: dashboard.vault?.maxMembers || 0, icon: Shield, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-gray-100`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Head Member + Members Grid */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Family Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Head member card */}
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white shadow-md">
                        {dashboard.headMember?.name?.charAt(0)?.toUpperCase() || "H"}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{dashboard.headMember?.name} {dashboard.headMember?.lastname || ""}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 inline-flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Head Member</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded-lg px-3 py-2">
                        <span className="text-gray-500">Reports</span>
                        <p className="font-bold text-gray-900">{dashboard.headMember?.reportCount || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2">
                        <span className="text-gray-500">Blood</span>
                        <p className="font-bold text-gray-900">{dashboard.headMember?.bloodGroup || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Member cards */}
                  {dashboard.members?.map((m, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3 mb-3">
                        <MemberAvatar member={m} size="md" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{m.userId?.name} {m.userId?.lastname || ""}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getRelationshipColor(m.relationship)}`}>
                            {getRelationshipLabel(m.relationship)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Reports</span>
                          <p className="font-bold text-gray-900">{m.reportCount || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-500">Blood</span>
                          <p className="font-bold text-gray-900">{m.userId?.bloodGroup || "N/A"}</p>
                        </div>
                      </div>
                      {(m.allergies?.length > 0 || m.chronicConditions?.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {m.allergies?.slice(0, 2).map((a, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">⚠ {a}</span>
                          ))}
                          {m.chronicConditions?.slice(0, 2).map((c, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">♥ {c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports */}
              {dashboard.recentReports?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Reports</h3>
                  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {dashboard.recentReports.map((r) => (
                      <div key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{r.originalFilename}</p>
                            <p className="text-xs text-gray-500">{r.category} • {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.reportType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No dashboard data available</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── MEMBERS TAB ────────────────────────────────────── */}
      {activeTab === "members" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Pending Invites */}
          {pendingInvites?.length > 0 && isHead && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Invitations ({pendingInvites.length})</span>
              </h3>
              <div className="space-y-2">
                {pendingInvites.map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">UMID: {inv.inviteeUmid}</p>
                      <p className="text-xs text-gray-500">
                        {getRelationshipLabel(inv.relationship)} • Invited {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Members ({vault.members?.length || 0}/{vault.maxMembers})
              </h3>
              {isHead && vault.members?.length < vault.maxMembers && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {vault.members?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vault.members.map((m, i) => (
                  <MemberCard
                    key={m._id || i}
                    member={m}
                    isHead={isHead}
                    onRemove={handleRemoveMember}
                    onPermissionsChange={handlePermissionsChange}
                    onView={handleViewMember}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">No members yet</p>
                {isHead && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Your First Member</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone (head only) */}
          {isHead && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
              <p className="text-xs text-red-500 mb-3">Deleting the vault will remove all members and their access.</p>
              <button
                onClick={async () => {
                  if (!window.confirm("DELETE your Family Vault? This action is irreversible.")) return;
                  try {
                    await deleteVault();
                    toast.success("Vault deleted");
                  } catch {
                    toast.error("Failed to delete vault");
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Vault</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── EMERGENCY TAB ──────────────────────────────────── */}
      {activeTab === "emergency" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {familyEmergency ? (
            <>
              {/* Head Member Emergency */}
              <EmergencyMemberCard data={familyEmergency.headMember} isHead />
              {/* Members Emergency */}
              {familyEmergency.members?.map((m, i) => (
                <EmergencyMemberCard key={i} data={m} />
              ))}
            </>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No emergency data available</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <CreateVaultModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={createVault} />
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={inviteMember}
        onInviteSuccess={(inviteId) => {
          setSelectedInviteId(inviteId);
          setShowOtpModal(true);
        }}
      />
      <OtpVerifyModal isOpen={showOtpModal} onClose={() => { setShowOtpModal(false); setSelectedInviteId(null); }} onVerify={verifyInviteOtp} inviteId={selectedInviteId} />
    </div>
  );
};

// ─── Emergency Member Card Component ─────────────────────────
const EmergencyMemberCard = ({ data, isHead = false }) => {
  if (!data) return null;
  const { user, medical, reports } = data;

  return (
    <div className={`rounded-2xl border overflow-hidden ${isHead ? "border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50" : "border-gray-100 bg-white"}`}>
      <div className={`px-5 py-4 flex items-center justify-between ${isHead ? "bg-violet-100/50" : "bg-gray-50"}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isHead ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-cyan-600"}`}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{user?.name} {user?.lastname || ""}</h4>
            <p className="text-xs text-gray-500">UMID: {user?.umid} {isHead && "• Head Member"}</p>
          </div>
        </div>
        {user?.bloodGroup && (
          <span className="flex items-center space-x-1 text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-bold">
            <Droplets className="w-4 h-4" />
            <span>{user.bloodGroup}</span>
          </span>
        )}
      </div>
      <div className="px-5 py-4 space-y-3">
        {/* Medical Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medical?.allergies?.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-orange-700 mb-1 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Allergies</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {medical.allergies.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{a}</span>
                ))}
              </div>
            </div>
          )}
          {medical?.chronicConditions?.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>Chronic Conditions</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {medical.chronicConditions.map((c, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {(medical?.emergencyContact || medical?.emergencyContactPhone) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center space-x-3">
            <Phone className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600 font-medium">Emergency Contact</p>
              <p className="text-sm text-gray-900">{medical.emergencyContact} {medical.emergencyContactPhone && `• ${medical.emergencyContactPhone}`}</p>
            </div>
          </div>
        )}
        {/* Reports */}
        {reports?.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Emergency Reports ({reports.length})</p>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{r.originalFilename}</p>
                      <p className="text-xs text-gray-500">{r.category} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">No emergency reports</p>
        )}
      </div>
    </div>
  );
};

export default FamilyVault;
