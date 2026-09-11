import React, { useState, useEffect } from "react";
import { 
  FiEdit, 
  FiX, 
  FiPlus,
  FiFileText, 
  FiUser, 
  FiAlertCircle, 
  FiCheck,
  FiClock,
  FiCalendar,
  FiPrinter,
  FiInfo,
  FiTrash2,
  FiHelpCircle,
  FiPlusCircle,
  FiCheckCircle
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import usePatientStore from "../../store/Patient/patientstore";
import { useAuthStore } from "../../store/Patient/authStore";

// Utility function to calculate age from date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const DigitalPrescription = ({ patient, onPrescriptionSaved }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    diagnosis: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { createPrescription } = usePatientStore();
  const { token } = useAuthStore();

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications, 
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    });
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = [...formData.medications];
      updatedMedications.splice(index, 1);
      setFormData({
        ...formData,
        medications: updatedMedications
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate that we have a token
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      // Add patient details and current date to the prescription
      const prescriptionData = {
        ...formData,
        patientId: patient._id,
        patientName: `${patient.name} ${patient.lastname}`,
        patientUMID: patient.umid,
        createdAt: new Date().toISOString()
      };

      // Use createPrescription from patient store with token
      const newPrescription = await createPrescription(prescriptionData, token);
      
      if (newPrescription) {
        toast.success('Prescription created successfully');
        setIsOpen(false);
        
        // Reset form data
        setFormData({
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
          diagnosis: '',
          notes: ''
        });
        
        // Call the callback if provided to refresh parent component
        if (onPrescriptionSaved) {
          onPrescriptionSaved(newPrescription);
        }      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      
      // Check if this is a cancellation error
      if (error.message === 'Request was cancelled') {
        toast.error("Prescription creation was cancelled. Please try again.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to create prescription");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle between edit and preview modes
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // List of common medication frequencies for dropdown
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every morning',
    'Every night',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'With meals',
    'Before meals',
    'After meals'
  ];

  return (
    <>
      {/* Button to open the prescription modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm"
      >
        <FiEdit className="w-4 h-4" />
        <span>Write Prescription</span>
      </button>

      {/* Prescription Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-linear-to-r from-blue-500 to-blue-600 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <FiFileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Digital Prescription</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePreviewMode}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex items-center gap-1.5 text-white backdrop-blur-sm"
                      title={previewMode ? "Switch to Edit Mode" : "Preview Prescription"}
                    >
                      {previewMode ? (
                        <>
                          <FiEdit className="w-5 h-5" />
                          <span className="text-sm">Edit</span>
                        </>
                      ) : (
                        <>
                          <FiFileText className="w-5 h-5" />
                          <span className="text-sm">Preview</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <FiX className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  {previewMode ? 'Previewing prescription' : 'Creating prescription'} for {patient.name} {patient.lastname} (UMID: {patient.umid})
                </p>
              </div>

              {previewMode ? (
                /* Prescription Preview Mode */
                <div className="p-6 bg-linear-to-br from-gray-50 to-blue-50">
                  <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl mx-auto shadow-lg">
                    {/* Header with Hospital Logo and Info */}
                    <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-blue-50 p-2 rounded-lg shadow-sm mr-3">
                          <img src="/logo.png" alt="Medicare Logo" className="h-12 w-12" />
                        </div>
                        <div>
                          <h2 className="font-bold text-xl text-gray-900">Medicare Hospital</h2>
                          <p className="text-gray-500 text-sm">123 Healthcare Ave, Medical District</p>
                          <p className="text-gray-500 text-sm">contact@medicare.healthcare</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg shadow-sm text-right">
                        <h3 className="font-bold text-blue-800">Prescription</h3>
                        <p className="text-gray-600 text-sm">Date: {formatDate(new Date())}</p>
                        <p className="text-gray-600 text-sm">Ref: RX-{Math.floor(Math.random() * 100000)}</p>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-100 rounded-full">
                          <FiUser className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Patient Information</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                        <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <FiUser className="text-blue-500 w-3 h-3" /> Name:
                          </p>
                          <p className="font-medium">{patient.name} {patient.lastname}</p>
                        </div>
                        {patient.dob && (
                          <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                              <FiCalendar className="text-blue-500 w-3 h-3" /> Date of Birth / Age:
                            </p>
                            <p className="font-medium">{patient.dob} ({calculateAge(patient.dob)} years)</p>
                          </div>
                        )}
                        <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <FiInfo className="text-blue-500 w-3 h-3" /> Patient ID:
                          </p>
                          <p className="font-medium">{patient.umid}</p>
                        </div>
                        {patient.bloodType && (
                          <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                              <FiInfo className="text-blue-500 w-3 h-3" /> Blood Type:
                            </p>
                            <p className="font-medium">{patient.bloodType}</p>
                          </div>
                        )}
                      </div>
                      
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <FiAlertCircle className="text-red-500 mr-2" />
                            <p className="font-medium text-red-700">Allergies: {patient.allergies.join(", ")}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Diagnosis */}
                    {formData.diagnosis && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">Diagnosis</h3>
                        <p className="text-gray-800">{formData.diagnosis}</p>
                      </div>
                    )}

                    {/* Medications */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-100 rounded-full">
                          <FiFileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">Prescribed Medications</h3>
                      </div>
                      
                      {formData.medications.map((med, index) => (
                        <div 
                          key={index} 
                          className="mb-4 p-5 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="bg-white p-2 rounded-full shadow-sm mt-0.5">
                                <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 mb-1">{med.name || "[Medication Name]"}</h4>
                                <p className="text-sm text-blue-800 font-medium">{med.dosage || "[Dosage]"}</p>
                              </div>
                            </div>
                            <span className="text-sm bg-white px-2 py-1 rounded-full text-blue-800 shadow-sm">Prescription</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 bg-white/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-100 rounded-full">
                                <FiClock className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Frequency</p>
                                <p className="font-medium text-gray-800">{med.frequency || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-100 rounded-full">
                                <FiCalendar className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="font-medium text-gray-800">{med.duration || "Not specified"}</p>
                              </div>
                            </div>
                            {med.instructions && (
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-blue-100 rounded-full">
                                  <FiInfo className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Instructions</p>
                                  <p className="font-medium text-gray-800">{med.instructions}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Notes */}
                    {formData.notes && (
                      <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-2">Additional Notes/Instructions</h3>
                        <p className="text-gray-800 whitespace-pre-line">{formData.notes}</p>
                      </div>
                    )}

                    {/* Doctor Signature */}
                    <div className="mt-10 flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-500">This is a digital prescription generated on {formatDate(new Date())}</p>
                        <p className="text-sm text-gray-500">Valid for 30 days from the date of issue</p>
                      </div>
                      <div className="text-right">
                        <div className="h-12 border-b border-gray-300 w-48 mb-1"></div>
                        <p className="font-medium">Doctor's Signature</p>
                        <p className="text-sm text-gray-500">Dr. [Doctor Name]</p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Actions */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={togglePreviewMode}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                        isSubmitting 
                          ? 'bg-blue-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          <span>Confirm & Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Prescription Edit Form */
                <form onSubmit={(e) => {e.preventDefault(); togglePreviewMode();}} className="p-6">
                  {/* Patient Information Summary */}
                  <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <FiUser className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-blue-800">Patient Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FiUser className="text-blue-500" /> Name:
                        </p>
                        <p className="font-medium text-gray-900">{patient.name} {patient.lastname}</p>
                      </div>
                      {patient.dob && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FiCalendar className="text-blue-500" /> Age:
                          </p>
                          <p className="font-medium text-gray-900">{calculateAge(patient.dob)} years <span className="text-sm text-gray-500">({patient.dob})</span></p>
                        </div>
                      )}
                      {patient.bloodType && (
                        <div className="bg-white/50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FiInfo className="text-blue-500" /> Blood Type:
                          </p>
                          <p className="font-medium text-gray-900">{patient.bloodType}</p>
                        </div>
                      )}
                      {patient.allergies && patient.allergies.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <FiAlertCircle className="text-red-500" /> Allergies:
                          </p>
                          <p className="font-medium text-red-700">{patient.allergies.join(", ")}</p>
                        </div>
                      )}
                    </div>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="mt-3 text-xs text-red-600 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        <span>Please check allergies before prescribing medications</span>
                      </div>
                    )}
                  </div>

                  {/* Diagnosis */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <FiFileText className="w-4 h-4 text-green-600" />
                      </div>
                      <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                        Diagnosis
                      </label>
                    </div>
                    <textarea
                      id="diagnosis"
                      name="diagnosis"
                      rows={2}
                      value={formData.diagnosis}
                      onChange={handleGeneralChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter diagnosis or reason for prescription"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <FiInfo className="w-3 h-3" />
                      <span>Enter a clear and specific diagnosis for accurate patient records</span>
                    </p>
                  </div>

                  {/* Medications */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-full">
                          <FiFileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">Prescribed Medications</h4>
                      </div>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="inline-flex items-center px-3.5 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm"
                      >
                        <FiPlusCircle className="w-4 h-4 mr-1.5" />
                        Add Medication
                      </button>
                    </div>

                    {formData.medications.map((medication, index) => (
                      <div 
                        key={index} 
                        className="bg-linear-to-r from-gray-50 to-gray-100 rounded-xl p-5 mb-5 border border-gray-200 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-full">
                              <FiFileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <h5 className="font-medium text-gray-900">Medication #{index + 1}</h5>
                          </div>
                          {formData.medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span className="text-sm">Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <FiFileText className="text-blue-500 w-3 h-3" /> Medication Name
                            </label>
                            <input
                              type="text"
                              value={medication.name}
                              onChange={(e) => handleChange(e, index, 'name')}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Enter medication name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <FiInfo className="text-blue-500 w-3 h-3" /> Dosage
                            </label>
                            <input
                              type="text"
                              value={medication.dosage}
                              onChange={(e) => handleChange(e, index, 'dosage')}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="E.g., 500mg, 5ml, etc."
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <FiClock className="text-blue-500 w-3 h-3" /> Frequency
                            </label>
                            <select
                              value={medication.frequency}
                              onChange={(e) => handleChange(e, index, 'frequency')}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select frequency</option>
                              {frequencyOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <FiCalendar className="text-blue-500 w-3 h-3" /> Duration
                            </label>
                            <input
                              type="text"
                              value={medication.duration}
                              onChange={(e) => handleChange(e, index, 'duration')}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="E.g., 7 days, 2 weeks, etc."
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                              <FiHelpCircle className="text-blue-500 w-3 h-3" /> Special Instructions
                            </label>
                            <input
                              type="text"
                              value={medication.instructions}
                              onChange={(e) => handleChange(e, index, 'instructions')}
                              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              placeholder="E.g., Take with food"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Notes */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-purple-100 p-1.5 rounded-full">
                        <FiFileText className="w-4 h-4 text-purple-600" />
                      </div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Additional Notes/Instructions
                    </label>
                    </div>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleGeneralChange}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Any additional instructions or notes for the patient"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <FiInfo className="w-3 h-3" />
                      <span>Include any dietary restrictions, lifestyle changes, or follow-up instructions</span>
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 text-white bg-linear-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm flex items-center gap-2"
                    >
                      <FiFileText className="w-4 h-4" />
                      <span>Preview Prescription</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DigitalPrescription;