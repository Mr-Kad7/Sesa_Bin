const nodemailer = require("nodemailer");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
  require("dotenv").config({ path: path.join(process.cwd(), ".env"), quiet: true });
} catch (err) {
  // Ignore dotenv errors when env variables are loaded by Next.js
}

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_SECURE,
  SMTP_FROM,
} = process.env;

function createTransporter() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error(
      "Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in your environment."
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || SMTP_SECURE === "1",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    throw new Error("Missing recipient email address");
  }

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = {
  sendEmail,
};
