import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MailService - Class-based service handling all transactional emails
 */
class MailService {
  constructor() {
    this.transporter = this.initTransporter();
  }

  /**
   * Initialize Nodemailer Transporter or Console Mock
   */
  initTransporter() {
    const user = (process.env.SMTP_USER || '').replace(/['"]/g, '').trim();
    const pass = (process.env.SMTP_PASS || '').replace(/['"]/g, '').trim();
    const host = (process.env.SMTP_HOST || '').replace(/['"]/g, '').trim();
    const port = Number(process.env.SMTP_PORT) || 587;

    const isSmtpConfigured = Boolean(user && pass);

    if (isSmtpConfigured) {
      if (user.includes('@gmail.com') || host.includes('gmail')) {
        console.log(`[MailService] Initializing Gmail transporter for ${user}...`);
        return nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });
      }

      console.log(`[MailService] Initializing SMTP transporter for ${host}:${port}...`);
      return nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    // Graceful Console Fallback if credentials not provided
    console.log('[MailService] SMTP credentials not configured. Using console logger fallback.');
    return {
      sendMail: async (mailOptions) => {
        console.log('--------------------------------------------------');
        console.log('📧 [MailService Mock Logger - No SMTP Configured]');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Preview: ${(mailOptions.text || mailOptions.html || '').substring(0, 120)}...`);
        console.log('--------------------------------------------------');
        return { messageId: `mock-${Date.now()}` };
      }
    };
  }

  /**
   * Send Email Helper
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"RBAC Task System" <no-reply@rbacsystem.com>',
        to,
        subject,
        text: text || '',
        html
      });
      return { success: true, info };
    } catch (error) {
      console.error('[MailService Error]:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Task Assigned Notification Email
   */
  async sendTaskAssignedEmail({ employeeEmail, employeeName, taskTitle, managerName, dueDate, priority }) {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">New Task Assigned</h2>
        <p>Hello <strong>${employeeName}</strong>,</p>
        <p>You have been assigned a new task by <strong>${managerName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0;">
          <h3 style="margin-top: 0;">${taskTitle}</h3>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Due Date:</strong> ${formattedDate}</p>
        </div>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" style="background-color: #4f46e5; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Open Dashboard</a>
      </div>
    `;

    return this.sendEmail({
      to: employeeEmail,
      subject: `📋 New Task Assigned: ${taskTitle}`,
      html,
      text: `Hello ${employeeName}, you have been assigned task: "${taskTitle}" by ${managerName}.`
    });
  }

  /**
   * Task Status Updated Notification Email
   */
  async sendTaskStatusUpdatedEmail({ recipientEmail, recipientName, taskTitle, updatedByName, newStatus }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Task Status Updated</h2>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>The status of task <strong>"${taskTitle}"</strong> has been updated by <strong>${updatedByName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #059669; margin: 15px 0;">
          <p style="font-size: 16px; margin: 0;"><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">${newStatus}</span></p>
        </div>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" style="background-color: #059669; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Review Task</a>
      </div>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `🔔 Task Update: "${taskTitle}" is now ${newStatus}`,
      html,
      text: `Task "${taskTitle}" status changed to ${newStatus} by ${updatedByName}.`
    });
  }

  /**
   * Send Account Email Verification Link
   */
  async sendVerificationEmail({ email, name, token }) {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Verify Your Email Address</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Enterprise RBAC Task Management System</p>
        </div>

        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Thank you for signing up! To complete your registration and activate your workspace privileges, please verify your email address by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
            Verify My Account
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          If the button above does not work, copy and paste this link into your web browser:
        </p>
        <p style="background-color: #f8fafc; padding: 10px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #4f46e5;">
          ${verifyUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          This verification link will expire in 24 hours. If you did not create an account, please ignore this email.
        </p>
      </div>
    `;

    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL VERIFICATION DISPATCHED]`);
    console.log(`To: ${email} (${name})`);
    console.log(`🔗 Verification Link: ${verifyUrl}`);
    console.log(`======================================================\n`);

    return this.sendEmail({
      to: email,
      subject: `✉️ Please verify your email address - RBAC System`,
      html,
      text: `Hello ${name}, please verify your email address by clicking the following link: ${verifyUrl}`
    });
  }
}

export default new MailService();
