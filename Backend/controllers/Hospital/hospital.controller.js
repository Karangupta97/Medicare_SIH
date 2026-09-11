import { User } from "../../models/User/user.model.js";
import { Report } from "../../models/User/report.model.js";

// Validate UMID format
const isValidUMID = (umid) => {
  // Format should be "AB12345XY" where A,B,X,Y are letters and 1,2,3,4,5 are digits
  // Exactly 2 letters + 5 digits + 2 letters = 9 characters total
  const umidRegex = /^[A-Z]{2}\d{5}[A-Z]{2}$/;
  return umidRegex.test(umid);
};

// Get patient information by UMID
export const getPatientByUMID = async (req, res) => {
  try {
    const { umid } = req.params;
    
    console.log(`Searching for patient with UMID: ${umid}`);
      // Validate UMID format
    if (!isValidUMID(umid)) {
      console.log(`Invalid UMID format: ${umid}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid UMID format. Format should be AB12345XY (2 letters + 5 digits + 2 letters)',
      });
    }
    
    // Find user by UMID
    const UserModel = User();
    const patient = await UserModel.findOne({ umid }).select('-password');
    
    if (!patient) {
      console.log(`No patient found with UMID: ${umid}`);
      return res.status(404).json({
        success: false,
        message: 'Patient not found with the provided UMID',
      });
    }
    
    console.log(`Found patient: ${patient.name} ${patient.lastname} (${patient._id})`);
    
    // Return patient info (excluding sensitive data)
    res.json({
      success: true,
      patient: {
        _id: patient._id,
        name: patient.name,
        lastname: patient.lastname,
        email: patient.email,
        dob: patient.dob,
        phone: patient.phone,
        umid: patient.umid,
        photoURL: patient.photoURL,
      },
    });
  } catch (error) {
    console.error('Error fetching patient by UMID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient information. Please try again.',
    });
  }
};

// Get all reports for a patient
export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log(`Fetching reports for patient ID: ${patientId}`);
    
    // Find all reports for the patient
    const ReportModel = Report();
    const reports = await ReportModel.find({ userId: patientId })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${reports.length} reports for patient ID: ${patientId}`);
    
    // Generate fresh signed URLs for each report
    const reportPromises = reports.map(async (report) => {
      const reportObject = report.toObject();
      
      // For security reasons, here we would actually regenerate the signed URL
      // But we'll just use the existing one for simplicity
      return {
        ...reportObject,
        fileUrl: reportObject.fileUrl
      };
    });
    
    const reportResults = await Promise.all(reportPromises);
    
    res.json({
      success: true,
      reports: reportResults,
    });
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient reports. Please try again.',
    });
  }
};

// Get recent patients for hospital dashboard
export const getRecentPatients = async (req, res) => {
  try {
    console.log('Fetching recent patients for hospital dashboard');
    
    // Find the 5 most recently created/updated users
    // In a real application, this would filter for only patients
    // and might use a "lastVisit" or similar field instead of updatedAt
    const UserModel = User();
    const recentPatients = await UserModel.find({})
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name lastname umid updatedAt photoURL');
    
    // Format data for the frontend
    const formattedPatients = recentPatients.map(patient => ({
      id: patient._id,
      name: `${patient.name} ${patient.lastname}`,
      umid: patient.umid,
      lastVisit: patient.updatedAt, // Using updatedAt as a proxy for last visit date
      status: determinePatientStatus(patient), // Determine status based on patient data
      photoURL: patient.photoURL
    }));
    
    console.log(`Found ${formattedPatients.length} recent patients`);
    
    res.json({
      success: true,
      patients: formattedPatients
    });
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent patients. Please try again.'
    });
  }
};

// Helper function to determine patient status (for demonstration purposes)
const determinePatientStatus = (patient) => {
  // In a real application, this would use actual medical data
  // Here we're just assigning statuses based on simple rules
  
  // Use the last digit of the ID to determine status (just for demo)
  const lastChar = patient._id.toString().slice(-1);
  const lastDigit = parseInt(lastChar, 16) % 4;
  
  switch (lastDigit) {
    case 0:
      return 'Stable';
    case 1:
      return 'Follow-up';
    case 2:
      return 'Critical';
    case 3:
      return 'Discharged';
    default:
      return 'Stable';
  }
};