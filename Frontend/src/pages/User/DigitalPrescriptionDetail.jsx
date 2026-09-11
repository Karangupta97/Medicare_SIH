import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";
import {
  FiFileText,
  FiUser,
  FiCalendar,
  FiArrowLeft,
  FiPrinter,
  FiShare2,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiBriefcase,
  FiRefreshCw,
  FiClock} from "react-icons/fi";

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { 
    isLoading,
    error,
    getPrescriptionById
  } = usePatientStore();
  const [prescription, setPrescription] = useState(null);
  const prescriptionRef = useRef(null);

  // Fetch prescription details
  useEffect(() => {
    const fetchPrescriptionDetails = async () => {
      try {
        const prescriptionData = await getPrescriptionById(token, id);
        setPrescription(prescriptionData);
      } catch (err) {
        console.error("Error fetching prescription details:", err);
        toast.error("An error occurred while fetching the prescription");
      }
    };

    if (token && id) {
      fetchPrescriptionDetails();
    }
  }, [token, id, getPrescriptionById]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  };

  // Handle print prescription
  const handlePrint = () => {
    window.print();
  };

  // Handle share prescription
  const handleShare = () => {
    toast.success("Share functionality coming soon!");
  };

  // Loading state
  if (isLoading) {
    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
            </div>
          </div>
        </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-red-100 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center mb-3 sm:mb-4">
                <FiAlertTriangle className="text-red-500 text-lg sm:text-xl" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Prescription Not Found</h2>
              <p className="text-gray-600 max-w-md mb-4 text-xs sm:text-sm">
                {error || "We couldn't find the prescription you're looking for. It may have been removed or you might not have permission to view it."}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Link
                  to="/dashboard/digital-prescriptions"
                  className="px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <FiArrowLeft className="inline mr-1" /> Back to All Prescriptions
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <FiRefreshCw className="inline mr-1" /> Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!prescription) {
    return (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4 text-center">
            <div className="rounded-full bg-yellow-100 h-10 w-10 sm:h-12 sm:w-12 mx-auto flex items-center justify-center mb-3 sm:mb-4">
              <FiInfo className="text-yellow-500 text-lg sm:text-xl" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">No Prescription Found</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-4 text-xs sm:text-sm">
              The prescription you're looking for could not be found.
            </p>
            <Link
              to="/dashboard/digital-prescriptions"
              className="px-2 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block text-xs sm:text-sm"
            >
              <FiArrowLeft className="inline mr-1" /> Back to All Prescriptions
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {/* Header/Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-blue-600" /> Digital Prescription
            </h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm flex items-center">
              <FiClock className="inline mr-1" /> Issued on {formatDate(prescription.createdAt)}
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Link
              to="/dashboard/digital-prescriptions"
              className="inline-flex items-center px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 text-xs sm:text-sm"
            >
              <FiArrowLeft className="mr-1" /> Back
            </Link>
          </div>
        </div>
        {/* Prescription Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-4" ref={prescriptionRef}>
          {/* Prescription Header */}
          <div className="bg-linear-to-r from-blue-50 to-blue-100 px-2 sm:px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center">
                <div className="bg-white p-1.5 rounded-md shadow-sm mr-2 shrink-0">
                  <FiFileText className="text-blue-600 text-base sm:text-lg" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                    Prescription #{prescription._id.substring(0, 8)}
                  </h2>
                  <p className="text-xs text-gray-600">
                    Issued: {formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={handlePrint}
                  className="p-1 sm:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Print Prescription"
                >
                  <FiPrinter className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 sm:p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Share Prescription"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Main content */}
          <div className="p-2 sm:p-4">
            {/* Status banner */}
            <div className={`mb-4 p-2 rounded-lg flex items-center
              ${prescription.status === "Active" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-blue-50 text-blue-700 border border-blue-200"}`}
            >
              {prescription.status === "Active" ? (
                <FiCheckCircle className="mr-2 shrink-0" />
              ) : (
                <FiInfo className="mr-2 shrink-0" />
              )}
              <span className="text-xs font-medium">
                This prescription is currently {prescription.status || "Active"}
              </span>
            </div>
            {/* Doctor and Hospital Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
              {/* Doctor Info */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                <h3 className="text-xs text-gray-500 mb-1 flex items-center">
                  <FiUser className="mr-2 shrink-0" /> Prescribed By
                </h3>
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <FiUser className="text-blue-600 text-xs sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">Dr. {prescription.doctor || "Not specified"}</p>
                    <p className="text-xs text-gray-600 truncate">{prescription.doctorSpecialty || "General Physician"}</p>
                    {prescription.doctorRegistrationNumber && (
                      <p className="text-xs text-gray-500 mt-1 truncate">Reg. No: {prescription.doctorRegistrationNumber}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Hospital Info */}
              <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                <h3 className="text-xs text-gray-500 mb-1 flex items-center">
                  <FiBriefcase className="mr-2 shrink-0" /> Hospital/Clinic
                </h3>
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <FiBriefcase className="text-blue-600 text-xs sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-xs sm:text-sm truncate">{prescription.hospitalName || "Medicare Hospital"}</p>
                    <p className="text-xs text-gray-600 truncate">{prescription.hospitalAddress || "Address not specified"}</p>
                    {prescription.hospitalPhone && (
                      <p className="text-xs text-gray-500 mt-1 truncate">Tel: {prescription.hospitalPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Patient Information */}
            <div className="mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Patient Information</h3>
              <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-xs sm:text-sm truncate">{user?.name || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Patient ID</p>
                    <p className="font-medium text-xs sm:text-sm truncate">{user?.umid || prescription.patientId || "Not available"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Age / Gender</p>
                    <p className="font-medium text-xs sm:text-sm">{prescription.patientAge || "N/A"} / {prescription.patientGender || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="font-medium text-xs sm:text-sm truncate">{user?.phone || "Not available"}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Diagnosis</h3>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-800">{prescription.diagnosis}</p>
                </div>
              </div>
            )}
            {/* Medications */}
            <div className="mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Medications</h3>
              {prescription.medications && prescription.medications.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left font-medium text-gray-500 uppercase">Medication</th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left font-medium text-gray-500 uppercase">Dosage</th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left font-medium text-gray-500 uppercase">Frequency</th>
                        <th scope="col" className="px-2 sm:px-3 py-2 text-left font-medium text-gray-500 uppercase">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prescription.medications.map((medication, index) => (
                        <tr key={index}>
                          <td className="px-2 sm:px-3 py-2 font-medium text-gray-800">{medication.name}</td>
                          <td className="px-2 sm:px-3 py-2 text-gray-700">{medication.dosage || "As directed"}</td>
                          <td className="px-2 sm:px-3 py-2 text-gray-700">{medication.frequency || "As needed"}</td>
                          <td className="px-2 sm:px-3 py-2 text-gray-700">{medication.duration || "Until completed"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">No medications specified</p>
                </div>
              )}
            </div>
            {/* Instructions */}
            {prescription.instructions && (
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-800">{prescription.instructions}</p>
                </div>
              </div>
            )}
            {/* Additional Notes */}
            {prescription.notes && (
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Additional Notes</h3>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-800">{prescription.notes}</p>
                </div>
              </div>
            )}
            {/* Follow-up */}
            {prescription.followUp && (
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-2">Follow-up</h3>
                <div className="bg-blue-50 rounded-lg p-2 sm:p-4 border border-blue-100">
                  <div className="flex items-start">
                    <FiCalendar className="text-blue-600 mt-0.5 mr-2 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-800">{prescription.followUp}</p>
                      {prescription.followUpDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          {formatDate(prescription.followUpDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Digital Signature */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-500">Digitally signed by</p>
                  <p className="font-medium text-xs sm:text-sm text-gray-800">Dr. {prescription.doctor || "Physician"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    on {formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)}
                  </p>
                </div>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <div className="text-xs text-center text-gray-600 mb-1">Digital Signature</div>
                  <div className="border-2 border-dashed border-blue-200 rounded p-1 sm:p-2 text-center">
                    <p className="text-xs text-blue-800 font-medium">Electronically Verified</p>
                    <p className="text-xs text-gray-500">{prescription._id.substring(0, 12)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
          >
            <FiPrinter className="mr-1" /> Print Prescription
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs sm:text-sm"
          >
            <FiShare2 className="mr-1" /> Share
          </button>
        </div>
      </div>
  );
};

export default PrescriptionDetail;