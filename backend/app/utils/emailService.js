import nodemailer from 'nodemailer';
import logger from './logger.js';

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || 'rahul7908362@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'zzjt icmv qdyf ipzm').trim();

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #2563eb; margin-bottom: 16px;">Welcome to TaskFlow Management!</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Hi <strong>${user.name}</strong>,</p>
      <p style="color: #475569; font-size: 15px; line-height: 1.5;">
        Thank you for signing up. Please verify your email address to activate your account and start managing tasks.
      </p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify My Account
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:</p>
      <p style="color: #2563eb; font-size: 12px; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 6px;">
        ${verifyUrl}
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">This verification link will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
    </div>
  `;

  try {
    const transporter = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"TaskFlow RBAC" <rahul7908362@gmail.com>';

    await transporter.sendMail({
      from: fromAddress,
      to: user.email,
      subject: 'Verify Your TaskFlow Account',
      html,
    });

    logger(`[Email] Verification email sent to: ${user.email}`);
    console.log(`[Email] Verification email sent to: ${user.email}`);
    return { success: true, verifyUrl };
  } catch (error) {
    logger(`[Email Error] Failed to send verification email to ${user.email}: ${error.message}`);
    console.error(`[Email Error] ${error.message}`);
    return { success: false, error: error.message, verifyUrl };
  }
};
