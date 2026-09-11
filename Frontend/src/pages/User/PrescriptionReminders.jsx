import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import usePatientStore from "../../store/Patient/patientstore";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiPlusCircle,
  FiEdit,
  FiTrash2,
  FiBell,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowLeft,
  FiInfo,
  FiChevronRight,
  FiSettings,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

// Notification sound URL
const NOTIFICATION_SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3";

// Create a mock data store for reminders with localStorage persistence
let mockReminders = [];
let mockReminderId = Date.now();

// Load saved reminders from localStorage
try {
  const savedReminders = localStorage.getItem("medicare-reminders");
  if (savedReminders) {
    mockReminders = JSON.parse(savedReminders);
    console.log(
      "Loaded reminders from localStorage:",
      mockReminders.length,
      "reminders found"
    );

    // Find the highest ID to continue from there
    if (mockReminders.length > 0) {
      const highestId = mockReminders
        .map((r) => parseInt(r._id.replace("rem", "")) || 0)
        .reduce((max, id) => Math.max(max, id), 0);
      mockReminderId = Math.max(highestId + 1, Date.now());
    }
  }
} catch (error) {
  console.error("Error loading reminders from localStorage:", error);
  // Continue with empty array if there's an error
  mockReminders = [];
}

// Helper function to save reminders to localStorage
const saveRemindersToStorage = () => {
  try {
    localStorage.setItem("medicare-reminders", JSON.stringify(mockReminders));
    console.log(
      "Saved reminders to localStorage:",
      mockReminders.length,
      "reminders saved"
    );
  } catch (error) {
    console.error("Error saving reminders to localStorage:", error);
  }
};

