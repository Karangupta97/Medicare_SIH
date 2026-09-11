import { sendMailjetEmail } from "./mailjet.service.js";

export const sendMailjetTestEmail = async ({
  toEmail,
  toName,
  fromEmail,
  fromName,
}) => {
  if (!toEmail || !fromEmail) {
    throw new Error("toEmail and fromEmail are required for Mailjet test email.");
  }

  return sendMailjetEmail({
    toEmail,
    toName,
    fromEmail,
    fromName,
    subject: "Mailjet Test Email",
    html: "Mailjet email integration is working successfully for Medicare.",
    customId: "mailjet-test-email",
  });
};
