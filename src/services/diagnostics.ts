
'use server';
import { getAdminApp } from './secure-settings';

export async function checkEnvironment(): Promise<any> {
    try {
       return await getAdminApp();
    } catch (e: any) {
        console.error("Error checking environment:", e);
        return { error: e.message || "An unknown error occurred while checking the environment." };
    }
}
