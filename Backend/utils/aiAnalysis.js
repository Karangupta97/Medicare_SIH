import axios from 'axios';
import vision from '@google-cloud/vision';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Initialize Google Cloud Vision client
let visionClient = null;
let visionInitError = null;

try {
  let clientConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  };

  console.log('[Vision API] Initializing Vision client with project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);

  // Support two ways of providing credentials:
  // 1. Via file path (GOOGLE_CLOUD_KEY_PATH)
  // 2. Via JSON string (GOOGLE_CLOUD_API_KEY)
  
  if (process.env.GOOGLE_CLOUD_KEY_PATH && process.env.GOOGLE_CLOUD_KEY_PATH !== '/path/to/service-account-key.json') {
    clientConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_PATH;
    console.log('[Vision API] Using credentials from file:', process.env.GOOGLE_CLOUD_KEY_PATH);
    visionClient = new vision.ImageAnnotatorClient(clientConfig);
    console.log('[Vision API] Client initialized successfully from file');
  } else if (process.env.GOOGLE_CLOUD_API_KEY && 
             process.env.GOOGLE_CLOUD_API_KEY !== 'your-service-account-json-as-string' &&
             process.env.GOOGLE_CLOUD_API_KEY.startsWith('{')) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_API_KEY);
      console.log('[Vision API] Parsed credentials with project_id:', credentials.project_id);
      clientConfig.credentials = credentials;
      visionClient = new vision.ImageAnnotatorClient(clientConfig);
      console.log('[Vision API] Client initialized successfully from environment variable');
    } catch (parseError) {
      visionInitError = `Failed to parse GOOGLE_CLOUD_API_KEY as JSON: ${parseError.message}`;
      console.error('[Vision API]', visionInitError);
      console.error('[Vision API] Vision API will not be available for report analysis');
    }
  } else {
    visionInitError = 'Neither GOOGLE_CLOUD_KEY_PATH nor GOOGLE_CLOUD_API_KEY is configured. Vision API will not be available.';
    console.warn('[Vision API]', visionInitError);
  }
} catch (error) {
  visionInitError = error.message;
  console.error('[Vision API] Failed to initialize Vision client:', error.message);
  console.error('[Vision API] Error stack:', error.stack);
}

// Initialize Google Gemini AI client (using newer @google/genai SDK)
let geminiClient = null;
let geminiInitError = null;

try {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!geminiApiKey) {
    geminiInitError = 'Gemini API key not configured. Set GEMINI_API_KEY or GOOGLE_CLOUD_API_KEY environment variable.';
    console.warn('[Gemini AI]', geminiInitError);
  } else {
    geminiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
    });
    console.log('[Gemini AI] Client initialized successfully');
  }
} catch (error) {
  geminiInitError = error.message;
  console.error('[Gemini AI] Failed to initialize Gemini client:', error.message);
}

/**
 * Extract text from medical report using Google Cloud Vision API
 * @param {Buffer} fileBuffer - The file buffer from S3
 * @param {string} mimeType - The MIME type of the file (image/png, application/pdf, etc.)
 * @returns {Promise<string>} - Extracted text from the report
 */
