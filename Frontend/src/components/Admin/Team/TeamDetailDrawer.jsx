import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Users, 
  Mail, 
  Info, 
  Tag, 
  Clock, 
  User,
  Edit,
  Trash2, 
  UserPlus,
  ChevronRight,
  AlertTriangle,
  Activity,
  UserMinus,
  Calendar,
  MoreHorizontal,
  Download,
  Send
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTeamStore } from "../../../store/teamStore";
import { useStaffStore } from "../../../store/staffStore";

const TeamDetailDrawer = ({ isOpen, onClose, team }) => {
  const [activeTab, setActiveTab] = useState("members");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [eligibleStaff, setEligibleStaff] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [confirmRemoveOwner, setConfirmRemoveOwner] = useState(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null);

  // Use store hooks
  const { addTeamMember, removeTeamMember, addTeamOwner, removeTeamOwner, getEligibleStaff, isLoading } = useTeamStore();
  const { getStaffList } = useStaffStore();

  // Load eligible staff when the search query changes
  useEffect(() => {
    if (isOpen && team && showAddMemberForm && memberSearchQuery.length > 1) {
      loadEligibleStaff();
    }
  }, [memberSearchQuery, isOpen, team, showAddMemberForm]);

  // Load eligible staff members (not in the team)
  const loadEligibleStaff = async () => {
    if (!team) return;
    
    setIsLoadingStaff(true);
    try {
      const response = await getEligibleStaff(team._id, memberSearchQuery);
      if (response.success) {
        setEligibleStaff(response.staffMembers);
      }
    } catch (error) {
      console.error("Error loading eligible staff:", error);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Time formatting error:", e);
      return "Invalid time";
    }
  };

  // Calculate relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return diffDays === 1 ? "yesterday" : `${diffDays} days ago`;
      }
      if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
      if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      }
      return "just now";
    } catch (e) {
      console.error("Relative time formatting error:", e);
      return "Unknown time";
    }
  };

  // Get user name from audit log entry
  const getAuditUserName = (entry) => {
    if (!entry) return "Unknown";
    
    if (typeof entry.user === 'object' && entry.user && entry.user.name) {
      return entry.user.name;
    }
    
    return entry.userName || (typeof entry.user === 'string' ? entry.user : "Unknown");
  };

  // Handle adding a new member
  const handleAddMember = async (member) => {
    try {
      if (!team) return;
      
      const response = await addTeamMember(team._id, member._id);
      if (response.success) {
        toast.success(`Added ${member.name} to the team`);
        setShowAddMemberForm(false);
        setMemberSearchQuery("");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  // Handle removing a member
  const handleRemoveMember = async (member) => {
    try {
      if (!team) return;
      
      const response = await removeTeamMember(team._id, member._id);
      if (response.success) {
        toast.success(`Removed ${member.name} from the team`);
        setConfirmRemoveMember(null);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  // Handle making a member an owner
  const handleMakeOwner = async (member) => {
    try {
      if (!team) return;
      
      const response = await addTeamOwner(team._id, member._id);
      if (response.success) {
        toast.success(`Made ${member.name} a team owner`);
      }
    } catch (error) {
      console.error("Error making owner:", error);
      toast.error("Failed to make owner");
    }
  };

  // Handle removing owner status
  const handleRemoveOwnerStatus = async (owner) => {
    try {
      if (!team) return;
      
      // Ensure there's at least one owner left
      if (team.owners.length <= 1) {
        toast.error("Team must have at least one owner");
        return;
      }
      
      const response = await removeTeamOwner(team._id, owner._id);
      if (response.success) {
        toast.success(`Removed owner status from ${owner.name}`);
        setConfirmRemoveOwner(null);
      }
    } catch (error) {
      console.error("Error removing owner:", error);
      toast.error("Failed to remove owner");
    }
  };

  // Handle exporting team data
  const handleExportTeamData = () => {
    if (!team) return;
    
    // Create CSV content
    const headers = ["Action", "User", "Details", "Timestamp"];
    const csvData = team.auditLog.map(entry => [
      entry.action,
      typeof entry.user === 'object' ? entry.user.name : entry.userName || entry.user,
      entry.details,
      formatDate(entry.timestamp) + " " + formatTime(entry.timestamp)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Download as file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `team_${team.name}_audit_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Team data exported successfully");
  };

  if (!team) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {team.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team.members.length + team.owners.length} members • Created {formatDate(team.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Team details */}
              <div className="space-y-6">
                {/* Email and description */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start">
                    <Mail size={20} className="mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Email Address</p>
                      <p className="text-gray-900 dark:text-white">{team.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Info size={20} className="mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Description</p>
                      <p className="text-gray-900 dark:text-white">
                        {team.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Tag size={20} className="mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Labels</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {team.labels.map((label, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("members")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "members"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      Members
                    </button>
                    <button
                      onClick={() => setActiveTab("activity")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "activity"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      Activity Log
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "settings"
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                    >
                      Settings
                    </button>
                  </nav>
                </div>
                
                {/* Tab content */}
                <div className="mt-6">
                  {/* Members tab */}
                  {activeTab === "members" && (
                    <div className="space-y-6">
                      {/* Add member button */}
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Team Members
                        </h3>
                        <button
                          onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <UserPlus size={16} className="mr-1" />
                          {showAddMemberForm ? "Cancel" : "Add Member"}
                        </button>
                      </div>
                      
                      {/* Add member form */}
                      {showAddMemberForm && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Find staff to add to this team
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            {isLoadingStaff ? (
                              <div className="mt-2 p-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-md shadow">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p>Loading staff members...</p>
                              </div>
                            ) : memberSearchQuery.length > 1 && eligibleStaff.length > 0 ? (
                              <div className="mt-2 rounded-md bg-white dark:bg-gray-800 shadow overflow-hidden">
                                {eligibleStaff.map(staff => (
                                  <div
                                    key={staff._id}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                  >
                                    <div className="flex items-center">
                                      <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                                        {staff.photoURL ? (
                                          <img
                                            src={staff.photoURL}
                                            alt={staff.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                            <User size={20} />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{staff.email}</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleAddMember(staff)}
                                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
                                    >
                                      Add
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : memberSearchQuery.length > 1 ? (
                              <div className="mt-2 p-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-md shadow">
                                No matching staff members found
                              </div>
                            ) : memberSearchQuery.length === 1 ? (
                              <div className="mt-2 p-3 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-md shadow">
                                Type at least 2 characters to search
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                      
                      {/* Team owners section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Team Owners
                        </h4>
                        <div className="space-y-2">
                          {team.owners.map((owner) => (
                            <div 
                              key={owner._id}
                              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                            >
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                                  {owner.photoURL ? (
                                    <img
                                      src={owner.photoURL}
                                      alt={owner.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                      <User size={20} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                    {owner.name}
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full">
                                      Owner
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{owner.email}</p>
                                </div>
                              </div>
                              <div className="relative">
                                <button
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => {
                                    if (team.owners.length > 1) {
                                      setConfirmRemoveOwner(owner);
                                    } else {
                                      toast.error("Teams must have at least one owner");
                                    }
                                  }}
                                >
                                  <MoreHorizontal size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Team members section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Team Members
                        </h4>
                        {team.members.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <Users size={36} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">No members yet</p>
                            <button
                              onClick={() => setShowAddMemberForm(true)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Add your first member
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {team.members.map((member) => (
                              <div 
                                key={member._id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                              >
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                                    {member.photoURL ? (
                                      <img
                                        src={member.photoURL}
                                        alt={member.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                        <User size={20} />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                      {member.name}
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full">
                                        Member
                                      </span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    className="text-sm px-2 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                    onClick={() => handleMakeOwner(member)}
                                  >
                                    Make Owner
                                  </button>
                                  <button
                                    className="text-sm px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-900/30 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => setConfirmRemoveMember(member)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Activity tab */}
                  {activeTab === "activity" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Activity Log
                        </h3>
                        <button
                          onClick={handleExportTeamData}
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Download size={16} className="mr-1" />
                          Export Log
                        </button>
                      </div>
                      
                      {/* Activity timeline */}
                      <div className="flow-root">
                        <ul className="-mb-8">
                          {team.auditLog.map((activity, activityIdx) => (
                            <li key={activityIdx}>
                              <div className="relative pb-8">
                                {activityIdx !== team.auditLog.length - 1 ? (
                                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                  <div className="relative">
                                    <div className={`
                                      h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800
                                      ${activity.action.includes('Added') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                                        activity.action.includes('Removed') ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                                        activity.action.includes('Created') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}
                                    `}>
                                      {activity.action.includes('Added') ? <UserPlus size={18} /> : 
                                       activity.action.includes('Removed') ? <UserMinus size={18} /> : 
                                       activity.action.includes('Created') ? <Users size={18} /> :
                                       <Activity size={18} />}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {getAuditUserName(activity)}
                                      </div>
                                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                        {formatRelativeTime(activity.timestamp)}
                                      </p>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                      <p>
                                        <span className="font-medium">{activity.action}</span>
                                        {" - "}
                                        {activity.details}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Settings tab */}
                  {activeTab === "settings" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                          Team Settings
                        </h3>
                        
                        {/* Edit team button */}
                        <button
                          className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => toast.success("Edit team functionality would open here")}
                        >
                          <div className="flex items-center">
                            <Edit size={20} className="mr-3 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Edit Team</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Modify team name, email, description and labels</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                        
                        {/* Send email to team button */}
                        <button
                          className="mt-3 w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => toast.success("Send email functionality would open here")}
                        >
                          <div className="flex items-center">
                            <Send size={20} className="mr-3 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Send Email to Team</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Email all team members at {team.email}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Danger zone */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center">
                          <AlertTriangle size={16} className="mr-2" />
                          Danger Zone
                        </h4>
                        
                        <button
                          className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 text-left hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => toast.success("Delete team functionality would open here")}
                        >
                          <div className="flex items-center">
                            <Trash2 size={20} className="mr-3 text-red-500" />
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Team</p>
                              <p className="text-xs text-red-600 dark:text-red-300 opacity-80">This action cannot be undone</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog for Removing Owner */}
      {confirmRemoveOwner && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto shadow-lg">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Remove Owner Status</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to remove owner status from {confirmRemoveOwner.name}? 
              They will no longer have administrative privileges for this team.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmRemoveOwner(null)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveOwnerStatus(confirmRemoveOwner)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Owner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Removing Member */}
      {confirmRemoveMember && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto shadow-lg">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Remove Member</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to remove {confirmRemoveMember.name} from this team?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmRemoveMember(null)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(confirmRemoveMember)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TeamDetailDrawer; 