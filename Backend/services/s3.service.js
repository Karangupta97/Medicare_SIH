import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Trim AWS env vars to remove hidden \r or whitespace from Windows-style .env files on Linux
['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'].forEach(key => {
  if (process.env[key]) {
    process.env[key] = process.env[key].trim();
  }
});

// Debug: log masked AWS credentials to verify correct values in production
console.log('AWS Config Check:', {
  accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + '...',
  accessKeyLength: process.env.AWS_ACCESS_KEY_ID?.length,
  secretKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_S3_BUCKET,
});

// Validate AWS credentials during initialization
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS credentials are missing or invalid. Please check the .env file.');
  throw new Error('AWS credentials are not properly configured.');
}

if (!process.env.AWS_REGION) {
  console.error('AWS region is missing. Please check the .env file.');
  throw new Error('AWS region is not properly configured.');
}

if (!process.env.AWS_S3_BUCKET) {
  console.error('AWS S3 bucket name is missing. Please check the .env file.');
  throw new Error('AWS S3 bucket name is not properly configured.');
}

const AWS_S3_FORCE_PATH_STYLE =
  (process.env.AWS_S3_FORCE_PATH_STYLE ?? "true") === "true";

const getRegionFromS3Endpoint = (endpointHost) => {
  if (!endpointHost) return undefined;
  // Example: medicare-medical-storage.s3.ap-south-1.amazonaws.com
  const match = String(endpointHost).match(/\.s3\.([a-z0-9-]+)\.amazonaws\.com/i);
  return match?.[1];
};

const createS3Client = ({ region }) =>
  new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    // Keep compatibility with S3-compatible providers; can be toggled via env var.
    forcePathStyle: AWS_S3_FORCE_PATH_STYLE,
  });

// S3 client is kept mutable so we can recover from region mismatches (PermanentRedirect).
let s3Client = createS3Client({ region: process.env.AWS_REGION });

// Get permanent (non-expiring) URL using bucket and key
// This creates a URL that doesn't expire but requires the object to be public or have appropriate permissions
const getPermanentUrl = (bucketName, key, region = process.env.AWS_REGION) => {
  // Format: https://<bucket-name>.s3.<region>.amazonaws.com/<object-key>
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

export const uploadFile = async (file, userId, userName, isPermanent = false) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid file: File or file buffer is missing');
    }

    if (!userId || !userName) {
      throw new Error('Invalid parameters: User ID and name are required');
    }

    const fileExtension = path.extname(file.originalname);
    const randomString = crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    const originalNameWithoutExt = path.basename(file.originalname, fileExtension);
    const formattedFilename = `${originalNameWithoutExt}-${now}${fileExtension}`;
    
    // Create appropriate folder based on file type
    const folderPath = isPermanent 
      ? `profile-pictures/${userId}` 
      : `user-reports/${userName}+${userId}`;
    
    const s3Key = `${folderPath}/${randomString}${fileExtension}`;

    console.log('Preparing to upload file to S3:', {
      bucket: process.env.AWS_S3_BUCKET,
      key: s3Key,
      contentType: file.mimetype,
      fileSize: file.size,
      isPermanent
    });

    // Validate AWS credentials and bucket
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS configuration is incomplete');
    }

    let hasRetriedAfterPermanentRedirect = false;

    // Declare uploadParams outside the try block so it's accessible in the catch
    // block during PermanentRedirect retry.
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('File successfully uploaded to S3:', { key: s3Key });
    } catch (uploadError) {
      console.error('S3 upload error details:', uploadError);
      if (uploadError.name === 'NoSuchBucket') {
        throw new Error('S3 bucket not found');
      } else if (uploadError.name === 'AccessDenied') {
        throw new Error('Access denied to S3 bucket');
      }

      const isPermanentRedirect =
        uploadError?.name === "PermanentRedirect" ||
        uploadError?.Code === "PermanentRedirect" ||
        /PermanentRedirect/i.test(uploadError?.message ?? "");

      if (isPermanentRedirect) {
        // Recover automatically when the bucket is in a different region than `AWS_REGION`.
        const endpointHost = uploadError?.Endpoint || uploadError?.endpoint;

        const endpointHostFromMessage = String(uploadError?.message ?? "").match(
          /Endpoint:\s*'([^']+)'/i
        )?.[1];

        const resolvedEndpointHost = endpointHostFromMessage || endpointHost;
        const redirectRegion = getRegionFromS3Endpoint(resolvedEndpointHost);

        if (redirectRegion && !hasRetriedAfterPermanentRedirect) {
          console.warn("S3 PermanentRedirect detected. Retrying upload with region:", {
            redirectRegion,
          });
          hasRetriedAfterPermanentRedirect = true;
          s3Client = createS3Client({ region: redirectRegion });
          await s3Client.send(new PutObjectCommand(uploadParams));
        } else {
          throw new Error(`Failed to upload to S3: ${uploadError.message}`);
        }
      } else {
        throw new Error(`Failed to upload to S3: ${uploadError.message}`);
      }
    }

    let fileUrl;
    
    // Use signed URLs for both permanent and temporary files
    // For profile pictures, use 30 minutes expiration time
    const expirationTime = isPermanent ? 30 * 60 : 3600; // 30 minutes for profile pics, 1 hour for others
    
    fileUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      }),
      { expiresIn: expirationTime }
    );
    
    console.log(`Generated signed URL for ${isPermanent ? 'profile picture' : 'uploaded file'}:`, { 
      fileUrl: fileUrl.split('?')[0] + '?...', // Log URL without exposing signature
      expiresIn: `${expirationTime} seconds`
    });

    return {
      s3Key,
      fileUrl,
      formattedFilename,
      isPermanent,
      expiresAt: isPermanent ? new Date(Date.now() + 30 * 60 * 1000) : new Date(Date.now() + 3600 * 1000)
    };
  } catch (error) {
    console.error('File upload error:', {
      error: error.message,
      userId,
      fileName: file?.originalname,
    });
    throw error;
  }
};

