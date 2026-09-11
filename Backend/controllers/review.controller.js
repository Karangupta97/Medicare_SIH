import Review from "../models/review.model.js";

// Submit a new review
export const submitReview = async (req, res) => {
  try {
    const { 
      name, 
      role, 
      review, 
      isAnonymous, 
      rating,
      hospitalName,
      hospitalLocation,
      collegeName,
      collegeLocation,
      storeName,
      storeLocation,
      otherInfo,
      additionalComments,
      reviewType = 'normal'
    } = req.body;
    
    // Validate required fields
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please select your role"
      });
    }

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Please share your experience"
      });
    }

    if (review.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Your review must be at least 10 characters long"
      });
    }

    if (review.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Your review must not exceed 1000 characters"
      });
    }

    if (!isAnonymous && !name) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name or select anonymous submission"
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5 stars"
      });
    }

    // Prepare role-specific information
    let roleInfo = null;
    
    // Role-specific validation and data preparation
    switch(role) {
      case 'doctor':
        // For doctors, hospital information is optional
        if (hospitalName || hospitalLocation) {
          roleInfo = {
            institutionName: hospitalName || '',
            institutionLocation: hospitalLocation || ''
          };
        }
        break;
      case 'hospital-staff':
      case 'healthcare-admin':
        if (!hospitalName || !hospitalLocation) {
          return res.status(400).json({
            success: false,
            message: "Please provide both hospital name and location"
          });
        }
        roleInfo = {
          institutionName: hospitalName,
          institutionLocation: hospitalLocation
        };
        break;
      case 'medical-student':
        if (!collegeName || !collegeLocation) {
          return res.status(400).json({
            success: false,
            message: "Please provide both college name and location"
          });
        }
        roleInfo = {
          collegeName: collegeName,
          collegeLocation: collegeLocation
        };
        break;
      case 'medical-store':
        if (!storeName || !storeLocation) {
          return res.status(400).json({
            success: false,
            message: "Please provide both store name and location"
          });
        }
        roleInfo = {
          storeName: storeName,
          storeLocation: storeLocation
        };
        break;
      case 'other':
        if (!otherInfo) {
          return res.status(400).json({
            success: false,
            message: "Please provide additional information about your role"
          });
        }
        roleInfo = {
          additionalInfo: otherInfo
        };
        break;
    }

    // Create new review
    const ReviewModel = Review();
    const newReview = new ReviewModel({
      name: isAnonymous ? 'Anonymous' : name,
      role,
      review,
      rating,
      isAnonymous,
      userId: req.user?._id,
      roleInfo,
      additionalComments,
      reviewType
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Thank you for sharing your experience! Your review will be published after approval.",
      data: newReview
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to submit review. Please try again.",
      error: error.message
    });
  }
};

// Get all approved reviews
export const getApprovedReviews = async (req, res) => {
  try {
    const ReviewModel = Review();
    const reviews = await ReviewModel.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// Get detailed reviews for healthcare providers
export const getDetailedReviews = async (req, res) => {
  try {
    const ReviewModel = Review();
    const reviews = await ReviewModel.find({ 
      status: 'approved',
      reviewType: 'detailed'
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching detailed reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch detailed reviews",
      error: error.message
    });
  }
}; 