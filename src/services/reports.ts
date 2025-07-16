
'use server';
import * as admin from 'firebase-admin';
import type { Task, User } from '@/lib/types';

// This is a simplified admin app initialization. 
// In a real app, you'd likely share this from a central file.
function getAdminApp(): admin.app.App {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    if (admin.apps.length > 0) {
        const defaultApp = admin.apps.find((app) => app?.name === '[DEFAULT]');
        if (defaultApp) return defaultApp;
    }
    
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

function escapeCsvCell(cellData: string | undefined | null): string {
    if (cellData === undefined || cellData === null) {
        return '';
    }
    let cell = String(cellData);
    // If the cell contains a comma, a double quote, or a newline, enclose it in double quotes.
    if (/[",\n]/.test(cell)) {
        cell = `"${cell.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
    }
    return cell;
}

export async function generateTaskReportCsv(tasks: Task[]): Promise<string> {
    const db = getAdminApp().firestore();

    try {
        // Fetch all users once to create a lookup map
        const usersSnapshot = await db.collection('users').get();
        const usersMap = new Map(usersSnapshot.docs.map(doc => {
            const userData = doc.data() as User;
            return [doc.id, userData.name];
        }));

        // Define CSV headers
        const headers = [
            'Job Number', 'Task Name', 'Type', 'Description', 'Location',
            'Contact Person', 'Contact Phone', 'Date', 'Status', 'Assigned Technician'
        ];
        
        let csvContent = headers.join(',') + '\r\n';

        // Map the provided tasks to CSV rows
        tasks.forEach(task => {
            const technicianName = usersMap.get(task.assignedTechnicianId) || 'Unknown';
            const row = [
                task.jobNumber,
                task.name,
                task.type,
                task.description,
                task.location,
                task.contactPerson,
                task.contactPhone,
                task.date,
                task.status,
                technicianName
            ].map(escapeCsvCell).join(',');
            
            csvContent += row + '\r\n';
        });

        return csvContent;

    } catch (error: any) {
        console.error("Error generating CSV report:", error);
        throw new Error("Could not generate CSV report. " + error.message);
    }
}
