import { Report } from "../../models/User/report.model.js";
import { getFileUrl, downloadFileFromS3 } from "../../services/s3.service.js";
import { analyzeMedicalReport } from "../../utils/aiAnalysis.js";

/**
 * Analyze a medical report using OCR and AI
 * POST /api/reports/:reportId/analyze
 */
export const analyzeReport = async (req, res) => {
  let analysisResult = null;
  
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    console.log(`[Analysis] Starting analysis for report ${reportId} by user ${userId}`);

    // Validate report ID
    if (!reportId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Report ID and user authentication are required.',
      });
    }

    // Get report from database
    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: reportId,
      userId: userId, // Ensure user owns the report
    });

    if (!report) {
      console.warn(`[Analysis] Report ${reportId} not found or unauthorized access`);
      return res.status(404).json({
        success: false,
        message: 'Report not found or you do not have permission to analyze it.',
      });
    }

    // Check file type compatibility
    const supportedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/tiff'];
    if (!supportedMimeTypes.includes(report.contentType)) {
      console.warn(`[Analysis] Unsupported file type: ${report.contentType}`);
      return res.status(400).json({
        success: false,
        message: `Unsupported file type: ${report.contentType}. Supported types: PNG, JPEG, PDF, TIFF.`,
      });
    }

    console.log(`[Analysis] Report found: ${report.originalFilename}, S3 Key: ${report.s3Key}`);

    // Download file from S3
    console.log(`[Analysis] Downloading file from S3...`);
    const fileBuffer = await downloadFileFromS3(report.s3Key);
    
    if (!fileBuffer) {
      throw new Error('Failed to download file from S3');
    }

    console.log(`[Analysis] File downloaded (${fileBuffer.length} bytes), starting analysis...`);

    // Analyze the report (OCR + AI)
    analysisResult = await analyzeMedicalReport(fileBuffer, report.contentType);

    console.log(`[Analysis] Analysis completed successfully for report ${reportId}`);

    // Return analysis result
    // NOTE: We do NOT store the extracted text or analysis in the database
    // We only return it in this response for security/privacy
    res.json({
      success: true,
      message: 'Report analyzed successfully',
      data: {
        reportId: report._id,
        reportName: report.originalFilename,
        analysis: analysisResult.analysis,
        // Do not return raw extracted text for security
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[Analysis] Error analyzing report:', error);
    
    // Determine error type and return appropriate response
    let statusCode = 500;
    let errorMessage = 'Failed to analyze report. Please try again.';

    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Report file not found in storage.';
    } else if (error.message.includes('No text could be extracted')) {
      statusCode = 400;
      errorMessage = 'No text could be extracted from the report. Please try uploading a clearer image or PDF.';
    } else if (error.message.includes('API key')) {
      statusCode = 500;
      errorMessage = 'AI analysis service is not properly configured.';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Analysis took too long. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get analysis status (for long-running operations)
 * GET /api/reports/:reportId/analysis-status
 */
export const getAnalysisStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.id;

    console.log(`[Status] Checking analysis status for report ${reportId}`);

    const ReportModel = Report();
    const report = await ReportModel.findOne({
      _id: reportId,
      userId: userId,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    // Check if analysis has been done before (optional - for caching)
    // For now, we don't cache analysis results for security
    
    res.json({
      success: true,
      data: {
        reportId: report._id,
        canAnalyze: true,
        fileType: report.contentType,
        lastAnalyzed: report.lastAnalyzedAt || null,
      },
    });
  } catch (error) {
    console.error('[Status] Error checking analysis status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check analysis status.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
