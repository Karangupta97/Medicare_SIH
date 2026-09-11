import { User } from "../../models/User/user.model.js";
import { FamilyVault } from "../../models/User/FamilyVault.model.js";
import { FamilyVaultInvite } from "../../models/User/FamilyVaultInvite.model.js";
import { MedicalInfo } from "../../models/User/medicalInfo.model.js";
import { Report } from "../../models/User/report.model.js";
import { getFileUrl } from "../../services/s3.service.js";
import { sendFamilyVaultInviteEmail } from "../../services/emails/emails.js";
import { getMaxFamilyMembersForPlan } from "../../config/planConfig.js";
import crypto from "crypto";

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// ─── Create Vault ───────────────────────────────────────────────────────────

export const createVault = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const UserModel = User();
    const VaultModel = FamilyVault();

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check plan eligibility
    if (!["pro", "premium"].includes(user.planType)) {
      return res.status(403).json({
        success: false,
        message: "Family Vault requires a Pro or Premium plan. Please upgrade your plan.",
      });
    }

    // Check if user already has a vault (as head)
    const existingVault = await VaultModel.findOne({ headMember: userId }).lean();
    if (existingVault) {
      return res.status(400).json({
        success: false,
        message: "You already have a Family Vault",
      });
    }

    // Check if user is already a member of another vault
    if (user.familyVaultId) {
      return res.status(400).json({
        success: false,
        message: "You are already part of another Family Vault. Leave that vault first.",
      });
    }

    const vault = new VaultModel({
      headMember: userId,
      name: name || `${user.name}'s Family`,
      planType: user.planType,
      members: [],
    });

    await vault.save();

    // Update user's familyVaultId
    await UserModel.findByIdAndUpdate(userId, { familyVaultId: vault._id });

    return res.status(201).json({
      success: true,
      message: "Family Vault created successfully",
      data: vault,
    });
  } catch (error) {
    console.error("Error in createVault:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Family Vault",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Get Vault ──────────────────────────────────────────────────────────────

export const getVault = async (req, res) => {
  try {
    const userId = req.user.id;

    const UserModel = User();
    const VaultModel = FamilyVault();
    const InviteModel = FamilyVaultInvite();

    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Try as head member first
    let vault = await VaultModel.findOne({ headMember: userId })
      .populate("headMember", "name lastname email umid photoURL planType")
      .populate("members.userId", "name lastname email umid photoURL bloodGroup")
      .lean();

    let isHead = true;

    // If not head, check if user is a member
    if (!vault && user.familyVaultId) {
      vault = await VaultModel.findById(user.familyVaultId)
        .populate("headMember", "name lastname email umid photoURL planType")
        .populate("members.userId", "name lastname email umid photoURL bloodGroup")
        .lean();
      isHead = false;
    }

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "No Family Vault found. Create one to get started.",
      });
    }

    // Get pending invites (only for head member)
    let pendingInvites = [];
    if (isHead) {
      pendingInvites = await InviteModel.find({
        vaultId: vault._id,
        status: "pending",
      }).lean();
    }

    return res.status(200).json({
      success: true,
      data: {
        vault,
        isHead,
        pendingInvites,
      },
    });
  } catch (error) {
    console.error("Error in getVault:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Family Vault",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Update Vault ───────────────────────────────────────────────────────────

export const updateVault = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const VaultModel = FamilyVault();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault not found or you are not the head member",
      });
    }

    if (name) vault.name = name;
    await vault.save();

    return res.status(200).json({
      success: true,
      message: "Family Vault updated successfully",
      data: vault,
    });
  } catch (error) {
    console.error("Error in updateVault:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Family Vault",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Delete Vault ───────────────────────────────────────────────────────────

export const deleteVault = async (req, res) => {
  try {
    const userId = req.user.id;

    const UserModel = User();
    const VaultModel = FamilyVault();
    const InviteModel = FamilyVaultInvite();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault not found or you are not the head member",
      });
    }

    // Clear familyVaultId for all members
    const memberIds = vault.members.map((m) => m.userId);
    memberIds.push(userId); // include head member
    await UserModel.updateMany(
      { _id: { $in: memberIds } },
      { $set: { familyVaultId: null } }
    );

    // Cancel all pending invites
    await InviteModel.updateMany(
      { vaultId: vault._id, status: "pending" },
      { $set: { status: "cancelled" } }
    );

    await VaultModel.findByIdAndDelete(vault._id);

    return res.status(200).json({
      success: true,
      message: "Family Vault deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteVault:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete Family Vault",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Invite Member ──────────────────────────────────────────────────────────

export const inviteMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { umid, relationship } = req.body;

    if (!umid || !relationship) {
      return res.status(400).json({
        success: false,
        message: "UMID and relationship are required",
      });
    }

    const UserModel = User();
    const VaultModel = FamilyVault();
    const InviteModel = FamilyVaultInvite();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault not found or you are not the head member",
      });
    }

    // Check member limit
    if (vault.members.length >= vault.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Member limit reached. Your ${vault.planType} plan allows up to ${vault.maxMembers} members.`,
      });
    }

    // Find invitee by UMID
    const invitee = await UserModel.findOne({ umid: umid.trim() }).lean();
    if (!invitee) {
      return res.status(404).json({
        success: false,
        message: "No user found with this Medicare ID (UMID)",
      });
    }

    // Cannot invite yourself
    if (invitee._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot invite yourself to your own vault",
      });
    }

    // Check if user is already a member
    const alreadyMember = vault.members.some(
      (m) => m.userId.toString() === invitee._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of your Family Vault",
      });
    }

    // Check if user is already in another vault
    if (invitee.familyVaultId) {
      return res.status(400).json({
        success: false,
        message: "This user is already part of another Family Vault",
      });
    }

    // Check for existing pending invite
    const existingInvite = await InviteModel.findOne({
      vaultId: vault._id,
      inviteeUmid: umid.trim(),
      status: "pending",
    });
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "An invite is already pending for this user",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOtp = hashOTP(otp);

    // Get head member name for the email
    const headUser = await UserModel.findById(userId).select("name lastname").lean();

    // Create invite
    const invite = new InviteModel({
      vaultId: vault._id,
      invitedBy: userId,
      inviteeUmid: umid.trim(),
      inviteeUserId: invitee._id,
      relationship,
      otp: hashedOtp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      email: invitee.email,
    });

    await invite.save();

    // Send OTP email
    try {
      await sendFamilyVaultInviteEmail(
        invitee.email,
        otp,
        `${headUser.name} ${headUser.lastname || ""}`.trim(),
        vault.name,
        relationship
      );
    } catch (emailErr) {
      console.error("Failed to send invite email:", emailErr);
      // Don't fail the invite if email fails — user can resend
    }

    return res.status(200).json({
      success: true,
      message: `Invitation sent to ${invitee.name}. They will receive an OTP via email.`,
      data: {
        inviteId: invite._id,
        inviteeName: invitee.name,
        inviteeEmail: invitee.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // mask email
      },
    });
  } catch (error) {
    console.error("Error in inviteMember:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Get My Pending Invites (for invitee) ───────────────────────────────────

export const getMyPendingInvites = async (req, res) => {
  try {
    const userId = req.user.id;

    const UserModel = User();
    const InviteModel = FamilyVaultInvite();
    const VaultModel = FamilyVault();

    const invites = await InviteModel.find({
      inviteeUserId: userId,
      status: "pending",
    }).lean();

    // Enrich each invite with vault name and inviter name
    const enrichedInvites = await Promise.all(
      invites.map(async (invite) => {
        const vault = await VaultModel.findById(invite.vaultId)
          .select("name")
          .lean();
        const inviter = await UserModel.findById(invite.invitedBy)
          .select("name lastname")
          .lean();
        return {
          _id: invite._id,
          vaultName: vault?.name || "Unknown Vault",
          inviterName: `${inviter?.name || ""} ${inviter?.lastname || ""}`.trim(),
          relationship: invite.relationship,
          createdAt: invite.createdAt,
          otpExpiresAt: invite.otpExpiresAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedInvites,
    });
  } catch (error) {
    console.error("Error in getMyPendingInvites:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending invites",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Verify Invite OTP ─────────────────────────────────────────────────────

export const verifyInviteOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId, otp } = req.body;

    if (!inviteId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invite ID and OTP are required",
      });
    }

    const UserModel = User();
    const VaultModel = FamilyVault();
    const InviteModel = FamilyVaultInvite();

    const invite = await InviteModel.findById(inviteId);
    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Verify the HEAD member is the one entering the OTP
    if (invite.invitedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the head member who sent this invite can verify the OTP",
      });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invite.status}`,
      });
    }

    // Check OTP expiry
    if (new Date() > invite.otpExpiresAt) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please resend the invitation.",
      });
    }

    // Verify OTP
    const hashedOtp = hashOTP(otp);
    if (hashedOtp !== invite.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Add the INVITEE as member to vault
    const vault = await VaultModel.findById(invite.vaultId);
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault no longer exists",
      });
    }

    // Double-check member limit
    if (vault.members.length >= vault.maxMembers) {
      return res.status(400).json({
        success: false,
        message: "Family Vault member limit has been reached",
      });
    }

    const inviteeId = invite.inviteeUserId;

    vault.members.push({
      userId: inviteeId,
      relationship: invite.relationship,
      joinedAt: new Date(),
    });

    await vault.save();

    // Update invite status
    invite.status = "accepted";
    await invite.save();

    // Update invitee's familyVaultId
    await UserModel.findByIdAndUpdate(inviteeId, { familyVaultId: vault._id });

    const invitee = await UserModel.findById(inviteeId).select("name").lean();

    return res.status(200).json({
      success: true,
      message: `${invitee?.name || "Member"} has been successfully added to your Family Vault!`,
    });
  } catch (error) {
    console.error("Error in verifyInviteOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify invitation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Remove Member ──────────────────────────────────────────────────────────

export const removeMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    const UserModel = User();
    const VaultModel = FamilyVault();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault not found or you are not the head member",
      });
    }

    const memberIndex = vault.members.findIndex(
      (m) => m.userId.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Member not found in the vault",
      });
    }

    vault.members.splice(memberIndex, 1);
    await vault.save();

    // Clear member's familyVaultId
    await UserModel.findByIdAndUpdate(memberId, { familyVaultId: null });

    return res.status(200).json({
      success: true,
      message: "Member removed from Family Vault",
    });
  } catch (error) {
    console.error("Error in removeMember:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Update Member Permissions ──────────────────────────────────────────────

export const updateMemberPermissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;
    const { permissions } = req.body;

    const VaultModel = FamilyVault();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "Family Vault not found or you are not the head member",
      });
    }

    const member = vault.members.find(
      (m) => m.userId.toString() === memberId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in the vault",
      });
    }

    // Update permissions
    if (permissions.canViewReports !== undefined) {
      member.permissions.canViewReports = permissions.canViewReports;
    }
    if (permissions.canViewMedicalInfo !== undefined) {
      member.permissions.canViewMedicalInfo = permissions.canViewMedicalInfo;
    }
    if (permissions.canViewEmergencyFolder !== undefined) {
      member.permissions.canViewEmergencyFolder = permissions.canViewEmergencyFolder;
    }

    await vault.save();

    return res.status(200).json({
      success: true,
      message: "Member permissions updated",
      data: member.permissions,
    });
  } catch (error) {
    console.error("Error in updateMemberPermissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permissions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Get Member Reports ─────────────────────────────────────────────────────

export const getMemberReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    const VaultModel = FamilyVault();
    const ReportModel = Report();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(403).json({
        success: false,
        message: "Only the head member can view member reports",
      });
    }

    const member = vault.members.find(
      (m) => m.userId.toString() === memberId
    );
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in vault",
      });
    }

    if (!member.permissions.canViewReports) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this member's reports",
      });
    }

    const reports = await ReportModel.find({ userId: memberId })
      .sort({ createdAt: -1 })
      .lean();

    // Generate signed URLs for each report
    const reportsWithUrls = await Promise.all(
      reports.map(async (r) => {
        try {
          const fileUrl = await getFileUrl(r.s3Key);
          return { ...r, fileUrl };
        } catch (err) {
          console.error(`Failed to get URL for report ${r._id}`, err);
          return { ...r, fileUrl: null };
        }
      })
    );

    return res.status(200).json({
      success: true,
      data: reportsWithUrls,
    });
  } catch (error) {
    console.error("Error in getMemberReports:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member reports",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Get Member Medical Info ────────────────────────────────────────────────

export const getMemberMedicalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    const VaultModel = FamilyVault();
    const MedicalInfoModel = MedicalInfo();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(403).json({
        success: false,
        message: "Only the head member can view member medical info",
      });
    }

    const member = vault.members.find(
      (m) => m.userId.toString() === memberId
    );
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in vault",
      });
    }

    if (!member.permissions.canViewMedicalInfo) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this member's medical info",
      });
    }

    const medicalInfo = await MedicalInfoModel.findOne({ userId: memberId }).lean();

    return res.status(200).json({
      success: true,
      data: medicalInfo || null,
    });
  } catch (error) {
    console.error("Error in getMemberMedicalInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member medical info",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Family Dashboard ───────────────────────────────────────────────────────

export const getFamilyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const UserModel = User();
    const VaultModel = FamilyVault();
    const ReportModel = Report();
    const MedicalInfoModel = MedicalInfo();

    // Allow both head member and regular members to see the dashboard
    let vault = await VaultModel.findOne({ headMember: userId })
      .populate("members.userId", "name lastname email umid photoURL bloodGroup dob gender")
      .populate("headMember", "name lastname email umid photoURL bloodGroup dob gender")
      .lean();

    let isHead = true;

    if (!vault) {
      const user = await UserModel.findById(userId).lean();
      if (user?.familyVaultId) {
        vault = await VaultModel.findById(user.familyVaultId)
          .populate("members.userId", "name lastname email umid photoURL bloodGroup dob gender")
          .populate("headMember", "name lastname email umid photoURL bloodGroup dob gender")
          .lean();
        isHead = false;
      }
    }

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "No Family Vault found",
      });
    }

    // Gather all member IDs (including head)
    const allMemberIds = [
      vault.headMember._id,
      ...vault.members.map((m) => m.userId._id),
    ];

    // Get recent reports across all members (last 10)
    const recentReports = await ReportModel.find({
      userId: { $in: allMemberIds },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get report counts per member
    const reportCounts = await ReportModel.aggregate([
      { $match: { userId: { $in: allMemberIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const reportCountMap = {};
    reportCounts.forEach((rc) => {
      reportCountMap[rc._id.toString()] = rc.count;
    });

    // Get medical info for all members
    const medicalInfos = await MedicalInfoModel.find({
      userId: { $in: allMemberIds },
    }).lean();

    const medicalInfoMap = {};
    medicalInfos.forEach((mi) => {
      medicalInfoMap[mi.userId.toString()] = mi;
    });

    // Build member summaries
    const memberSummaries = vault.members.map((m) => {
      const medInfo = medicalInfoMap[m.userId._id.toString()];
      return {
        ...m,
        reportCount: reportCountMap[m.userId._id.toString()] || 0,
        hasAllergies: medInfo?.allergies?.length > 0,
        hasChronicConditions: medInfo?.chronicConditions?.length > 0,
        allergies: medInfo?.allergies || [],
        chronicConditions: medInfo?.chronicConditions || [],
      };
    });

    // Head member summary
    const headMedInfo = medicalInfoMap[vault.headMember._id.toString()];
    const headSummary = {
      ...vault.headMember,
      reportCount: reportCountMap[vault.headMember._id.toString()] || 0,
      hasAllergies: headMedInfo?.allergies?.length > 0,
      hasChronicConditions: headMedInfo?.chronicConditions?.length > 0,
      allergies: headMedInfo?.allergies || [],
      chronicConditions: headMedInfo?.chronicConditions || [],
    };

    return res.status(200).json({
      success: true,
      data: {
        vault: {
          _id: vault._id,
          name: vault.name,
          planType: vault.planType,
          maxMembers: vault.maxMembers,
          memberCount: vault.members.length,
        },
        isHead,
        headMember: headSummary,
        members: memberSummaries,
        recentReports: recentReports.map((r) => ({
          _id: r._id,
          userId: r.userId,
          originalFilename: r.originalFilename,
          reportType: r.reportType,
          category: r.category,
          createdAt: r.createdAt,
        })),
        totalReports: Object.values(reportCountMap).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    console.error("Error in getFamilyDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch family dashboard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Family Emergency Data ──────────────────────────────────────────────────

export const getFamilyEmergencyData = async (req, res) => {
  try {
    const userId = req.user.id;

    const UserModel = User();
    const VaultModel = FamilyVault();
    const ReportModel = Report();
    const MedicalInfoModel = MedicalInfo();

    let vault = await VaultModel.findOne({ headMember: userId })
      .populate("members.userId", "name lastname umid bloodGroup")
      .populate("headMember", "name lastname umid bloodGroup")
      .lean();

    if (!vault) {
      const user = await UserModel.findById(userId).lean();
      if (user?.familyVaultId) {
        vault = await VaultModel.findById(user.familyVaultId)
          .populate("members.userId", "name lastname umid bloodGroup")
          .populate("headMember", "name lastname umid bloodGroup")
          .lean();
      }
    }

    if (!vault) {
      return res.status(404).json({
        success: false,
        message: "No Family Vault found",
      });
    }

    const allMemberIds = [
      vault.headMember._id,
      ...vault.members.map((m) => m.userId._id),
    ];

    // Get emergency reports for all members
    const emergencyReports = await ReportModel.find({
      userId: { $in: allMemberIds },
      inEmergencyFolder: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Generate URLs for emergency reports
    const reportsWithUrls = await Promise.all(
      emergencyReports.map(async (r) => {
        try {
          const fileUrl = await getFileUrl(r.s3Key, true);
          return {
            _id: r._id,
            userId: r.userId,
            originalFilename: r.originalFilename,
            category: r.category,
            createdAt: r.createdAt,
            fileUrl,
          };
        } catch (err) {
          return { ...r, fileUrl: null };
        }
      })
    );

    // Get medical info for all members
    const medicalInfos = await MedicalInfoModel.find({
      userId: { $in: allMemberIds },
    })
      .select("userId allergies emergencyContact emergencyContactPhone chronicConditions")
      .lean();

    const medicalInfoMap = {};
    medicalInfos.forEach((mi) => {
      medicalInfoMap[mi.userId.toString()] = mi;
    });

    // Build family emergency data
    const buildMemberEmergencyData = (userInfo, memberId) => {
      const medInfo = medicalInfoMap[memberId.toString()];
      const memberReports = reportsWithUrls.filter(
        (r) => r.userId.toString() === memberId.toString()
      );
      return {
        user: {
          name: userInfo.name,
          lastname: userInfo.lastname,
          umid: userInfo.umid,
          bloodGroup: userInfo.bloodGroup,
        },
        medical: {
          allergies: medInfo?.allergies || [],
          chronicConditions: medInfo?.chronicConditions || [],
          emergencyContact: medInfo?.emergencyContact || "",
          emergencyContactPhone: medInfo?.emergencyContactPhone || "",
        },
        reports: memberReports,
      };
    };

    const familyEmergencyData = {
      headMember: buildMemberEmergencyData(vault.headMember, vault.headMember._id),
      members: vault.members.map((m) =>
        buildMemberEmergencyData(m.userId, m.userId._id)
      ),
    };

    return res.status(200).json({
      success: true,
      data: familyEmergencyData,
    });
  } catch (error) {
    console.error("Error in getFamilyEmergencyData:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch family emergency data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ─── Member Emergency Folder ────────────────────────────────────────────────

export const getMemberEmergencyFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    const UserModel = User();
    const VaultModel = FamilyVault();
    const ReportModel = Report();
    const MedicalInfoModel = MedicalInfo();

    const vault = await VaultModel.findOne({ headMember: userId });
    if (!vault) {
      return res.status(403).json({
        success: false,
        message: "Only the head member can view member emergency folders",
      });
    }

    const member = vault.members.find(
      (m) => m.userId.toString() === memberId
    );
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in vault",
      });
    }

    if (!member.permissions.canViewEmergencyFolder) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this member's emergency folder",
      });
    }

    const memberUser = await UserModel.findById(memberId)
      .select("name lastname umid bloodGroup")
      .lean();

    const medicalInfo = await MedicalInfoModel.findOne({ userId: memberId })
      .select("allergies emergencyContact emergencyContactPhone chronicConditions")
      .lean();

    const emergencyReports = await ReportModel.find({
      userId: memberId,
      inEmergencyFolder: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const reportsWithUrls = await Promise.all(
      emergencyReports.map(async (r) => {
        try {
          const fileUrl = await getFileUrl(r.s3Key, true);
          return {
            _id: r._id,
            originalFilename: r.originalFilename,
            category: r.category,
            createdAt: r.createdAt,
            fileUrl,
          };
        } catch (err) {
          return { ...r, fileUrl: null };
        }
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        user: memberUser,
        medical: {
          allergies: medicalInfo?.allergies || [],
          chronicConditions: medicalInfo?.chronicConditions || [],
          emergencyContact: medicalInfo?.emergencyContact || "",
          emergencyContactPhone: medicalInfo?.emergencyContactPhone || "",
        },
        reports: reportsWithUrls,
      },
    });
  } catch (error) {
    console.error("Error in getMemberEmergencyFolder:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member emergency folder",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
