import { Resend } from "resend";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/config";

/**
 * Send a transactional email via Resend. No-ops (and logs) when Resend isn't
 * configured, so flows that send mail don't break before keys are added.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  if (!env.resendApiKey) {
    console.warn(`[email] Resend not configured — skipped: "${opts.subject}" → ${opts.to}`);
    return { sent: false };
  }

  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: `${siteConfig.name} <${siteConfig.fromEmail}>`,
    replyTo: siteConfig.supportEmail,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return { sent: true };
}
