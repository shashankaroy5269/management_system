import nodemailer from 'nodemailer';
import logger from './logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = (process.env.SMTP_USER || 'rahul7908362@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || 'zzjt icmv qdyf ipzm').trim();

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #2563eb; margin: 0; font-size: 24px;">TaskFlow RBAC Management</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Account Email Verification</p>
      </div>
      
      <p style="color: #334155; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
      
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Thank you for creating an account. Please click the button below to verify your email address and activate your account.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
          Verify Email & Activate Account
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 13px;">Or copy and paste this verification link into your web browser:</p>
      <p style="color: #2563eb; font-size: 12px; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 6px;">
        ${verifyUrl}
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        This link is valid for 24 hours. If you did not create this account, you can safely ignore this email.
      </p>
    </div>
  `;

  try {
    const mailer = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || '"TaskFlow RBAC" <rahul7908362@gmail.com>';

    await mailer.sendMail({
      from: fromAddress,
      to: user.email,
      subject: 'Verify Your TaskFlow RBAC Account',
      html,
    });

    logger(`Verification email sent to: ${user.email}`);
    console.log(`[Nodemailer] Verification email sent to ${user.email}`);
    return { success: true, verifyUrl };
  } catch (error) {
    logger(`Failed to send verification email to ${user.email}: ${error.message}`);
    console.error(`[Nodemailer Error] ${error.message}`);
    return { success: false, error: error.message, verifyUrl };
  }
};
