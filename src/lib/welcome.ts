import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/config";

/*
  Send a one-time welcome email the first time a user reaches the app. Uses a
  `welcomed_at` flag on their profile so it fires exactly once. This is the
  starter's worked example of a transactional email — swap the copy, or call
  sendEmail() from anywhere you need to mail a user.
*/
export async function sendWelcomeEmailOnce(userId: string, email: string): Promise<void> {
  const supabase = await createClient();

  // Atomically claim the welcome: only the request that flips welcomed_at from
  // null wins, so concurrent page loads can't double-send.
  const { data: claimed } = await supabase
    .from("profiles")
    .update({ welcomed_at: new Date().toISOString() })
    .eq("id", userId)
    .is("welcomed_at", null)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (!claimed) return; // already welcomed, or lost the race

  await sendEmail({
    to: email,
    subject: `Welcome to ${siteConfig.name}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Welcome to ${siteConfig.name} 👋</h1>
        <p>Thanks for signing up. You're all set — head to your dashboard to get started.</p>
        <p><a href="${siteConfig.url}/dashboard" style="color: #0147ff;">Open your dashboard →</a></p>
        <p style="color: #888; font-size: 13px;">— The ${siteConfig.name} team</p>
      </div>`,
  });
}
