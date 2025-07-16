
'use server';

import { z } from 'zod';
import { getEmailConfig } from './secure-settings';
import type { ReportFormat } from '@/lib/types';
import { generateTaskReportCsv } from './reports';
import type { Attachment } from 'nodemailer/lib/mailer';

// --- Core Email Sending Service ---
interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    attachments?: Attachment[];
}

async function sendEmail({ to, subject, html, attachments }: SendEmailParams): Promise<void> {
    const { transporter, companyName, fromAddress } = await getEmailConfig();
    
    const mailOptions = {
        from: `"${companyName}" <${fromAddress}>`,
        to,
        subject,
        html,
        attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send email:', error);
        // Re-throw a more generic error to avoid leaking implementation details
        throw new Error('An error occurred while trying to send the email.');
    }
}


// --- Invitation Service ---
const inviteSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  roleId: z.string(),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export async function sendInvite(data: InviteInput): Promise<void> {
  const { name, email, roleId } = inviteSchema.parse(data);
  const { companyName } = await getEmailConfig();
  
  const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${roleId}`;

  const html = `
    <p>Hello ${name},</p>
    <p>You have been invited to create an account on ${companyName}.</p>
    <p>Please click the link below to complete your registration:</p>
    <p><a href="${registrationUrl}">Register Now</a></p>
    <p>If you were not expecting this invitation, you can safely ignore this email.</p>
    <p>Thanks,</p>
    <p>The ${companyName} Team</p>
  `;

  await sendEmail({
      to: email,
      subject: `You are invited to join ${companyName}`,
      html: html,
  });
}


// --- Report Sending Service ---
const reportSchema = z.object({
  recipient: z.string().email(),
  format: z.enum(['pdf', 'excel', 'csv']),
});
export type ReportInput = z.infer<typeof reportSchema>;

export async function sendTaskReport(data: ReportInput) {
    const { recipient, format } = reportSchema.parse(data);
    const { companyName } = await getEmailConfig();

    let reportBuffer: Buffer;
    let filename: string;
    let mimeType: string;

    switch (format) {
        case 'csv':
            const csvData = await generateTaskReportCsv();
            reportBuffer = Buffer.from(csvData, 'utf-8');
            filename = `task-report-${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
            break;
        case 'pdf':
            // Placeholder for PDF generation
            reportBuffer = Buffer.from(`This is a placeholder for the PDF report.`);
            filename = `task-report-${new Date().toISOString().split('T')[0]}.pdf`;
            mimeType = 'application/pdf';
            break;
        case 'excel':
            // Placeholder for Excel generation
            reportBuffer = Buffer.from(`This is a placeholder for the EXCEL report.`);
            filename = `task-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
        default:
            throw new Error('Unsupported report format');
    }

    const attachments: Attachment[] = [
        {
            filename,
            content: reportBuffer,
            contentType: mimeType,
        },
    ];

    await sendEmail({
        to: recipient,
        subject: `Your Task Report from ${companyName}`,
        html: `<p>Please find your requested task report attached.</p>`,
        attachments: attachments,
    });
}
