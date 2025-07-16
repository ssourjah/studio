
'use server';

import { z } from 'zod';
import { getEmailConfig } from './secure-settings';
import nodemailer from 'nodemailer';

const inviteSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  roleId: z.string(),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export async function sendInvite(data: InviteInput): Promise<void> {
  const { name, email, roleId } = inviteSchema.parse(data);
  const { transporter, companyName, fromAddress } = await getEmailConfig();
  
  const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${roleId}`;

  const mailOptions = {
      from: `"${companyName}" <${fromAddress}>`,
      to: email,
      subject: `You are invited to join ${companyName}`,
      html: `
        <p>Hello ${name},</p>
        <p>You have been invited to create an account on ${companyName}.</p>
        <p>Please click the link below to complete your registration:</p>
        <p><a href="${registrationUrl}">Register Now</a></p>
        <p>If you were not expecting this invitation, you can safely ignore this email.</p>
        <p>Thanks,</p>
        <p>The ${companyName} Team</p>
      `,
  };

  await transporter.sendMail(mailOptions);
}


const reportSchema = z.object({
  recipient: z.string().email(),
  format: z.enum(['pdf', 'excel']),
});
export type ReportInput = z.infer<typeof reportSchema>;

export async function sendTaskReport(data: ReportInput) {
    const { recipient, format } = reportSchema.parse(data);
    const { transporter, companyName, fromAddress } = await getEmailConfig();

    // Placeholder for report generation logic
    const reportBuffer = Buffer.from(`This is a placeholder for the ${format.toUpperCase()} report.`);
    const filename = `task-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const mailOptions = {
        from: `"${companyName}" <${fromAddress}>`,
        to: recipient,
        subject: `Your Task Report from ${companyName}`,
        html: `<p>Please find your requested task report attached.</p>`,
        attachments: [
            {
                filename,
                content: reportBuffer,
                contentType: mimeType,
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send report email:', error);
        throw new Error('Failed to send the report via email.');
    }
}