export const extractTextFromReport = async (fileBuffer, mimeType) => {
  try {
    console.log('[OCR] Starting text extraction from report...');
    
    // Check if Vision API is properly initialized
    if (!visionClient) {
      throw new Error(`Vision API is not initialized. ${visionInitError || 'Unknown initialization error'}`);
    }
    
    // For images, use direct vision API
    if (mimeType.startsWith('image/')) {
      console.log('[OCR] Processing image file with Vision API...');
      
      const request = {
        image: {
          content: fileBuffer.toString('base64'),
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
          {
            type: 'DOCUMENT_TEXT_DETECTION',
          },
        ],
      };

      try {
        const [result] = await visionClient.batchAnnotateImages({ requests: [request] });
        const annotations = result.responses[0];

        if (!annotations.fullTextAnnotation) {
          console.warn('[OCR] No text detected in image');
          return '';
        }

        const extractedText = annotations.fullTextAnnotation.text;
        console.log('[OCR] Successfully extracted text from image');
        
        return extractedText;
      } catch (visionError) {
        // If Vision API fails with permission error, provide helpful guidance
        if (visionError.code === 7 || visionError.status === 'PERMISSION_DENIED') {
          console.error('[OCR] Vision API Permission Denied. This usually means:');
          console.error('  1. Vision API is not enabled in Google Cloud Project');
          console.error('  2. Service account lacks required permissions');
          console.error('  3. Project has billing issues');
          console.error('');
          console.error('To fix:');
          console.error('  1. Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com');
          console.error('  2. Select project: medicare-490619');
          console.error('  3. Click ENABLE');
          console.error('  4. Ensure service account has "Cloud Vision API User" role');
        }
        throw visionError;
      }
    }
    
    // For PDF files, use PDF/TIFF detection
    if (mimeType === 'application/pdf') {
      console.log('[OCR] Processing PDF file...');
      
      const request = {
        requests: [
          {
            inputConfig: {
              mimeType: 'application/pdf',
              gcsSource: {
                uri: `gs://medical-reports-bucket/${Date.now()}-report.pdf`, // This would need actual GCS path
              },
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
              },
            ],
            outputConfig: {
              gcsDestination: {
                uri: `gs://medical-reports-bucket/${Date.now()}-output.json`,
              },
              batchSize: 100,
            },
          },
        ],
      };

      // For PDFs, we need to use async processing
      // Fallback: Convert PDF to image and process
      console.log('[OCR] PDF processing requires async operation - using fallback');
      return 'PDF content extraction - requires async processing';
    }

    console.warn('[OCR] Unsupported file type for text extraction');
    return '';
  } catch (error) {
    console.error('[OCR] Error extracting text from report:', error);
    console.error('[OCR] Full error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    });
    throw new Error(`Failed to extract text from report: ${error.message}`);
  }
};

/**
 * Clean and structure the extracted text
 * @param {string} rawText - Raw extracted text from OCR
 * @returns {string} - Cleaned and structured text
 */
export const cleanExtractedText = (rawText) => {
  try {
    console.log('[Text Processing] Cleaning extracted text...');
    
    // Remove extra whitespace and normalize
    let cleanedText = rawText
      .replace(/\s+/g, ' ')
      .trim();
    
    // Preserve line breaks for readability
    cleanedText = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    console.log('[Text Processing] Text cleaned successfully');
    return cleanedText;
  } catch (error) {
    console.error('[Text Processing] Error cleaning text:', error);
    throw new Error(`Failed to clean extracted text: ${error.message}`);
  }
};

/**
 * Send extracted text to Grok AI for medical explanation
 * @param {string} extractedText - Cleaned extracted text from the report
 * @returns {Promise<Object>} - AI-generated analysis with sections
 */
export const getGeminiAIAnalysis = async (extractedText) => {
  try {
    console.log('[Gemini AI] Sending request to Gemini API for medical analysis...');
    
    if (!geminiClient) {
      throw new Error(`Gemini AI is not initialized. ${geminiInitError || 'Unknown initialization error'}`);
    }

    const systemPrompt = `You are a medical report explanation assistant. Your role is to help patients understand their medical test results in simple, non-technical language.

When analyzing medical reports:
1. Use simple language that a non-medical person can understand
2. Avoid complex medical jargon
3. Focus on practical health implications
4. Be accurate and factual
5. Do not provide diagnoses, but explain what the values might indicate
6. Always recommend consulting a doctor for diagnosis

Format your response as JSON with the following structure:
{
  "summary": "A brief, simple summary of what the report tests",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "abnormalValues": [
    {
      "name": "Value name",
      "result": "The actual result",
      "normal": "What is normal",
      "explanation": "Simple explanation of what this value means"
    }
  ],
  "normalValues": [
    {
      "name": "Value name",
      "result": "The actual result",
      "explanation": "Brief explanation"
    }
  ],
  "healthConcerns": ["Potential concern 1", "Potential concern 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "doctorConsultation": "When and why the patient should consult a doctor"
}`;

    const userMessage = `Please analyze this extracted medical report and provide a detailed explanation in the specified JSON format:

Medical Report Text:
${extractedText}

Remember to keep all explanations simple and understandable for a non-medical person. Return ONLY valid JSON, no markdown or code blocks.`;

    console.log('[Gemini AI] Sending request with model: gemini-3-flash-preview');

    // Use the newer Google Gemini API with gemini-3-flash-preview
    const response = await geminiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\n${userMessage}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2000,
      }
    });

    console.log('[Gemini AI] Successfully received analysis from Gemini');

    // Extract the response content
    // The response from @google/genai is directly the content object
    const textContent = response.candidates?.[0]?.content?.parts?.[0]?.text || 
                       response.content?.parts?.[0]?.text ||
                       (typeof response.text === 'function' ? response.text() : response.text) ||
                       '';
    
    const content = textContent;
    
    // Try to parse JSON from the response
    try {
      // Extract JSON from the response (might be wrapped in code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        return analysisData;
      }
      
      // If no JSON found, return as plain text
      return {
        summary: content,
        keyFindings: [],
        abnormalValues: [],
        normalValues: [],
        healthConcerns: [],
        suggestions: [],
        doctorConsultation: 'Consult your doctor for professional medical advice.',
      };
    } catch (parseError) {
      console.warn('[Gemini AI] Could not parse JSON response, returning as summary');
      return {
        summary: content,
        keyFindings: [],
        abnormalValues: [],
        normalValues: [],
        healthConcerns: [],
        suggestions: [],
        doctorConsultation: 'Consult your doctor for professional medical advice.',
      };
    }
  } catch (error) {
    console.error('[Gemini AI] Error getting analysis from Gemini:', error.message);
    console.error('[Gemini AI] Error details:', error);
    console.error('[Gemini AI] Error stack:', error.stack);
    
    // Fallback: Provide basic analysis from extracted text
    console.log('[Gemini AI] Falling back to basic text analysis since Gemini API failed');
    return provideFallbackAnalysis(extractedText);
  }
};