export const deleteFile = async (s3Key) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      })
    );
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
};export const getFileUrl = async (s3Key, isPermanent = false) => {
  try {
    // Use signed URLs for both permanent and temporary files
    const expirationTime = isPermanent ? 7 * 24 * 3600 : 3600; // 7 days for profile pics, 1 hour for others
    
    const fileUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      }),
      { expiresIn: expirationTime }
    );
    return fileUrl;
  } catch (error) {
    console.error('S3 get URL error:', error);
    throw error;
  }
};

// Specific function for uploading profile pictures with permanent URLs
export const uploadProfilePicture = async (file, userId, userName) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid profile picture: File or file buffer is missing');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type for profile picture. Only JPEG, JPG and PNG images are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('Profile picture too large. Maximum size is 5MB');
    }

    // Use the uploadFile function with isPermanent=true for profile pictures
    const result = await uploadFile(file, userId, userName, true);
    
    console.log('Profile picture uploaded successfully with signed URL:', {
      userId,
      s3Key: result.s3Key,
      fileUrl: result.fileUrl.split('?')[0] + '?...' // Don't log full signed URL
    });
    
    return result;
  } catch (error) {
    console.error('Profile picture upload error:', {
      error: error.message,
      userId,
      fileName: file?.originalname,
    });
    throw error;
  }
};

// Function to refresh URL if it's close to expiring (for profile pictures)
export const refreshProfilePictureUrl = async (s3Key) => {
  try {
    if (!s3Key) {
      throw new Error('S3 key is required to refresh URL');
    }

    // Generate new signed URL with 30 minutes expiration for profile pictures
    const fileUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      }),
      { expiresIn: 30 * 60 } // 30 minutes
    );
    
    console.log('Profile picture URL refreshed:', {
      s3Key,
      newUrl: fileUrl.split('?')[0] + '?...' // Don't log full signed URL
    });
    
    return {
      fileUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    };
  } catch (error) {
    console.error('URL refresh error:', error);
    throw error;
  }
};

/**
 * Download file buffer from S3
 * @param {string} s3Key - The S3 key/path of the file
 * @returns {Promise<Buffer>} - The file buffer
 */
export const downloadFileFromS3 = async (s3Key) => {
  try {
    if (!s3Key) {
      throw new Error('S3 key is required to download file');
    }

    console.log(`Downloading file from S3: ${s3Key}`);

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
      })
    );

    // Convert readable stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    console.log(`File downloaded successfully from S3: ${s3Key} (${fileBuffer.length} bytes)`);
    return fileBuffer;
  } catch (error) {
    console.error(`S3 download error for key ${s3Key}:`, error);
    throw error;
  }
};

