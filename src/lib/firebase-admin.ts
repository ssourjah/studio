
import * as admin from 'firebase-admin';

let app: admin.app.App;

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

export function initAdminApp() {
    if (!admin.apps.length) {
        app = admin.initializeApp({
            credential: admin.credential.cert(getServiceAccount()),
            // If you have a Realtime Database, you can add its URL here
            // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
        });
    } else {
        app = admin.app();
    }
    return app;
}

export function getAdminApp() {
    if (app) {
        return app;
    }
    return initAdminApp();
}

    