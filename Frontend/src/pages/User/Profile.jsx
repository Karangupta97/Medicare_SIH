import React from "react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  FaUserEdit,
  FaIdCard,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaHistory,
  FaCamera,
  FaChevronDown,
  FaBirthdayCake,
  FaSave,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaUser,
  FaEdit,
  FaRunning,
  FaClipboardList,
} from "react-icons/fa";
import {
  FiX,
  FiEye,

  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuthStore } from "../../store/Patient/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";
import PhotoEditorModal from "../../components/User/PhotoEditorModal";

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);
  const [showPicOptions, setShowPicOptions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [medicalEditMode, setMedicalEditMode] = useState(false);
  const fileInputRef = useRef(null);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

  // Address data states
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  // Pincode lookup states
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    state: "",
    postalCode: "",
    dob: "",
    gender: "",
    bloodGroup: "",
  });
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);

  // Medical info state
  const [medicalInfo, setMedicalInfo] = useState({
    gender: "",
    bloodGroup: "",
    height: "",
    weight: "",
    chronicConditions: [],
    allergies: [],
    emergencyContact: "",
    emergencyContactPhone: "",
    smokingStatus: "",
    alcoholConsumption: "",
    exerciseFrequency: "",
    previousSurgeries: "",
    familyMedicalHistory: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    // Additional comprehensive medical fields
    currentMedications: "",
    primaryPhysician: "",
    primaryPhysicianPhone: "",
    lastPhysicalExam: "",
    lastBloodWork: "",
    vaccinations: [],
    mentalHealthStatus: "",
    sleepPatterns: "",
    stressLevel: "",
    occupationalHazards: [],
    pregnancyStatus: "",
    menstrualCycle: "",
    sexuallyActive: "",
    birthControlMethod: "",
    disability: "",
    assistiveDevices: [],
    organDonor: "",
    advancedDirectives: "",
    preferredPharmacy: "",
    pharmacyPhone: "",
    bloodPressure: "",
    heartRate: "",
    bodyTemperature: "",
    oxygenSaturation: "",
  });

  // Height unit state and values
  const [heightInput, setHeightInput] = useState("");
  const [detectedUnit, setDetectedUnit] = useState("cm");

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genders = ["Male", "Female", "Other"];
  const chronicOptions = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Heart Disease",
    "Thyroid Disorder",
    "Arthritis",
    "High Cholesterol",
    "Depression",
    "Anxiety",
    "Kidney Disease",
    "None",
  ];
  const allergyOptions = [
    "Penicillin",
    "Peanuts",
    "Shellfish",
    "Pollen",
    "Dust",
    "Latex",
    "Eggs",
    "Milk",
    "Soy",
    "Sulfa Drugs",
    "None",
  ];
  const smokingStatusOptions = [
    "Never smoked",
    "Former smoker",
    "Current smoker (less than 1 pack/day)",
    "Current smoker (1+ packs/day)",
  ];
  const alcoholOptions = [
    "Never",
    "Rarely (special occasions)",
    "Socially (1-2 drinks/week)",
    "Moderately (3-7 drinks/week)",
    "Frequently (8+ drinks/week)",
  ];
  const exerciseOptions = [
    "Sedentary (little to no exercise)",
    "Lightly active (1-3 days/week)",
    "Moderately active (3-5 days/week)",
    "Very active (6-7 days/week)",
    "Extremely active (multiple times/day)",
  ];
  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Low sodium",
    "Diabetic diet",
    "Heart-healthy diet",
    "None",
  ];

  // Additional comprehensive medical options
  const vaccinationOptions = [
    "COVID-19",
    "Influenza (Annual)",
    "Hepatitis A",
    "Hepatitis B",
    "MMR (Measles, Mumps, Rubella)",
    "Tetanus/Diphtheria",
    "Pneumococcal",
    "HPV",
    "Shingles",
    "Meningococcal",
    "Polio",
    "Varicella (Chickenpox)",
  ];

  const mentalHealthOptions = [
    "Excellent",
    "Good",
    "Fair",
    "Poor",
    "Currently receiving treatment",
    "History of depression",
    "History of anxiety",
    "History of other mental health conditions",
  ];

  const sleepPatternOptions = [
    "4-5 hours per night",
    "6-7 hours per night",
    "8-9 hours per night",
    "10+ hours per night",
    "Irregular sleep schedule",
    "Difficulty falling asleep",
    "Frequent wake-ups",
    "Sleep apnea",
  ];

  const stressLevelOptions = [
    "Very Low",
    "Low",
    "Moderate",
    "High",
    "Very High",
    "Chronic stress",
  ];

  const occupationalHazardOptions = [
    "Chemical exposure",
    "Radiation exposure",
    "Noise exposure",
    "Physical strain/repetitive motion",
    "Psychological stress",
    "Infectious disease exposure",
    "Heavy lifting",
    "None",
  ];

  const assistiveDeviceOptions = [
    "Wheelchair",
    "Walker",
    "Cane",
    "Hearing aid",
    "Glasses/Contacts",
    "Prosthetic limb",
    "Oxygen tank",
    "CPAP machine",
    "Insulin pump",
    "None",
  ];

  const birthControlOptions = [
    "None",
    "Condoms",
    "Birth control pills",
    "IUD",
    "Implant",
    "Injection",
    "Patch",
    "Diaphragm",
    "Vasectomy",
    "Tubal ligation",
    "Natural family planning",
  ];

  // Height conversion utilities
  const convertCmToFeetInches = (cm) => {
    if (!cm || cm <= 0) return { feet: "", inches: "" };

    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    return { feet: feet.toString(), inches: inches.toString() };
  };

  const convertCmToDecimalFeet = (cm) => {
    if (!cm || cm <= 0) return "";

    const totalInches = cm / 2.54;
    const decimalFeet = totalInches / 12;

    return decimalFeet.toFixed(1);
  };

  const convertFeetInchesToCm = (feet, inches) => {
    const feetNum = parseInt(feet) || 0;
    const inchesNum = parseInt(inches) || 0;

    if (feetNum === 0 && inchesNum === 0) return "";

    const totalInches = feetNum * 12 + inchesNum;
    return Math.round(totalInches * 2.54).toString();
  };

  const convertDecimalFeetToCm = (decimalFeet) => {
    const feetNum = parseFloat(decimalFeet) || 0;

    if (feetNum === 0) return "";

    const totalInches = feetNum * 12;
    return Math.round(totalInches * 2.54).toString();
  };

  const formatHeightDisplay = (cm) => {
    if (!cm) return "Not provided";

    const feetInches = convertCmToFeetInches(cm);
    if (!feetInches.feet && !feetInches.inches) return `${cm} cm`;

    return `${cm} cm (${feetInches.feet}'${feetInches.inches}")`;
  };

  // Smart height input parser
  const parseHeightInput = (input) => {
    if (!input || !input.trim()) return { value: "", unit: "cm", cm: "" };

    const cleanInput = input.toLowerCase().trim();

    // Check for ft/feet patterns (5.6 ft, 5.6ft, 5.6 feet, 5.6feet)
    const ftMatch = cleanInput.match(/^(\d+\.?\d*)\s*(ft|feet)?\s*$/);
    if (
      ftMatch ||
      (parseFloat(cleanInput) > 0 && parseFloat(cleanInput) <= 8.5)
    ) {
      const feetValue = parseFloat(cleanInput);
      if (feetValue > 0 && feetValue <= 8.5) {
        const cm = convertDecimalFeetToCm(feetValue.toString());
        return { value: feetValue.toString(), unit: "ft", cm };
      }
    }

    // Check for cm patterns (170 cm, 170cm, just 170)
    const cmMatch = cleanInput.match(/^(\d+\.?\d*)\s*(cm)?\s*$/);
    if (cmMatch) {
      const cmValue = parseFloat(cmMatch[1]);
      if (cmValue >= 50 && cmValue <= 300) {
        return {
          value: cmValue.toString(),
          unit: "cm",
          cm: cmValue.toString(),
        };
      }
    }

    // Default to cm for pure numbers in typical height range
    const numValue = parseFloat(cleanInput);
    if (numValue >= 50 && numValue <= 300) {
      return {
        value: numValue.toString(),
        unit: "cm",
        cm: numValue.toString(),
      };
    }

    return { value: input, unit: "cm", cm: "" };
  };

  // Handle smart height input
  const handleHeightInputChange = (value) => {
    setHeightInput(value);
    const parsed = parseHeightInput(value);
    setDetectedUnit(parsed.unit);
    setMedicalInfo((prev) => ({ ...prev, height: parsed.cm }));
  };

  // Function to fetch medical information
  const fetchMedicalInfo = async () => {
    try {
      const response = await axios.get("/api/medical-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success && response.data.medicalInfo) {
        const medicalData = response.data.medicalInfo;
        setMedicalInfo({
          gender: user?.gender || "",
          bloodGroup: user?.bloodGroup || "",
          height: medicalData.height || "",
          weight: medicalData.weight || "",
          chronicConditions: medicalData.chronicConditions || [],
          allergies: medicalData.allergies || [],
          emergencyContact: medicalData.emergencyContact || "",
          emergencyContactPhone: medicalData.emergencyContactPhone || "",
          smokingStatus: medicalData.smokingStatus || "",
          alcoholConsumption: medicalData.alcoholConsumption || "",
          exerciseFrequency: medicalData.exerciseFrequency || "",
          previousSurgeries: medicalData.previousSurgeries || "",
          familyMedicalHistory: medicalData.familyMedicalHistory || "",
          insuranceProvider: medicalData.insuranceProvider || "",
          insurancePolicyNumber: medicalData.insurancePolicyNumber || "",
          currentMedications: medicalData.currentMedications || "",
          primaryPhysician: medicalData.primaryPhysician || "",
          primaryPhysicianPhone: medicalData.primaryPhysicianPhone || "",
          lastPhysicalExam: medicalData.lastPhysicalExam || "",
          lastBloodWork: medicalData.lastBloodWork || "",
          vaccinations: medicalData.vaccinations || [],
          mentalHealthStatus: medicalData.mentalHealthStatus || "",
          sleepPatterns: medicalData.sleepPatterns || "",
          stressLevel: medicalData.stressLevel || "",
          occupationalHazards: medicalData.occupationalHazards || [],
          pregnancyStatus: medicalData.pregnancyStatus || "",
          menstrualCycle: medicalData.menstrualCycle || "",
          sexuallyActive: medicalData.sexuallyActive || "",
          birthControlMethod: medicalData.birthControlMethod || "",
          disability: medicalData.disability || "",
          assistiveDevices: medicalData.assistiveDevices || [],
          organDonor: medicalData.organDonor || "",
          advancedDirectives: medicalData.advancedDirectives || "",
          preferredPharmacy: medicalData.preferredPharmacy || "",
          pharmacyPhone: medicalData.pharmacyPhone || "",
          bloodPressure: medicalData.bloodPressure || "",
          heartRate: medicalData.heartRate || "",
          bodyTemperature: medicalData.bodyTemperature || "",
          oxygenSaturation: medicalData.oxygenSaturation || "",
        });
      } else {
        // No medical info exists yet, keep default empty values
        console.log("No medical information found for user");
      }
    } catch (error) {
      console.error("Error fetching medical information:", error);
      // Keep default empty values on error
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
      setFormData({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: user.dob || "",
        addressLine1: user.addressLine1 || "",
        addressLine2: user.addressLine2 || "",
        state: user.state || "",
        district: user.district || "",
        postalCode: user.postalCode || "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
      });

      // Fetch medical information separately
      fetchMedicalInfo();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.dob) {
      const today = new Date();
      const dob = new Date(user.dob);
      if (
        today.getDate() === dob.getDate() &&
        today.getMonth() === dob.getMonth()
      ) {
        setShowBirthdayModal(true);
      }
    }
  }, [user]);

  // Handle navigation state to open edit mode
  useEffect(() => {
    if (location.state?.openEditMode) {
      setEditMode(true);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value || !value.trim()) error = "First name is required";
        else if (value.trim().length < 2)
          error = "First name must be at least 2 characters";
        else if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          error = "First name should only contain letters";
        break;
      case "lastname":
        if (!value || !value.trim()) error = "Last name is required";
        else if (value.trim().length < 2)
          error = "Last name must be at least 2 characters";
        else if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          error = "Last name should only contain letters";
        break;
      case "phone":
        if (
          value &&
          value.trim() &&
          !/^\+?[\d\s\-\(\)]{10,15}$/.test(value.trim())
        )
          error = "Please enter a valid phone number";
        break;
      case "dob":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 0 || age > 150)
            error = "Please enter a valid date of birth";
        }
        break;
      case "postalCode":
        if (value && value.trim()) {
          if (value.trim().length !== 6) error = "Postal code must be 6 digits";
          else if (!/^\d{6}$/.test(value.trim()))
            error = "Postal code should only contain numbers";
        }
        break;
      case "addressLine1":
        if (value && value.trim() && value.trim().length < 5)
          error = "Address must be at least 5 characters";
        break;
      case "district":
      case "state":
        // These fields are auto-populated from pincode, so only validate length if manually entered
        if (value && value.trim()) {
          if (value.trim().length < 2)
            error = `${
              name.charAt(0).toUpperCase() + name.slice(1)
            } must be at least 2 characters`;
          // Removed letters-only restriction to allow numbers and special characters in place names
        }
        break;
      case "gender":
        if (!value) error = "Please select your gender";
        break;
      case "bloodGroup":
        if (!value) error = "Please select your blood group";
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error === "";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = "First name is required";
      isValid = false;
    }
    if (!formData.lastname.trim()) {
      errors.lastname = "Last name is required";
      isValid = false;
    }
    if (!formData.gender) {
      errors.gender = "Gender is required";
      isValid = false;
    }
    if (!formData.bloodGroup) {
      errors.bloodGroup = "Blood group is required";
      isValid = false;
    }

    // Additional validations
    Object.keys(formData).forEach((key) => {
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });

    setValidationErrors(errors);
    setIsFormValid(isValid);
    return isValid;
  };

  // Separate validation function for address data
  const validateAddressForm = () => {
    const errors = {};
    let isValid = true;

    // Required address fields
    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Address Line 1 is required";
      isValid = false;
    }
    if (!formData.postalCode.trim()) {
      errors.postalCode = "Postal Code is required";
      isValid = false;
    }

    // Validate specific address fields only if they have values
    const addressFields = ["addressLine1", "postalCode"];
    addressFields.forEach((key) => {
      if (formData[key] && !validateField(key, formData[key])) {
        isValid = false;
      }
    });

    // Validate optional fields only if they have values
    const optionalFields = ["addressLine2", "district", "state"];
    optionalFields.forEach((key) => {
      if (
        formData[key] &&
        formData[key].trim() &&
        !validateField(key, formData[key])
      ) {
        isValid = false;
      }
    });

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return isValid;
  };

  const handlePicView = () => {
    setIsPicModalOpen(true);
  };

  const handlePhotoClick = () => {
    setIsPhotoEditorOpen(true);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, JPG or PNG)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setUser((prev) => ({
      ...prev,
      photoURL: localPreview,
      _tempPhotoURL: true,
    }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.put("/api/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload progress:", percentCompleted);
        },
      });

      if (response.data.user && response.data.user.photoURL) {
        setUser({
          ...response.data.user,
          _tempPhotoURL: false,
        });

        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            photoURL: response.data.user.photoURL,
            _tempPhotoURL: false,
          })
        );

        toast.success("Profile photo updated successfully");
      } else {
        throw new Error("Invalid server response: Missing photo URL");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setUser((prev) => ({
        ...prev,
        photoURL: user.photoURL,
        _tempPhotoURL: false,
      }));

      if (error.response?.status === 413) {
        toast.error("Image size too large. Please select a smaller file.");
      } else if (error.response?.status === 415) {
        toast.error("Invalid file type. Please select a JPEG or PNG image.");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to update profile photo. Please try again."
        );
      }
    } finally {
      setUploading(false);
      if (localPreview) URL.revokeObjectURL(localPreview);
    }
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) {
      toast.error("Please fix address validation errors before saving");
      return;
    }

    setSaving(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading(
        "Validating and saving your address..."
      );

      // Check if we have required address fields
      if (!formData.addressLine1 || !formData.postalCode) {
        toast.error("Address Line 1 and Postal Code are required");
        return;
      }

      // Prepare address data
      const addressData = {
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || "",
        district: formData.district,
        state: formData.state,
        postalCode: formData.postalCode,
      };

      // Use the new address validation endpoint
      const response = await axios.post(
        "/api/pincode/validate-address",
        addressData
      );

      if (response.data.success && response.data.user) {
        setUser(response.data.user);

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        // Show success message
        toast.success("Address validated and saved successfully!", {
          icon: "✅",
          duration: 4000,
        });

        setAddressEditMode(false);
        setValidationErrors({});
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating address:", error);

      // Handle specific error messages
      const errorMessage =
        error.response?.data?.message || "Failed to validate and save address";

      if (errorMessage.includes("mismatch")) {
        toast.error(`Validation Error: ${errorMessage}`, {
          duration: 6000,
        });
      } else if (errorMessage.includes("PIN code")) {
        toast.error(`PIN Code Error: ${errorMessage}`, {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 4000,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSave = async (editedImage) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", editedImage);

      const response = await axios.put("/api/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.user) {
        setUser({
          ...response.data.user,
          _tempPhotoURL: false,
        });

        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            photoURL: response.data.user.photoURL,
            _tempPhotoURL: false,
          })
        );

        toast.success("Profile photo updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setUploading(false);
      setIsPhotoEditorOpen(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDOB = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;

    const birthDate = new Date(dateString);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleMedicalChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setMedicalInfo((prev) => {
        const arr = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...arr, value] };
        } else {
          return { ...prev, [name]: arr.filter((v) => v !== value) };
        }
      });
    } else {
      setMedicalInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateMedicalForm = () => {
    const { gender, bloodGroup, height, weight } = medicalInfo;

    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!bloodGroup) {
      toast.error("Please select your blood group");
      return false;
    }
    if (!height || height <= 0) {
      toast.error("Please enter a valid height");
      return false;
    }
    if (!weight || weight <= 0) {
      toast.error("Please enter a valid weight");
      return false;
    }

    return true;
  };

  const handleMedicalSave = async (e) => {
    e.preventDefault();

    if (!validateMedicalForm()) return;

    setSaving(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading(
        "Updating your medical information..."
      );

      // Create medical data object
      const medicalData = {
        gender: medicalInfo.gender,
        bloodGroup: medicalInfo.bloodGroup,
        height: medicalInfo.height,
        weight: medicalInfo.weight,
        chronicConditions: medicalInfo.chronicConditions,
        allergies: medicalInfo.allergies,
        emergencyContact: medicalInfo.emergencyContact,
        emergencyContactPhone: medicalInfo.emergencyContactPhone,
        smokingStatus: medicalInfo.smokingStatus,
        alcoholConsumption: medicalInfo.alcoholConsumption,
        exerciseFrequency: medicalInfo.exerciseFrequency,
        previousSurgeries: medicalInfo.previousSurgeries,
        familyMedicalHistory: medicalInfo.familyMedicalHistory,
        insuranceProvider: medicalInfo.insuranceProvider,
        insurancePolicyNumber: medicalInfo.insurancePolicyNumber,
        // Additional comprehensive medical fields
        currentMedications: medicalInfo.currentMedications,
        primaryPhysician: medicalInfo.primaryPhysician,
        primaryPhysicianPhone: medicalInfo.primaryPhysicianPhone,
        lastPhysicalExam: medicalInfo.lastPhysicalExam,
        lastBloodWork: medicalInfo.lastBloodWork,
        vaccinations: medicalInfo.vaccinations,
        mentalHealthStatus: medicalInfo.mentalHealthStatus,
        sleepPatterns: medicalInfo.sleepPatterns,
        stressLevel: medicalInfo.stressLevel,
        occupationalHazards: medicalInfo.occupationalHazards,
        pregnancyStatus: medicalInfo.pregnancyStatus,
        menstrualCycle: medicalInfo.menstrualCycle,
        sexuallyActive: medicalInfo.sexuallyActive,
        birthControlMethod: medicalInfo.birthControlMethod,
        disability: medicalInfo.disability,
        assistiveDevices: medicalInfo.assistiveDevices,
        organDonor: medicalInfo.organDonor,
        advancedDirectives: medicalInfo.advancedDirectives,
        preferredPharmacy: medicalInfo.preferredPharmacy,
        pharmacyPhone: medicalInfo.pharmacyPhone,
        bloodPressure: medicalInfo.bloodPressure,
        heartRate: medicalInfo.heartRate,
        bodyTemperature: medicalInfo.bodyTemperature,
        oxygenSaturation: medicalInfo.oxygenSaturation,
      };

      // Send update request to the backend medical info endpoint
      const response = await axios.put(
        "/api/medical-info/update",
        medicalData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if update was successful
      if (response.data.success) {
        // Update user state - medical info is now separate but we can still update the UI
        setMedicalInfo(medicalData);
        // Note: The actual user object doesn't contain medical fields anymore
        // Medical data is stored separately and fetched when needed
      } else {
        throw new Error(response.data.message || "Update failed");
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      toast.success("Medical information updated successfully!", {
        icon: "🏥",
        duration: 3000,
      });

      // Close edit mode
      setMedicalEditMode(false);
    } catch (error) {
      console.error("Error updating medical information:", error);
      toast.error(
        error.response?.data?.message || "Failed to update medical information",
        {
          duration: 4000,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  // Address Information PIN code lookup
  const handlePostalCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, postalCode: value }));
    setPinError("");

    // Clear validation errors for postal code
    setValidationErrors((prev) => ({
      ...prev,
      postalCode: "",
    }));

    if (value.length === 6) {
      setPinLoading(true);
      try {
        const res = await fetch(`/api/pincode/${value}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "PIN code not found");
        }
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          district: data.district || "",
          state: data.state || "",
        }));

        // Clear validation errors for auto-populated fields
        setValidationErrors((prev) => ({
          ...prev,
          district: "",
          state: "",
        }));
      } catch (err) {
        setPinError(err.message);
        setFormData((prev) => ({ ...prev, district: "", state: "" }));
      } finally {
        setPinLoading(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, district: "", state: "" }));
    }
  };

  // Custom Input Component with validation
  const FormInput = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    disabled = false,
    placeholder,
    error,
    ...props
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : disabled
                ? "border-gray-200 bg-gray-50 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            } 
            focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white 
            dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <FiAlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
      {disabled && name === "email" && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <FaShieldAlt className="h-3 w-3" />
          Email cannot be changed for security reasons
        </p>
      )}
    </div>
  );

  // Custom Select Component with validation
  const FormSelect = ({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    error,
    ...props
  }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 appearance-none bg-white dark:bg-gray-700
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            } 
            focus:ring-4 focus:outline-none dark:border-gray-600 dark:text-white 
            hover:border-gray-400 dark:hover:border-gray-500`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <FiAlertCircle className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );

  // Success animation component
  const SuccessAnimation = () => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-green-500 text-white p-4 rounded-full shadow-lg">
        <FaCheck className="w-8 h-8" />
      </div>
    </motion.div>
  );

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast.error("Please fix all validation errors before saving");
      return;
    }

    setSaving(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating your profile...");

      // Create personal data object (excluding address fields)
      const personalData = {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
      };

      // Send update request to the backend
      const response = await axios.put(
        "/api/auth/update-profile",
        personalData
      );

      if (response.data.user) {
        setUser(response.data.user);

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        toast.success("Profile updated successfully", {
          icon: "🎉",
          duration: 3000,
        });

        setEditMode(false);
        setValidationErrors({});
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      toast.error(error.response?.data?.message || "Failed to update profile", {
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user && user.dob) {
      const today = new Date();
      const dob = new Date(user.dob);
      if (
        today.getDate() === dob.getDate() &&
        today.getMonth() === dob.getMonth()
      ) {
        setShowBirthdayModal(true);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FaUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Personal Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your basic profile details
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg shadow"
          >
            {editMode ? (
              <>
                <FaTimes className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <FaUserEdit className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>
        {editMode ? (
          <form className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FaIdCard className="w-4 h-4 text-blue-500" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="First Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your first name"
                  error={validationErrors.name}
                />

                <FormInput
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your last name"
                  error={validationErrors.lastname}
                />

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  error={validationErrors.email}
                />

                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  error={validationErrors.phone}
                />
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FaHeartbeat className="w-4 h-4 text-red-500" />
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={genders}
                  required
                  error={validationErrors.gender}
                />

                <FormSelect
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  options={bloodGroups}
                  required
                  error={validationErrors.bloodGroup}
                />

                <FormInput
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  error={validationErrors.dob}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={
                  saving ||
                  Object.keys(validationErrors).some(
                    (key) => validationErrors[key]
                  )
                }
                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setValidationErrors({});
                  setFormData({
                    name: user.name || "",
                    lastname: user.lastname || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    dob: user.dob || "",
                    gender: user.gender || "",
                    bloodGroup: user.bloodGroup || "",
                    addressLine1: user.addressLine1 || "",
                    addressLine2: user.addressLine2 || "",
                    state: user.state || "",
                    district: user.district || "",
                    postalCode: user.postalCode || "",
                  });
                }}
                className="flex-1 sm:flex-initial px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Basic Information Display */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FaIdCard className="w-4 h-4 text-blue-500" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FaIdCard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {user.name} {user.lastname}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FaEnvelope className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email Address
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FaPhone className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone Number
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <FaBirthdayCake className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date of Birth
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.dob ? (
                        <>
                          {formatDOB(user.dob)}
                          {calculateAge(user.dob) && (
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              ({calculateAge(user.dob)} years old)
                            </span>
                          )}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information Display */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FaHeartbeat className="w-4 h-4 text-red-500" />
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <FaUser className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gender
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.gender || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <FaHeartbeat className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Blood Group
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.bloodGroup || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Address Information Card */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FaMapMarkerAlt className="w-5 h-5 text-blue-500" />
            Address Information
          </h3>
          <button
            onClick={() => setAddressEditMode(!addressEditMode)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg shadow"
          >
            {addressEditMode ? (
              <>
                <FaTimes className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <FaEdit className="w-4 h-4" />
                Edit Address
              </>
            )}
          </button>
        </div>
        {addressEditMode ? (
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                placeholder="Street address, apartment, suite, etc."
                error={validationErrors.addressLine1}
              />

              <FormInput
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, etc. (optional)"
                error={validationErrors.addressLine2}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handlePostalCodeChange}
                    className={`w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 pr-10
                      ${
                        validationErrors.postalCode
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                      } 
                      focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white 
                      dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-gray-500`}
                    placeholder="Enter 6-digit postal code"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>
                {pinLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-2 text-blue-600 text-sm"
                  >
                    <FiLoader className="animate-spin h-4 w-4" />
                    Looking up postal code...
                  </motion.div>
                )}
                {pinError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                  >
                    <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                    {pinError}
                  </motion.div>
                )}
                {validationErrors.postalCode && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <FiAlertCircle className="h-4 w-4" />
                    {validationErrors.postalCode}
                  </motion.p>
                )}
              </div>

              <FormInput
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="District/County"
                disabled
                error={validationErrors.district}
              />

              <FormInput
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                placeholder="State/Province"
                disabled
                error={validationErrors.state}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={
                  saving ||
                  Object.keys(validationErrors).some(
                    (key) => validationErrors[key]
                  )
                }
                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Validating Address...
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="w-4 h-4" />
                    Save Address
                  </>
                )}
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">
                    Address Validation Information
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Enter your 6-digit postal code to auto-fill city,
                      district, and state
                    </li>
                    <li>
                      • Fields marked with{" "}
                      <span className="text-red-500">*</span> are required for
                      validation
                    </li>
                    <li>
                      • Address validation helps ensure accurate delivery of
                      medical services
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {user.addressLine1 ||
            user.addressLine2 ||
            user.district ||
            user.state ||
            user.postalCode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.addressLine1 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Address Line 1
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.addressLine1}
                    </p>
                  </div>
                )}
                {user.addressLine2 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Address Line 2
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.addressLine2}
                    </p>
                  </div>
                )}
                {user.state && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      State
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.state}
                    </p>
                  </div>
                )}
                {user.district && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      District
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.district}
                    </p>
                  </div>
                )}
                {user.postalCode && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Postal Code
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {user.postalCode}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaMapMarkerAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No address information available
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Click "Edit Address" to add your address
                </p>
              </div>
            )}
            <div className="mt-4 flex items-center">
              {user?.addressValidated ? (
                <div className="flex items-center text-green-600 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Address verified and validated
                </div>
              ) : user?.addressLine1 && user?.postalCode ? (
                <div className="flex items-center text-yellow-600 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Address saved but not validated - Click save to validate
                </div>
              ) : (
                <div className="flex items-center text-gray-500 text-sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  No address information provided
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderMedicalTab = () => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
            <FaHeartbeat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Medical Information
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your health details and medical history
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FaShieldAlt className="w-4 h-4" />
            Secure & Confidential
          </div>
          <button
            onClick={() => {
              setMedicalEditMode(!medicalEditMode);
              if (!medicalEditMode) {
                // Initialize height state when entering edit mode
                if (user.height) {
                  setHeightInput(user.height);
                  setDetectedUnit("cm");
                } else {
                  setHeightInput("");
                  setDetectedUnit("cm");
                }
              }
            }}
            className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg shadow"
          >
            {medicalEditMode ? (
              <>
                <FaTimes className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <FaEdit className="w-4 h-4" />
                Edit Medical Info
              </>
            )}
          </button>
        </div>
      </div>

      {medicalEditMode ? (
        <form className="space-y-6" onSubmit={handleMedicalSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={medicalInfo.gender}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  required
                >
                  <option value="">Select Gender</option>
                  {genders.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="bloodGroup"
                  value={medicalInfo.bloodGroup}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Height <span className="text-red-500">*</span>
              </label>

              {/* Smart Height Input */}
              <div className="relative">
                <input
                  type="text"
                  value={heightInput}
                  onChange={(e) => handleHeightInputChange(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-16"
                  placeholder="170 cm or 5.6 ft"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                  {detectedUnit === "ft" ? "ft" : "cm"}
                </span>
              </div>

              {/* Display conversion and validation */}
              {medicalInfo.height && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Detected:</span>
                    {detectedUnit === "cm" ? (
                      <>
                        {medicalInfo.height} cm (
                        {convertCmToDecimalFeet(medicalInfo.height)} ft)
                      </>
                    ) : (
                      <>
                        {convertCmToDecimalFeet(medicalInfo.height)} ft (
                        {medicalInfo.height} cm)
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Height input tips */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-3 h-3 mt-0.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    Enter height as: <strong>170 cm</strong>,{" "}
                    <strong>170</strong>, <strong>5.6 ft</strong>, or{" "}
                    <strong>5.6</strong> (auto-detects unit)
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Weight <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  value={medicalInfo.weight}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                  min="0"
                  max="500"
                  placeholder="70"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* BMI Calculator */}
          {medicalInfo.height && medicalInfo.weight && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Body Mass Index (BMI)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically calculated
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {(
                      medicalInfo.weight /
                      (medicalInfo.height / 100) ** 2
                    ).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(() => {
                      const bmi =
                        medicalInfo.weight / (medicalInfo.height / 100) ** 2;
                      if (bmi < 18.5) return "Underweight";
                      if (bmi < 25) return "Normal weight";
                      if (bmi < 30) return "Overweight";
                      return "Obese";
                    })()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Chronic Conditions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {chronicOptions.map((cond) => (
                  <label
                    key={cond}
                    className="group relative flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <input
                      type="checkbox"
                      name="chronicConditions"
                      value={cond}
                      checked={medicalInfo.chronicConditions.includes(cond)}
                      onChange={handleMedicalChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                      {cond}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Known Allergies
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allergyOptions.map((allergy) => (
                  <label
                    key={allergy}
                    className="group relative flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <input
                      type="checkbox"
                      name="allergies"
                      value={allergy}
                      checked={medicalInfo.allergies.includes(allergy)}
                      onChange={handleMedicalChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                      {allergy}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-blue-500" />
              Emergency Contact Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={medicalInfo.emergencyContact}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Full name of emergency contact"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={medicalInfo.emergencyContactPhone}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Emergency contact phone number"
                />
              </div>
            </div>
          </div>

          {/* Lifestyle Information */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-green-500" />
              Lifestyle Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Smoking Status
                </label>
                <div className="relative">
                  <select
                    name="smokingStatus"
                    value={medicalInfo.smokingStatus}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select smoking status</option>
                    {smokingStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alcohol Consumption
                </label>
                <div className="relative">
                  <select
                    name="alcoholConsumption"
                    value={medicalInfo.alcoholConsumption}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select alcohol consumption</option>
                    {alcoholOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exercise Frequency
                </label>
                <div className="relative">
                  <select
                    name="exerciseFrequency"
                    value={medicalInfo.exerciseFrequency}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select exercise frequency</option>
                    {exerciseOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHistory className="w-4 h-4 text-purple-500" />
              Medical History
            </h5>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Previous Surgeries
                </label>
                <textarea
                  name="previousSurgeries"
                  value={medicalInfo.previousSurgeries}
                  onChange={handleMedicalChange}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="List any previous surgeries with dates and details..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Family Medical History
                </label>
                <textarea
                  name="familyMedicalHistory"
                  value={medicalInfo.familyMedicalHistory}
                  onChange={handleMedicalChange}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Describe any significant family medical history (parents, siblings, grandparents)..."
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-indigo-500" />
              Insurance Information
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  name="insuranceProvider"
                  value={medicalInfo.insuranceProvider}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Insurance company name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="insurancePolicyNumber"
                  value={medicalInfo.insurancePolicyNumber}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Insurance policy number"
                />
              </div>
            </div>
          </div>

          {/* Vaccinations */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Vaccinations (Select all you have received)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {vaccinationOptions.map((vaccination) => (
                  <label
                    key={vaccination}
                    className="group relative flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <input
                      type="checkbox"
                      name="vaccinations"
                      value={vaccination}
                      checked={medicalInfo.vaccinations.includes(vaccination)}
                      onChange={handleMedicalChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                      {vaccination}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Mental Health & Wellness */}
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-pink-500" />
              Mental Health & Wellness
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mental Health Status
                </label>
                <div className="relative">
                  <select
                    name="mentalHealthStatus"
                    value={medicalInfo.mentalHealthStatus}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select mental health status</option>
                    {mentalHealthOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sleep Patterns
                </label>
                <div className="relative">
                  <select
                    name="sleepPatterns"
                    value={medicalInfo.sleepPatterns}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select sleep pattern</option>
                    {sleepPatternOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stress Level
                </label>
                <div className="relative">
                  <select
                    name="stressLevel"
                    value={medicalInfo.stressLevel}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select stress level</option>
                    {stressLevelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Women's Health (conditionally shown) */}
          {medicalInfo.gender === "Female" && (
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-rose-500" />
                Women's Health
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pregnancy Status
                  </label>
                  <div className="relative">
                    <select
                      name="pregnancyStatus"
                      value={medicalInfo.pregnancyStatus}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                    >
                      <option value="">Select pregnancy status</option>
                      <option value="Not pregnant">Not pregnant</option>
                      <option value="Pregnant">Pregnant</option>
                      <option value="Trying to conceive">
                        Trying to conceive
                      </option>
                      <option value="Postpartum">Postpartum</option>
                      <option value="Breastfeeding">Breastfeeding</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Menstrual Cycle
                  </label>
                  <div className="relative">
                    <select
                      name="menstrualCycle"
                      value={medicalInfo.menstrualCycle}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                    >
                      <option value="">Select menstrual status</option>
                      <option value="Regular">Regular</option>
                      <option value="Irregular">Irregular</option>
                      <option value="Stopped (menopause)">
                        Stopped (menopause)
                      </option>
                      <option value="Stopped (other)">Stopped (other)</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Birth Control Method
                  </label>
                  <div className="relative">
                    <select
                      name="birthControlMethod"
                      value={medicalInfo.birthControlMethod}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                    >
                      <option value="">Select birth control method</option>
                      {birthControlOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sexually Active
                  </label>
                  <div className="relative">
                    <select
                      name="sexuallyActive"
                      value={medicalInfo.sexuallyActive}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                    >
                      <option value="">Select option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Prefer not to answer">
                        Prefer not to answer
                      </option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disability & Assistive Devices */}
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-violet-500" />
              Disability & Assistive Devices
            </h5>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Disability Status
                </label>
                <textarea
                  name="disability"
                  value={medicalInfo.disability}
                  onChange={handleMedicalChange}
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Describe any disabilities or special accommodations needed..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Assistive Devices (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {assistiveDeviceOptions.map((device) => (
                    <label
                      key={device}
                      className="group relative flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    >
                      <input
                        type="checkbox"
                        name="assistiveDevices"
                        value={device}
                        checked={medicalInfo.assistiveDevices.includes(device)}
                        onChange={handleMedicalChange}
                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                        {device}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-emerald-500" />
              Recent Vital Signs (if known)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={medicalInfo.bloodPressure}
                  onChange={handleMedicalChange}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="120/80 mmHg"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heart Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="heartRate"
                    value={medicalInfo.heartRate}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                    placeholder="72"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    bpm
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Body Temperature
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="bodyTemperature"
                    value={medicalInfo.bodyTemperature}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                    placeholder="98.6"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    °F
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Oxygen Saturation
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={medicalInfo.oxygenSaturation}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                    placeholder="98"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Directives */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHistory className="w-4 h-4 text-gray-500" />
              Advanced Directives & Preferences
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organ Donor Status
                </label>
                <div className="relative">
                  <select
                    name="organDonor"
                    value={medicalInfo.organDonor}
                    onChange={handleMedicalChange}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-white"
                  >
                    <option value="">Select organ donor status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Undecided">Undecided</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Advanced Directives
                </label>
                <textarea
                  name="advancedDirectives"
                  value={medicalInfo.advancedDirectives}
                  onChange={handleMedicalChange}
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-300 focus:border-red-500 focus:ring-red-500/20 focus:ring-4 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                  placeholder="Living will, healthcare proxy, DNR orders, etc..."
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving Medical Details...
                </>
              ) : (
                <>
                  <FaHeartbeat className="w-4 h-4" />
                  Save Medical Information
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMedicalEditMode(false);
                // Reset medical info to original values
                setMedicalInfo({
                  gender: user.gender || "",
                  bloodGroup: user.bloodGroup || "",
                  height: user.height || "",
                  weight: user.weight || "",
                  chronicConditions: user.chronicConditions || [],
                  allergies: user.allergies || [],
                  emergencyContact: user.emergencyContact || "",
                  emergencyContactPhone: user.emergencyContactPhone || "",
                  smokingStatus: user.smokingStatus || "",
                  alcoholConsumption: user.alcoholConsumption || "",
                  exerciseFrequency: user.exerciseFrequency || "",
                  previousSurgeries: user.previousSurgeries || "",
                  familyMedicalHistory: user.familyMedicalHistory || "",
                  insuranceProvider: user.insuranceProvider || "",
                  insurancePolicyNumber: user.insurancePolicyNumber || "",
                  // Additional comprehensive medical fields
                  currentMedications: user.currentMedications || "",
                  primaryPhysician: user.primaryPhysician || "",
                  primaryPhysicianPhone: user.primaryPhysicianPhone || "",
                  lastPhysicalExam: user.lastPhysicalExam || "",
                  lastBloodWork: user.lastBloodWork || "",
                  vaccinations: user.vaccinations || [],
                  mentalHealthStatus: user.mentalHealthStatus || "",
                  sleepPatterns: user.sleepPatterns || "",
                  stressLevel: user.stressLevel || "",
                  occupationalHazards: user.occupationalHazards || [],
                  pregnancyStatus: user.pregnancyStatus || "",
                  menstrualCycle: user.menstrualCycle || "",
                  sexuallyActive: user.sexuallyActive || "",
                  birthControlMethod: user.birthControlMethod || "",
                  disability: user.disability || "",
                  assistiveDevices: user.assistiveDevices || [],
                  organDonor: user.organDonor || "",
                  advancedDirectives: user.advancedDirectives || "",
                  preferredPharmacy: user.preferredPharmacy || "",
                  pharmacyPhone: user.pharmacyPhone || "",
                  bloodPressure: user.bloodPressure || "",
                  heartRate: user.heartRate || "",
                  bodyTemperature: user.bodyTemperature || "",
                  oxygenSaturation: user.oxygenSaturation || "",
                });
                // Reset height input state
                if (user.height) {
                  setHeightInput(user.height);
                  setDetectedUnit("cm");
                } else {
                  setHeightInput("");
                  setDetectedUnit("cm");
                }
              }}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaTimes className="w-4 h-4" />
              Cancel
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium mb-1">Medical Information Privacy</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • Your medical information is encrypted and securely stored
                  </li>
                  <li>
                    • Only authorized healthcare providers can access this data
                  </li>
                  <li>• This information helps provide better medical care</li>
                  <li>• You can update or modify this information anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Medical Information Display */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-red-500" />
              Basic Medical Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <FaUser className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gender
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {medicalInfo.gender || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <FaHeartbeat className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Blood Group
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {medicalInfo.bloodGroup || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <FaUser className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Height
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatHeightDisplay(medicalInfo.height)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <FaUser className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Weight
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {medicalInfo.weight
                      ? `${medicalInfo.weight} kg`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* BMI Display */}
            {medicalInfo.height && medicalInfo.weight && (
              <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Body Mass Index (BMI)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Calculated from height and weight
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {(
                        medicalInfo.weight /
                        (medicalInfo.height / 100) ** 2
                      ).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(() => {
                        const bmi =
                          medicalInfo.weight / (medicalInfo.height / 100) ** 2;
                        if (bmi < 18.5) return "Underweight";
                        if (bmi < 25) return "Normal weight";
                        if (bmi < 30) return "Overweight";
                        return "Obese";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chronic Conditions Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-blue-500" />
              Chronic Conditions
            </h4>
            {medicalInfo.chronicConditions &&
            medicalInfo.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicalInfo.chronicConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No chronic conditions reported
              </p>
            )}
          </div>

          {/* Allergies Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />
              Known Allergies
            </h4>
            {medicalInfo.allergies && medicalInfo.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicalInfo.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No known allergies
              </p>
            )}
          </div>

          {/* Emergency Contact Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-red-500" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Contact Name
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.emergencyContactName || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Phone Number
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.emergencyContactPhone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Lifestyle Information Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaRunning className="w-4 h-4 text-green-500" />
              Lifestyle Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Smoking Status
                </p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    medicalInfo.smokingStatus === "Never"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : medicalInfo.smokingStatus === "Former"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                  }`}
                >
                  {medicalInfo.smokingStatus || "Not specified"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Alcohol Consumption
                </p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {medicalInfo.alcoholConsumption || "Not specified"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Exercise Frequency
                </p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  {medicalInfo.exerciseFrequency || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Medical History Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaClipboardList className="w-4 h-4 text-indigo-500" />
              Medical History
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Previous Surgeries
                </p>
                {medicalInfo.previousSurgeries ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {medicalInfo.previousSurgeries}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No previous surgeries reported
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Family Medical History
                </p>
                {medicalInfo.familyMedicalHistory ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {medicalInfo.familyMedicalHistory}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No family medical history provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Information Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-cyan-500" />
              Insurance Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Insurance Provider
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.insuranceProvider || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Policy Number
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {medicalInfo.insurancePolicyNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Vaccinations Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-green-500" />
              Vaccinations
            </h4>
            {medicalInfo.vaccinations && medicalInfo.vaccinations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {medicalInfo.vaccinations.map((vaccination, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                  >
                    {vaccination}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No vaccinations recorded
              </p>
            )}
          </div>

          {/* Mental Health & Wellness Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-pink-500" />
              Mental Health & Wellness
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Mental Health Status
                </p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                  {medicalInfo.mentalHealthStatus || "Not specified"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Sleep Patterns
                </p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                  {medicalInfo.sleepPatterns || "Not specified"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Stress Level
                </p>
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                  {medicalInfo.stressLevel || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Disability & Assistive Devices Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaShieldAlt className="w-4 h-4 text-violet-500" />
              Disability & Assistive Devices
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Disability Status
                </p>
                {medicalInfo.disability ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {medicalInfo.disability}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No disability status provided
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Assistive Devices
                </p>
                {medicalInfo.assistiveDevices &&
                medicalInfo.assistiveDevices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.assistiveDevices.map((device, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                      >
                        {device}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No assistive devices reported
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Vital Signs Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHeartbeat className="w-4 h-4 text-emerald-500" />
              Recent Vital Signs
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Blood Pressure
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.bloodPressure || "Not recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Heart Rate
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.heartRate
                    ? `${medicalInfo.heartRate} bpm`
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Body Temperature
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.bodyTemperature
                    ? `${medicalInfo.bodyTemperature}°F`
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Oxygen Saturation
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {medicalInfo.oxygenSaturation
                    ? `${medicalInfo.oxygenSaturation}%`
                    : "Not recorded"}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Directives & Preferences Display */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FaHistory className="w-4 h-4 text-gray-500" />
              Advanced Directives & Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Organ Donor Status
                </p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    medicalInfo.organDonor === "Yes"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : medicalInfo.organDonor === "No"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  {medicalInfo.organDonor || "Not specified"}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Advanced Directives
                </p>
                {medicalInfo.advancedDirectives ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {medicalInfo.advancedDirectives}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No advanced directives provided
                  </p>
                )}
              </div>
            </div>
          </div>

          {!medicalInfo.gender &&
            !medicalInfo.bloodGroup &&
            !medicalInfo.height &&
            !medicalInfo.weight &&
            (!medicalInfo.chronicConditions ||
              medicalInfo.chronicConditions.length === 0) &&
            (!medicalInfo.allergies || medicalInfo.allergies.length === 0) &&
            !medicalInfo.emergencyContactName &&
            !medicalInfo.emergencyContactPhone &&
            !medicalInfo.smokingStatus &&
            !medicalInfo.alcoholConsumption &&
            !medicalInfo.exerciseFrequency &&
            !medicalInfo.previousSurgeries &&
            !medicalInfo.familyMedicalHistory &&
            !medicalInfo.insuranceProvider &&
            !medicalInfo.insurancePolicyNumber &&
            (!medicalInfo.vaccinations ||
              medicalInfo.vaccinations.length === 0) &&
            !medicalInfo.mentalHealthStatus &&
            !medicalInfo.sleepPatterns &&
            !medicalInfo.stressLevel &&
            !medicalInfo.disability &&
            (!medicalInfo.assistiveDevices ||
              medicalInfo.assistiveDevices.length === 0) &&
            !medicalInfo.bloodPressure &&
            !medicalInfo.heartRate &&
            !medicalInfo.bodyTemperature &&
            !medicalInfo.oxygenSaturation &&
            !medicalInfo.organDonor &&
            !medicalInfo.advancedDirectives && (
              <div className="text-center py-8">
                <FaHeartbeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No medical information available
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Click "Edit Medical Info" to add your health details
                </p>
              </div>
            )}
        </div>
      )}
    </motion.div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 relative overflow-hidden backdrop-blur-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full -mr-10 sm:-mr-16 md:-mr-24 lg:-mr-32 -mt-10 sm:-mt-16 md:-mt-24 lg:-mt-32 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-purple-500/20 rounded-full -ml-10 sm:-ml-16 md:-ml-24 lg:-ml-32 -mb-10 sm:-mb-16 md:-mb-24 lg:-mb-32 blur-3xl"></div>

              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 z-10 w-full">
                <div className="relative shrink-0 mb-3 sm:mb-0 flex flex-col items-center">
                  <div
                    onClick={handlePhotoClick}
                    className="group w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center relative overflow-hidden cursor-pointer"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-[90%] h-[90%] rounded-full object-cover border-2 sm:border-3 md:border-4 border-white transition-all group-hover:opacity- text-center"
                      />
                    ) : (
                      <div className="w-[90%] h-[90%] rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl md:text-5xl border-2 sm:border-3 md:border-4 border-white">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                      <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                        <FaCamera className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handlePicView}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white text-xs hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-1">
                    {user.name} {user.lastname}
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-sm md:text-base mb-3 sm:mb-2">
                    UMID: {user.umid}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-1.5 md:gap-2">
                    {user.isverified ? (
                      <span className="inline-flex items-center px-2 sm:px-2 md:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-500/20 text-green-50 border border-green-500/30">
                        <FaShieldAlt className="mr-1 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />{" "}
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 sm:px-2 md:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-500/20 text-yellow-50 border border-yellow-500/30">
                        <FaShieldAlt className="mr-1 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />{" "}
                        Unverified
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 sm:px-2 md:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-500/20 text-blue-50 border border-blue-500/30">
                      <FaCalendarAlt className="mr-1 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4" />{" "}
                      Member since{" "}
                      {new Date(
                        user.createdAt || Date.now() - 30 * 24 * 60 * 60 * 1000
                      ).getFullYear()}
                    </span>
                    {user.addressValidated && (
                      <span className="inline-flex items-center px-2 sm:px-2 md:px-3 py-1 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-teal-500/20 text-teal-50 border border-teal-500/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 w-3 h-3 sm:w-3 sm:h-3 md:w-4 md:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Verified Address
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-2 sm:mx-0 px-2 sm:px-0 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex space-x-2 min-w-max">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === "overview"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FaIdCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("medical")}
                    className={`px-3 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === "medical"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FaHistory className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Medical Details
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {activeTab === "overview" && renderOverviewTab()}
              {activeTab === "medical" && renderMedicalTab()}
            </div>

            {isPicModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6"
                onClick={() => setIsPicModalOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="relative max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl w-full bg-white rounded-xl sm:rounded-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={user?.photoURL || "/user.png"}
                    alt="Profile"
                    className="w-full h-auto object-contain"
                  />
                  <button
                    onClick={() => setIsPicModalOpen(false)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <PhotoEditorModal
        isOpen={isPhotoEditorOpen}
        onClose={() => setIsPhotoEditorOpen(false)}
        onSave={handlePhotoSave}
        imageUrl={user?.photoURL || "/user.png"}
      />
      {/* Birthday Modal */}
      <AnimatePresence>
        {showBirthdayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowBirthdayModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setShowBirthdayModal(false)}
              >
                <FiX className="w-5 h-5" />
              </button>
              <FaBirthdayCake className="mx-auto text-5xl text-pink-500 mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                Happy Birthday, {user.name}!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Wishing you a wonderful year ahead filled with health and
                happiness! 🎉
              </p>
              <button
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => setShowBirthdayModal(false)}
              >
                Thank you!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Profile;
