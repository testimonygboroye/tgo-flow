import { env } from '../config/env';
import { escapeHtml } from '../utils/htmlEscape';

interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.brevoApiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: env.senderName, email: env.senderEmail },
      to: [{ email: input.to, name: input.toName || input.to }],
      subject: input.subject,
      htmlContent: input.htmlContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Brevo email send failed:', response.status, errorBody);
    throw new Error('Failed to send email');
  }
}

export async function sendInviteEmail(toEmail: string, workspaceName: string, role: string, inviteLink: string): Promise<void> {
  const safeWorkspaceName = escapeHtml(workspaceName);
  const safeRole = escapeHtml(role);

  await sendEmail({
    to: toEmail,
    subject: `You've been invited to join ${safeWorkspaceName} on TGO Flow`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1B1830;">You're invited to TGO Flow</h2>
        <p style="color: #6E6A85; font-size: 15px; line-height: 1.5;">
          You've been invited to join <strong>${safeWorkspaceName}</strong> as a <strong>${safeRole}</strong>.
        </p>
        <a href="${inviteLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #7C3AED, #22D3EE); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Accept Invite
        </a>
        <p style="color: #9B96B3; font-size: 13px; margin-top: 24px;">
          This invite expires in 7 days. If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
  await sendEmail({
    to: toEmail,
    subject: 'Reset your TGO Flow password',
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1B1830;">Reset your password</h2>
        <p style="color: #6E6A85; font-size: 15px; line-height: 1.5;">
          We received a request to reset your TGO Flow password. Click below to choose a new one.
        </p>
        <a href="${resetLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #7C3AED, #22D3EE); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #9B96B3; font-size: 13px; margin-top: 24px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not be changed.
        </p>
      </div>
    `,
  });
}
