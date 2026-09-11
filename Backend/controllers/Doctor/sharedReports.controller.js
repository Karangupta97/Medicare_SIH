import { ReportShare } from "../../models/User/ReportShare.model.js";
import { Report } from "../../models/User/report.model.js";
import { getFileUrl } from "../../services/s3.service.js";
import { createNotification } from "../User/notifications.controller.js";

/**
 * GET /api/doctor/shared-reports
 * Get all active, non-expired report shares for the authenticated doctor.
 */
export const getSharedReports = async (req, res) => {
  try {
    const doctorObjectId = req.doctor.id;
    const ShareModel = ReportShare();

    // Auto-expire shares past their expiresAt
    await ShareModel.updateMany(
      {
        doctorObjectId,
        status: "active",
        expiresAt: { $ne: null, $lte: new Date() },
      },
      { $set: { status: "expired" } }
    );

    const shares = await ShareModel.find({
      doctorObjectId,
      status: "active",
    })
      .populate(
        "reportIds",
        "originalFilename category createdAt reportType fileSize description"
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, shares });
  } catch (error) {
    console.error("Error fetching shared reports for doctor:", error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch shared reports: ${error.message}`,
    });
  }
};

/**
 * GET /api/doctor/shared-reports/:shareId/reports/:reportId
 * View a specific shared report. Logs the access and notifies the patient.
 */
export const viewSharedReport = async (req, res) => {
  try {
    const { shareId, reportId } = req.params;
    const doctorObjectId = req.doctor.id;
    const ShareModel = ReportShare();

    const share = await ShareModel.findOne({
      _id: shareId,
      doctorObjectId,
      status: "active",
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share not found or access has been revoked/expired.",
      });
    }

    // Check if this report is in the shared set
    const isReportShared = share.reportIds.some(
      (id) => String(id) === String(reportId)
    );
    if (!isReportShared) {
      return res.status(403).json({
        success: false,
        message: "This report was not shared with you.",
      });
    }

    // Check expiry
    if (share.expiresAt && new Date() > share.expiresAt) {
      share.status = "expired";
      await share.save();
      return res.status(403).json({
        success: false,
        message: "Access to this share has expired.",
      });
    }

    // Fetch the report
    const ReportModel = Report();
    const report = await ReportModel.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    // Generate a fresh signed URL
    let fileUrl = report.fileUrl;
    try {
      fileUrl = await getFileUrl(report.s3Key);
    } catch (s3Err) {
      console.error("Error generating signed URL for shared report:", s3Err);
    }

    // Log the access
    share.accessLog.push({
      accessedAt: new Date(),
      action: "viewed",
      reportId: report._id,
    });
    await share.save();

    // Notify the patient that the doctor viewed their report
    try {
      await createNotification(
        String(share.patientId),
        "Report Viewed",
        `Dr. ${share.doctorName} viewed your report: ${report.originalFilename}`,
        "info",
        "/dashboard/shared-reports"
      );
    } catch (notifErr) {
      console.error("Error sending view notification:", notifErr);
    }

    res.json({
      success: true,
      report: {
        _id: report._id,
        originalFilename: report.originalFilename,
        description: report.description,
        reportType: report.reportType,
        fileUrl,
        fileSize: report.fileSize,
        contentType: report.contentType,
        category: report.category,
        createdAt: report.createdAt,
      },
      share: {
        _id: share._id,
        patientName: share.patientName,
        sharedAt: share.createdAt,
        expiresAt: share.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error viewing shared report:", error);
    res.status(500).json({
      success: false,
      message: `Failed to view shared report: ${error.message}`,
    });
  }
};

/**
 * POST /api/doctor/shared-reports/:shareId/notes
 * Doctor adds a note/feedback to a shared report.
 */
export const addNote = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { text, type } = req.body;
    const doctorObjectId = req.doctor.id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note text is required.",
      });
    }

    const ShareModel = ReportShare();
    const share = await ShareModel.findOne({
      _id: shareId,
      doctorObjectId,
      status: "active",
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: "Share not found or access has been revoked/expired.",
      });
    }

    const noteType = ["comment", "medication", "prescription", "general"].includes(type)
      ? type
      : "general";

    share.notes.push({
      text: text.trim(),
      type: noteType,
      createdAt: new Date(),
    });

    // Log the note action
    share.accessLog.push({
      accessedAt: new Date(),
      action: "noted",
    });

    await share.save();

    // Notify the patient about the doctor's feedback
    try {
      const noteLabel =
        noteType === "medication"
          ? "medication suggestion"
          : noteType === "prescription"
          ? "prescription note"
          : "note";

      await createNotification(
        String(share.patientId),
        "Doctor Feedback",
        `Dr. ${share.doctorName} added a ${noteLabel} on your shared reports.`,
        "info",
        "/dashboard/shared-reports"
      );
    } catch (notifErr) {
      console.error("Error sending note notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Note added successfully.",
      notes: share.notes,
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({
      success: false,
      message: `Failed to add note: ${error.message}`,
    });
  }
};
