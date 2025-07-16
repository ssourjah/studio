
'use server';

export interface EnvironmentStatus {
    serviceAccountStatus?: 'OK' | 'MISSING' | 'INVALID_JSON';
    smtpHostStatus?: 'OK' | 'MISSING';
    smtpPortStatus?: 'OK' | 'MISSING';
    smtpUserStatus?: 'OK' | 'MISSING';
    smtpPasswordStatus?: 'OK' | 'MISSING';
    error?: string;
}

export async function checkEnvironment(): Promise<EnvironmentStatus> {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        
        const status: EnvironmentStatus = {};

        if (!serviceAccountJson) {
            status.serviceAccountStatus = 'MISSING';
        } else {
            try {
                JSON.parse(serviceAccountJson);
                status.serviceAccountStatus = 'OK';
            } catch (e) {
                status.serviceAccountStatus = 'INVALID_JSON';
            }
        }
        
        status.smtpHostStatus = process.env.SMTP_HOST ? 'OK' : 'MISSING';
        status.smtpPortStatus = process.env.SMTP_PORT ? 'OK' : 'MISSING';
        status.smtpUserStatus = process.env.SMTP_USER ? 'OK' : 'MISSING';
        status.smtpPasswordStatus = process.env.SMTP_PASSWORD ? 'OK' : 'MISSING';

        return status;
    } catch (e: any) {
        console.error("Error checking environment:", e);
        return { error: e.message || "An unknown error occurred while checking the environment." };
    }
}
