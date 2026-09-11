import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiStar, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SuccessModal from "../components/SuccessModal";

const DetailReview = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    review: '',
    rating: 0,
    isAnonymous: false,
    roleInfo: {
      institutionName: '',
      institutionLocation: '',
      collegeName: '',
      collegeLocation: '',
      storeName: '',
      storeLocation: '',
      additionalInfo: ''
    },
    additionalComments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [user, setUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('roleInfo.')) {
      const [_, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        roleInfo: {
          ...prev.roleInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRatingClick = (value) => {
    setFormData(prev => ({
      ...prev,
      rating: value
    }));
  };

  const renderRoleSpecificFields = () => {
    switch(formData.role) {
      case 'doctor':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="roleInfo.institutionName" className="block text-sm font-medium text-gray-700">
                Hospital Name (Optional)
              </label>
              <input
                type="text"
                id="roleInfo.institutionName"
                name="roleInfo.institutionName"
                value={formData.roleInfo.institutionName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter hospital name (optional)"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roleInfo.institutionLocation" className="block text-sm font-medium text-gray-700">
                Hospital Location (Optional)
              </label>
              <input
                type="text"
                id="roleInfo.institutionLocation"
                name="roleInfo.institutionLocation"
                value={formData.roleInfo.institutionLocation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter hospital location (optional)"
              />
            </div>
          </div>
        );
      case 'hospital-staff':
      case 'healthcare-admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="roleInfo.institutionName" className="block text-sm font-medium text-gray-700">
                Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.institutionName"
                name="roleInfo.institutionName"
                value={formData.roleInfo.institutionName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter hospital name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roleInfo.institutionLocation" className="block text-sm font-medium text-gray-700">
                Hospital Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.institutionLocation"
                name="roleInfo.institutionLocation"
                value={formData.roleInfo.institutionLocation}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter hospital location"
              />
            </div>
          </div>
        );
      case 'medical-student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="roleInfo.collegeName" className="block text-sm font-medium text-gray-700">
                College Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.collegeName"
                name="roleInfo.collegeName"
                value={formData.roleInfo.collegeName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter your college name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roleInfo.collegeLocation" className="block text-sm font-medium text-gray-700">
                College Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.collegeLocation"
                name="roleInfo.collegeLocation"
                value={formData.roleInfo.collegeLocation}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter your college location"
              />
            </div>
          </div>
        );
      case 'medical-store':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="roleInfo.storeName" className="block text-sm font-medium text-gray-700">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.storeName"
                name="roleInfo.storeName"
                value={formData.roleInfo.storeName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter your store name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="roleInfo.storeLocation" className="block text-sm font-medium text-gray-700">
                Store Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleInfo.storeLocation"
                name="roleInfo.storeLocation"
                value={formData.roleInfo.storeLocation}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                placeholder="Enter your store location"
              />
            </div>
          </div>
        );
      case 'other':
        return (
          <div className="space-y-2">
            <label htmlFor="roleInfo.additionalInfo" className="block text-sm font-medium text-gray-700">
              Additional Information <span className="text-red-500">*</span>
            </label>
            <textarea
              id="roleInfo.additionalInfo"
              name="roleInfo.additionalInfo"
              value={formData.roleInfo.additionalInfo}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200 resize-none"
              placeholder="Please provide additional information about your role..."
            ></textarea>
          </div>
        );
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.role) {
      errors.push('Please select your role');
    }
    
    if (!formData.review) {
      errors.push('Please share your experience');
    } else if (formData.review.length < 10) {
      errors.push('Your review must be at least 10 characters long');
    } else if (formData.review.length > 1000) {
      errors.push('Your review must not exceed 1000 characters');
    }

    if (!formData.isAnonymous && !formData.name) {
      errors.push('Please enter your name or select anonymous submission');
    }

    if (!formData.rating) {
      errors.push('Please provide a rating');
    }

    // Role-specific validation
    switch(formData.role) {
      case 'hospital-staff':
      case 'healthcare-admin':
        if (!formData.roleInfo.institutionName) errors.push('Please enter the hospital name');
        if (!formData.roleInfo.institutionLocation) errors.push('Please enter the hospital location');
        break;
      case 'medical-student':
        if (!formData.roleInfo.collegeName) errors.push('Please enter your college name');
        if (!formData.roleInfo.collegeLocation) errors.push('Please enter your college location');
        break;
      case 'medical-store':
        if (!formData.roleInfo.storeName) errors.push('Please enter your store name');
        if (!formData.roleInfo.storeLocation) errors.push('Please enter your store location');
        break;
      case 'other':
        if (!formData.roleInfo.additionalInfo) errors.push('Please provide additional information about your role');
        break;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const errors = validateForm();
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Prepare role-specific data for submission
      const roleSpecificData = {
        hospitalName: formData.roleInfo.institutionName,
        hospitalLocation: formData.roleInfo.institutionLocation,
        collegeName: formData.roleInfo.collegeName,
        collegeLocation: formData.roleInfo.collegeLocation,
        storeName: formData.roleInfo.storeName,
        storeLocation: formData.roleInfo.storeLocation,
        otherInfo: formData.roleInfo.additionalInfo
      };

      const response = await axios.post('/api/reviews/submit', {
        ...formData,
        ...roleSpecificData,
        reviewType: 'detailed'
      });

      setFormData({
        name: '',
        role: '',
        review: '',
        rating: 0,
        isAnonymous: false,
        roleInfo: {
          institutionName: '',
          institutionLocation: '',
          collegeName: '',
          collegeLocation: '',
          storeName: '',
          storeLocation: '',
          additionalInfo: ''
        },
        additionalComments: ''
      });
      
      setShowSuccessModal(true);
      setSubmitStatus({
        type: 'success',
        message: response.data.message || 'Thank you for sharing your experience!'
      });

      // Auto-hide the modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center w-full bg-white dark:bg-gray-900">
        <Navbar user={user} onLogout={handleLogout} />
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Your detailed review has been submitted successfully. It will be published after approval."
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-[#252A61] hover:text-[#363b7e] mb-6">
          <FiArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#252A61] mb-3">
              Share Your Experience
            </h1>
            <p className="text-gray-600">
              Help others by sharing your detailed experience with Medicare
            </p>
          </div>

          {submitStatus.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {submitStatus.message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#252A61] mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Your Name {!formData.isAnonymous && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={formData.isAnonymous}
                    className={`w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200 ${
                      formData.isAnonymous ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder={formData.isAnonymous ? 'Anonymous' : 'Enter your name'}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Your Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200"
                  >
                    <option value="">Select your role</option>
                    <option value="doctor">Doctor</option>
                    <option value="hospital-staff">Hospital Staff</option>
                    <option value="healthcare-admin">Healthcare Admin</option>
                    <option value="medical-student">Medical Student</option>
                    <option value="medical-store">Medical Store</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#252A61] border-gray-300 rounded focus:ring-[#252A61]"
                  />
                  <span className="text-sm text-gray-600">Submit anonymously</span>
                </label>
              </div>
            </div>

            {/* Role-specific Information Section */}
            {formData.role && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#252A61] mb-4">
                  {formData.role === 'doctor' ? 'Hospital Information (Optional)' :
                   formData.role === 'medical-student' ? 'College Information' :
                   formData.role === 'medical-store' ? 'Store Information' :
                   'Additional Information'}
                </h2>
                {renderRoleSpecificFields()}
              </div>
            )}

            {/* Experience Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[#252A61] mb-4">Experience Details</h2>
              
              {/* Star Rating */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 transition-all duration-200 ${
                        formData.rating >= star
                          ? 'text-yellow-400 scale-110'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <FiStar className="w-8 h-8" />
                    </button>
                  ))}
                </div>
                {formData.rating > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                  Your Experience <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.review.length}/1000 characters)
                  </span>
                </label>
                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  required
                  maxLength={1000}
                  rows="4"
                  className={`w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200 resize-none ${
                    formData.review.length > 1000 ? 'border-red-300' : ''
                  }`}
                  placeholder="Share your detailed experience with the hospital..."
                ></textarea>
                {formData.review.length < 10 && formData.review.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please write at least 10 characters
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <label htmlFor="additionalComments" className="block text-sm font-medium text-gray-700">
                  Additional Comments
                </label>
                <textarea
                  id="additionalComments"
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#252A61] focus:border-[#252A61] transition-all duration-200 resize-none"
                  placeholder="Any additional comments or suggestions..."
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full sm:w-auto px-8 py-3 bg-[#252A61] text-white font-medium rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#363b7e]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DetailReview; 