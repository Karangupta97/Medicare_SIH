import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js";
import { PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js";
import { FOUNDER_OTP_LOGIN_TEMPLATE } from "./emailTemplates.js";
import { FOUNDER_SENSITIVE_ACTION_OTP_TEMPLATE } from "./emailTemplates.js";
import { STAFF_WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { STAFF_PASSWORD_RESET_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { sendMailjetEmail } from "./mailjet.service.js";
import { DOCTOR_APPROVAL_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { DOCTOR_REJECTION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { FAMILY_VAULT_INVITE_EMAIL_TEMPLATE } from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      customId: "verification-email",
    });

    console.log("Verification email sent successfully", { email, id: data?.id });
    return data;
  } catch (error) {
    console.error("Mailjet error (verification):", { email, error: error?.message || error });
    const verificationError = new Error(`Error sending verification: ${error.message}`);
    verificationError.code = error.code;
    verificationError.providerStatus = error.providerStatus;
    throw verificationError;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Welcome to Medicare",
      html: `<p>Welcome, ${name}!</p>`,
      customId: "welcome-email",
    });

    console.log("Welcome email sent successfully", { email, id: data?.id });
    return data;
  } catch (error) {
    console.error("Mailjet error (welcome):", { email, error: error?.message || error });
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      customId: "password-reset-request",
    });

    console.log("Password reset email sent successfully", { email, id: data?.id });
    return data;
  } catch (error) {
    console.error("Mailjet error (password reset request):", { email, error: error?.message || error });
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      customId: "password-reset-success",
    });

    console.log("Password reset success email sent successfully", { email, id: data?.id });
    return data;
  } catch (error) {
    console.error("Mailjet error (password reset success):", { email, error: error?.message || error });
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};

export const sendFounderLoginOTP = async (email, otpCode, ipAddress) => {
  try {
    // Create timestamp in a human-readable format
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Replace template placeholders
    let emailContent = FOUNDER_OTP_LOGIN_TEMPLATE
      .replace("{otpCode}", otpCode)
      .replace("{ipAddress}", ipAddress)
      .replace("{timestamp}", timestamp);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Medicare Founder Portal: Security Verification Code",
      html: emailContent,
      customId: "founder-login-otp",
    });

    console.log("Founder login OTP email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (founder login OTP):", { email, error: error?.message || error });
    const otpError = new Error(`Error sending founder login OTP: ${error.message}`);
    otpError.code = error.code;
    otpError.providerStatus = error.providerStatus;
    throw otpError;
  }
};

export const sendFounderSensitiveActionOTP = async (email, otpCode, actionType, actionDetails, ipAddress) => {
  try {
    // Create timestamp in a human-readable format
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Replace template placeholders
    let emailContent = FOUNDER_SENSITIVE_ACTION_OTP_TEMPLATE
      .replace("{otpCode}", otpCode)
      .replace("{actionType}", actionType)
      .replace("{actionDetails}", actionDetails)
      .replace("{timestamp}", timestamp)
      .replace("{ipAddress}", ipAddress);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "URGENT: Medicare Sensitive Action Verification Required",
      html: emailContent,
      customId: "founder-sensitive-otp",
    });

    console.log("Sensitive action OTP email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (sensitive action OTP):", { email, error: error?.message || error });
    throw new Error(`Error sending sensitive action OTP: ${error.message}`);
  }
};

/**
 * Send welcome email to a new staff member with login credentials
 * @param {string} email - Staff member's email
 * @param {string} name - Staff member's name
 * @param {string} temporaryPassword - Generated temporary password
 * @param {string} staffId - Generated staff ID
 */
export const sendStaffWelcomeEmail = async (email, name, temporaryPassword, staffId) => {
  try {
    // Get current year for copyright
    const currentYear = new Date().getFullYear();
    
    // Login URL (frontend staff login page)
    const loginUrl = `${process.env.CLIENT_URL}/staff/login`;
    
    // Replace template placeholders
    let emailContent = STAFF_WELCOME_EMAIL_TEMPLATE
      .replace("{staffName}", name)
      .replace("{staffEmail}", email)
      .replace("{staffId}", staffId)
      .replace("{temporaryPassword}", temporaryPassword)
      .replace("{loginUrl}", loginUrl)
      .replace("{currentYear}", currentYear);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Welcome to Medicare Staff - Your Account Details",
      html: emailContent,
      customId: "staff-welcome",
    });

    console.log("Staff welcome email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (staff welcome):", { email, error: error?.message || error });
    throw new Error(`Error sending staff welcome email: ${error.message}`);
  }
};

