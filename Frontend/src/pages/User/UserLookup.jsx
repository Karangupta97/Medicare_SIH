import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiShield, FiUser, FiCheck, FiAlertTriangle, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import FloatingActionButton from "../../components/FloatingActionButton";

const UserLookup = () => {
  const navigate = useNavigate();
  const [umid, setUmid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    // Get recent searches from localStorage
    const saved = localStorage.getItem("recentMedicareSearches");
    return saved ? JSON.parse(saved) : [];
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!umid.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Try to fetch the user to validate the UMID
      const response = await axios.get(`/api/user/profile/${umid.trim()}`);
      
      if (response.data && response.data.success) {
        // Save to recent searches
        saveToRecentSearches(umid.trim(), response.data.user?.name || "Medicare User");
        
        // Navigate to the user profile
        navigate(`/user/${umid.trim()}`);
      } else {
        setError("User not found. Please check the Medicare ID and try again.");
      }
    } catch (err) {
      console.error("Error looking up user:", err);
      setError(err.response?.data?.message || "Error looking up user. Please check the Medicare ID and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save search to recent searches
  const saveToRecentSearches = (searchUmid, name) => {
    const search = { umid: searchUmid, name, timestamp: new Date().toISOString() };
    
    // Add to start of array, limit to 5 entries, and remove duplicates
    const updatedSearches = [search, ...recentSearches.filter(s => s.umid !== searchUmid)].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentMedicareSearches", JSON.stringify(updatedSearches));
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentMedicareSearches");
    toast.success("Recent searches cleared");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Medicare User Lookup</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enter a Medicare ID to find and verify a user's identity. This tool is for healthcare providers 
              and authorized personnel only.
            </p>
          </div>
        </div>
        
        {/* Search Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 max-w-md mx-auto mb-8"
        >
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
            <div className="flex items-center">
              <FiUser className="mr-2" size={20} />
              <h2 className="text-xl font-semibold">Find Medicare User</h2>
            </div>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="umid" className="block text-sm font-medium text-gray-700 mb-1">
                  Medicare ID (UMID)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShield className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="umid"
                    value={umid}
                    onChange={(e) => setUmid(e.target.value)}
                    placeholder="Example: AB12345XY"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
                  <FiAlertTriangle className="mr-2 mt-0.5 shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !umid.trim()}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                  isSubmitting || !umid.trim() ? "opacity-70 cursor-not-allowed" : ""
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
              </motion.button>
            </form>
          </div>
        </motion.div>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Recent Searches</h3>
              <button 
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentSearches.map((search, index) => (
                <motion.li 
                  key={search.umid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <Link 
                    to={`/user/${search.umid}`}
                    className="flex items-center px-4 py-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-3">
                      {search.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{search.name}</p>
                      <p className="text-xs text-gray-500">{search.umid}</p>
                    </div>
                    <div className="text-gray-400">
                      <FiChevronRight size={16} />
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
        
        {/* Information box */}
        <div className="mt-8 max-w-md mx-auto bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <FiCheck className="mr-1.5" /> Quick Access Tips
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Scan the QR code on a Medicare card to automatically lookup a user</li>
            <li>• Medicare IDs typically begin with "MED-" followed by 20 digits</li>
            <li>• Recent searches are saved for quicker access</li>
          </ul>
        </div>
      </div>
      
      {/* Add the floating button but with a different icon and title since we're already on the lookup page */}
      <FloatingActionButton 
        link="/"
        icon={<FiUser size={24} />}
        title="Back to Home"
      />
    </div>
  );
};

export default UserLookup; 