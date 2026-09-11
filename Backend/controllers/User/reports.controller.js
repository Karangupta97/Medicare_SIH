import { Report } from "../../models/User/report.model.js";
import { uploadFile, deleteFile, getFileUrl } from "../../services/s3.service.js";
import { io } from "../../server.js";
import { sendNotificationToUser } from "../../utils/notifications.js";
import { createNotification } from "../User/notifications.controller.js";
import { checkStorageLimitBeforeUpload, getUserStorageInfo } from "../../utils/checkStorageLimit.js";

// Valid categories
const VALID_CATEGORIES = ['medical', 'lab', 'prescription', 'other'];

// Get all reports for the authenticated user
export const getReports = async (req, res) => {
  try {
    console.log(`Fetching reports for user ID: ${req.user.id}`);
    
    if (!req.user || !req.user.id) {
      console.error('User ID is missing in the request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User ID is missing.',
      });
    }
    
    const ReportModel = Report();
    const reports = await ReportModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${reports.length} reports for user ID: ${req.user.id}`);
    
    // Generate fresh signed URLs for each report
    const reportsWithUrls = await Promise.all(reports.map(async (report) => {
      try {
        console.log(`Generating signed URL for report ID: ${report._id}, S3 key: ${report.s3Key}`);
        
        const fileUrl = await getFileUrl(report.s3Key);
        
        console.log(`Successfully generated signed URL for report ID: ${report._id}`);
        
        // Create a new object with the updated URL
        return {
          ...report.toObject(),
          fileUrl
        };
      } catch (error) {
        console.error(`Error generating signed URL for report ${report._id}:`, error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        return report;
      }
    }));
    
    console.log(`Successfully processed ${reportsWithUrls.length} reports with signed URLs`);
    
    res.json({ success: true, reports: reportsWithUrls });
  } catch (error) {
    console.error('Error fetching reports:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload a new report
export const uploadReport = async (req, res) => {
  try {
    const { description, category, title } = req.body;
    const file = req.file;

    console.log("Upload request received:", { 
      description, 
      category, 
      title, 
      userId: req.user?.id,
      userName: req.user?.name,
      file: file ? { 
        originalname: file.originalname, 
        mimetype: file.mimetype, 
        size: file.size 
      } : null 
    });

    if (!req.user || !req.user.id) {
      console.error("User information missing in request");
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User information is missing.',
      });
    }

    if (!file) {
      console.error("No file provided in request");
      return res.status(400).json({
        success: false,
        message: 'Please upload a file.',
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/dicom'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.error(`Invalid file type: ${file.mimetype}`);
      return res.status(415).json({
        success: false,
        message: 'Invalid file type. Only PDF, JPG, PNG, and DICOM files are allowed.',
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      console.error(`File size too large: ${file.size} bytes`);
      return res.status(413).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }

    // // Check storage limit before uploading
    try {
      const storageCheck = await checkStorageLimitBeforeUpload(req.user.id, file.size);
      
      if (storageCheck.wouldExceedLimit) {
        console.log(`Storage limit exceeded for user ${req.user.id}:`, storageCheck);
        return res.status(413).json({
          success: false,
          error: 'STORAGE_LIMIT_EXCEEDED',
          message: 'Storage limit exceeded. Please upgrade your plan to upload more files.',
          details: {
            currentUsage: storageCheck.currentUsage,
            storageLimit: storageCheck.storageLimit,
            fileSize: storageCheck.newFileSize,
            availableSpace: storageCheck.availableSpace,
            usagePercentage: storageCheck.usagePercentage,
            planType: storageCheck.planType,
            // Convert bytes to human readable format
            currentUsageMB: Math.round(storageCheck.currentUsage / (1024 * 1024) * 100) / 100,
            storageLimitMB: Math.round(storageCheck.storageLimit / (1024 * 1024) * 100) / 100,
            fileSizeMB: Math.round(storageCheck.newFileSize / (1024 * 1024) * 100) / 100,
            availableSpaceMB: Math.round(storageCheck.availableSpace / (1024 * 1024) * 100) / 100
          }
        });
      }
    } catch (storageError) {
      console.error('Error checking storage limit:', storageError);
      return res.status(500).json({
        success: false,
        message: 'Failed to check storage limit. Please try again.',
      });
    }

    try {
      // Upload file to S3 using the service
      const { s3Key, fileUrl, formattedFilename } = await uploadFile(file, req.user.id, req.user.name);

      // Create report in database
      const ReportModel = Report();
      const report = new ReportModel({
        userId: req.user.id,
        filename: formattedFilename,
        originalFilename: title || file.originalname,
        description: description || `Uploaded on ${new Date().toLocaleDateString()}`,
        reportType: file.mimetype,
        fileUrl,
        s3Key,
        fileSize: file.size,
        contentType: file.mimetype,
        category: category || 'medical',
        tags: []
      });

      console.log("Saving report to MongoDB:", report);
      const savedReport = await report.save();
      console.log("Report saved successfully:", savedReport);

      // Create notification in database and send real-time notification
      await createNotification(
        req.user.id,
        "Document Uploaded",
        `You uploaded a new document: ${savedReport.originalFilename}`,
        "info",
        `/reports/${savedReport._id}`
      );
      
      // Send real-time notification to connected user
      const socketId = Array.from(io.sockets.sockets.values()).find(
        socket => socket.userId === req.user.id
      )?.id;
      
      if (socketId) {
        io.to(socketId).emit('notification', {
          id: `upload-${Date.now()}`,
          type: 'info',
          title: 'Document Uploaded',
          message: `You uploaded a new document: ${savedReport.originalFilename}`,
          link: `/reports/${savedReport._id}`,
          createdAt: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Report uploaded successfully',
        report: savedReport,
      });
    } catch (error) {
      console.error('Error uploading report:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload report. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error uploading report:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload report. Please try again.',
    });
  }
};

// Get a specific report by ID
export const getReportById = async (req, res) => {
  try {
    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    // Generate a new signed URL for the file
    const fileUrl = await getFileUrl(report.s3Key);

    // Update the report with the new signed URL
    report.fileUrl = fileUrl;
    await report.save();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report. Please try again.',
    });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    console.log(`Attempting to delete report with ID: ${req.params.id} for user: ${req.user.id}`);
    
    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!report) {
      console.log(`Report not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    console.log(`Found report to delete: ${report.originalFilename}, S3 key: ${report.s3Key}`);

    try {
      // Delete file from S3 using the service
      await deleteFile(report.s3Key);
      console.log(`Successfully deleted file from S3: ${report.s3Key}`);
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
      // This prevents orphaned database records
    }

    // Delete report from database
    await report.deleteOne();
    console.log(`Successfully deleted report from database: ${req.params.id}`);

    // Create notification in database for delete action
    await createNotification(
      req.user.id,
      "Document Deleted",
      `You deleted the document: ${report.originalFilename}`,
      "info",
      null
    );
    
    // Send real-time notification for delete action
    const socketId = Array.from(io.sockets.sockets.values()).find(
      socket => socket.userId === req.user.id
    )?.id;
    
    if (socketId) {
      io.to(socketId).emit('notification', {
        id: `delete-${Date.now()}`,
        type: 'warning',
        title: 'Document Deleted',
        message: `You deleted the document: ${report.originalFilename}`,
        createdAt: new Date().toISOString()
      });
    }

    // Emit WebSocket event for report deletion
    io.emit("recent-activity", {
      type: "delete",
      message: `${req.user.name} deleted a report: ${report.originalFilename}`,
      title: "Report Deleted",
      createdAt: new Date().toISOString(),
      link: null,
    });

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: `Failed to delete report: ${error.message}`,
    });
  }
};