// Create a custom API for reminders that uses mock data
const createRemindersApi = (token) => {
  const api = {
    // Get all reminders
    getReminders: async () => {
      console.log(
        "MOCK API: Getting all reminders",
        mockReminders.length,
        "reminders found"
      );
      return {
        data: {
          success: true,
          reminders: mockReminders,
        },
      };
    },

    // Create a new reminder
    createReminder: async (reminderData) => {
      console.log("MOCK API: Creating a new reminder", reminderData);

      // Check for duplicates based on prescription and medication
      const existingIndex = mockReminders.findIndex(
        (r) =>
          r.prescriptionId === reminderData.prescriptionId &&
          r.medicationIndex === reminderData.medicationIndex &&
          r.reminderTime === reminderData.reminderTime
      );

      // If duplicate found, update instead of creating
      if (existingIndex !== -1) {
        console.log("MOCK API: Found duplicate reminder, updating instead");
        mockReminders[existingIndex] = {
          ...mockReminders[existingIndex],
          ...reminderData,
          updatedAt: new Date().toISOString(),
        };

        // Save to localStorage
        saveRemindersToStorage();

        return {
          data: {
            success: true,
            reminder: mockReminders[existingIndex],
            message: "Reminder updated successfully",
          },
        };
      }

      // Create new reminder if no duplicate
      const newReminder = {
        _id: `rem${mockReminderId++}`,
        ...reminderData,
        createdAt: new Date().toISOString(),
      };
      mockReminders.push(newReminder);

      // Save to localStorage
      saveRemindersToStorage();

      return {
        data: {
          success: true,
          reminder: newReminder,
          message: "Reminder created successfully",
        },
      };
    },

    // Delete a reminder
    deleteReminder: async (reminderId) => {
      console.log("MOCK API: Deleting reminder", reminderId);
      const index = mockReminders.findIndex((r) => r._id === reminderId);

      if (index !== -1) {
        mockReminders.splice(index, 1);

        // Save to localStorage
        saveRemindersToStorage();

        return {
          data: {
            success: true,
          },
        };
      }

      throw new Error("Reminder not found");
    },

    // Update a reminder
    updateReminder: async (reminderId, updateData) => {
      console.log("MOCK API: Updating reminder", reminderId);
      const index = mockReminders.findIndex((r) => r._id === reminderId);

      if (index !== -1) {
        mockReminders[index] = {
          ...mockReminders[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        // Save to localStorage
        saveRemindersToStorage();

        return {
          data: {
            success: true,
            reminder: mockReminders[index],
          },
        };
      }

      throw new Error("Reminder not found");
    },
  };

  return api;
};

const PrescriptionReminders = () => {
  const { user, token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [editingReminder, setEditingReminder] = useState(null);
  const notificationAudioRef = useRef(null);
  const lastPlayedRef = useRef({});
  const remindersApiRef = useRef(null);
  const [formData, setFormData] = useState({
    prescriptionId: "",
    medicationIndex: 0,
    reminderTime: "",
    days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    notes: "",
    enabled: true,
  });

  // Get state and actions from patient store
  const { prescriptions, isLoading, error, fetchPrescriptions } =
    usePatientStore();

  // Initialize the reminders API
  useEffect(() => {
    remindersApiRef.current = createRemindersApi(token);
  }, [token]);

  // Initialize notification sound - fix the infinite loop issue
  useEffect(() => {
    // Create audio element for notifications
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.preload = "auto";

    // Flag to track if we've already attempted preloading
    let hasAttemptedPreload = false;

    // Pre-load the audio to be ready
    const preloadAudio = () => {
      // Only attempt preloading once to avoid infinite loops
      if (hasAttemptedPreload) return;
      hasAttemptedPreload = true;

      console.log("Attempting to preload audio");
      audio.load();

      // Some browsers need a user interaction to enable audio
      // This is a workaround to try to get the audio ready
      audio.volume = 0.01; // Almost silent
      audio.muted = true; // Muted for safety
      const silentPromise = audio.play();

      if (silentPromise !== undefined) {
        silentPromise
          .then(() => {
            console.log("Audio preloaded successfully");
            // Stop the silent playback
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0;
            audio.muted = false;
          })
          .catch((e) => {
            console.log(
              "Silent preload failed, will try on first user interaction:",
              e
            );
          });
      }
    };

    // Only add the canplaythrough listener once
    let canPlayListener = () => {
      console.log("Notification sound loaded successfully");
      // Remove the listener after first trigger
      audio.removeEventListener("canplaythrough", canPlayListener);
      preloadAudio();
    };

    audio.addEventListener("canplaythrough", canPlayListener);

    audio.addEventListener("error", (e) => {
      console.error("Error loading notification sound:", e);
    });

    notificationAudioRef.current = audio;

    // Try to prime audio on first user interaction
    const handleUserInteraction = () => {
      if (notificationAudioRef.current && !hasAttemptedPreload) {
        preloadAudio();
        // Remove the event listeners after first interaction
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      // Clean up
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);

      if (audio) {
        audio.removeEventListener("canplaythrough", canPlayListener);
      }

      if (notificationAudioRef.current) {
        notificationAudioRef.current.pause();
        notificationAudioRef.current = null;
      }
    };
  }, []);

  // Check for prescriptionId in URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const prescriptionId = queryParams.get("prescriptionId");

    if (prescriptionId) {
      // If prescription ID is in URL, open the form and preset the prescription
      setShowReminderForm(true);
      setFormData((prev) => ({
        ...prev,
        prescriptionId,
      }));

      // Clean up the URL by removing the query parameter
      navigate("/dashboard/digital-prescriptions/reminders", { replace: true });
    }
  }, [location.search, navigate]);

  // After prescriptions are loaded, check if we need to preselect one
  useEffect(() => {
    if (prescriptions.length > 0 && formData.prescriptionId) {
      const selectedPrescript = prescriptions.find(
        (p) => p._id === formData.prescriptionId
      );
      if (selectedPrescript) {
        setSelectedPrescription(selectedPrescript);
      }
    }
  }, [prescriptions, formData.prescriptionId]);

  // Check for reminders that need to be triggered
  useEffect(() => {
    if (!reminders.length) return;

    console.log(
      "Setting up reminder checking interval with sound",
      soundEnabled ? "enabled" : "disabled"
    );

    // Store the next reminder times for more precise scheduling
    const nextReminderTimes = new Map();

    // Schedule a specific reminder for exact timing
    const scheduleReminder = (reminder, scheduledTimeMs) => {
      const now = Date.now();
      const delay = Math.max(0, scheduledTimeMs - now);

      // Store the timeout ID so we can clear it if needed
      const timeoutId = setTimeout(() => {
        console.log(
          `Executing scheduled reminder at exact time: ${new Date(
            scheduledTimeMs
          ).toLocaleTimeString()}`
        );
        playNotificationSound(reminder);

        // Remove this reminder from the next times after playing
        nextReminderTimes.delete(reminder._id);
      }, delay);

      // Store the timeout ID with the reminder
      nextReminderTimes.set(reminder._id, {
        timeoutId,
        scheduledTime: scheduledTimeMs,
      });

      console.log(
        `Scheduled reminder for ${new Date(
          scheduledTimeMs
        ).toLocaleTimeString()} (${delay}ms from now)`
      );
    };

    // Function to check if a reminder should be triggered
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeString = `${String(currentHour).padStart(
        2,
        "0"
      )}:${String(currentMinute).padStart(2, "0")}`;

      // Get current day of week (0-6, where 0 is Sunday)
      const dayOfWeek = now.getDay();
      const dayMap = {
        0: "sunday",
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
        6: "saturday",
      };
      const currentDay = dayMap[dayOfWeek];

      // Calculate exact target time for the next minute
      const calculateNextTime = (reminderTime) => {
        const [hours, minutes] = reminderTime.split(":").map(Number);

        // Create a date object for the target time
        const targetTime = new Date(now);
        targetTime.setHours(hours, minutes, 0, 0); // Set hours, minutes, 0 seconds, 0 ms

        // If the time has already passed today, schedule for tomorrow
        if (targetTime <= now) {
          targetTime.setDate(targetTime.getDate() + 1);
        }

        return targetTime;
      };

      // Check each reminder
      reminders.forEach((reminder) => {
        // Skip if not enabled
        if (!reminder.enabled) return;

        // Skip if the day is not enabled for today or tomorrow
        if (!reminder.days[currentDay]) return;

        const [reminderHour, reminderMinute] = reminder.reminderTime
          .split(":")
          .map(Number);
        const nextTargetTime = calculateNextTime(reminder.reminderTime);
        const nextTargetTimeMs = nextTargetTime.getTime();

        // Log what we're checking
        console.log(
          `Checking reminder: ${reminder.reminderTime}, Current: ${currentTimeString}`,
          `Next: ${nextTargetTime.toLocaleTimeString()}`
        );

        // Get the reminder key and check if it's already scheduled
        const reminderKey = reminder._id;
        const existingSchedule = nextReminderTimes.get(reminderKey);

        // Calculate time until next occurrence in milliseconds
        const msUntilReminder = nextTargetTimeMs - now.getTime();

        // Only schedule if:
        // 1. It's not already scheduled OR
        // 2. The existing schedule is for a different time (e.g., if reminder time changed)
        if (
          !existingSchedule ||
          existingSchedule.scheduledTime !== nextTargetTimeMs
        ) {
          // If there's an existing timeout, clear it first
          if (existingSchedule && existingSchedule.timeoutId) {
            clearTimeout(existingSchedule.timeoutId);
          }

          // If the reminder is within the next hour, schedule it precisely
          if (msUntilReminder <= 3600000) {
            // 1 hour in ms
            scheduleReminder(reminder, nextTargetTimeMs);
          }
        }

        // For reminders that are exactly at the current minute
        if (reminderHour === currentHour && reminderMinute === currentMinute) {
          const reminderKey = `${reminder._id}-${currentTimeString}`;
          const lastPlayed = lastPlayedRef.current[reminderKey];
          const currentTimestamp = now.getTime();

          // Play the sound if not played in the last minute
          if (!lastPlayed || currentTimestamp - lastPlayed > 60000) {
            console.log(
              "Time matches exactly, playing notification for reminder",
              reminderKey
            );
            playNotificationSound(reminder);
            lastPlayedRef.current[reminderKey] = currentTimestamp;
          }
        }
      });
    };

    // Initial check
    checkReminders();

    // Set up the main interval for checking reminders
    // Still check every 30 seconds to ensure we don't miss any reminders
    // The precise timers will handle the exact timing
    const intervalId = setInterval(checkReminders, 30000);

    // Clean up all timeouts when component unmounts
    return () => {
      clearInterval(intervalId);
      // Clear all scheduled timeouts
      nextReminderTimes.forEach(({ timeoutId }) => {
        if (timeoutId) clearTimeout(timeoutId);
      });
    };
  }, [reminders, soundEnabled]);

  // Fetch prescriptions and reminders from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          // Fetch prescriptions using patient store
          await fetchPrescriptions(token);

          // Fetch reminders using our mock API
          const remindersResponse =
            await remindersApiRef.current.getReminders();

          if (remindersResponse.data && remindersResponse.data.success) {
            setReminders(remindersResponse.data.reminders || []);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load prescription reminders");
      }
    };

    if (token && remindersApiRef.current) {
      fetchData();
    }
  }, [token, fetchPrescriptions]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name.startsWith("days.")) {
        const day = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          days: {
            ...prev.days,
            [day]: checked,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle prescription selection
  const handlePrescriptionSelect = (e) => {
    const prescriptionId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      prescriptionId,
      medicationIndex: 0,
    }));

    const prescription = prescriptions.find((p) => p._id === prescriptionId);
    setSelectedPrescription(prescription);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingReminder) {
        // Update existing reminder
        response = await remindersApiRef.current.updateReminder(
          editingReminder,
          formData
        );

        if (response.data && response.data.success) {
          toast.success("Reminder updated successfully");

          // Update in state
          setReminders((prev) =>
            prev.map((r) =>
              r._id === editingReminder ? response.data.reminder : r
            )
          );

          // Reset editing state
          setEditingReminder(null);
        } else {
          toast.error(response.data?.message || "Failed to update reminder");
        }
      } else {
        // Create new reminder
        response = await remindersApiRef.current.createReminder(formData);

        if (response.data && response.data.success) {
          toast.success(response.data.message || "Reminder saved successfully");

          // Check if it's a new reminder or an update
          const existingIndex = reminders.findIndex(
            (r) => r._id === response.data.reminder._id
          );

          if (existingIndex !== -1) {
            // Update existing reminder
            setReminders((prev) =>
              prev.map((r) =>
                r._id === response.data.reminder._id
                  ? response.data.reminder
                  : r
              )
            );
          } else {
            // Add new reminder
            setReminders((prev) => [...prev, response.data.reminder]);
          }
        } else {
          toast.error(response.data?.message || "Failed to create reminder");
        }
      }

      // Reset form and hide it
      setShowReminderForm(false);
      setFormData({
        prescriptionId: "",
        medicationIndex: 0,
        reminderTime: "",
        days: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        },
        notes: "",
        enabled: true,
      });
    } catch (err) {
      console.error("Error saving reminder:", err);
      toast.error("An error occurred while saving the reminder");
    }
  };

  // Handle reminder deletion
  const handleDeleteReminder = async (reminderId) => {
    try {
      const response = await remindersApiRef.current.deleteReminder(reminderId);

      if (response.data && response.data.success) {
        toast.success("Reminder deleted successfully");
        setReminders((prev) => prev.filter((r) => r._id !== reminderId));
      } else {
        toast.error(response.data?.message || "Failed to delete reminder");
      }
    } catch (err) {
      console.error("Error deleting reminder:", err);
      toast.error("An error occurred while deleting the reminder");
    }
  };

  // Handle reminder toggle
  const handleToggleReminder = async (reminder) => {
    try {
      const updatedEnabled = !reminder.enabled;
      const response = await remindersApiRef.current.updateReminder(
        reminder._id,
        { enabled: updatedEnabled }
      );

      if (response.data && response.data.success) {
        toast.success(`Reminder ${updatedEnabled ? "enabled" : "disabled"}`);
        setReminders((prev) =>
          prev.map((r) =>
            r._id === reminder._id ? { ...r, enabled: updatedEnabled } : r
          )
        );
      } else {
        toast.error(response.data?.message || "Failed to update reminder");
      }
    } catch (err) {
      console.error("Error updating reminder:", err);
      toast.error("An error occurred while updating the reminder");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get medication details from prescription and index
  const getMedicationDetails = (prescriptionId, medicationIndex) => {
    const prescription = prescriptions.find((p) => p._id === prescriptionId);
    if (
      !prescription ||
      !prescription.medications ||
      !prescription.medications[medicationIndex]
    ) {
      return null;
    }

    return prescription.medications[medicationIndex];
  };

  // Function to show a visual notification
  const showNotification = (reminder) => {
    if (!reminder) return;

    const message = `Time to take ${
      reminder.medicineName ||
      getMedicationName(reminder.prescriptionId, reminder.medicationIndex)
    }${reminder.dosage ? ` - ${reminder.dosage}` : ""}`;
    console.log("Showing notification:", message);

    // Show toast notification using toast() instead of toast.info
    toast(message, {
      icon: "🔔",
      duration: 10000,
      style: {
        background: "#EBF5FF",
        color: "#1E40AF",
        border: "1px solid #93C5FD",
      },
    });
  };

  // Enhance the playNotificationSound function for more reliable playback
  const playNotificationSound = (reminder) => {
    const medicineName =
      reminder?.medicineName ||
      getMedicationName(reminder.prescriptionId, reminder.medicationIndex) ||
      "reminder";
    console.log(
      `⏰ PLAYING NOTIFICATION: ${new Date().toLocaleTimeString()} for ${medicineName}`
    );

    try {
      if (!notificationAudioRef.current) {
        console.error("Audio element reference is not available");
        showNotification(reminder);
        return;
      }

      if (!soundEnabled) {
        console.log("Sound is disabled, showing silent notification");
        showNotification(reminder);
        return;
      }

      // Create a new audio element each time for more reliable playback
      const notificationSound = new Audio(NOTIFICATION_SOUND_URL);
      notificationSound.volume = 1.0;

      // Better error handling with cleanup
      const playWithFallback = async () => {
        try {
          await notificationSound.play();
          console.log("Sound played successfully");
          showNotification(reminder);
        } catch (error) {
          console.error("Error playing sound, trying fallback:", error);
          // Fallback to the original audio reference
          try {
            notificationAudioRef.current.currentTime = 0;
            notificationAudioRef.current.volume = 1.0;
            notificationAudioRef.current.muted = false;
            await notificationAudioRef.current.play();
            console.log("Fallback sound played successfully");
            showNotification(reminder);
          } catch (fallbackError) {
            console.error("Fallback playback failed:", fallbackError);
            showNotification(reminder);
          }
        }
      };

      playWithFallback();
    } catch (error) {
      console.error("Failed to play notification sound:", error);
      showNotification(reminder);
    }
  };

  // Get medication name from prescription and medication index
  const getMedicationName = (prescriptionId, medicationIndex) => {
    const prescription = prescriptions.find((p) => p._id === prescriptionId);
    if (
      !prescription ||
      !prescription.medications ||
      !prescription.medications[medicationIndex]
    ) {
      return "Unknown medication";
    }

    return prescription.medications[medicationIndex].name;
  };

  // Get weekday names
  const getActiveDaysText = (days) => {
    const activeDays = Object.entries(days)
      .filter(([_, isActive]) => isActive)
      .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3));

    if (activeDays.length === 7) {
      return "Every day";
    } else if (activeDays.length === 0) {
      return "No days selected";
    } else {
      return activeDays.join(", ");
    }
  };

  // Add function to start editing a reminder
  const handleEditReminder = (reminder) => {
    // Find the prescription to select it
    const prescription = prescriptions.find(
      (p) => p._id === reminder.prescriptionId
    );
    setSelectedPrescription(prescription);

    // Set form data with existing reminder values
    setFormData({
      ...reminder,
      // Make sure we're using the same structure
      prescriptionId: reminder.prescriptionId,
      medicationIndex: reminder.medicationIndex,
      reminderTime: reminder.reminderTime,
      days: reminder.days || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      notes: reminder.notes || "",
      enabled: reminder.enabled,
    });

    // Set editing mode and show form
    setEditingReminder(reminder._id);
    setShowReminderForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/digital-prescriptions"
                className="text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Medication Reminders
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Set up and manage reminders for your prescriptions
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg shadow-sm ${
                soundEnabled
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={
                soundEnabled
                  ? "Disable notification sounds"
                  : "Enable notification sounds"
              }
              title={
                soundEnabled
                  ? "Sound notifications on"
                  : "Sound notifications off"
              }
            >
              {soundEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowReminderForm((prev) => !prev);
                if (editingReminder) {
                  setEditingReminder(null);
                  setFormData({
                    prescriptionId: "",
                    medicationIndex: 0,
                    reminderTime: "",
                    days: {
                      monday: true,
                      tuesday: true,
                      wednesday: true,
                      thursday: true,
                      friday: true,
                      saturday: true,
                      sunday: true,
                    },
                    notes: "",
                    enabled: true,
                  });
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm shadow-sm flex items-center gap-2
                ${
                  showReminderForm
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {showReminderForm ? (
                <>
                  Cancel <FiX size={16} />
                </>
              ) : (
                <>
                  Add Reminder <FiPlusCircle size={16} />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Test notification button (for development) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mb-6">
            <motion.button
              onClick={() => {
                if (reminders.length > 0) {
                  playNotificationSound(reminders[0]);
                } else {
                  playNotificationSound({
                    _id: "test",
                    prescriptionId: "",
                    medicationIndex: 0,
                    notes: "Test medication reminder",
                  });
                }
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300"
            >
              Test Notification Sound
            </motion.button>
          </div>
        )}

        {/* Form to add new reminder */}
        {showReminderForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden"
          >
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBell className="text-blue-600 mr-2" />
                {editingReminder
                  ? "Edit Medication Reminder"
                  : "Create New Medication Reminder"}
              </h2>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Prescription Select */}
                  <div>
                    <label
                      htmlFor="prescriptionId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Prescription
                    </label>
                    <select
                      id="prescriptionId"
                      name="prescriptionId"
                      value={formData.prescriptionId}
                      onChange={handlePrescriptionSelect}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a prescription</option>
                      {prescriptions.map((prescription) => (
                        <option key={prescription._id} value={prescription._id}>
                          {prescription.doctor
                            ? `Dr. ${prescription.doctor}`
                            : "Prescription"}{" "}
                          - {formatDate(prescription.createdAt)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Medication Select */}
                  <div>
                    <label
                      htmlFor="medicationIndex"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Medication
                    </label>
                    <select
                      id="medicationIndex"
                      name="medicationIndex"
                      value={formData.medicationIndex}
                      onChange={handleInputChange}
                      required
                      disabled={!selectedPrescription}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      {selectedPrescription &&
                      selectedPrescription.medications ? (
                        selectedPrescription.medications.map((med, index) => (
                          <option key={index} value={index}>
                            {med.name} {med.dosage && `(${med.dosage})`}
                          </option>
                        ))
                      ) : (
                        <option value="">Select a prescription first</option>
                      )}
                    </select>
                  </div>

                  {/* Time */}
                  <div>
                    <label
                      htmlFor="reminderTime"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      id="reminderTime"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g., Take with food"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Days of the week */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days to receive reminder
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].map((day) => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name={`days.${day}`}
                          checked={formData.days[day]}
                          onChange={handleInputChange}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {day.slice(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Enabled toggle */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Enable reminder
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingReminder ? "Update Reminder" : "Create Reminder"}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center justify-center">
              <FiRefreshCw className="animate-spin text-blue-600 text-xl mb-4" />
              <p className="text-gray-600">
                Loading your medication reminders...
              </p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-red-100 h-16 w-16 flex items-center justify-center mb-4">
                <FiAlertTriangle className="text-red-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Reminders
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // Main content - List of reminders
          <div className="space-y-6">
            {reminders.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-semibold text-gray-800 flex items-center">
                    <FiClock className="mr-2 text-blue-600" /> Your Medication
                    Reminders
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {reminders.map((reminder) => {
                    const medicationName = getMedicationName(
                      reminder.prescriptionId,
                      reminder.medicationIndex
                    );
                    return (
                      <div
                        key={reminder._id}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2.5 rounded-full ${
                                reminder.enabled ? "bg-blue-100" : "bg-gray-100"
                              }`}
                            >
                              <FiBell
                                className={
                                  reminder.enabled
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {medicationName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center text-sm text-gray-600">
                                  <FiClock className="mr-1" size={14} />
                                  {reminder.reminderTime}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                  {getActiveDaysText(reminder.days)}
                                </span>
                              </div>
                              {reminder.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">
                                  "{reminder.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReminder(reminder)}
                              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="Edit reminder"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleReminder(reminder)}
                              className={`p-2 rounded-full 
                                ${
                                  reminder.enabled
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              title={
                                reminder.enabled
                                  ? "Disable reminder"
                                  : "Enable reminder"
                              }
                            >
                              {reminder.enabled ? (
                                <FiToggleRight size={18} />
                              ) : (
                                <FiToggleLeft size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder._id)}
                              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete reminder"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Empty state
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <FiBell className="text-blue-400 text-2xl" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No Medication Reminders
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-md">
                    You haven't set up any medication reminders yet. Create a
                    reminder to help you remember to take your medications on
                    time.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowReminderForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiPlusCircle size={16} /> Create Your First Reminder
                  </motion.button>
                </div>
              </div>
            )}

            {/* Tips section */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="font-semibold text-gray-800 flex items-center mb-4">
                <FiInfo className="mr-2 text-blue-600" /> Medication Reminder
                Tips
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    Keep your reminders enabled to receive notifications on
                    time.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    Set reminders around your daily routine for better
                    adherence.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-600 mt-1" />
                  <p className="text-sm text-gray-700">
                    Add notes to remind yourself of special instructions (e.g.,
                    "Take with food").
                  </p>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
  );
};

export default PrescriptionReminders;
