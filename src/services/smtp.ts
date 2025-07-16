
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';

const SmtpSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP Host is required'),
  smtpPort: z.string().min(1, 'SMTP Port is required'),
  smtpUser: z.string().min(1, 'SMTP User is required'),
  smtpPassword: z.string().optional(),
});
export type SmtpSettingsInput = z.infer<typeof SmtpSettingsSchema>;

export async function testSmtpConnection(settings: SmtpSettingsInput): Promise<{ success: boolean; message: string }> {
  const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: parseInt(settings.smtpPort, 10),
      secure: parseInt(settings.smtpPort, 10) === 465,
      auth: {
          user: settings.smtpUser,
          pass: settings.smtpPassword || '',
      },
  });
  
  try {
      await transporter.verify();
      return { success: true, message: 'Connection successful.' };
  } catch (error: any) {
      console.error("SMTP verification failed", error);
      throw new Error(`Connection failed: ${error.message}`);
  }
}
