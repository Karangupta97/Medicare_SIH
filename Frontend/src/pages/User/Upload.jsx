import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck, FiFile, FiInfo, FiCloud, FiFolder } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/Patient/authStore';
import usePatientStore from '../../store/Patient/patientstore';
import StorageLimitModal from '../../components/StorageLimitModal';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [category, setCategory] = useState('medical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storageModal, setStorageModal] = useState({ show: false, details: null });
  const { token, isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get uploadReport from patient store
  const { uploadReport } = usePatientStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        setIsLoading(true);
        if (!isAuthenticated) {
          await checkAuth();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        if (errors[0]?.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        } else if (errors[0]?.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported file type.`);
        } else {
          toast.error(`Error with ${file.name}: ${errors[0]?.message}`);
        }
      });
    }

    const newFiles = acceptedFiles.filter(
      (file) => !files.some((f) => f.name === file.name)
    );
    
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/dicom': ['.dcm'],
    },
    maxSize: 10485760, // 10MB
    multiple: true,
  });

  const removeFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to upload reports');
      navigate('/login');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title for your report');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('description', description || `Uploaded on ${new Date().toLocaleDateString()}`);
      formData.append('category', category);
      formData.append('title', title);

      // Use uploadReport from patient store
      await uploadReport(token, formData);

      toast.success('Report uploaded successfully!');
      setFiles([]);
      setDescription('');
      setTitle('');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Check if it's a storage limit error
      if (error.response?.status === 413 && error.response?.data?.error === 'STORAGE_LIMIT_EXCEEDED') {
        setStorageModal({ 
          show: true, 
          details: error.response.data.details 
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload report');
      }
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 animate-fadeIn">
        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 transition-all duration-300 hover:shadow-md">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">Upload Medical Reports</h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Upload your medical reports securely to your personal health record.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="transition-all duration-200 transform hover:translate-x-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter a descriptive title for your report"
                disabled={uploading}
              />
            </div>

            <div className="transition-all duration-200 transform hover:translate-x-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-8 sm:pr-10 text-sm sm:text-base"
                  disabled={uploading}
                >
                  <option value="medical">Medical Reports</option>
                  <option value="lab">Lab Results</option>
                  <option value="prescription">Prescription</option>
                  <option value="other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="transition-all duration-200 transform hover:translate-x-1">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Add details about this report to help you identify it later"
                rows="3"
                disabled={uploading}
              />
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} disabled={uploading} />
                <div className="flex flex-col items-center justify-center">
                  <FiCloud className={`h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  {isDragActive ? (
                    <p className="text-blue-600 font-medium text-sm sm:text-base md:text-lg animate-pulse">Drop your files here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-medium text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
                        Drag & drop your files here
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                        or <span className="text-blue-500 font-medium">browse files</span> from your device
                      </p>
                      <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 bg-gray-100 rounded-lg py-1 sm:py-2 px-2 sm:px-3">
                        <FiInfo className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Supported formats: PDF, JPG, PNG, DICOM | Max size: 10MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 sm:mt-6 md:mt-8 transition-all duration-300 animate-fadeIn">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                    <FiFolder className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Selected Files <span className="ml-1 sm:ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{files.length}</span>
                  </h3>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100 transition-all duration-200 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <div className="p-1 sm:p-2 bg-blue-50 rounded-lg mr-2 sm:mr-3">
                          <FiFile className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-800 mb-0.5 line-clamp-1 max-w-[150px] sm:max-w-[250px] md:max-w-full">
                            {file.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file)}
                        className="p-1 sm:p-1.5 bg-gray-200 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors duration-200"
                        disabled={uploading}
                        aria-label="Remove file"
                      >
                        <FiX className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 sm:mt-6 md:mt-8">
              <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0 || !title.trim()}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg text-white font-medium transition-all duration-300 text-sm sm:text-base ${
                  uploading || files.length === 0 || !title.trim()
                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01] hover:shadow-md'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <FiUpload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Upload Report
                  </div>
                )}
              </button>
            </div>

            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 sm:mt-6 animate-fadeIn">
                <div className="relative pt-1">
                  <div className="flex mb-1 sm:mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Upload Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {uploadProgress.total}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-1.5 sm:h-2 mb-2 sm:mb-4 text-xs flex rounded-full bg-blue-100">
                    <div
                      style={{ width: `${uploadProgress.total}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-md">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-5 flex items-center">
            <FiInfo className="mr-1 sm:mr-2 text-blue-500 w-4 h-4 sm:w-5 sm:h-5" /> Upload Guidelines
          </h2>
          <ul className="space-y-2 sm:space-y-3 md:space-y-4">
            <li className="flex items-start p-2 sm:p-3 rounded-lg bg-green-50 border border-green-100">
              <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5" />
              <span className="text-xs sm:text-sm text-green-800">
                Supported formats: <span className="font-medium">PDF, JPG, PNG, DICOM</span> (medical imaging)
              </span>
            </li>
            <li className="flex items-start p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-100">
              <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 sm:mr-3 mt-0.5" />
              <span className="text-xs sm:text-sm text-blue-800">
                Maximum file size: <span className="font-medium">10MB</span> per file
              </span>
            </li>
            <li className="flex items-start p-2 sm:p-3 rounded-lg bg-purple-50 border border-purple-100">
              <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-2 sm:mr-3 mt-0.5" />
              <span className="text-xs sm:text-sm text-purple-800">
                Your files are encrypted and stored securely in <span className="font-medium">AWS S3</span>
              </span>
            </li>
            <li className="flex items-start p-2 sm:p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <FiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mr-2 sm:mr-3 mt-0.5" />
              <span className="text-xs sm:text-sm text-indigo-800">
                Only you and authorized healthcare providers can access your reports
              </span>
            </li>
          </ul>
        </div>

        {/* Storage Limit Modal */}
        <StorageLimitModal
          isOpen={storageModal.show}
          onClose={() => setStorageModal({ show: false, details: null })}
          storageDetails={storageModal.details}
          planType={storageModal.details?.planType || 'free'}
        />
      </div>
  );
};

export default Upload;