
'use server';

import { getAdminApp, initAdminApp } from '@/lib/firebase-admin';
import type { ServiceAccount } from 'firebase-admin/app';

export interface SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export async function getSmtpSettings(): Promise<SmtpConfig> {
    try {
        const adminApp = getAdminApp();
        const db = adminApp.firestore();
        const adminSettingsDocRef = db.collection('settings').doc('admin');
        const docSnap = await adminSettingsDocRef.get();

        if (!docSnap.exists) {
            throw new Error('Admin settings document not found in Firestore.');
        }

        const data = docSnap.data();
        if (!data) {
            throw new Error('Admin settings document is empty.');
        }
        
        return {
            host: data.smtpHost || '',
            port: data.smtpPort ? parseInt(data.smtpPort, 10) : 587,
            secure: data.smtpPort ? parseInt(data.smtpPort, 10) === 465 : false,
            auth: {
                user: data.smtpUser || '',
                pass: data.smtpPassword || '',
            },
        };
    } catch (error: any) {
        console.error("Failed to securely fetch SMTP settings:", error);
        throw new Error(`Could not retrieve SMTP settings: ${error.message}`);
    }
}

    