
'use server';

import nodemailer from 'nodemailer';
import { getEmailConfig, type EmailConfig } from './secure-settings';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

async function sendEmail(options: EmailOptions, config: EmailConfig) {
    if (!config.smtp.host || !config.smtp.auth.user || !config.smtp.auth.pass) {
        throw new Error("SMTP server is not configured. Please complete the settings on the Settings page.");
    }
    
    const transporter = nodemailer.createTransport(config.smtp);

    const mailOptions = {
        from: `"${config.companyName}" <${config.smtp.auth.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email.");
    }
}


export interface SendInviteInput {
  name: string;
  email: string;
  roleId: string;
}

export async function sendInvite(input: SendInviteInput): Promise<void> {
    const config = await getEmailConfig();
    const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${input.roleId}`;
    
    const subject = `You are invited to join ${config.companyName}`;
    const emailBody = `
      <p>Hello ${input.name},</p>
      <p>You have been invited to create an account on ${config.companyName}.</p>
      <p>Please click the link below to complete your registration:</p>
      <p><a href="${registrationUrl}">Register Now</a></p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
      <p>Thanks,</p>
      <p>The ${config.companyName} Team</p>
    `;

    await sendEmail({
      to: input.email,
      subject: subject,
      html: emailBody,
    }, config);
}
