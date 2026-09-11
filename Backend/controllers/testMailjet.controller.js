import { sendMailjetTestEmail } from "../services/emails/mailjetTest.service.js";

export const testMailjetEmail = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  const { toEmail, toName, fromEmail, fromName } = req.body || {};

  if (!toEmail || !fromEmail) {
    return res.status(400).json({
      success: false,
      message: "toEmail and fromEmail are required for Mailjet test email.",
    });
  }

  if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
    return res.status(500).json({
      success: false,
      message: "MAILJET_API_KEY and MAILJET_SECRET_KEY must be set for Mailjet test email.",
    });
  }

  try {
    const result = await sendMailjetTestEmail({
      toEmail,
      toName,
      fromEmail,
      fromName,
    });

    return res.status(200).json({
      success: true,
      message: "Mailjet test email sent successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Mailjet test email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send Mailjet test email.",
      error: error.message,
    });
  }
};
