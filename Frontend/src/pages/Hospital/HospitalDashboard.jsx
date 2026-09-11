import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HospitalDashboardLayout from "../../components/Hospital/HospitalDashboardLayout";
import { 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiActivity, 
  FiClipboard, 
  FiPlus, 
  FiSearch,
  FiSettings,
  FiCheckCircle,
  FiAlertTriangle,
  FiBell,
  FiUser
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    activeStaff: 0
  });
  
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch real recent patients data
        const recentPatientsResponse = await axios.get('/api/hospital/recent-patients');
        
        if (recentPatientsResponse.data.success) {
          setRecentPatients(recentPatientsResponse.data.patients);
        }
        
        // For other data, we'll keep using mock data for now
        setTimeout(() => {
          setStats({
            totalPatients: 3458,
            todayAppointments: 24,
            pendingAppointments: 18,
            activeStaff: 42
          });

          // We don't need mock data for recent patients anymore, as we're using the API

          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load recent patients");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'follow-up':
        return 'bg-blue-100 text-blue-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'discharged':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HospitalDashboardLayout>
      <div className="max-w-380 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Hospital Dashboard</h1>
            <p className="text-gray-500">Welcome back, Hospital Admin</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/hospital/find-patient" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" /> Find Patient
            </Link>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <FiBell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
              <span className="p-2 bg-blue-50 rounded-lg">
                <FiUsers className="w-5 h-5 text-blue-500" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Registered in the system</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
              <span className="p-2 bg-green-50 rounded-lg">
                <FiCalendar className="w-5 h-5 text-green-500" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">--</p>
            <p className="text-xs text-gray-500 mt-1">Under development</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Pending Appointments</h3>
              <span className="p-2 bg-yellow-50 rounded-lg">
                <FiClock className="w-5 h-5 text-yellow-500" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">--</p>
            <p className="text-xs text-gray-500 mt-1">Under development</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 text-sm font-medium">Active Staff</h3>
              <span className="p-2 bg-purple-50 rounded-lg">
                <FiActivity className="w-5 h-5 text-purple-500" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.activeStaff}</p>
            <p className="text-xs text-gray-500 mt-1">Currently on duty</p>
          </div>
        </div>

        {/* Recent Patients and Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
              <p className="text-sm text-gray-500">Latest patient activity</p>
            </div>
            
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 text-gray-500">Patient Name</th>
                      <th className="px-6 py-3 text-gray-500">UMID</th>
                      <th className="px-6 py-3 text-gray-500">Last Visit</th>
                      <th className="px-6 py-3 text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center p-[2px]">
                              <div className="bg-white rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                                {patient.photoURL ? (
                                  <img 
                                    src={patient.photoURL}
                                    alt={patient.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/user.png';
                                    }}
                                  />
                                ) : (
                                  <FiUser className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                            <div className="font-medium text-gray-900">{patient.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {patient.umid.substring(0, 9)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(patient.lastVisit).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                            {patient.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-100 text-center">
              <Link to="/hospital/patients" className="text-sm text-blue-600 hover:text-blue-800">
                View all patients
              </Link>
            </div>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
              <p className="text-sm text-gray-500">Scheduled for April 16, 2025</p>
            </div>
            
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">This section is under development.</p>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-100 text-center">
              <Link to="/hospital/appointments" className="text-sm text-blue-600 hover:text-blue-800">
                View all appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link 
              to="/hospital/find-patient" 
              className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <FiSearch className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Find Patient</span>
            </Link>
            
            <Link 
              to="/hospital/appointments" 
              className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <FiCalendar className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Appointments</span>
            </Link>
            
            <Link 
              to="/hospital/settings" 
              className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <FiSettings className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </Link>
            
            <Link 
              to="/hospital/help" 
              className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <FiClipboard className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Help</span>
            </Link>
            
            <Link 
              to="#" 
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FiActivity className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </HospitalDashboardLayout>
  );
};

export default HospitalDashboard;