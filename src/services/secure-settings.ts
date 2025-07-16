'use server';

import * as admin from 'firebase-admin';

// --- Firebase Admin Initialization ---
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let serviceAccount: admin.ServiceAccount;

if (!serviceAccountJson) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. This is required for server-side admin operations.'
  );
}

try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (e) {
  throw new Error(
    'Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Make sure it is a valid JSON string.'
  );
}

function getAdminApp() {
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


export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export interface EmailConfig {
    companyName: string;
    smtp: SmtpConfig;
}

export async function getEmailConfig(): Promise<EmailConfig> {
    try {
        const adminApp = getAdminApp();
        const db = adminApp.firestore();
        
        const adminSettingsDoc = await db.collection('settings').doc('admin').get();
        const companySettingsDoc = await db.collection('settings').doc('company').get();

        if (!adminSettingsDoc.exists) {
            throw new Error('Admin settings document not found in Firestore.');
        }
        
        if (!companySettingsDoc.exists) {
            throw new Error('Company settings document not found in Firestore.');
        }

        const adminData = adminSettingsDoc.data();
        const companyData = companySettingsDoc.data();

        if (!adminData || !companyData) {
            throw new Error('Settings documents are empty.');
        }
        
        return {
            companyName: companyData.companyName || 'TaskMaster Pro',
            smtp: {
                host: adminData.smtpHost || '',
                port: adminData.smtpPort ? parseInt(adminData.smtpPort, 10) : 587,
                secure: adminData.smtpPort ? parseInt(adminData.smtpPort, 10) === 465 : false,
                auth: {
                    user: adminData.smtpUser || '',
                    pass: adminData.smtpPassword || '',
                },
            }
        };
    } catch (error: any) {
        console.error("Failed to securely fetch email config:", error);
        throw new Error(`Could not retrieve email config: ${error.message}`);
    }
}
