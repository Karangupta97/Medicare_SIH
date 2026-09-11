import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHardDrive, FiBarChart, FiArrowUp, FiInfo } from 'react-icons/fi';
import storageAPI from '../services/storageAPI';

const StorageUsageWidget = ({ showUpgradeButton = true, compact = false }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const fetchStorageInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storageAPI.getStorageInfo();
      setStorageInfo(response.storageInfo);
    } catch (err) {
      console.error('Error fetching storage info:', err);
      setError('Failed to load storage information');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getPlanDisplayName = (planType) => {
    const plans = {
      free: 'Free Plan',
      basic: 'Basic Plan',
      premium: 'Premium Plan',
      pro: 'Pro Plan'
    };
    return plans[planType] || 'Unknown Plan';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center text-red-600">
          <FiInfo className="w-4 h-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!storageInfo) return null;

  const usagePercentage = Math.round((storageInfo.currentUsage / storageInfo.storageLimit) * 100);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiHardDrive className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-base'}`}>
            Storage Usage
          </h3>
        </div>
        {!compact && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getPlanDisplayName(storageInfo.planType)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
            {usagePercentage}% used
          </span>
          <span className="text-sm text-gray-600">
            {formatBytes(storageInfo.currentUsage)} / {formatBytes(storageInfo.storageLimit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(usagePercentage)}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Usage Details */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <FiBarChart className="w-4 h-4 mr-1" />
          <span>{storageInfo.fileCount || 0} files</span>
        </div>
        <span>{formatBytes(storageInfo.availableSpace)} available</span>
      </div>

      {/* Upgrade Button */}
      {showUpgradeButton && usagePercentage >= 80 && storageInfo.planType !== 'pro' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            to="/pricing"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <FiArrowUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Link>
        </div>
      )}
    </div>
  );
};

export default StorageUsageWidget;
