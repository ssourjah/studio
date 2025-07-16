
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import { z } from 'zod';

// --- Firebase Admin Initialization ---
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

function getServiceAccount(): admin.ServiceAccount | { error: string } {
    if (!serviceAccountJson) {
        const errorMessage = 'FATAL: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. The application cannot start without it.';
        console.error(errorMessage);
        return { error: errorMessage };
    }
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        console.log("API Route: Successfully parsed FIREBASE_SERVICE_ACCOUNT_JSON.");
        return serviceAccount;
    } catch (e: any) {
        const errorMessage = `FATAL: API Route: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Please ensure it is a valid, single-line JSON string. Error: ${e.message}`;
        console.error(errorMessage);
        return { error: errorMessage };
    }
}

function getAdminApp(): admin.app.App | { error: string } {
    const serviceAccount = getServiceAccount();
    if ('error' in serviceAccount) {
        return serviceAccount;
    }

    if (admin.apps.length > 0) {
        const defaultApp = admin.apps.find((app) => app?.name === '[DEFAULT]');
        if (defaultApp) {
            return defaultApp;
        }
    }
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
// --- End Firebase Admin Initialization ---

const inviteSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  roleId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const adminApp = getAdminApp();
        if ('error' in adminApp) {
            return NextResponse.json({ error: adminApp.error }, { status: 500 });
        }

        const body = await req.json();
        const { name, email, roleId } = inviteSchema.parse(body);

        const db = adminApp.firestore();

        const adminSettingsDoc = await db.collection('settings').doc('admin').get();
        const companySettingsDoc = await db.collection('settings').doc('company').get();

        if (!adminSettingsDoc.exists || !companySettingsDoc.exists) {
            throw new Error('Settings documents not found in Firestore.');
        }

        const adminData = adminSettingsDoc.data()!;
        const companyData = companySettingsDoc.data()!;
        const companyName = companyData.companyName || 'TaskMaster Pro';

        if (!adminData.smtpHost || !adminData.smtpUser || !adminData.smtpPassword) {
            throw new Error("SMTP server is not configured.");
        }

        const transporter = nodemailer.createTransport({
            host: adminData.smtpHost,
            port: parseInt(adminData.smtpPort, 10) || 587,
            secure: parseInt(adminData.smtpPort, 10) === 465,
            auth: {
                user: adminData.smtpUser,
                pass: adminData.smtpPassword,
            },
        });
        
        const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${roleId}`;

        const mailOptions = {
            from: `"${companyName}" <${adminData.smtpUser}>`,
            to: email,
            subject: `You are invited to join ${companyName}`,
            html: `
              <p>Hello ${name},</p>
              <p>You have been invited to create an account on ${companyName}.</p>
              <p>Please click the link below to complete your registration:</p>
              <p><a href="${registrationUrl}">Register Now</a></p>
              <p>If you were not expecting this invitation, you can safely ignore this email.</p>
              <p>Thanks,</p>
              <p>The ${companyName} Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Invitation sent successfully' }, { status: 200 });
    } catch (error: any) {
        console.error("API Invite Error:", error);
        return NextResponse.json({ error: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}
