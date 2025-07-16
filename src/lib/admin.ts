import 'dotenv/config';
import * as admin from 'firebase-admin';

function getServiceAccount(): admin.ServiceAccount {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. This is required for server-side admin operations.');
    }
    try {
        return JSON.parse(serviceAccountJson);
    } catch (e) {
        throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON. Make sure it is a valid JSON string.');
    }
}

export function getAdminApp() {
    if (admin.apps.length > 0) {
        const app = admin.apps.find(a => a?.name === '[DEFAULT]');
        if (app) {
            return app;
        }
    }

    return admin.initializeApp({
        credential: admin.credential.cert(getServiceAccount()),
    });
}
