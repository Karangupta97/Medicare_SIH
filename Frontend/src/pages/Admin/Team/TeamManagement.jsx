import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Users, 
  Search, 
  PlusCircle, 
  Filter, 
  Mail, 
  Tag, 
  Info,
  User,
  Clock,
  ExternalLink,
  Download,
  Trash2,
  Edit,
  AlertCircle
} from "lucide-react";
import FounderDashboardLayout from "../../../components/Founder/FounderDashboardLayout";
import { useTeamStore } from "../../../store/teamStore";
import { useFounderStore } from "../../../store/founderStore";
import CreateTeamModal from "../../../components/Admin/Team/CreateTeamModal";
import TeamDetailDrawer from "../../../components/Admin/Team/TeamDetailDrawer";

const TeamManagement = () => {
  // State for UI controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  
  // Use team store
  const { 
    teams, 
    totalTeams, 
    totalPages, 
    currentPage, 
    isLoading, 
    error,
    getTeams, 
    createTeam, 
    getTeamById, 
    deleteTeam,
    clearError
  } = useTeamStore();

  // Get unique labels from all teams for filtering
  const uniqueLabels = React.useMemo(() => {
    const labels = new Set();
    teams.forEach(team => {
      team.labels?.forEach(label => labels.add(label));
    });
    return Array.from(labels);
  }, [teams]);

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle loading teams with search and pagination
  const loadTeams = async (page = 1) => {
    try {
      await getTeams(page, 10, searchQuery);
    } catch (error) {
      // Error is already handled in the store
      console.error("Error loading teams:", error);
    }
  };

  // Handle search
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      loadTeams(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle label filter
  useEffect(() => {
    if (selectedLabelFilter) {
      // Filter teams locally based on selected label
      // This uses client-side filtering for labels
      // For a larger application, this could be done server-side
    }
  }, [selectedLabelFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Format date to readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Handle creating a new team
  const handleCreateTeam = async (newTeam) => {
    try {
      await createTeam(newTeam);
      toast.success(`Team "${newTeam.name}" created successfully`);
      setIsCreateModalOpen(false);
      loadTeams(); // Reload teams to get the latest data
    } catch (error) {
      // Error toast is handled in the useEffect for error
      console.error("Error creating team:", error);
    }
  };

  // Open team details drawer
  const handleViewTeam = async (team) => {
    try {
      await getTeamById(team._id);
      setSelectedTeam(team);
      setIsTeamDetailOpen(true);
    } catch (error) {
      console.error("Error loading team details:", error);
    }
  };

  // Handle team deletion
  const handleDeleteTeam = async (teamId) => {
    try {
      await deleteTeam(teamId);
      toast.success("Team deleted successfully");
      setTeamToDelete(null);
      setIsConfirmDeleteOpen(false);
      
      // If we were viewing this team, close the drawer
      if (selectedTeam && selectedTeam._id === teamId) {
        setIsTeamDetailOpen(false);
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  // Handle opening delete confirmation
  const confirmDeleteTeam = (team, e) => {
    e.stopPropagation();
    setTeamToDelete(team);
    setIsConfirmDeleteOpen(true);
  };

  // Export teams data as CSV
  const handleExportTeams = () => {
    // Filter teams if there's a label filter
    const teamsToExport = selectedLabelFilter
      ? teams.filter(team => team.labels?.includes(selectedLabelFilter))
      : teams;
    
    // Simple CSV export implementation
    const headers = ["Name", "Email", "Owners", "Members", "Labels", "Created"];
    const csvData = teamsToExport.map(team => [
      team.name,
      team.email,
      team.owners.map(o => o.name).join("; "),
      team.members.map(m => m.name).join("; "),
      team.labels?.join("; ") || "",
      formatDate(team.createdAt)
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'medicare_teams.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Teams data exported successfully");
  };

  // Get filtered teams based on label
  const filteredTeams = selectedLabelFilter
    ? teams.filter(team => team.labels?.includes(selectedLabelFilter))
    : teams;

  return (
    <FounderDashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage teams within your organization
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-all duration-200 hover:shadow"
            >
              <PlusCircle size={18} className="mr-2" />
              Create Team
            </button>
            
            <button
              onClick={handleExportTeams}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
            >
              <Download size={18} className="mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Search and filter section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or owner..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag size={18} className="text-gray-400" />
              </div>
              <select
                value={selectedLabelFilter}
                onChange={(e) => setSelectedLabelFilter(e.target.value)}
                className="w-full md:w-44 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Labels</option>
                {uniqueLabels.map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Teams list/table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-blue-600 dark:text-blue-400 animate-pulse">Loading teams...</p>
              </div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {teams.length === 0 
                  ? "You haven't created any teams yet. Create your first team to get started."
                  : "No teams match your current filters. Try adjusting your search criteria."}
              </p>
              {teams.length === 0 && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto shadow-sm transition-all duration-200 hover:shadow"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Create First Team
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Team
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Owners
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Labels
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTeams.map((team) => (
                    <tr 
                      key={team._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => handleViewTeam(team)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center">
                            <Users size={20} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {team.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {team.members?.length + team.owners?.length || 0} members
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-200">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          {team.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex -space-x-2">
                          {team.owners?.slice(0, 3).map((owner) => (
                            <div 
                              key={owner._id} 
                              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700"
                              title={owner.name}
                            >
                              {owner.photoURL ? (
                                <img 
                                  src={owner.photoURL} 
                                  alt={owner.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                                  <User size={16} />
                                </div>
                              )}
                            </div>
                          ))}
                          {team.owners?.length > 3 && (
                            <div 
                              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400"
                            >
                              +{team.owners.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {team.labels?.slice(0, 3).map((label, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                            >
                              {label}
                            </span>
                          ))}
                          {team.labels?.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              +{team.labels.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-gray-400" />
                          {formatDate(team.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                          <button
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTeam(team);
                            }}
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit team (opens modal with pre-filled data)
                              toast.success("Edit functionality coming soon!");
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            onClick={(e) => confirmDeleteTeam(team, e)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls - only show if we have more than one page */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTeams.length} of {totalTeams} teams
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => loadTeams(currentPage - 1)} 
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                  ${currentPage === 1 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => loadTeams(i + 1)}
                  className={`px-3 py-1 rounded-md border 
                    ${currentPage === i + 1 
                      ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                onClick={() => loadTeams(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                  ${currentPage === totalPages 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Team Modal */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
      
      {/* Team Detail Drawer */}
      <TeamDetailDrawer
        isOpen={isTeamDetailOpen}
        onClose={() => setIsTeamDetailOpen(false)}
        team={selectedTeam}
      />

      {/* Delete Confirmation Dialog */}
      {isConfirmDeleteOpen && teamToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmDeleteOpen(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Delete Team
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete the team "{teamToDelete.name}"? 
                  This will permanently remove the team and all of its data.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTeam(teamToDelete._id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FounderDashboardLayout>
  );
};

export default TeamManagement;