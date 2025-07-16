
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { getEmailConfig } from './secure-settings';

const SmtpSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP Host is required'),
  smtpPort: z.string().min(1, 'SMTP Port is required'),
  smtpUser: z.string().min(1, 'SMTP User is required'),
  smtpPassword: z.string().optional(),
});
export type SmtpSettingsInput = z.infer<typeof SmtpSettingsSchema>;

export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  
  try {
      const { transporter } = await getEmailConfig();
      await transporter.verify();
      return { success: true, message: 'Connection successful.' };
  } catch (error: any) {
      console.error("SMTP verification failed", error);
      // Don't expose detailed error message to client
      if (error.message.includes("credentials")) {
          throw new Error('Connection failed: Invalid credentials.');
      }
       if (error.message.includes("ENOTFOUND")) {
          throw new Error('Connection failed: Hostname not found. Check the SMTP Host.');
      }
      throw new Error(`Connection failed. Please check the settings and try again.`);
  }
}
