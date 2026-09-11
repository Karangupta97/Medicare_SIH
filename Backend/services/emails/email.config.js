import Mailjet from "node-mailjet";
import dotenv from "dotenv";

dotenv.config();

const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

if (!mailjetApiKey || !mailjetSecretKey) {
  console.warn(
    "[Email Service Warning]: MAILJET_API_KEY and/or MAILJET_SECRET_KEY are not set. " +
      "Email sending will fail until Mailjet credentials are provided in the environment."
  );
}

const parseLegacySender = (value) => {
  if (!value) return null;

  const match = value.match(/^(.*)<(.+)>$/);
  if (match) {
    return {
      email: match[2].trim(),
      name: match[1].trim() || "Medicare",
    };
  }

  if (value.includes("@")) {
    return {
      email: value.trim(),
      name: "Medicare",
    };
  }

  return null;
};

const resolveSender = () => {
  const senderEmail =
    process.env.MAILJET_SENDER_EMAIL ||
    process.env.MAILJET_FROM_EMAIL ||
    null;
  const senderName =
    process.env.MAILJET_SENDER_NAME ||
    process.env.MAILJET_FROM_NAME ||
    null;

  if (senderEmail) {
    return {
      email: senderEmail,
      name: senderName || "Medicare",
    };
  }

  const legacySender = parseLegacySender(process.env.RESEND_SENDER || "");
  if (legacySender) {
    return legacySender;
  }

  return {
    email: "noreply@medicares.in",
    name: "Medicare",
  };
};

const resolvedSender = resolveSender();

export const mailjet =
  mailjetApiKey && mailjetSecretKey
    ? Mailjet.apiConnect(mailjetApiKey, mailjetSecretKey)
    : null;
export const sender = {
  Email: resolvedSender.email,
  Name: resolvedSender.name,
};




 
