import { Prescription } from "../../models/Hospital/prescription.model.js";
import { User } from "../../models/User/user.model.js";
import { createNotification } from "../User/notifications.controller.js";

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    // Get data from request body
    const {
      patientId,
      patientName,
      patientUMID,
      diagnosis,
      medications,
      notes,
      createdAt
    } = req.body;

    // Validate required fields
    if (!patientId || !patientName || !patientUMID || !medications || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: patient information and medications are required"
      });
    }

    // Add doctor information from the logged-in user
    const UserModel = User();
    const doctorUser = await UserModel.findById(req.user.id).select("name");
    
    // Create new prescription
    const PrescriptionModel = Prescription();
    const prescription = new PrescriptionModel({
      patientId,
      patientName,
      patientUMID,
      doctorId: req.user.id,
      doctor: doctorUser ? `${doctorUser.name}` : "Medicare Doctor",
      diagnosis,
      medications,
      notes,
      createdAt: createdAt || new Date()
    });

    // Save prescription to database
    await prescription.save();

    // Create a notification for the patient
    await createNotification(
      patientId, 
      "New Prescription", 
      `Dr. ${doctorUser ? doctorUser.name : "Medicare Doctor"} has issued you a new prescription.`, 
      "info", 
      `/digital-prescriptions/${prescription._id}`
    );

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message
    });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    const PrescriptionModel = Prescription();
    const prescription = await PrescriptionModel.findById(prescriptionId);
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message
    });
  }
};

// Get all prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log("Fetching prescriptions for patient:", patientId);
    console.log("Request from doctor ID:", req.user.id);
    
    // Check if patientId is valid
    if (!patientId || patientId === 'undefined') {
      console.error("Invalid patientId provided:", patientId);
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID provided"
      });
    }

    // Query for all prescriptions regardless of which doctor created them
    const PrescriptionModel = Prescription();
    const prescriptions = await PrescriptionModel.find({ patientId })
      .sort({ createdAt: -1 });
    
    console.log("Found prescriptions:", prescriptions.length);
    
    if (prescriptions.length > 0) {
      const samplePrescription = prescriptions[0];
      console.log("Sample prescription data:", {
        id: samplePrescription._id,
        patientId: samplePrescription.patientId,
        doctorId: samplePrescription.doctorId,
        doctor: samplePrescription.doctor,
        patientName: samplePrescription.patientName,
        medicationsCount: samplePrescription.medications ? samplePrescription.medications.length : 0,
        createdAt: samplePrescription.createdAt
      });
    } else {
      console.log("No prescriptions found for this patient");
    }
    
    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions
    });
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient prescriptions",
      error: error.message
    });
  }
};

// Get all prescriptions created by a doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    // Get prescriptions created by the logged-in doctor
    console.log("Fetching prescriptions for doctor:", req.user.id);
    
    const PrescriptionModel = Prescription();
    const prescriptions = await PrescriptionModel.find({ doctorId: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log("Found doctor prescriptions:", prescriptions.length);
    
    return res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    console.error("Error fetching doctor prescriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor prescriptions",
      error: error.message
    });
  }
};

// Get prescriptions for a patient from other doctors
export const getOtherDoctorPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const currentDoctorId = req.user.id; // Use req.user.id instead of _id
    
    // Find prescriptions where:
    // 1. The patient matches patientId
    // 2. The doctor is NOT the current doctor (other doctors only)
    // 3. Sort by newest first
    const PrescriptionModel = Prescription();
    const prescriptions = await PrescriptionModel.find({ 
      patientId: patientId, // Use patientId field instead of patient
      doctorId: { $ne: currentDoctorId } // Use doctorId field instead of doctor
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Transform the data to include doctor name and hospital info
    const formattedPrescriptions = prescriptions.map(prescription => {
      return {
        _id: prescription._id,
        medications: prescription.medications,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        followUp: prescription.followUp,
        createdAt: prescription.createdAt,
        doctorName: prescription.doctor || 'Unknown Doctor', // Use doctor field directly
        doctorHospital: prescription.hospital || 'Unknown Hospital' // Add hospital field if available
      };
    });
    
    return res.status(200).json({
      success: true,
      count: formattedPrescriptions.length,
      prescriptions: formattedPrescriptions
    });
  } catch (error) {
    console.error("Error fetching other doctor prescriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching prescriptions from other doctors",
      error: error.message
    });
  }
};