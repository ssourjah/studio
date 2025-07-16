
'use server';
import type { Task } from '@/lib/types';

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
    try {
        // Define CSV headers
        const headers = [
            'Job Number', 'Task Name', 'Type', 'Description', 'Location',
            'Contact Person', 'Contact Phone', 'Date', 'Status', 'Assigned Technician'
        ];
        
        let csvContent = headers.join(',') + '\r\n';

        // Map the provided tasks to CSV rows
        tasks.forEach(task => {
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
                task.technicianName || 'Unknown'
            ].map(escapeCsvCell).join(',');
            
            csvContent += row + '\r\n';
        });

        return csvContent;

    } catch (error: any) {
        console.error("Error generating CSV report:", error);
        throw new Error("Could not generate CSV report. " + error.message);
    }
}