/**
 * Backward compatibility - alias to Gemini
 */
export const getGrokAIAnalysis = getGeminiAIAnalysis;

/**
 * Provide basic analysis when Grok API is not available
 * Extracts key information from the OCR text
 */
const provideFallbackAnalysis = (extractedText) => {
  console.log('[Analysis] Using fallback analysis mode - basic text extraction');
  
  // Split text into lines and identify key sections
  const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Extract summary from first few lines
  const summary = lines.length > 0 
    ? `Medical report summary: ${lines.slice(0, 3).join(' ')}`
    : 'Medical report analyzed';
  
  const keyFindings = [];
  const abnormalValues = [];
  const normalValues = [];
  
  // Look for lines with common medical report patterns
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    if ((lowerLine.includes('abnormal') || lowerLine.includes('high') || lowerLine.includes('low')) && line.length > 10) {
      abnormalValues.push({
        name: line.substring(0, 50),
        result: '',
        normal: '',
        explanation: 'This value appears to be outside normal range. Consult your doctor for interpretation.'
      });
    } else if ((lowerLine.includes('normal') || lowerLine.includes('within') || lowerLine.includes('range')) && line.length > 10) {
      normalValues.push({
        name: line.substring(0, 50),
        result: '',
        explanation: 'This value appears to be within normal range.'
      });
    }
    
    // Extract key medical terms
    if (lowerLine.includes('result') || lowerLine.includes('test') || lowerLine.includes('positive') || lowerLine.includes('negative')) {
      keyFindings.push(line.substring(0, 100));
    }
  });
  
  return {
    summary: summary,
    keyFindings: keyFindings.slice(0, 5),
    abnormalValues: abnormalValues.slice(0, 5),
    normalValues: normalValues.slice(0, 5),
    healthConcerns: ['Please consult with your healthcare provider for professional interpretation of results'],
    suggestions: ['Schedule a follow-up appointment with your doctor', 'Maintain regular health check-ups', 'Keep all medical records organized'],
    doctorConsultation: 'Please discuss these results with your doctor to understand what they mean for your health and any necessary follow-up actions.',
  };
};

/**
 * Analyze a medical report end-to-end
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} - Complete analysis result
 */
export const analyzeMedicalReport = async (fileBuffer, mimeType) => {
  try {
    console.log('[Analysis Pipeline] Starting complete medical report analysis...');
    
    // Step 1: Extract text using OCR
    console.log('[Analysis Pipeline] Step 1/3: Extracting text from report...');
    const extractedText = await extractTextFromReport(fileBuffer, mimeType);
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the report');
    }

    // Step 2: Clean the extracted text
    console.log('[Analysis Pipeline] Step 2/3: Cleaning extracted text...');
    const cleanedText = cleanExtractedText(extractedText);

    // Step 3: Get AI analysis
    console.log('[Analysis Pipeline] Step 3/3: Getting AI explanation...');
    const aiAnalysis = await getGrokAIAnalysis(cleanedText);

    console.log('[Analysis Pipeline] Medical report analysis completed successfully');

    return {
      success: true,
      extractedText: cleanedText,
      analysis: aiAnalysis,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[Analysis Pipeline] Error in medical report analysis:', error);
    throw error;
  }
};
