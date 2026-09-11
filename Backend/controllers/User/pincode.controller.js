import axios from 'axios';
import { User } from '../../models/User/user.model.js';

// Validate Indian PIN code (6 digits)
function isValidPin(pin) {
  return /^\d{6}$/.test(pin);
}

// GET /api/pincode/:pin
export async function lookupPincode(req, res) {
  const { pin } = req.params;
  if (!isValidPin(pin)) {
    return res.status(400).json({ error: 'Invalid PIN code. Must be 6 digits.' });
  }
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
    const data = response.data && response.data[0];
    if (!data || data.Status !== 'Success' || !data.PostOffice || !data.PostOffice.length) {
      return res.status(404).json({ error: 'PIN code not found.' });
    }    const office = data.PostOffice[0];
    const result = {
      state: office.State,
      district: office.District,
      division: office.Division,
      region: office.Region,
      country: office.Country,
    };
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch pincode details.' });
  }
}

// POST /api/pincode/validate-address - Validate and save address
export async function validateAndSaveAddress(req, res) {  try {
    const userId = req.user.id;
    const { addressLine1, addressLine2, district, state, postalCode } = req.body;

    // Basic validation
    if (!addressLine1 || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Address Line 1 and Postal Code are required'
      });
    }

    if (!isValidPin(postalCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN code. Must be 6 digits.'
      });
    }

    // Validate postal code with API
    let validatedData = {};
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${postalCode}`);
      const data = response.data && response.data[0];
      
      if (!data || data.Status !== 'Success' || !data.PostOffice || !data.PostOffice.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PIN code. Please check and try again.'
        });
      }      const office = data.PostOffice[0];
      validatedData = {
        state: office.State,
        district: office.District,
      };

      // Cross-validate provided data with API response if provided
      if (state && state.toLowerCase() !== office.State.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `State mismatch. Expected: ${office.State}, Provided: ${state}`
        });
      }

      if (district && district.toLowerCase() !== office.District.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `District mismatch. Expected: ${office.District}, Provided: ${district}`
        });
      }

    } catch (apiError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to validate postal code. Please try again.'
      });
    }    // Update user address
    const updateData = {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : '',
      district: district || validatedData.district,
      state: state || validatedData.state,
      postalCode: postalCode,
      addressValidated: true,
      addressValidatedAt: new Date()
    };

    const UserModel = User();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password -verificationToken -resetPasswordToken' }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'Address validated and saved successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in validateAndSaveAddress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate and save address'
    });
  }
}