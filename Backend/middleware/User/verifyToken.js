import jwt from "jsonwebtoken";
import { getDeviceSessionModel } from "../../models/User/deviceSession.model.js";
import { getDBConnection } from "../../DB/db.js";
import { getCachedBlacklist, setCachedBlacklist } from "./blacklistCache.js";

export const verifyToken = async (req, res, next) => {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  let token = null;

  console.log('Verifying token for request:', req.originalUrl);
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('Token extracted from Authorization header');
  } else {
    // Fall back to cookie if no Authorization header
    token = req.cookies.token;
    console.log('Token from cookie:', token ? 'Present' : 'Missing');
  }

  if (!token) {
    console.error('No token provided in request');
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  console.log('Raw token before verification:', token);

  try {
    // Check if token is blacklisted first — with a short-TTL cache so a
    // transient MongoDB/Atlas blip doesn't cascade into failing EVERY request.
    let isBlacklisted = getCachedBlacklist(token);
    if (isBlacklisted === undefined) {
      // Cache miss → consult the DB, then cache the result for the TTL window.
      try {
        const dbConnection = getDBConnection(req.get('origin'));
        const DeviceSession = getDeviceSessionModel(dbConnection);
        isBlacklisted = await DeviceSession.isTokenBlacklisted(token);
        setCachedBlacklist(token, isBlacklisted);
      } catch (dbErr) {
        // DB unreachable (e.g. Atlas connectivity blip). Rather than failing the
        // request, fall back to the last known cached value; if we've never
        // seen this token, fail OPEN (treat as not-blacklisted) so a brief
        // outage doesn't lock everyone out. The JWT signature is still verified
        // below, so this only skips the revocation check during the outage.
        console.warn(
          "[verifyToken] blacklist DB check failed; using resilient fallback:",
          dbErr.message
        );
        const cached = getCachedBlacklist(token);
        isBlacklisted = cached === undefined ? false : cached;
      }
    }

    if (isBlacklisted) {
      console.log('Token is blacklisted');
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Token has been revoked",
      });
    }

    console.log('Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user ID:', decoded.id);
    req.user = decoded; // Attach entire user object to request
    req.token = token; // Attach token to request for potential blacklisting
    next(); // Move to next middleware/controller
  } catch (error) {
    console.error("Error in verifyToken:", error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    let errorMessage = "Unauthorized - Invalid or expired token";
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Unauthorized - Token has expired";
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = "Unauthorized - Invalid token";
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
};