// Toggle whether a report appears in the Emergency Folder
export const setReportEmergencyFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { inEmergencyFolder } = req.body;

    if (typeof inEmergencyFolder !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "inEmergencyFolder must be a boolean",
      });
    }

    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    report.inEmergencyFolder = inEmergencyFolder;
    await report.save();

    let fileUrl = report.fileUrl;
    try {
      fileUrl = await getFileUrl(report.s3Key);
    } catch (e) {
      console.error("setReportEmergencyFolder: could not refresh signed URL", e);
    }

    res.json({
      success: true,
      message: inEmergencyFolder
        ? "Report added to Emergency Folder"
        : "Report removed from Emergency Folder",
      report: { ...report.toObject(), fileUrl },
    });
  } catch (error) {
    console.error("Error updating Emergency Folder flag:", error);
    res.status(500).json({
      success: false,
      message: `Failed to update Emergency Folder: ${error.message}`,
    });
  }
};

// Move a report to a different category
export const moveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    
    console.log(`Attempting to move report ${id} to category: ${category}`);
    
    // Validate the category
    if (!VALID_CATEGORIES.includes(category)) {
      console.error(`Invalid category: ${category}`);
      return res.status(400).json({
        success: false,
        message: `Invalid category. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
    
    // Find the report
    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: id,
      userId: req.user.id,
    });
    
    if (!report) {
      console.log(`Report not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }
    
    console.log(`Found report: ${report.originalFilename}, current category: ${report.category}`);
    
    // Update the category
    report.category = category;
    await report.save();
    
    console.log(`Successfully moved report ${id} to category: ${category}`);
    
    res.json({
      success: true,
      message: 'Report moved successfully',
      report,
    });
  } catch (error) {
    console.error('Error moving report:', error);
    res.status(500).json({
      success: false,
      message: `Failed to move report: ${error.message}`,
    });
  }
};

