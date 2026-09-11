export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const FOUNDER_OTP_LOGIN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Founder Login Security Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #1e40af, #3b82f6); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Founder Security Verification</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello Founder,</p>
    <p>For enhanced security, we require two-factor authentication for all founder account access.</p>
    <p>Your one-time verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af; background-color: #e0e7ff; padding: 8px 16px; border-radius: 4px;">{otpCode}</span>
    </div>
    <p>Enter this code on the login verification page to complete your authentication.</p>
    <p>This code will expire in 10 minutes and can only be used once.</p>
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 20px 0;">
      <p style="margin: 0; color: #721c24;"><strong>Important Security Notice:</strong></p>
      <p style="margin: 10px 0 0 0; color: #721c24;">If you did not attempt to log in to the Medicare Founder Dashboard, please contact the system administrator immediately as your account may be compromised.</p>
    </div>
    <p>Best regards,<br>Medicare Security Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare Founder Portal. Please do not reply to this email.</p>
    <p>Accessed from IP: {ipAddress} at {timestamp}</p>
  </div>
</body>
</html>
`;

export const FOUNDER_SENSITIVE_ACTION_OTP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sensitive Action Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #991b1b, #dc2626); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Sensitive Action Verification</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello Founder,</p>
    <p>A <strong>sensitive action</strong> is being attempted on the Medicare platform:</p>
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Action:</strong> {actionType}</p>
      <p style="margin: 10px 0 0 0;"><strong>Details:</strong> {actionDetails}</p>
      <p style="margin: 10px 0 0 0;"><strong>Requested at:</strong> {timestamp}</p>
    </div>
    <p>To authorize this action, use the following verification code:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #991b1b; background-color: #fee2e2; padding: 8px 16px; border-radius: 4px;">{otpCode}</span>
    </div>
    <p>This code will expire in 5 minutes for security reasons.</p>
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 10px; margin: 20px 0;">
      <p style="margin: 0; color: #721c24;"><strong>Security Warning:</strong></p>
      <p style="margin: 10px 0 0 0; color: #721c24;">If you did not initiate this action, please immediately contact the system administrator and change your password as your account may be compromised.</p>
    </div>
    <p>Best regards,<br>Medicare Security Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated security message from the Medicare Founder Portal. Please do not reply to this email.</p>
    <p>Accessed from IP: {ipAddress}</p>
  </div>
</body>
</html>
`;

export const STAFF_WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Medicare Staff</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4338ca, #6366f1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Medicare Staff</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {staffName},</p>
    <p>Welcome to the Medicare Team! You have been added as a staff member to our platform.</p>
    <p>Here are your login credentials:</p>
    
    <div style="background-color: #e0e7ff; border-left: 4px solid #4338ca; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Email:</strong> {staffEmail}</p>
      <p style="margin: 10px 0 0 0;"><strong>Staff ID:</strong> {staffId}</p>
      <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> {temporaryPassword}</p>
    </div>
    
    <p><strong>Important:</strong> For security reasons, you will be required to change your password after your first login.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginUrl}" style="background-color: #4338ca; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Medicare</a>
    </div>
    
    <p>If you have any questions or need assistance, please contact your manager.</p>
    <p>Best regards,<br>Medicare Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare Staff Portal. Please do not reply to this email.</p>
    <p>Medicare - {currentYear}</p>
  </div>
</body>
</html>
`;

export const STAFF_PASSWORD_RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4338ca, #6366f1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello {staffName},</p>
    <p>Your password has been reset by an administrator. Please use the following temporary password to log in:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #4338ca; background-color: #e0e7ff; padding: 8px 16px; border-radius: 4px;">{temporaryPassword}</span>
    </div>
    
    <p>You will be required to set a new password upon your next login.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginUrl}" style="background-color: #4338ca; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Medicare</a>
    </div>
    
    <div style="background-color: #e0e7ff; border-left: 4px solid #4338ca; padding: 10px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Security Notice:</strong></p>
      <p style="margin: 10px 0 0 0;">If you did not request this password reset, please contact your administrator immediately.</p>
    </div>
    
    <p>Best regards,<br>Medicare Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare Staff Portal. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const DOCTOR_APPROVAL_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctor Account Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4338ca, #6366f1); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Your Doctor Account is Approved!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello Dr. {doctorName},</p>
    <p>Congratulations! Your Medicare doctor account has been approved.</p>
    
    <div style="background-color: #e0e7ff; border-left: 4px solid #4338ca; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Next Steps:</strong></p>
      <ul style="margin-top: 10px;">
        <li>Log in to your account using your registered email and password</li>
        <li>Complete your profile information</li>
        <li>Start using the Medicare platform to manage patients and reports</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{loginUrl}" style="background-color: #4338ca; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Medicare</a>
    </div>
    
    <p>If you have any questions or need assistance, please contact our support team.</p>
    
    <p>Welcome to the Medicare community!</p>
    
    <p>Best regards,<br>Medicare Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare platform. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const DOCTOR_REJECTION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctor Account Application Status</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #6b7280, #4b5563); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Doctor Account Application Status</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello Dr. {doctorName},</p>
    <p>Thank you for your interest in joining the Medicare platform.</p>
    
    <p>After careful review of your application, we regret to inform you that we are unable to approve your doctor account at this time.</p>
    
    <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Reason for rejection:</strong></p>
      <p style="margin: 10px 0 0 0;">{rejectionReason}</p>
    </div>
    
    <p>You are welcome to reapply with updated information or corrected documentation by creating a new account.</p>
    
    <p>If you have any questions or need further clarification, please contact our support team.</p>
    
    <p>Best regards,<br>Medicare Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare platform. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const FAMILY_VAULT_INVITE_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Family Vault Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #7c3aed, #a855f7); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Family Vault Invitation</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p><strong>{headMemberName}</strong> has invited you to join their Family Vault <strong>"{vaultName}"</strong> on Medicare as a <strong>{relationship}</strong>.</p>
    
    <div style="background-color: #f3e8ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
      <p style="margin: 0;"><strong>What is Family Vault?</strong></p>
      <p style="margin: 10px 0 0 0;">Family Vault lets your family securely manage and monitor medical records together. The head member can view shared reports, track health trends, and access emergency information for all family members.</p>
    </div>
    
    <p>To accept this invitation, share the following verification code with <strong>{headMemberName}</strong>:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7c3aed; background-color: #f3e8ff; padding: 8px 16px; border-radius: 4px;">{otpCode}</span>
    </div>
    <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
      <p style="margin: 0; color: #166534; font-size: 14px;"><strong>How it works:</strong> Share this code with {headMemberName}. They will enter it in their Medicare dashboard to complete your registration.</p>
    </div>
    <p>This code will expire in <strong>10 minutes</strong> for security reasons.</p>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;"><strong>Note:</strong> By joining, the head member will be able to view your medical reports and health information based on the permissions you agree to. You can leave the vault at any time.</p>
    </div>
    
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
    <p>Best regards,<br>Medicare Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message from the Medicare platform. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;
