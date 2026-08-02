import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/config";
import { worksheetPrompts } from "@/lib/kit";

/*
  Lead capture for the two free entry points: the Swap Sheet download and a
  Pitch Sprint enquiry. Stores the lead and notifies the support address.

  Notification failures never fail the request — a captured lead that didn't
  email is recoverable, a lost lead isn't.
*/

const KINDS = ["swap-sheet", "sprint"] as const;
type Kind = (typeof KINDS)[number];

const MAX_LEN = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, MAX_LEN);
  return trimmed.length > 0 ? trimmed : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const kind = clean(payload.kind) as Kind | null;
  const email = clean(payload.email);

  if (!kind || !KINDS.includes(kind)) {
    return NextResponse.json({ error: "Unknown form." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const lead = {
    kind,
    email,
    name: clean(payload.name),
    company: clean(payload.company),
    opportunity: kind === "sprint" ? clean(payload.opportunity) : null,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert(lead);

  // 23505 = unique violation. They've already signed up; that's not an error
  // worth showing them.
  if (error && error.code !== "23505") {
    console.error("[leads] insert failed", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  const isDuplicate = error?.code === "23505";

  // Deliver the Swap Sheet itself. Sent on repeat submissions too — someone
  // asking again has usually lost the first one.
  if (kind === "swap-sheet") {
    try {
      await sendEmail({
        to: lead.email,
        subject: "The Swap Sheet",
        html: `<p>Here it is. One page, eight blanks.</p>
<p style="font-size:18px"><strong>If a __________ behaved like a __________, they&rsquo;d probably&hellip;</strong></p>
<ul>${worksheetPrompts.map((p) => `<li>${p} __________</li>`).join("")}</ul>
<p>Pick a business you&rsquo;d love to work with, pick somewhere its customers already spend money, and fill it in. The awkward pairings are usually the good ones.</p>
<p>The part this sheet doesn&rsquo;t give you is how to choose a second industry that actually holds up. That&rsquo;s the method, and it&rsquo;s in The Kit: <a href="${siteConfig.url}/#kit">${siteConfig.url}/#kit</a></p>
<p>&mdash; Thad</p>`,
      });
    } catch (err) {
      console.error("[leads] swap sheet delivery failed", err);
    }
  }

  if (!isDuplicate) {
    const label = kind === "sprint" ? "Pitch Sprint enquiry" : "Swap Sheet download";
    const rows = [
      ["Email", lead.email],
      ["Name", lead.name],
      ["Company", lead.company],
      ["Opportunity", lead.opportunity],
    ].filter(([, v]) => v);

    try {
      await sendEmail({
        to: siteConfig.supportEmail,
        subject: `${label}: ${lead.name ?? lead.email}`,
        html: `<h2>${label}</h2>${rows
          .map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v as string)}</p>`)
          .join("")}`,
      });
    } catch (err) {
      console.error("[leads] notification failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