// Update report title and description
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    console.log(`Attempting to update report ${id} with title: "${title}", description: "${description}"`);
    
    // Validate the title
    if (!title || !title.trim()) {
      console.error(`Invalid title: ${title}`);
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty',
      });
    }
    
    // Find the report
    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: id,
      userId: req.user.id,
    });
    
    if (!report) {
      console.log(`Report not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }
    
    console.log(`Found report: ${report.originalFilename}`);
    
    // Update the title and description
    report.originalFilename = title;
    report.description = description || '';
    await report.save();
    
    console.log(`Successfully updated report ${id} with new title: "${title}"`);
    
    // Create notification in database and send real-time notification
    await createNotification(
      req.user.id,
      "Report Updated",
      `You updated the details of: ${title}`,
      "info",
      `/reports/${report._id}`
    );
    
    // Send real-time notification to connected user
    const socketId = Array.from(io.sockets.sockets.values()).find(
      socket => socket.userId === req.user.id
    )?.id;
    
    if (socketId) {
      io.to(socketId).emit('notification', {
        id: `update-${Date.now()}`,
        type: 'info',
        title: 'Report Updated',
        message: `You updated the details of: ${title}`,
        link: `/reports/${report._id}`,
        createdAt: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: `Failed to update report: ${error.message}`,
    });
  }
};

// Refresh the signed URL for a report (for when URLs expire)
export const refreshReportUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Attempting to refresh URL for report ID: ${id}`);
    
    // Find the report
    const ReportModel = Report();
    const report = await ReportModel.findById(id);
    
    if (!report) {
      console.log(`Report not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    // For security, verify the hospital has access to this report 
    // This is a different security model than personal reports
    // Hospital users can access any patient report, but we should log the access
    console.log(`Refreshing URL for report: ${report.originalFilename}, S3 key: ${report.s3Key}`);
    
    // Generate a new signed URL
    try {
      const newFileUrl = await getFileUrl(report.s3Key);
      
      console.log(`Successfully refreshed signed URL for report ID: ${id}`);
      
      res.json({
        success: true,
        message: 'URL refreshed successfully',
        fileUrl: newFileUrl
      });
    } catch (s3Error) {
      console.error(`Error generating new signed URL for report ${id}:`, s3Error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh URL. Please try again.',
        error: process.env.NODE_ENV === 'development' ? s3Error.message : undefined
      });
    }
  } catch (error) {
    console.error('Error refreshing report URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh URL. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};