/**
 * Send password reset email to a staff member
 * @param {string} email - Staff member's email
 * @param {string} name - Staff member's name
 * @param {string} temporaryPassword - Generated temporary password
 */
export const sendStaffPasswordResetEmail = async (email, name, temporaryPassword) => {
  try {
    // Login URL (frontend staff login page)
    const loginUrl = `${process.env.CLIENT_URL}/staff/login`;
    
    // Replace template placeholders
    let emailContent = STAFF_PASSWORD_RESET_EMAIL_TEMPLATE
      .replace("{staffName}", name)
      .replace("{temporaryPassword}", temporaryPassword)
      .replace("{loginUrl}", loginUrl);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Medicare Staff - Your Password Has Been Reset",
      html: emailContent,
      customId: "staff-password-reset",
    });

    console.log("Staff password reset email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (staff password reset):", { email, error: error?.message || error });
    throw new Error(`Error sending staff password reset email: ${error.message}`);
  }
};

/**
 * Send approval email to a doctor whose account has been verified
 * @param {string} email - Doctor's email
 * @param {string} name - Doctor's name
 */
export const sendDoctorApprovalEmail = async (email, name) => {
  try {
    // Login URL (frontend doctor login page)
    const loginUrl = `${process.env.CLIENT_URL}/doctor/login`;
    
    // Replace template placeholders
    let emailContent = DOCTOR_APPROVAL_EMAIL_TEMPLATE
      .replace("{doctorName}", name)
      .replace("{loginUrl}", loginUrl);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Medicare - Your Doctor Account is Approved",
      html: emailContent,
      customId: "doctor-approval",
    });

    console.log("Doctor approval email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (doctor approval):", { email, error: error?.message || error });
    throw new Error(`Error sending doctor approval email: ${error.message}`);
  }
};

/**
 * Send rejection email to a doctor whose account has been rejected
 * @param {string} email - Doctor's email
 * @param {string} name - Doctor's name
 * @param {string} rejectionReason - Reason for rejection
 */
export const sendDoctorRejectionEmail = async (email, name, rejectionReason) => {
  try {
    // Replace template placeholders
    let emailContent = DOCTOR_REJECTION_EMAIL_TEMPLATE
      .replace("{doctorName}", name)
      .replace("{rejectionReason}", rejectionReason);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Medicare - Doctor Account Application Status",
      html: emailContent,
      customId: "doctor-rejection",
    });

    console.log("Doctor rejection email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (doctor rejection):", { email, error: error?.message || error });
    throw new Error(`Error sending doctor rejection email: ${error.message}`);
  }
};

/**
 * Send verification email to a doctor who just registered
 * @param {string} email - Doctor's email
 * @param {string} verificationToken - Verification token or code
 */
export const sendDoctorVerificationEmail = async (email, verificationToken) => {
  try {
    // Use the same template as regular verification emails
    const data = await sendMailjetEmail({
      toEmail: email,
      subject: "Medicare - Doctor Registration Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      customId: "doctor-verification",
    });

    console.log("Doctor verification email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (doctor verification):", { email, error: error?.message || error });
    throw new Error(`Error sending doctor verification email: ${error.message}`);
  }
};

/**
 * Send Family Vault invitation email with OTP
 * @param {string} email - Invitee's email
 * @param {string} otpCode - 6-digit OTP
 * @param {string} headMemberName - Name of the head member
 * @param {string} vaultName - Name of the family vault
 * @param {string} relationship - Relationship type (child, parent, spouse, etc.)
 */
export const sendFamilyVaultInviteEmail = async (email, otpCode, headMemberName, vaultName, relationship) => {
  try {
    let emailContent = FAMILY_VAULT_INVITE_EMAIL_TEMPLATE
      .replace("{otpCode}", otpCode)
      .replace("{headMemberName}", headMemberName)
      .replace("{vaultName}", vaultName)
      .replace("{relationship}", relationship);

    const data = await sendMailjetEmail({
      toEmail: email,
      subject: `Medicare Family Vault - You've been invited to join "${vaultName}"`,
      html: emailContent,
      customId: "family-vault-invite",
    });

    console.log("Family Vault invite email sent successfully", data);
  } catch (error) {
    console.error("Mailjet error (family vault invite):", { email, error: error?.message || error });
    throw new Error(`Error sending Family Vault invite email: ${error.message}`);
  }
};
