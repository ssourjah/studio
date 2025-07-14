
import nodemailer from 'nodemailer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const settingsDocRef = doc(db, 'settings', 'company');

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

async function getSmtpConfig() {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            host: data.smtpHost,
            port: data.smtpPort,
            secure: (data.smtpPort === 465), // true for 465, false for other ports
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
