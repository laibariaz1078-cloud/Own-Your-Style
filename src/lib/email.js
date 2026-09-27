import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are missing. Add SMTP_USER and SMTP_PASS in your environment.");
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  });

  return true;
}

export async function sendVerificationCodeEmail({ to, code }) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials are missing. Add SMTP_USER and SMTP_PASS in your environment.");
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Your password reset verification code",
    text: `Your verification code is: ${code}\n\nUse this code to reset your password.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Password Reset Verification</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${code}</p>
        <p>Use this code to reset your password.</p>
      </div>
    `,
  });

  return true;
}