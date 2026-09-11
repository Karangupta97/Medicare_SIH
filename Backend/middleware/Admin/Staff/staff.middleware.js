// -------------------NOT in use----------










import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
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

  try {
    console.log('Verifying token with JWT_SECRET');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user ID:', decoded.id);
    req.user = decoded; // Attach entire user object to request
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
