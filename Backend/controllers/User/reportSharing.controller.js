import { ReportShare } from "../../models/User/ReportShare.model.js";
import { Report } from "../../models/User/report.model.js";
import { Doctor } from "../../models/Doctor/doctor.model.js";
import { User } from "../../models/User/user.model.js";
import { createNotification } from "./notifications.controller.js";

// Helper: calculate expiry date from duration label
const calcExpiry = (duration, customDate) => {
  const now = new Date();
  switch (duration) {
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case "custom":
      if (customDate) return new Date(customDate);
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "indefinite":
    default:
      return null;
  }
};

/**
 * POST /api/report-sharing
 * Patient shares selected reports with a doctor.
 */
export const shareReports = async (req, res) => {
  try {
    const { doctorId, reportIds, accessDuration, customExpiry } = req.body;

    if (!doctorId || !reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and at least one report are required.",
      });
    }

    // Validate doctor exists
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findOne({ doctorId }).select("fullName _id doctorId");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found. Please check the Doctor ID and try again.",
      });
    }

    // Validate all reports belong to the patient
    const ReportModel = Report();
    const reports = await ReportModel.find({
      _id: { $in: reportIds },
      userId: req.user.id,
    });

    if (reports.length !== reportIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some reports were not found or do not belong to you.",
      });
    }

    // Get patient name
    const UserModel = User();
    const patient = await UserModel.findById(req.user.id).select("name lastname");
    const patientName = patient
      ? `${patient.name}${patient.lastname ? " " + patient.lastname : ""}`
      : "Patient";

    const expiresAt = calcExpiry(accessDuration || "7d", customExpiry);

    const ShareModel = ReportShare();
    const share = new ShareModel({
      patientId: req.user.id,
      patientName,
      doctorId: doctor.doctorId,
      doctorObjectId: doctor._id,
      doctorName: doctor.fullName,
      reportIds,
      accessDuration: accessDuration || "7d",
      expiresAt,
      status: "active",
    });

    const savedShare = await share.save();

    // Notify patient (createNotification handles both DB + real-time socket)
    await createNotification(
      req.user.id,
      "Reports Shared",
      `You shared ${reportIds.length} report(s) with Dr. ${doctor.fullName}.${
        expiresAt ? ` Access expires on ${expiresAt.toLocaleDateString()}.` : ""
      }`,
      "success",
      "/dashboard/shared-reports"
    );

    res.status(201).json({
      success: true,
      message: `Reports shared successfully with Dr. ${doctor.fullName}.`,
      share: savedShare,
    });
  } catch (error) {
    console.error("Error sharing reports:", error);
    res.status(500).json({
      success: false,
      message: `Failed to share reports: ${error.message}`,
    });
  }
};

/**
 * GET /api/report-sharing
 * Get all shares for the authenticated patient.
 */
export const getMyShares = async (req, res) => {
  try {
    const ShareModel = ReportShare();

    // Auto-expire any shares that are past their expiresAt
    await ShareModel.updateMany(
      {
        patientId: req.user.id,
        status: "active",
        expiresAt: { $ne: null, $lte: new Date() },
      },
      { $set: { status: "expired" } }
    );

    const shares = await ShareModel.find({ patientId: req.user.id })
      .populate("reportIds", "originalFilename category createdAt reportType fileSize")
      .sort({ createdAt: -1 });

    res.json({ success: true, shares });
  } catch (error) {
    console.error("Error fetching shares:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch shares: ${error.message}`,
    });
  }
};

/**
 * PATCH /api/report-sharing/:shareId/revoke
 * Patient revokes a share.
 */
export const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const ShareModel = ReportShare();

    const share = await ShareModel.findOne({
      _id: shareId,
      patientId: req.user.id,
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share not found.",
      });
    }

    if (share.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Cannot revoke a share that is already ${share.status}.`,
      });
    }

    share.status = "revoked";
    await share.save();

    // Notify patient
    await createNotification(
      req.user.id,
      "Share Revoked",
      `You revoked Dr. ${share.doctorName}'s access to ${share.reportIds.length} report(s).`,
      "warning",
      "/dashboard/shared-reports"
    );

    res.json({
      success: true,
      message: `Access revoked for Dr. ${share.doctorName}.`,
      share,
    });
  } catch (error) {
    console.error("Error revoking share:", error);
    res.status(500).json({
      success: false,
      message: `Failed to revoke share: ${error.message}`,
    });
  }
};

/**
 * GET /api/report-sharing/:shareId/access-log
 * Get access log for a specific share.
 */
export const getShareAccessLog = async (req, res) => {
  try {
    const { shareId } = req.params;
    const ShareModel = ReportShare();

    const share = await ShareModel.findOne({
      _id: shareId,
      patientId: req.user.id,
    }).select("accessLog doctorName status");

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share not found.",
      });
    }

    res.json({
      success: true,
      accessLog: share.accessLog,
      doctorName: share.doctorName,
      status: share.status,
    });
  } catch (error) {
    console.error("Error fetching access log:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch access log: ${error.message}`,
    });
  }
};

/**
 * GET /api/report-sharing/validate-doctor/:doctorId
 * Validate that a doctor ID exists (for the share modal autocomplete).
 */
export const validateDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findOne({ doctorId }).select(
      "fullName specialization doctorId"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "No doctor found with this ID.",
      });
    }

    res.json({
      success: true,
      doctor: {
        doctorId: doctor.doctorId,
        fullName: doctor.fullName,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Error validating doctor:", error);
    res.status(500).json({
      success: false,
      message: `Failed to validate doctor: ${error.message}`,
    });
  }
};
