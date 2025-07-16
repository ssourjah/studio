
'use server';

import nodemailer from 'nodemailer';

interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

export async function sendEmail(options: EmailOptions, smtpConfig: SmtpConfig, companyName: string) {
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        throw new Error("SMTP server is not configured. Please complete the settings on the Settings page.");
    }
    
    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
        from: `"${companyName}" <${smtpConfig.auth.user}>`,
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
  companyName: string;
  smtpConfig: {
      smtpHost: string;
      smtpPort: string;
      smtpUser: string;
      smtpPassword?: string;
  };
}

export async function sendInvite(input: SendInviteInput): Promise<void> {
    const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${input.roleId}`;
    
    const subject = `You are invited to join ${input.companyName}`;
    const emailBody = `
      <p>Hello ${input.name},</p>
      <p>You have been invited to create an account on ${input.companyName}.</p>
      <p>Please click the link below to complete your registration:</p>
      <p><a href="${registrationUrl}">Register Now</a></p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
      <p>Thanks,</p>
      <p>The ${input.companyName} Team</p>
    `;
    
    const smtpConfig = {
        host: input.smtpConfig.smtpHost,
        port: input.smtpConfig.smtpPort ? parseInt(input.smtpConfig.smtpPort, 10) : 587,
        secure: input.smtpConfig.smtpPort ? parseInt(input.smtpConfig.smtpPort, 10) === 465 : false,
        auth: {
            user: input.smtpConfig.smtpUser,
            pass: input.smtpConfig.smtpPassword || '',
        },
    };

    await sendEmail({
      to: input.email,
      subject: subject,
      html: emailBody,
    }, smtpConfig, input.companyName);
}
