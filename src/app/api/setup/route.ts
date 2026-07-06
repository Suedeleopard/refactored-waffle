import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSetupStatus } from "@/lib/env";

/*
  Setup API — powers the onboarding wizard.

  GET  → current integration status (booleans only).
  POST → in DEVELOPMENT ONLY, write submitted keys into .env.local so the
         installer never hand-edits env files. In production this is refused;
         keys belong in the host's env settings (e.g. Vercel), and the wizard
         shows copy-paste instructions instead.
*/

const ENV_PATH = path.join(process.cwd(), ".env.local");

// Only these keys may be written, so the endpoint can't be used to set arbitrary env.
const ALLOWED_KEYS = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
  "NEXT_PUBLIC_STRIPE_PRICE_PRO",
]);

export async function GET() {
  return NextResponse.json({ status: getSetupStatus(), env: process.env.NODE_ENV });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error: "writes_disabled_in_production",
        message:
          "Set these as environment variables in your host (e.g. Vercel) and redeploy.",
      },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { values?: Record<string, string> };
  const values = body.values ?? {};

  const updates: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (ALLOWED_KEYS.has(key) && typeof value === "string" && value.trim()) {
      updates[key] = value.trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no_valid_keys" }, { status: 400 });
  }

  await writeEnvLocal(updates);

  return NextResponse.json({
    ok: true,
    written: Object.keys(updates),
    note: "Saved to .env.local. The dev server will reload — re-check status in a moment.",
  });
}

/** Merge updates into .env.local, preserving existing keys and comments. */
async function writeEnvLocal(updates: Record<string, string>) {
  let existing = "";
  try {
    existing = await fs.readFile(ENV_PATH, "utf8");
  } catch {
    // file doesn't exist yet
  }

  const lines = existing.length ? existing.split("\n") : [];
  const seen = new Set<string>();

  const next = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (match && updates[match[1]] !== undefined) {
      seen.add(match[1]);
      return `${match[1]}=${updates[match[1]]}`;
    }
    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
  }

  const content = next.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  await fs.writeFile(ENV_PATH, content, "utf8");
}
