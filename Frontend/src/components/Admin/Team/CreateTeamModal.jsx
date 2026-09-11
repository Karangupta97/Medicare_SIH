import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Mail, Info, Tag, Plus, User, Search, UserPlus } from "lucide-react";
import { useStaffStore } from "../../../store/staffStore";
import { useFounderStore } from "../../../store/founderStore";

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    owners: [],
    members: [],
    labels: []
  });
  
  const [errors, setErrors] = useState({});
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  
  // Use staffStore to fetch real staff data
  const { getStaffList } = useStaffStore();
  // Use founderStore to get the current user
  const { founder } = useFounderStore();
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        description: "",
        owners: [],
        members: [],
        labels: []
      });
      setErrors({});
      setOwnerSearchQuery("");
      setMemberSearchQuery("");
      setLabelInput("");
      
      // Load staff when modal opens
      loadStaffMembers();
    }
  }, [isOpen]);
  
  // Load staff members from API
  const loadStaffMembers = async () => {
    setIsLoadingStaff(true);
    try {
      const response = await getStaffList(1, 20);
      if (response.success) {
        setStaffMembers(response.staff);
      }
    } catch (error) {
      console.error("Error loading staff members:", error);
    } finally {
      setIsLoadingStaff(false);
    }
  };
  
  // Filter staff members based on owner search query
  const filteredOwnerStaffMembers = ownerSearchQuery
    ? staffMembers.filter(
        staff => 
          !formData.owners.some(owner => owner._id === staff._id) &&
          !formData.members.some(member => member._id === staff._id) &&
          (staff.name.toLowerCase().includes(ownerSearchQuery.toLowerCase()) || 
           staff.email.toLowerCase().includes(ownerSearchQuery.toLowerCase()))
      )
    : [];
    
  // Filter staff members based on member search query
  const filteredMemberStaffMembers = memberSearchQuery
    ? staffMembers.filter(
        staff => 
          !formData.owners.some(owner => owner._id === staff._id) &&
          !formData.members.some(member => member._id === staff._id) &&
          (staff.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
           staff.email.toLowerCase().includes(memberSearchQuery.toLowerCase()))
      )
    : [];
  
  // Pre-defined label suggestions
  const labelSuggestions = [
    "Department", "Medical", "Mailing", "Security", "Administration", 
    "Records", "Emergency", "IT", "Support", "Finance", "Nursing",
    "Laboratory", "Pharmacy", "Management", "Training"
  ];
  
  // Filter label suggestions based on what's already been added and current input
  const filteredLabelSuggestions = labelInput
    ? labelSuggestions.filter(
        label => 
          !formData.labels.includes(label) &&
          label.toLowerCase().includes(labelInput.toLowerCase())
      )
    : [];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle adding an owner
  const handleAddOwner = (staff) => {
    setFormData(prev => ({
      ...prev,
      owners: [...prev.owners, staff]
    }));
    setOwnerSearchQuery("");
  };
  
  // Handle removing an owner
  const handleRemoveOwner = (ownerId) => {
    setFormData(prev => ({
      ...prev,
      owners: prev.owners.filter(owner => owner._id !== ownerId)
    }));
  };
  
  // Handle adding a member
  const handleAddMember = (staff) => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, staff]
    }));
    setMemberSearchQuery("");
  };
  
  // Handle removing a member
  const handleRemoveMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member._id !== memberId)
    }));
  };
  
  // Handle adding a label
  const handleAddLabel = (label) => {
    if (label && !formData.labels.includes(label)) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, label]
      }));
      setLabelInput("");
    }
  };
  
  // Handle removing a label
  const handleRemoveLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Team name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Team email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.owners.length === 0) newErrors.owners = "At least one owner is required";
    if (formData.members.length === 0) newErrors.members = "At least one member is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Call parent's onCreateTeam function with form data
    onCreateTeam(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
              
              {/* Modal header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create New Team
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set up a new team for your organization
                  </p>
                </div>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Team name */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology Department"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.name 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>
                
                {/* Team email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="team@example.com"
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        errors.email 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                {/* Team description */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <Info size={16} className="text-gray-400" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the team's purpose"
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Team owners */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Owners
                  </label>
                  <div className="space-y-3">
                    {/* Selected owners */}
                    {formData.owners.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.owners.map(owner => (
                          <div
                            key={owner._id}
                            className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full pl-2 pr-1 py-1"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                                {owner.photoURL ? (
                                  <img
                                    src={owner.photoURL}
                                    alt={owner.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                    <User size={14} />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium">{owner.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveOwner(owner._id)}
                              className="ml-1 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Owner search input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={ownerSearchQuery}
                        onChange={(e) => setOwnerSearchQuery(e.target.value)}
                        placeholder="Search for owners by name or email..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          errors.owners 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    
                    {/* Search results */}
                    {isLoadingStaff ? (
                      <div className="absolute z-10 mt-1 w-full max-h-60 bg-white dark:bg-gray-700 py-2 rounded-md shadow-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">Loading staff members...</p>
                      </div>
                    ) : ownerSearchQuery && filteredOwnerStaffMembers.length > 0 ? (
                      <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {filteredOwnerStaffMembers.map(staff => (
                          <div
                            key={staff._id}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => handleAddOwner(staff)}
                          >
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                              {staff.photoURL ? (
                                <img
                                  src={staff.photoURL}
                                  alt={staff.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                  <User size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{staff.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : ownerSearchQuery ? (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 py-2 rounded-md shadow-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">No staff members found</p>
                      </div>
                    ) : null}
                  </div>
                  {errors.owners && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.owners}</p>
                  )}
                </div>
                
                {/* Team members */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Team Members
                  </label>
                  <div className="space-y-3">
                    {/* Selected members */}
                    {formData.members.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.members.map(member => (
                          <div
                            key={member._id}
                            className="inline-flex items-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full pl-2 pr-1 py-1"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                                {member.photoURL ? (
                                  <img
                                    src={member.photoURL}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-green-500 text-white">
                                    <User size={14} />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium">{member.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member._id)}
                              className="ml-1 p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Member search input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserPlus size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="Search for members by name or email..."
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          errors.members 
                            ? "border-red-500 dark:border-red-500" 
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    
                    {/* Search results */}
                    {isLoadingStaff ? (
                      <div className="absolute z-10 mt-1 w-full max-h-60 bg-white dark:bg-gray-700 py-2 rounded-md shadow-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">Loading staff members...</p>
                      </div>
                    ) : memberSearchQuery && filteredMemberStaffMembers.length > 0 ? (
                      <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {filteredMemberStaffMembers.map(staff => (
                          <div
                            key={staff._id}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => handleAddMember(staff)}
                          >
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                              {staff.photoURL ? (
                                <img
                                  src={staff.photoURL}
                                  alt={staff.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-green-500 text-white">
                                  <User size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{staff.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : memberSearchQuery ? (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 py-2 rounded-md shadow-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400">No staff members found</p>
                      </div>
                    ) : null}
                  </div>
                  {errors.members && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.members}</p>
                  )}
                </div>
                
                {/* Team labels */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Labels
                  </label>
                  <div className="space-y-3">
                    {/* Selected labels */}
                    {formData.labels.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.labels.map(label => (
                          <div
                            key={label}
                            className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full pl-2 pr-1 py-1"
                          >
                            <span className="text-sm font-medium">{label}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLabel(label)}
                              className="ml-1 p-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Label input */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        placeholder="Add labels (e.g., Department, Mailing, Security)"
                        className="w-full pl-10 pr-12 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLabel(labelInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => handleAddLabel(labelInput)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {/* Label suggestions */}
                    {labelInput && filteredLabelSuggestions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {filteredLabelSuggestions.slice(0, 5).map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => handleAddLabel(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Form actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTeamModal; 