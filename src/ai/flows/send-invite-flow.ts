
'use server';
/**
 * @fileOverview A flow to send an email invitation to a new user.
 * - sendInvite - Handles sending the invitation email.
 * - SendInviteInput - The input type for the sendInvite function.
 */

import { sendEmail } from '@/services/email';

export interface SendInviteInput {
  name: string;
  email: string;
  roleId: string;
}

export async function sendInvite(input: SendInviteInput): Promise<void> {
    // In a real application, you would generate a unique, single-use registration token,
    // store it, and include it in the URL. For simplicity, we'll just link to the
    // standard registration page.
    const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/register?roleId=${input.roleId}`;
    
    const subject = 'You are invited to join TaskMaster Pro';
    const emailBody = `
      <p>Hello ${input.name},</p>
      <p>You have been invited to create an account on TaskMaster Pro.</p>
      <p>Please click the link below to complete your registration:</p>
      <p><a href="${registrationUrl}">Register Now</a></p>
      <p>If you were not expecting this invitation, you can safely ignore this email.</p>
      <p>Thanks,</p>
      <p>The TaskMaster Pro Team</p>
    `;

    await sendEmail({
      to: input.email,
      subject: subject,
      html: emailBody,
    });
}
