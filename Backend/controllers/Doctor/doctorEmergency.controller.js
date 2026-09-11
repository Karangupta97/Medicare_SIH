import { User } from "../../models/User/user.model.js";
import { MedicalInfo } from "../../models/User/medicalInfo.model.js";
import { Report } from "../../models/User/report.model.js";
import { Doctor } from "../../models/Doctor/doctor.model.js";
import { getFileUrl } from "../../services/s3.service.js";

/**
 * Get a patient's Emergency Folder data — doctor-authenticated access.
 * The doctor can ONLY see data the patient has chosen to share in emergencies
 * (blood type, allergies, emergency contact, + reports with inEmergencyFolder: true).
 * Private reports that are NOT in the emergency folder are NEVER returned.
 */
export const getDoctorEmergencyAccess = async (req, res) => {
  try {
    const { umid } = req.params;
    const doctorId = req.doctor.id;

    if (!umid || !umid.trim()) {
      return res.status(400).json({
        success: false,
        message: "Patient UMID is required",
      });
    }

    // Fetch the doctor info for access logging
    const DoctorModel = Doctor();
    const doctor = await DoctorModel.findById(doctorId)
      .select("fullName doctorId specialization")
      .lean();

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Find the patient by UMID
    const UserModel = User();
    const user = await UserModel.findOne({ umid: umid.trim() })
      .select("name lastname bloodGroup umid phone dob gender")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No patient found with this UMID",
      });
    }

    // Get medical info
    const MedicalInfoModel = MedicalInfo();
    const medicalInfo = await MedicalInfoModel.findOne({ userId: user._id })
      .select(
        "allergies emergencyContact emergencyContactPhone chronicConditions currentMedications"
      )
      .lean();

    // Get ONLY reports that are in the emergency folder
    const ReportModel = Report();
    const reports = await ReportModel.find({
      userId: user._id,
      inEmergencyFolder: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Generate fresh signed URLs for the emergency reports
    const reportsWithUrls = await Promise.all(
      reports.map(async (r) => {
        try {
          const fileUrl = await getFileUrl(r.s3Key, true);
          return {
            _id: r._id,
            originalFilename: r.originalFilename,
            category: r.category,
            description: r.description || "",
            reportType: r.reportType,
            createdAt: r.createdAt,
            fileUrl,
          };
        } catch (err) {
          console.error(
            `doctor-emergency: failed to get URL for report ${r._id}`,
            err
          );
          return {
            _id: r._id,
            originalFilename: r.originalFilename,
            category: r.category,
            description: r.description || "",
            reportType: r.reportType,
            createdAt: r.createdAt,
            fileUrl: null,
          };
        }
      })
    );

    // Log the emergency access (for audit purposes)
    console.log(
      `[EMERGENCY ACCESS] Doctor ${doctor.fullName} (${doctor.doctorId}) accessed emergency folder of patient ${user.name} ${user.lastname} (${user.umid}) at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      data: {
        patient: {
          name: user.name || "",
          lastname: user.lastname || "",
          bloodGroup: user.bloodGroup || null,
          umid: user.umid,
          phone: user.phone || "",
          dob: user.dob || null,
          gender: user.gender || "",
        },
        medical: {
          allergies: medicalInfo?.allergies || [],
          chronicConditions: medicalInfo?.chronicConditions || [],
          currentMedications: medicalInfo?.currentMedications || "",
          emergencyContact: medicalInfo?.emergencyContact || "",
          emergencyContactPhone: medicalInfo?.emergencyContactPhone || "",
        },
        reports: reportsWithUrls,
        accessInfo: {
          accessedBy: doctor.fullName,
          doctorId: doctor.doctorId,
          accessedAt: new Date().toISOString(),
          accessType: "emergency",
        },
      },
    });
  } catch (error) {
    console.error("Error in getDoctorEmergencyAccess:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to access Emergency Folder",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
