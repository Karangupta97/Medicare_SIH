import { User } from "../../models/User/user.model.js";
import { MedicalInfo } from "../../models/User/medicalInfo.model.js";
import { Report } from "../../models/User/report.model.js";
import { getFileUrl } from "../../services/s3.service.js";

/**
 * Get Emergency Folder data by UMID (public, no auth required).
 * Returns only data the patient has chosen to share in emergencies:
 * name, blood group, allergies, emergency contact, reports in Emergency Folder.
 */
export const getEmergencyFolderByUmid = async (req, res) => {
  try {
    const { umid } = req.params;

    if (!umid || !umid.trim()) {
      return res.status(400).json({
        success: false,
        message: "Medicare ID (UMID) is required",
      });
    }

    const UserModel = User();
    const user = await UserModel.findOne({ umid: umid.trim() })
      .select("name lastname bloodGroup umid")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No Emergency Folder found for this Medicare ID",
      });
    }

    const MedicalInfoModel = MedicalInfo();
    const medicalInfo = await MedicalInfoModel.findOne({ userId: user._id })
      .select("allergies emergencyContact emergencyContactPhone")
      .lean();

    const ReportModel = Report();
    const reports = await ReportModel.find({
      userId: user._id,
      inEmergencyFolder: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const reportsWithUrls = await Promise.all(
      reports.map(async (r) => {
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
          console.error(`emergency: failed to get URL for report ${r._id}`, err);
          return { ...r, fileUrl: null };
        }
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name || "",
          lastname: user.lastname || "",
          bloodGroup: user.bloodGroup || null,
          umid: user.umid,
        },
        medical: {
          allergies: medicalInfo?.allergies || [],
          emergencyContact: medicalInfo?.emergencyContact || "",
          emergencyContactPhone: medicalInfo?.emergencyContactPhone || "",
        },
        reports: reportsWithUrls,
      },
    });
  } catch (error) {
    console.error("Error in getEmergencyFolderByUmid:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load Emergency Folder",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
