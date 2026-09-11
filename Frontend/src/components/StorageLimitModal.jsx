import React from 'react';
import { FiX, FiAlertTriangle, FiArrowUp, FiHardDrive, FiBarChart, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const StorageLimitModal = ({ 
  isOpen, 
  onClose, 
  storageDetails = null,
  planType = 'free' 
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  // Plan-aware storage limits (in MB)
  const PLAN_LIMITS_MB = { free: 50, pro: 500, premium: 2048 };
  const limitMB = PLAN_LIMITS_MB[planType] || PLAN_LIMITS_MB.free;

  // Default storage details if not provided
  const defaultStorageDetails = {
    currentUsageMB: limitMB,
    storageLimitMB: limitMB,
    usagePercentage: 100,
    planType: planType
  };

  const details = storageDetails || defaultStorageDetails;

  // Plan upgrade options — only show plans higher than the current one
  const allPlans = [
    {
      name: 'Pro Plan',
      storage: '500 MB',
      price: '₹11/month',
      features: ['500 MB storage', 'Family Vault (2 members)', 'Share reports with doctors', 'Prescription reminders'],
      planKey: 'pro',
    },
    {
      name: 'Premium Plan',
      storage: '2 GB',
      price: '₹399/month',
      features: ['2 GB storage', 'Family Vault (6 members)', 'AI health insights', 'Priority 24/7 support'],
      planKey: 'premium',
    },
  ];

  const planOrder = ['free', 'pro', 'premium'];
  const currentIndex = planOrder.indexOf(details.planType || 'free');
  const upgradePlans = allPlans.filter(p => planOrder.indexOf(p.planKey) > currentIndex);
  // Mark first available upgrade as recommended
  if (upgradePlans.length > 0) upgradePlans[0].recommended = true;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Storage Limit Exceeded</h2>
              <p className="text-sm text-gray-500">Your storage is full and needs attention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Storage Usage Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <FiHardDrive className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Storage Usage</h3>
              <p className="text-2xl font-bold text-orange-600">
                {details.currentUsageMB} / {details.storageLimitMB} MB
              </p>
              <p className="text-sm text-gray-600">
                {details.usagePercentage}% of your {details.planType} plan limit used
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Storage Used</span>
              <span>{details.usagePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  details.usagePercentage >= 100 
                    ? 'bg-red-500' 
                    : details.usagePercentage >= 80 
                    ? 'bg-orange-500' 
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(details.usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">Upload Blocked</h4>
                <p className="text-sm text-red-700">
                  You've reached your storage limit. To continue uploading medical reports, 
                  please upgrade your plan or free up space by deleting old files.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <FiArrowUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
          </div>

          <div className="grid gap-4 mb-6">
            {upgradePlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                  plan.recommended 
                    ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-2 left-4">
                    <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-600">{plan.storage} storage</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{plan.price}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"            >
              <FiArrowUp className="w-5 h-5" />
              Upgrade Plan
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Need help choosing? <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Contact our support team</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageLimitModal;
