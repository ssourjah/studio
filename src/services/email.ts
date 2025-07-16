
'use server';

import nodemailer from 'nodemailer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const adminSettingsDocRef = doc(db, 'settings', 'admin');

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

async function getSmtpConfig() {
    const docSnap = await getDoc(adminSettingsDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            host: data.smtpHost,
            port: data.smtpPort ? parseInt(data.smtpPort, 10) : 587,
            secure: data.smtpPort ? parseInt(data.smtpPort, 10) === 465 : false,
            auth: {
                user: data.smtpUser,
                pass: data.smtpPassword,
            },
        };
    }
    throw new Error("SMTP settings not found in Firestore.");
}

export async function sendEmail(options: EmailOptions) {
    const smtpConfig = await getSmtpConfig();

    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        throw new Error("SMTP server is not configured. Please complete the settings on the Settings page.");
    }
    
    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
        from: `"${smtpConfig.auth.user}" <${smtpConfig.auth.user}>`, // sender address
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
    // In a real application, you would generate a unique, single-use registration token,
    // store it, and include it in the URL. For simplicity, we'll just link to the
    // standard registration page.
    const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${input.roleId}`;
    
    const subject = 'You are invited to join TaskMaster Pro';
    const emailBody = `
      <p>Hello ${input.name},</p>
      <p>You have been invited to create an account on TaskMaster Pro.</p>
      <p>Please click the link below to complete your registration:</p>
      <p><a href="${registrationUrl}">Register Now</a></p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
      <p>Thanks,</p>
      <p>The TaskMaster Pro Team</p>
    `;

    await sendEmail({
      to: input.email,
      subject: subject,
      html: emailBody,
    });
}
