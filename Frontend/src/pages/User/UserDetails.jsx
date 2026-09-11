import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiCalendar, FiCreditCard, FiAlertTriangle, FiCheckCircle, FiDownload, FiShare2, FiSearch } from "react-icons/fi";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/Patient/authStore";
import { motion } from "framer-motion";
import FloatingActionButton from "../../components/FloatingActionButton";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div>
        {children}
      </div>
    </div>
  );
};

// New clean layout for authenticated users without sidebar
const CleanLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div>
        {children}
      </div>
    </div>
  );
};

// Add a new component for the search form
const UserSearchForm = ({ onSearch }) => {
  const [searchUmid, setSearchUmid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchUmid.trim()) return;
    
    setIsSubmitting(true);
    onSearch(searchUmid.trim());
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiSearch className="text-blue-500 mr-2" /> Find Medicare User
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter a Medicare ID to find and verify a user's identity
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="umid" className="block text-sm font-medium text-gray-700 mb-1">
            Medicare ID (UMID)
          </label>
          <input
            type="text"
            id="umid"
            value={searchUmid}
            onChange={(e) => setSearchUmid(e.target.value)}
            placeholder="Example: AB12345XY"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !searchUmid.trim()}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
            isSubmitting || !searchUmid.trim() ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin w-5 h-5 border-t-2 border-white rounded-full mr-2"></div>
              Searching...
            </>
          ) : (
            <>
              <FiSearch className="mr-2" />
              Find User
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const UserDetails = () => {
  const { umid } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser, isAuthenticated } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const fetchUserDetails = async (searchUmid) => {
    const targetUmid = searchUmid || umid;
    setLoading(true);
    setError(null);
    
    try {
      if (!targetUmid) {
        setError("User ID not provided");
        setLoading(false);
        return;
      }
      
      // Check if we're looking at our own profile
      if (isAuthenticated && currentUser?.umid === targetUmid) {
        setUser(currentUser);
        setLoading(false);
        return;
      }
      
      // Configure request headers based on authentication status
      const headers = {};
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Fetch user details from API
      const response = await axios.get(`/api/user/profile/${targetUmid}`, { headers });
      
      if (response.data.user) {
        setUser(response.data.user);
        
        // If this was a search, navigate to the user's profile
        if (searchUmid && searchUmid !== umid) {
          navigate(`/user/${searchUmid}`);
          return;
        }
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.response?.data?.message || "Error fetching user details");
      toast.error("Could not load user information");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserDetails();
  }, [umid, token, currentUser, isAuthenticated]);

  // Save contact information
  const saveContact = () => {
    if (!user) return;
    
    // Create vCard format
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${user.name || 'Medicare User'}
ORG:Medicare
TEL;TYPE=WORK,VOICE:${user.phone || ''}
ADR;TYPE=WORK:;;${user.address || ''}
EMAIL:${user.email || ''}
NOTE:Medicare ID: ${user.umid || ''}
END:VCARD`;

    // Create a download link for the vCard
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.name || 'medicare-user'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Contact saved successfully");
  };
  
  // Share contact information
  const shareContact = async () => {
    if (!user) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Medicare User: ${user.name}`,
          text: `Medicare ID: ${user.umid}\nName: ${user.name}`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing contact:", error);
    }
  };

  // Content component will be the same regardless of layout
  const UserDetailsContent = () => (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Back navigation */}
      <motion.div 
        className="mb-4 sm:mb-6"
        variants={itemVariants}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm hover:shadow"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
      </motion.div>
      
      {/* Main user card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden mb-6 sm:mb-8"
      >
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 h-24 sm:h-32 md:h-40 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <FiUser size={28} className="text-white drop-shadow-md" />
            <h2 className="text-xl md:text-2xl font-bold drop-shadow-md">Medicare User Profile</h2>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {/* User photo */}
            <div className="-mt-16 sm:-mt-20 md:-mt-24 relative z-10">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 sm:border-6 border-white shadow-xl ring-2 ring-blue-100 bg-white shrink-0 mx-auto md:mx-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl md:text-5xl">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>
            
            {/* User info */}
            <div className="flex-1 text-center md:text-left mt-3 md:mt-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
                {user?.name || "User"}
              </h2>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3 sm:mb-4">
                {user?.umid && (
                  <div className="inline-flex items-center text-blue-700 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-blue-100">
                    <FiShield className="mr-1 sm:mr-2" size={14} />
                    Medicare ID: {user.umid}
                  </div>
                )}
                {user?.verified && (
                  <div className="inline-flex items-center text-green-700 bg-green-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-green-100">
                    <FiCheckCircle className="mr-1 sm:mr-2" size={14} />
                    Verified
                  </div>
                )}
                {user?.planType && (
                  <div className="inline-flex items-center text-purple-700 bg-purple-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-purple-100">
                    <FiCreditCard className="mr-1 sm:mr-2" size={14} />
                    {user.planType}
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveContact}
                  className="text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors shadow-sm"
                >
                  <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  Save Contact
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={shareContact}
                  className="text-xs sm:text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors border border-indigo-200 shadow-sm"
                >
                  <FiShare2 className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  Share
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* User details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiMail className="mr-1.5 sm:mr-2 text-blue-500" /> Email
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base break-all">{user?.email || "Not provided"}</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiPhone className="mr-1.5 sm:mr-2 text-blue-500" /> Phone
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{user?.phone || "Not provided"}</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiMapPin className="mr-1.5 sm:mr-2 text-blue-500" /> Address
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{user?.address || "Not provided"}</p>
              </motion.div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiShield className="mr-1.5 sm:mr-2 text-blue-500" /> Medicare ID
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{user?.umid || "Not provided"}</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiCreditCard className="mr-1.5 sm:mr-2 text-blue-500" /> Plan Type
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base">{user?.planType || "Not provided"}</p>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                className="border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-blue-100 transition-all"
              >
                <h3 className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center">
                  <FiCalendar className="mr-1.5 sm:mr-2 text-blue-500" /> Member Since
                </h3>
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Not available"}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Additional Info Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="text-center">
          <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-2 sm:mb-3">
            Medicare Information
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            For additional medical information or plan details, please consult with your healthcare provider
            or Medicare representative.
          </p>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <a
              href="https://www.medicare.gov/care-compare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
            >
              Find Providers
            </a>
            <a
              href="https://www.medicare.gov/plan-compare"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
            >
              Compare Plans
            </a>
            <a
              href="https://www.medicare.gov/forms-help-resources"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
            >
              Help Resources
            </a>
          </div>
        </div>
      </motion.div>
      
      {/* Footer/disclaimer */}
      <motion.div
        variants={itemVariants}
        className="mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm"
      >
        <p>This is an official Medicare digital identification for healthcare provider use.</p>
        <p className="mt-1">Scan the QR code to verify this information electronically.</p>
      </motion.div>
    </motion.div>
  );
  
  // Loading state
  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center h-full py-20">
          <Loading />
        </div>
      </PublicLayout>
    );
  }
  
  // Error state with Search Form
  if (error) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <FiAlertTriangle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow mb-8"
            >
              <FiArrowLeft className="mr-2" /> Go Back
            </button>
            
            {/* User Search Form */}
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Try searching for a different user</h3>
              <UserSearchForm onSearch={fetchUserDetails} />
              <div className="mt-6 text-center">
                <Link to="/user-lookup" className="text-blue-600 hover:text-blue-800 text-sm">
                  Go to Medicare User Lookup
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }
  
  // Simplified to always use PublicLayout
  return (
    <PublicLayout>
      <UserDetailsContent />
      <FloatingActionButton />
    </PublicLayout>
  );
};

export default UserDetails;