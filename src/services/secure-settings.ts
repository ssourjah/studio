
'use server';

import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// --- Firebase Admin Initialization ---
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

function getServiceAccount(): admin.ServiceAccount {
    if (!serviceAccountJson) {
        throw new Error('FATAL: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. The application cannot start without it.');
    }
    try {
        // Log a success message to confirm the variable is being read and is valid JSON
        console.log("Successfully parsed FIREBASE_SERVICE_ACCOUNT_JSON.");
        return JSON.parse(serviceAccountJson);
    } catch (e: any) {
        // Provide a more detailed error if parsing fails
        throw new Error(`FATAL: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Please ensure it is a valid, single-line JSON string. Error: ${e.message}`);
    }
}

function getAdminApp(): admin.app.App {
    const serviceAccount = getServiceAccount();
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

export async function getEmailConfig() {
    try {
        const adminApp = getAdminApp();
        const db = adminApp.firestore();

        const adminSettingsDoc = await db.collection('settings').doc('admin').get();
        const companySettingsDoc = await db.collection('settings').doc('company').get();

        if (!adminSettingsDoc.exists) {
            throw new Error("Admin settings document not found. Cannot configure email.");
        }
        
        if (!companySettingsDoc.exists) {
            throw new Error("Company settings document not found.");
        }

        const adminData = adminSettingsDoc.data()!;
        const companyData = companySettingsDoc.data()!;

        if (!adminData.smtpHost || !adminData.smtpUser || !adminData.smtpPassword) {
            throw new Error("SMTP server details are not fully configured in settings.");
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

        return {
            transporter,
            companyName: companyData.companyName || 'TaskMaster Pro',
            fromAddress: adminData.smtpUser,
        };
    } catch (error: any) {
        console.error("Failed to securely fetch email config:", error);
        throw new Error(`Could not retrieve email config: ${error.message}`);
    }
}
